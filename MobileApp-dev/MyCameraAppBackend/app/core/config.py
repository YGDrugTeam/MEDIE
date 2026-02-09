import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

AZURE_PREDICTION_ENDPOINT = os.getenv("AZURE_PREDICTION_ENDPOINT")
AZURE_PREDICTION_KEY = os.getenv("AZURE_PREDICTION_KEY")
AZURE_PROJECT_ID = os.getenv("AZURE_PROJECT_ID")
AZURE_PUBLISHED_NAME = os.getenv("AZURE_PUBLISHED_NAME")

print("ENV PATH:", ENV_PATH)
print("ENDPOINT:", AZURE_PREDICTION_ENDPOINT)
print("PROJECT:", AZURE_PROJECT_ID)
print("PUBLISHED:", AZURE_PUBLISHED_NAME)

if not all(
    [
        AZURE_PREDICTION_ENDPOINT,
        AZURE_PREDICTION_KEY,
        AZURE_PROJECT_ID,
        AZURE_PUBLISHED_NAME,
    ]
):
    raise RuntimeError("❌ Azure Custom Vision 환경변수 로딩 실패")
