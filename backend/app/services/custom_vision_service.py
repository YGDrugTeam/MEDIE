import os
import httpx
from dotenv import load_dotenv

load_dotenv()

PREDICTION_ENDPOINT = os.getenv("EXPO_CUSTUM_VISION_PREDICTION_ENDPOINT")
print(PREDICTION_ENDPOINT)
PREDICTION_KEY = os.getenv("EXPO_CUSTUM_VISION_PREDICTION_KEY")
print(PREDICTION_KEY)
PROJECT_ID = os.getenv("EXPO_CUSTUM_VISION_PROJECT_ID")
print(PROJECT_ID)
PUBLISHED_NAME = os.getenv("EXPO_CUSTUM_VISION_PUBLISHED_NAME")
print(PUBLISHED_NAME)


print("ENDPOINT:", PREDICTION_ENDPOINT)
print("PROJECT_ID:", PROJECT_ID)
print("PUBLISHED_NAME:", PUBLISHED_NAME)
print("KEY LENGTH:", len(PREDICTION_KEY))


async def predict_image(file):
    image_bytes = await file.read()

    if not image_bytes:
        raise ValueError("업로드된 이미지가 비어 있습니다.")

    url = (
        f"{PREDICTION_ENDPOINT}"
        f"customvision/v3.0/Prediction/"
        f"{PROJECT_ID}/classify/iterations/"
        f"{PUBLISHED_NAME}/image"
    )
    print("🔥 FINAL URL:", url)

    headers = {
        "Prediction-Key": PREDICTION_KEY,
        "Content-Type": "application/octet-stream",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            headers=headers,
            data=image_bytes,  # ✅ content ❌ → data ✅
        )

    if response.status_code != 200:
        print("🔥 Custom Vision Error Response:")
        print(response.text)

    response.raise_for_status()
    print("🔥 FINAL URL:", url)

    return response.json()
