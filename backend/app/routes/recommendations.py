from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.session import CoupleSession
from app.models.survey import SurveyResponse
from app.services.matching import merge_preferences, MatchedPreferences
from app.services.places import find_restaurants
from app.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


class RecommendationRequest(BaseModel):
    session_id: str
    latitude: float
    longitude: float


class MatchedPrefsOut(BaseModel):
    cuisines: List[str]
    dietary_restrictions: List[str]
    price_range: dict
    max_distance_miles: float
    atmospheres: List[str]


class Restaurant(BaseModel):
    place_id: Optional[str]
    name: str
    address: str
    rating: float
    review_count: int
    price_level: str
    distance_miles: float
    open_now: bool
    hours_today: Optional[str]
    phone: Optional[str]
    google_maps_url: Optional[str]
    photo_url: Optional[str]
    health_score: Optional[float]


class RecommendationResponse(BaseModel):
    matched_preferences: MatchedPrefsOut
    restaurants: List[Restaurant]


@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(body: RecommendationRequest, db: Session = Depends(get_db)):
    session = db.query(CoupleSession).filter(CoupleSession.id == body.session_id).first()
    if not session:
        logger.warning("Recommendations requested for unknown session: %s", body.session_id)
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "complete":
        logger.warning(
            "Recommendations requested before survey completion for session: %s (status: %s)",
            body.session_id,
            session.status,
        )
        raise HTTPException(status_code=400, detail="Both partners must complete the survey first")

    responses = db.query(SurveyResponse).filter(
        SurveyResponse.session_id == body.session_id
    ).all()

    if len(responses) < 2:
        logger.error("Session %s marked complete but has only %d survey response(s)", body.session_id, len(responses))
        raise HTTPException(status_code=400, detail="Both partners must complete the survey first")

    prefs = merge_preferences(responses[0], responses[1])
    logger.info(
        "Fetching restaurants for session %s — cuisines: %s, location: (%.4f, %.4f)",
        body.session_id,
        prefs.cuisines,
        body.latitude,
        body.longitude,
    )
    restaurants = await find_restaurants(prefs, body.latitude, body.longitude)
    logger.info("Returning %d restaurant(s) for session: %s", len(restaurants), body.session_id)

    return RecommendationResponse(
        matched_preferences=MatchedPrefsOut(
            cuisines=prefs.cuisines,
            dietary_restrictions=prefs.dietary_restrictions,
            price_range={"min": prefs.price_min, "max": prefs.price_max},
            max_distance_miles=prefs.max_distance_miles,
            atmospheres=prefs.atmospheres,
        ),
        restaurants=[Restaurant(**r) for r in restaurants],
    )
