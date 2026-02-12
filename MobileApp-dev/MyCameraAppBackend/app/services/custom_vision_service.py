# import os
# import httpx
# from dotenv import load_dotenv

# from dotenv import load_dotenv

# # .env 로드
# load_dotenv()

# PREDICTION_ENDPOINT = os.getenv("EXPO_CUSTUM_VISION_PREDICTION_ENDPOINT")
# print(PREDICTION_ENDPOINT)
# print("-----------------------------------")
# PREDICTION_KEY = os.getenv("EXPO_CUSTUM_VISION_PREDICTION_KEY")
# print(PREDICTION_KEY)
# print("-----------------------------------")
# PROJECT_ID = os.getenv("EXPO_CUSTUM_VISION_PROJECT_ID")
# print(PROJECT_ID)
# print("-----------------------------------")
# PUBLISHED_NAME = os.getenv("EXPO_CUSTUM_VISION_PUBLISHED_NAME")
# print(PUBLISHED_NAME)


# print("ENDPOINT:", PREDICTION_ENDPOINT)
# print("PROJECT_ID:", PROJECT_ID)
# print("PUBLISHED_NAME:", PUBLISHED_NAME)
# print("KEY LENGTH:", len(PREDICTION_KEY))


# async def predict_image(file):
#     image_bytes = await file.read()

#     url = (
#         f"{PREDICTION_ENDPOINT}"
#         f"customvision/v3.0/Prediction/"
#         f"{PROJECT_ID}/classify/iterations/"
#         f"{PUBLISHED_NAME}/image"
#     )

#     headers = {
#         "Prediction-Key": PREDICTION_KEY,
#         "Content-Type": "application/octet-stream",
#     }

#     async with httpx.AsyncClient(timeout=30.0) as client:
#         response = await client.post(url, headers=headers, content=image_bytes)

#     response.raise_for_status()
#     return response.json()
