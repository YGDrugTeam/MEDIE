# pill_agent_service.py
from app.services.custom_vision_service import predict_image
from app.services.gpt_service import generate_pill_info_from_tag
from app.services.live_context_service import collect_live_context


async def analyze_pill_agent(file):
    print("\n[PillAgent] analyze_pill 시작")

    vision_result = await predict_image(file)
    predictions = vision_result.get("predictions", [])

    if not predictions:
        return {"success": False, "message": "알약을 인식하지 못했습니다."}

    top = max(predictions, key=lambda x: x["probability"])

    if top["probability"] < 0.7:
        return {
            "success": False,
            "message": "알약 인식 신뢰도가 낮습니다.",
            "confidence": round(top["probability"], 3),
        }

    # ✅ 실시간 컨텍스트 수집
    pill_name = top["tagName"].split(",")[0]
    context = collect_live_context(pill_name)

    # ✅ GPT 호출 (컨텍스트 포함)
    analysis = generate_pill_info_from_tag(top["tagName"], context)

    result = {
        "success": True,
        "pill_tag": top["tagName"],
        "confidence": round(top["probability"], 3),
        "analysis": analysis,
    }

    print("[PillAgent] 최종 응답:")
    print(result)

    return result
