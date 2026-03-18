import requests
from fastapi import APIRouter, HTTPException
from app.schemas.kakao_auth import KakaoLoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])

# 예시용 임시 저장소
fake_users = {}


def create_access_token_for_user(user: dict) -> str:
    # 네 기존 JWT 발급 로직으로 교체
    return f"dummy-token-for-{user['id']}"


@router.post("/kakao/login")
async def kakao_login(data: KakaoLoginRequest):
    kakao_res = requests.get(
        "https://kapi.kakao.com/v2/user/me",
        headers={
            "Authorization": f"Bearer {data.kakao_access_token}",
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        timeout=10,
    )

    if kakao_res.status_code != 200:
        raise HTTPException(
            status_code=401, detail="카카오 사용자 정보를 확인할 수 없습니다."
        )

    kakao_user = kakao_res.json()

    kakao_id = str(kakao_user.get("id"))
    kakao_account = kakao_user.get("kakao_account", {}) or {}
    profile = kakao_account.get("profile", {}) or {}

    email = kakao_account.get("email")
    nickname = profile.get("nickname") or "카카오사용자"

    if not kakao_id:
        raise HTTPException(status_code=400, detail="카카오 사용자 식별값이 없습니다.")

    # 카카오 id 기준으로 유저 조회/생성
    user = fake_users.get(kakao_id)
    if not user:
        user = {
            "id": kakao_id,
            "name": nickname,
            "email": email,
            "provider": "kakao",
        }
        fake_users[kakao_id] = user
    else:
        # 이메일/이름 최신값 보정
        user["name"] = nickname or user["name"]
        user["email"] = email or user["email"]

    service_token = create_access_token_for_user(user)

    return {
        "access_token": service_token,
        "token_type": "bearer",
        "user": user,
    }
