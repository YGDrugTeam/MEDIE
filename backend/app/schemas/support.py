from pydantic import BaseModel
from typing import Optional


class SupportTicketCreate(BaseModel):
    title: str
    content: str
    author: str
    category: Optional[str] = "general"  # general / bug / account / etc


class SupportTicketAnswer(BaseModel):
    answer: str
    answered_by: str
