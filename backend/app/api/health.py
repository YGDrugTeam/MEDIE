from fastapi import APIRouter
from core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    return {
        "status": "healthy",
        "device": str(settings.DEVICE),
        "confidence_threshold": settings.CONFIDENCE_THRESHOLD,
    }
