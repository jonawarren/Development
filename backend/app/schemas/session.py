from datetime import datetime
from pydantic import BaseModel


class SessionCreate(BaseModel):
    pass


class SessionCreated(BaseModel):
    session_id: str
    partner_a_survey_token: str
    partner_b_survey_token: str
    expires_at: datetime


class SessionStatus(BaseModel):
    session_id: str
    status: str
    partners_completed: int
    expires_at: datetime
