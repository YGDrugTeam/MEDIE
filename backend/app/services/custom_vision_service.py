import os
import requests
from dotenv import load_dotenv

load_dotenv()

PREDICTION_ENDPOINT = os.getenv("EXPO_CUSTUM_VISION_PREDICTION_ENDPOINT")
PREDICTION_KEY = os.getenv("EXPO_CUSTUM_VISION_PREDICTION_KEY")
PROJECT_ID = os.getenv("EXPO_CUSTUM_VISION_PROJECT_ID")
PUBLISHED_NAME = os.getenv("EXPO_CUSTUM_VISION_PUBLISHED_NAME")


def predict_image(image_bytes: bytes):
    url = (
        f"{PREDICTION_ENDPOINT}"
        f"customvision/v3.0/Prediction/"
        f"{PROJECT_ID}/classify/iterations/"
        f"{PUBLISHED_NAME}/image"
    )

    headers = {
        "Prediction-Key": PREDICTION_KEY,
        "Content-Type": "application/octet-stream",
    }

    response = requests.post(url, headers=headers, data=image_bytes)
    response.raise_for_status()

    return response.json()
