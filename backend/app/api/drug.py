from fastapi import APIRouter, HTTPException
from app.services.drug_service import fetch_drug_info

router = APIRouter(prefix="/drugs", tags=["Drug"])


@router.get("/search")
def search_drug(name: str):
    result = fetch_drug_info(name)

    if not result:
        raise HTTPException(status_code=404, detail="약 정보를 찾을 수 없습니다")

    return {"count": len(result), "items": result}
