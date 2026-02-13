import requests
from app.core.config import DRUG_API_KEY, DRUG_API_ENDPOINT


def fetch_drug_info(item_name: str):
    params = {
        "serviceKey": DRUG_API_KEY,
        "itemName": item_name,
        "type": "json",
        "numOfRows": 1,
        "pageNo": 1,
    }

    response = requests.get(DRUG_API_ENDPOINT, params=params, timeout=5)

    if response.status_code != 200:
        raise Exception("MFDS API HTTP 실패")

    data = response.json()

    # ✅ 공공데이터포털 표준 구조
    body = data.get("body", {})
    items = body.get("items", [])

    if not items:
        return None

    item = items[0]

    return {
        "name": item.get("itemName"),
        "company": item.get("entpName"),
        "effect": item.get("efcyQesitm"),
        "usage": item.get("useMethodQesitm"),
        "warning": item.get("atpnWarnQesitm"),
        "caution": item.get("atpnQesitm"),
        "interaction": item.get("intrcQesitm"),
        "sideEffect": item.get("seQesitm"),
        "storage": item.get("depositMethodQesitm"),
        "updatedAt": item.get("updateDe"),
        "source": "MFDS",
    }
