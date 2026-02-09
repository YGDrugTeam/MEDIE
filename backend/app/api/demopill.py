# # app/api/pill.py
# from fastapi import APIRouter, UploadFile, File, HTTPException
# import logging

# # ✅ Custom Vision 서비스 import
# from app.services.custom_vision_service import predict_image

# router = APIRouter(
#     prefix="/analyze-pill",
#     tags=["Pill"],
# )


# @router.post("")
# async def analyze_pill(file: UploadFile = File(...)):
#     logging.info("✅ /analyze-pill 요청 도착")
#     logging.info(f"📸 파일명: {file.filename}, 타입: {file.content_type}")

#     try:
#         # 🔥 여기서 Custom Vision 호출
#         logging.info("🚀 Custom Vision 요청 시작")
#         cv_result = await predict_image(file)

#         # 🔍 전체 응답 로그 (너무 크면 일부만)
#         logging.info(f"🧠 Custom Vision 원본 응답: {cv_result}")

#         # 보통 predictions 안에 결과 있음
#         predictions = cv_result.get("predictions", [])
#         if not predictions:
#             logging.warning("⚠️ Custom Vision 결과 없음")
#             return {
#                 "result": "NO_PREDICTION",
#                 "raw": cv_result,
#             }

#         top = predictions[0]
#         tag_name = top.get("tagName")
#         probability = top.get("probability")

#         logging.info(f"🏷️ 예측 결과 → tag={tag_name}, probability={probability}")

#         # 일단 Custom Vision 연결 확인용 응답
#         return {
#             "result": "OK",
#             "tag": tag_name,
#             "confidence": probability,
#         }

#     except Exception as e:
#         logging.exception("🔥 analyze-pill 처리 중 에러")
#         raise HTTPException(status_code=500, detail=str(e))
