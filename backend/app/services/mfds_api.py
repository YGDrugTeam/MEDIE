# import requests
# from core.config import MFDS_API_KEY, MFDS_API_ENDPOINT


# def search_drug_from_mfds(item_name: str):
#     params = {
#         "serviceKey": MFDS_API_KEY,
#         "itemName": item_name,
#         "type": "json",
#         "numOfRows": 3,
#         "pageNo": 1,
#     }

#     response = requests.get(MFDS_API_ENDPOINT, params=params, timeout=5)

#     if response.status_code != 200:
#         raise Exception("MFDS API 호출 실패")

#     data = response.json()

#     body = data.get("body", {})
#     items = body.get("items", [])

#     if not items:
#         return None

#     # ✅ 첫 번째 결과만 사용 (MVP)
#     item = items[0]

#     return {
#         "name": item.get("itemName"),
#         "company": item.get("entpName"),
#         "effect": item.get("efcyQesitm"),
#         "usage": item.get("useMethodQesitm"),
#         "warning": item.get("atpnWarnQesitm"),
#         "caution": item.get("atpnQesitm"),
#         "interaction": item.get("intrcQesitm"),
#         "sideEffect": item.get("seQesitm"),
#         "storage": item.get("depositMethodQesitm"),
#         "image": item.get("itemImage"),
#         "updatedAt": item.get("updateDe"),
#     }
