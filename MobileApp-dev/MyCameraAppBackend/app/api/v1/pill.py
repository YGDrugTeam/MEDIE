from fastapi import APIRouter, UploadFile, File, HTTPException
from services.custom_vision_service import predict_image

router = APIRouter()


@router.post("/analyze")
async def analyze_pill(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능")

    image_bytes = await file.read()

    result = predict_image(image_bytes)

    return {
        "status": "success",
        "pill_name": result["pill_name"],
        "confidence": result["confidence"],
        "agent_summary": result["summary"],
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
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),  # gpt-4o-2
        messages=[{"role": "system", "content": "test"}],
        temperature=0.2,
    )

    print("env deployment model name: " + os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"))

    print(response)
