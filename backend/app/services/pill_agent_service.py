# app/services/pill_agent_service.py
from app.services.custom_vision_service import predict_image
from app.services.gpt_service import generate_pill_info_from_tag


async def analyze_pill_agent(file):
    print("\n[PillAgent] analyze_pill 시작")

    vision_result = await predict_image(file)
    print("[PillAgent] Custom Vision 결과 수신 완료")

    predictions = vision_result.get("predictions", [])
    print(f"[PillAgent] predictions 개수: {len(predictions)}")

    if not predictions:
        return {"success": False, "message": "알약을 인식하지 못했습니다."}

    for p in predictions:
        print(
            f"[PillAgent] 후보 태그: {p['tagName']} "
            f"(확률: {round(p['probability'], 3)})"
        )

    top = max(predictions, key=lambda x: x["probability"])

    print(
        f"[PillAgent] ✅ 최고 확률 태그: {top['tagName']} "
        f"(확률: {round(top['probability'], 3)})"
    )

    if top["probability"] < 0.7:
        return {
            "success": False,
            "message": "알약 인식 신뢰도가 낮습니다.",
            "confidence": round(top["probability"], 3),
        }

    # ✅ GPT 호출 (완전 위임)
    analysis = generate_pill_info_from_tag(top["tagName"])

    result = {
        "success": True,
        "pill_tag": top["tagName"],
        "confidence": round(top["probability"], 3),
        "analysis": analysis,
    }

    print("[PillAgent] 최종 응답:")
    print(result)

    return result
