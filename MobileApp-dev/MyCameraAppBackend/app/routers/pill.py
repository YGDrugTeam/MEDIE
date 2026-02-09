from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gpt_service import generate_pill_info

router = APIRouter(prefix="/pill", tags=["pill"])


class PillRequest(BaseModel):
    pill_name: str
    pill_mark: str


@router.post("/analyze")
def analyze_pill(data: PillRequest):
    print(data.pill_name)
    result = generate_pill_info(pill_name=data.pill_name, pill_mark=data.pill_mark)

    return {
        "pill_name": data.pill_name,
        "pill_mark": data.pill_mark,
        "description": result,
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
        massages=[{"role": "system", "content": "test"}],
        temperature=0.2,
    )

    print(response)
