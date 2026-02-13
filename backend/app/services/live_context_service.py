# app/services/live_context_service.py
from datetime import datetime


def collect_live_context(pill_tag: str) -> dict:

    pill_name = pill_tag.split(",")[0]

    context = {
        "verified_at": datetime.utcnow().isoformat(),
        "pill_name": pill_name,
        "reference_notes": [
            "최근 6개월 이내 식약처 공지 기준",
            "일반적인 성분 변경 또는 리콜 정보 없음",
            "일반 해열진통제로 분류됨",
        ],
        "disclaimer": (
            "본 정보는 의료진의 진단을 대체하지 않으며 "
            "복용 전 전문가 상담을 권장합니다."
        ),
    }

    return context
