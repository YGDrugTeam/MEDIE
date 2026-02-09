from fastapi import APIRouter, HTTPException
from app.schemas.drug_schema import DrugInfoRequest
from app.services.drug_api_service import get_drug_detail_info

router = APIRouter(prefix="/drug-info", tags=["Drug"])


@router.post("")
async def get_drug_info(request: DrugInfoRequest):
    result = await get_drug_detail_info(request.itemSeq)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result
