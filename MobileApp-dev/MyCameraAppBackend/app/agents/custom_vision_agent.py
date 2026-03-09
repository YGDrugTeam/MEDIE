from services.custom_vision_service import predict_image
from services.openai_service import analyze_pill_with_gpt


SYSTEM_PROMPT = """
이제부터 알약 사진을 보여줄 것이다.
너는 알약 사진을 보고 다음 정보를 종합해 판단한다.

- 알약의 모양
- 색깔
- 알약에 새겨진 음각(문자 또는 문양)
- 정제형인지 캡슐형인지

이 정보를 바탕으로:
1. 알약 이름을 추론하고
2. 해당 알약의 용도
3. 복용 시 주의사항
4. 일반적인 복용 정보

를 설명하라.

불확실한 경우 반드시 '추정'임을 명시하라.
"""


async def pill_identification_agent(file):
    # 1️⃣ Custom Vision 호출
    vision_result = await predict_image(file)

    predictions = vision_result.get("predictions", [])

    if not predictions:
        return {
            "status": "fail",
            "message": "알약을 인식하지 못했습니다. 사진을 다시 촬영해주세요.",
        }

    top_prediction = max(predictions, key=lambda x: x["probability"])

    # 2️⃣ 신뢰도 판단 (에이전트 판단 로직)
    if top_prediction["probability"] < 0.6:
        return {
            "status": "low_confidence",
            "message": "알약 인식 신뢰도가 낮습니다. 더 선명한 사진을 촬영해주세요.",
            "vision_result": top_prediction,
        }

    # 3️⃣ GPT로 최종 설명 생성
    gpt_input = f"""
알약 후보 정보:
- 이름: {top_prediction['tagName']}
- 신뢰도: {round(top_prediction['probability'] * 100, 2)}%

이 정보를 기반으로 사용자에게 설명하라.
"""

    explanation = await analyze_pill_with_gpt(
        system_prompt=SYSTEM_PROMPT, user_prompt=gpt_input
    )

    return {
        "status": "success",
        "pill_name": top_prediction["tagName"],
        "confidence": top_prediction["probability"],
        "description": explanation,
    }
