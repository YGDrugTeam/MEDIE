from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.jwt_service import verify_device_jwt
from app.services.crypto_service import decrypt_cryptojs_aes

router = APIRouter(prefix="/pills")

AES_SECRET_KEY = "FRONT_AES_SECRET"  # ⚠️ 나중에 device별 분리 가능


class EncryptedPayload(BaseModel):
    encrypted_data: str


@router.post("/sync")
def sync_pills(payload: EncryptedPayload, token=Depends(verify_device_jwt)):
    device_id = token["device_id"]

    pills = decrypt_cryptojs_aes(payload.encrypted_data, AES_SECRET_KEY)

    # TODO: device_id 기준 DB 저장
    # save_pills(device_id, pills)

    return {"success": True, "device_id": device_id, "pill_count": len(pills)}
