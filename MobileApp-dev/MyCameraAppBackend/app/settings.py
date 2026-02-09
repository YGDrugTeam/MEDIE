import os
from dotenv import load_dotenv


# .env에서 키를 읽어오는 코드
load_dotenv()


class Settings:
    EXPO_PUBLIC_AZURE_VISION_KEY = os.getenv("EXPO_PUBLIC_AZURE_VISION_KEY")
    EXPO_PUBLIC_AZURE_VISION_ENDPOINT = os.getenv("EXPO_PUBLIC_AZURE_VISION_ENDPOINT")

    EXPO_PUBLIC_AZURE_OPENAI_KEY = os.getenv("EXPO_PUBLIC_AZURE_OPENAI_KEY")
    EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT = os.getenv("EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT")


settings = Settings()
