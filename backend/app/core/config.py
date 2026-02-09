from pathlib import Path
from typing import ClassVar
from pydantic_settings import BaseSettings


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
