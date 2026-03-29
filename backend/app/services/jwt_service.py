from datetime import datetime, timedelta
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from app.core.security import decode_access_token


JWT_SECRET = "MEDICLENS_DEVICE_SECRET"
JWT_ALG = "HS256"
JWT_EXPIRE_DAYS = 30

security = HTTPBearer()


def create_device_jwt(device_id: str):
    payload = {
        "device_id": device_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def verify_device_jwt(token=Depends(security)):
    try:
        decoded = jwt.decode(token.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="JWT expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid JWT")


def verify_access_jwt(token: str):
    try:
        payload = decode_access_token(token)

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid JWT: sub 없음",
            )

        return payload

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT",
        )
