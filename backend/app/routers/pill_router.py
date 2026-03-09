from fastapi import APIRouter, UploadFile, File
from app.agents.custom_vision_agent import pill_identification_agent

router = APIRouter(prefix="/pill", tags=["Pill Agent"])


@router.post("/identify")
async def identify_pill(file: UploadFile = File(...)):
    return await pill_identification_agent(file)
