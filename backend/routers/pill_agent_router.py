# app/routers/pill_agent.py
from fastapi import APIRouter, UploadFile, File
from app.services.pill_agent_service import analyze_pill

router = APIRouter(prefix="/pill", tags=["PillAgent"])


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    return await analyze_pill(file)
