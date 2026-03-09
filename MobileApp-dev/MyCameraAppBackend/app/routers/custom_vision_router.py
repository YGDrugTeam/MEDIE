# app/routers/custom_vision.py
from fastapi import APIRouter, UploadFile, File
from services.custom_vision_service import predict_image

router = APIRouter(prefix="/custom-vision", tags=["CustomVision"])


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    result = await predict_image(file)
    return result
