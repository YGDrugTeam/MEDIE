# # app/services/grok_service.py
# import httpx
# from app.core.config import settings


# async def verify_with_grok(image_b64: str, hint: str | None):
#     async with httpx.AsyncClient() as client:
#         res = await client.post(
#             settings.XAI_ENDPOINT,
#             headers={
#                 "Authorization": f"Bearer {settings.XAI_API_KEY}",
#                 "Content-Type": "application/json",
#             },
#             json={...},
#         )
#     return res.json()

# app/services/grok_service.py
# ⚠️ 현재 사용 안 함 (안정화 후 붙이기)


async def verify_with_grok(*args, **kwargs):
    return {"message": "Grok disabled"}
