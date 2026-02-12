# app/schemas/pill.py
from pydantic import BaseModel


class PillAnalyzeResponse(BaseModel):
    pill_id: str
    confidence: float
