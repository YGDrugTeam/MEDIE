from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.pill_history import PillHistoryCreate, PillHistoryResponse
from app.services import pill_history_service

router = APIRouter(prefix="/api/history", tags=["Pill History"])


@router.post("", response_model=PillHistoryResponse)
def create_history(data: PillHistoryCreate, db: Session = Depends(get_db)):
    return pill_history_service.create_history(db, data)


@router.get("/{user_id}", response_model=list[PillHistoryResponse])
def get_history(user_id: str, db: Session = Depends(get_db)):
    return pill_history_service.get_history_by_user(db, user_id)
