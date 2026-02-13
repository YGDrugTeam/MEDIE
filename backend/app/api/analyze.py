from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.services.drug_service import fetch_drug_info
from app.services.gpt_service import generate_pill_info_from_tag, parse_pill_tag

router = APIRouter(prefix="/analyze", tags=["Analyze"])


@router.post("")
def analyze_pill(tag_name: str, confidence: float | None = None):
    pill_name, _ = parse_pill_tag(tag_name)

    mfds_info = fetch_drug_info(pill_name)

    context = {
        "verified_at": datetime.now().isoformat(),
        "reference_notes": ["이미지 인식 기반 태그", "외형 정보는 참고 수준"],
        "mfds": mfds_info,
        "vision_confidence": confidence,
    }

    return generate_pill_info_from_tag(tag_name, context)
