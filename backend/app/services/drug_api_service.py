import os
import httpx
from dotenv import load_dotenv

load_dotenv()

# 식약처 의약품 정보 API
DRUG_API_ENDPOINT = (
    "https://apis.data.go.kr/1471000/" "DrbEasyDrugInfoService/getDrbEasyDrugList"
)

# 환경변수에 없으면 기존에 쓰던 키 fallback
DRUG_API_KEY = os.getenv(
    "DRUG_API_KEY", "940b88c7d03a653c76851dda7e8b9db654b495fb18a3c9dc923b32dd202da2e9"
)


async def get_drug_detail_info(item_seq: str) -> dict:
    """
    식약처 API를 통해 품목기준코드(itemSeq)로
    약물 상세 정보 조회
    """

    params = {
        "serviceKey": DRUG_API_KEY,
        "itemSeq": item_seq,
        "type": "json",
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(DRUG_API_ENDPOINT, params=params, timeout=30.0)

        data = response.json()

        header = data.get("header", {})
        body = data.get("body", {})

        if header.get("resultCode") != "00":
            return {"error": "식약처 API 응답 오류"}

        if body.get("totalCount", 0) == 0:
            return {"error": "해당 품목을 찾을 수 없습니다"}

        item = body["items"][0]

        return {
            "품목기준코드": item_seq,
            "품목명": item.get("itemName", "-"),
            "제조사": item.get("entpName", "-"),
            "효능효과": item.get("efcyQesitm", "-"),
            "용법용량": item.get("useMethodQesitm", "-"),
            "사용상의경고사항": item.get("atpnWarnQesitm", "-"),
            "사용상의주의사항": item.get("atpnQesitm", "-"),
            "상호작용사항": item.get("intrcQesitm", "-"),
            "부작용": item.get("seQesitm", "-"),
            "보관방법": item.get("depositMethodQesitm", "-"),
        }

    except Exception as e:
        print(f"❌ 식약처 API 호출 실패: {e}")
        return {"error": str(e)}
