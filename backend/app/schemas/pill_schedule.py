from pydantic import BaseModel
from typing import Optional


class PillScheduleCreate(BaseModel):
    userId: str
    pillName: str
    time: str
    enabled: bool = True


class PillScheduleResponse(BaseModel):
    id: str
    userId: str
    pillName: str
    time: str
    enabled: bool
