from fastapi import APIRouter, Query, HTTPException
from app.services.duty_pharmacy_service import fetch_duty_pharmacies
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/pharmacies/duty")
def duty_pharmacies(
    sido: str = Query(..., description="시/도"),
    sigungu: str = Query(..., description="시/군/구"),
    lat: float = Query(..., description="사용자 위도"),
    lng: float = Query(..., description="사용자 경도"),
):
    try:
        pharmacies = fetch_duty_pharmacies(
            sido=sido,
            sigungu=sigungu,
            user_lat=lat,
            user_lng=lng,
        )

        # ✅ 영업중 약국이 없는 경우 (정상 케이스)
        if not pharmacies:
            return {
                "count": 0,
                "message": "현재 영업중인 당번약국이 없습니다.",
                "data": [],
            }

        return {
            "count": len(pharmacies),
            "data": pharmacies,
        }

    except Exception as e:
        # 🔥 어떤 에러든 서버가 죽지 않게
        logger.exception("🔥 당번약국 조회 중 서버 에러 발생")

        raise HTTPException(
            status_code=500,
            detail="당번약국 정보를 불러오는 중 오류가 발생했습니다.",
        )
