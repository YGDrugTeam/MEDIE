from fastapi import APIRouter, HTTPException
from app.schemas.user import RegisterRequest, LoginRequest

router = APIRouter()


# 예시용 가짜 DB
fake_users = []


@router.post("/register")
async def register(data: RegisterRequest):
    # 이메일 중복 체크
    for user in fake_users:
        if user["email"] == data.email:
            raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")

    fake_users.append(
        {
            "email": data.email,
            "password": data.password,
            "name": data.name,
        }
    )

    return {
        "success": True,
        "message": "회원가입이 완료되었습니다.",
        "user": {
            "email": data.email,
            "name": data.name,
        },
    }


@router.post("/login")
async def login(data: LoginRequest):
    user = next((u for u in fake_users if u["email"] == data.email), None)

    if not user:
        raise HTTPException(
            status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    if user["password"] != data.password:
        raise HTTPException(
            status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    return {
        "success": True,
        "message": "로그인되었습니다.",
        "user": {
            "email": user["email"],
            "name": user["name"],
        },
    }
