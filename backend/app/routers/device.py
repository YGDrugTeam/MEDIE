from fastapi import APIRouter
from app.services.jwt_service import create_device_jwt

router = APIRouter(prefix="/device")


@router.post("/register")
def register_device(payload: dict):
    device_id = payload["device_id"]
    jwt_token = create_device_jwt(device_id)

    return {"jwt": jwt_token}
