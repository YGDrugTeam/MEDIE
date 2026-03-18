from pydantic import BaseModel


class KakaoLoginRequest(BaseModel):
    kakao_access_token: str
