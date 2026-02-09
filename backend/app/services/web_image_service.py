from duckduckgo_search import DDGS
from typing import Optional


def get_web_image_url(query: str, is_medicine: bool = True) -> Optional[str]:
    if not is_medicine:
        return None

    try:
        with DDGS() as ddgs:
            results = list(
                ddgs.images(f"{query} 약 의약품 pill medicine", max_results=5)
            )

            for r in results:
                title = r.get("title", "").lower()
                if any(k in title for k in ["pill", "medicine", "약", "정", "캡슐"]):
                    return r["image"]

            return results[0]["image"] if results else None

    except Exception as e:
        print(f"⚠️ 웹 이미지 검색 실패: {e}")
        return None
