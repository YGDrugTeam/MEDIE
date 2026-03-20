import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Header

from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.user_cosmos_service import get_user_container
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def get_user_by_email(container, email: str):
    query = "SELECT * FROM c WHERE c.email = @email"
    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@email", "value": email}],
            enable_cross_partition_query=True,
        )
    )
    return items[0] if items else None


@router.post("/register")
def register(payload: RegisterRequest):
    container = get_user_container()

    existing_user = get_user_by_email(container, payload.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")

    try:
        user_item = {
            "id": str(uuid.uuid4()),
            "name": payload.nickname,
            "email": payload.email,
            "password_hash": hash_password(payload.password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        created_user = container.create_item(body=user_item)

        access_token = create_access_token(
            {
                "sub": created_user["email"],
                "name": created_user["name"],
                "user_id": created_user["id"],
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": created_user["id"],
                "name": created_user["name"],
                "email": created_user["email"],
            },
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logging.exception("회원가입 실패")
        raise HTTPException(status_code=500, detail="회원가입 중 오류가 발생했습니다.")


@router.post("/login")
def login(payload: LoginRequest):
    container = get_user_container()

    user = get_user_by_email(container, payload.email)
    if not user:
        raise HTTPException(
            status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    try:
        if not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(
                status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다."
            )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    access_token = create_access_token(
        {
            "sub": user["email"],
            "name": user["name"],
            "user_id": user["id"],
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
        },
    }


@router.get("/me")
def get_me(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰이 없습니다.")

    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

    return {
        "id": payload.get("user_id"),
        "name": payload.get("name"),
        "email": payload.get("sub"),
    }
