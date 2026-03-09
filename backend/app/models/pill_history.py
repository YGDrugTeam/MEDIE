from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base


# DB 스키마
class PillHistory(Base):
    __tablename__ = "pill_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    pill_name = Column(String)
    scheduled_time = Column(String)
    taken_at = Column(DateTime, default=datetime.utcnow)
