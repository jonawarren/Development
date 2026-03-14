import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.session import CoupleSession
from app.models.survey import SurveyResponse
from app.schemas.session import SessionCreated, SessionStatus
from app.config import settings

router = APIRouter()


@router.post("/sessions", response_model=SessionCreated, status_code=201)
def create_session(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    session = CoupleSession(
        id=str(uuid.uuid4()),
        partner_a_token=str(uuid.uuid4()),
        partner_b_token=str(uuid.uuid4()),
        status="pending",
        created_at=now,
        expires_at=now + timedelta(hours=settings.session_expiry_hours),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return SessionCreated(
        session_id=session.id,
        partner_a_survey_token=session.partner_a_token,
        partner_b_survey_token=session.partner_b_token,
        expires_at=session.expires_at,
    )


@router.get("/sessions/{session_id}/status", response_model=SessionStatus)
def get_session_status(session_id: str, db: Session = Depends(get_db)):
    session = db.query(CoupleSession).filter(CoupleSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    count = db.query(SurveyResponse).filter(SurveyResponse.session_id == session_id).count()
    return SessionStatus(
        session_id=session.id,
        status=session.status,
        partners_completed=count,
        expires_at=session.expires_at,
    )
