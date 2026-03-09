from pydantic import BaseModel
from datetime import datetime


class PillHistoryCreate(BaseModel):
    user_id: str
    pill_name: str
    scheduled_time: str
    taken_at: datetime


class PillHistoryResponse(PillHistoryCreate):
    id: int

    class Config:
        from_attributes = True
