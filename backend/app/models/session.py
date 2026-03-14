from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from app.database import Base


class CoupleSession(Base):
    __tablename__ = "couple_sessions"

    id = Column(String, primary_key=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    partner_a_token = Column(String, nullable=False, unique=True)
    partner_b_token = Column(String, nullable=False, unique=True)
    status = Column(String, nullable=False, default="pending")
    expires_at = Column(DateTime, nullable=False)
