import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.types import TypeDecorator
from app.database import Base


class JSONList(TypeDecorator):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return "[]"
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        return json.loads(value)


class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("couple_sessions.id"), nullable=False)
    partner_token = Column(String, nullable=False, unique=True)
    submitted_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    cuisines_liked = Column(JSONList, nullable=False)
    cuisines_avoided = Column(JSONList, nullable=False, default=list)
    dietary_restrictions = Column(JSONList, nullable=False, default=list)
    price_min = Column(Integer, nullable=False)
    price_max = Column(Integer, nullable=False)
    atmospheres = Column(JSONList, nullable=False, default=list)
    max_distance_miles = Column(Float, nullable=False)
