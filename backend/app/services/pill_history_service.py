from sqlalchemy.orm import Session
from app.models.pill_history import PillHistory
from app.schemas.pill_history import PillHistoryCreate


def create_history(db: Session, data: PillHistoryCreate):
    record = PillHistory(**data.dict())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_history_by_user(db: Session, user_id: str):
    return (
        db.query(PillHistory)
        .filter(PillHistory.user_id == user_id)
        .order_by(PillHistory.taken_at.desc())
        .all()
    )
