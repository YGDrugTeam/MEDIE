from typing import Literal
from pydantic import BaseModel, Field


class BoardCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    author: str = Field(..., min_length=1, max_length=100)
    boardType: Literal["free", "med_question", "review", "notice"]


class BoardResponse(BaseModel):
    id: str
    title: str
    content: str
    author: str
    boardType: Literal["free", "med_question", "review", "notice"]
    created_at: str
