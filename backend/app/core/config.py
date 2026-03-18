from pathlib import Path
from typing import ClassVar
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv


load_dotenv()

DRUG_API_KEY = os.getenv("DRUG_API_KEY")
DRUG_API_ENDPOINT = os.getenv("DRUG_API_ENDPOINT")
DUTY_PHARM_API_KEY = os.getenv("DUTY_PHARM_API_KEY")

COSMOS_CONNECTION_STRING = os.getenv("COSMOS_CONNECTION_STRING", "")
COSMOS_DATABASE_NAME = os.getenv("COSMOS_DATABASE_NAME", "community")
COSMOS_CONTAINER_NAME = os.getenv("COSMOS_CONTAINER_NAME", "boards")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7일

print(DRUG_API_ENDPOINT)
print(DRUG_API_KEY[:10])


class Settings(BaseSettings):
    DEVICE: str = "cpu"

    # 🔥 Pydantic 필드가 아닌 "클래스 상수"라고 명시
    MODEL_PATH: ClassVar[Path] = (
        Path(__file__).resolve().parent.parent.parent
        / "models"
        / "optimized_medicine_model_170.pt"
    )

    class Config:
        env_file = ".env"


settings = Settings()
