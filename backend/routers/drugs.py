from fastapi import APIRouter, Query, HTTPException
from app.services.mfds_api import search_drug_from_mfds

router = APIRouter(prefix="/drugs", tags=["drugs"])


@router.get("/search")
def search_drug(name: str = Query(..., description="약 이름")):
    result = search_drug_from_mfds(name)

    if not result:
        raise HTTPException(status_code=404, detail="약 정보를 찾을 수 없습니다")

    return result
