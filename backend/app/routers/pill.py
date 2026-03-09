from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.services.custom_vision_service import predict_image
from app.services.gpt_service import generate_pill_info
from app.schemas.pill import PillAnalyzeResponse

router = APIRouter(prefix="/pill", tags=["pill"])


class PillRequest(BaseModel):
    pill_name: str
    pill_mark: str


@router.post("/analyze", response_model=PillAnalyzeResponse)
async def analyze_pill(file: UploadFile = File(...)):
    # 1. Custom Vision 호출
    vision_result = await predict_image(file)
    predictions = vision_result.get("predictions", [])

    if not predictions:
        raise HTTPException(status_code=400, detail="알약을 인식하지 못했습니다.")

    # 2. 최고 확률 태그 선택
    top = max(predictions, key=lambda x: x["probability"])

    if top["probability"] < 0.7:
        raise HTTPException(
            status_code=400, detail=f"인식 신뢰도 낮음 ({round(top['probability'], 2)})"
        )

    # 3. 태그 분리 (약이름, 음각)
    # 예: "타이레놀,TYL"
    tag = top["tagName"]
    parts = [p.strip() for p in tag.split(",")]

    pill_name = parts[0]
    pill_mark = parts[1] if len(parts) > 1 else ""

    # 4. GPT 분석 (기존 로직 그대로 활용)
    description = await generate_pill_info(pill_name=pill_name, pill_mark=pill_mark)

    # 5. 최종 응답
    return {
        "pill_name": pill_name,
        "pill_mark": pill_mark,
        "confidence": round(top["probability"], 3),
        "description": description,
    }


from openai import AzureOpenAI
import os

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2025-01-01-preview",
)


@router.post("/testapis")
def gpt_test():
    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),  # gpt-4o-2
        messages=[{"role": "system", "content": "test"}],
        temperature=0.2,
    )

    print(response)
