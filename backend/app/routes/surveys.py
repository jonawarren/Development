from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.session import CoupleSession
from app.models.survey import SurveyResponse
from app.schemas.survey import SurveySubmit, SurveyInfo, SurveyResult
from app.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


def _get_session_by_token(token: str, db: Session) -> CoupleSession:
    session = db.query(CoupleSession).filter(
        (CoupleSession.partner_a_token == token) |
        (CoupleSession.partner_b_token == token)
    ).first()
    if not session:
        logger.warning("Survey token not found: %s", token)
        raise HTTPException(status_code=404, detail="Invalid survey token")
    if session.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        logger.warning("Survey token expired for session: %s", session.id)
        raise HTTPException(status_code=410, detail="Session has expired")
    return session


@router.get("/surveys/{token}", response_model=SurveyInfo)
def get_survey(token: str, db: Session = Depends(get_db)):
    session = _get_session_by_token(token, db)
    already_submitted = db.query(SurveyResponse).filter(
        SurveyResponse.partner_token == token
    ).first() is not None
    return SurveyInfo(
        token=token,
        session_id=session.id,
        already_submitted=already_submitted,
    )


@router.post("/surveys/{token}", response_model=SurveyResult, status_code=201)
def submit_survey(token: str, body: SurveySubmit, db: Session = Depends(get_db)):
    session = _get_session_by_token(token, db)

    existing = db.query(SurveyResponse).filter(SurveyResponse.partner_token == token).first()
    if existing:
        logger.warning("Duplicate survey submission for token: %s (session: %s)", token, session.id)
        raise HTTPException(status_code=409, detail="Survey already submitted for this token")

    if body.price_min > body.price_max:
        logger.warning("Invalid price range [%d, %d] for token: %s", body.price_min, body.price_max, token)
        raise HTTPException(status_code=422, detail="price_min cannot exceed price_max")

    response = SurveyResponse(
        session_id=session.id,
        partner_token=token,
        cuisines_liked=body.cuisines_liked,
        cuisines_avoided=body.cuisines_avoided or [],
        dietary_restrictions=body.dietary_restrictions or [],
        price_min=body.price_min,
        price_max=body.price_max,
        atmospheres=body.atmospheres or [],
        max_distance_miles=body.max_distance_miles,
    )
    db.add(response)

    count = db.query(SurveyResponse).filter(SurveyResponse.session_id == session.id).count()
    session.status = "complete" if count + 1 == 2 else "partial"
    db.commit()

    logger.info("Survey submitted for session: %s (status: %s)", session.id, session.status)
    return SurveyResult(session_id=session.id, status=session.status)
