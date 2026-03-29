from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel  # ← 추가
from app.agents.custom_vision_agent import pill_identification_agent

router = APIRouter(prefix="/pill", tags=["Pill Agent"])


@router.post("/identify")
async def identify_pill(file: UploadFile = File(...)):
    return await pill_identification_agent(file)

# ✅ 알람 시간 조회 API
alarm_store = {"User_01": "08:00"}  # 임시 메모리 저장

class AlarmTimeResponse(BaseModel):
    alarm_time: str

class AlarmTimeUpdateRequest(BaseModel):
    alarm_time: str

@router.get("/alarm/{user_id}", response_model=AlarmTimeResponse)
async def get_alarm_time(user_id: str):
    alarm_time = alarm_store.get(user_id, "08:00")
    return {"alarm_time": alarm_time}

@router.post("/alarm/{user_id}")
async def update_alarm_time(user_id: str, req: AlarmTimeUpdateRequest):
    alarm_store[user_id] = req.alarm_time
    print(f"✅ 알람 시간 업데이트: {user_id} / {req.alarm_time}")
    return {"status": "ok", "alarm_time": req.alarm_time}