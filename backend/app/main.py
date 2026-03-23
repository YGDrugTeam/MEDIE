# app/main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import re
import logging

from app.api import pill
from app.models.pill_predictor import load_model
from app.api import drug
from app.api import analyze
from app.api import pharmacy
from app.api.auth import router as auth_router


from app.routers import device, pills, pill_history
from app.routers import board_router, support_router
from app.routers.auth import router as auth_router2
from app.routers.kakao_auth import router as kakao_auth_router

from app.core.database import Base, engine
from app.models.user import User

from app.core.error_handlers import (
    validation_exception_handler,
    http_exception_handler,
    global_exception_handler,
)

app = FastAPI(title="MedicHubs API", version="2.0")


def field_to_korean(field_name: str) -> str:
    field_map = {
        "email": "이메일",
        "password": "비밀번호",
        "name": "이름",
        "username": "아이디",
        "nickname": "닉네임",
    }
    return field_map.get(field_name, field_name)


def translate_validation_error(err: dict) -> str:
    loc = err.get("loc", [])
    msg = err.get("msg", "")
    err_type = err.get("type", "")

    field = loc[-1] if loc else "입력값"
    field_kr = field_to_korean(str(field))

    msg_lower = str(msg).lower()

    # 이메일 형식 오류
    if "valid email address" in msg_lower:
        return "올바른 이메일 형식으로 입력해주세요."

    # 최소 길이
    if "at least" in msg_lower and "characters" in msg_lower:
        match = re.search(r"at least (\d+) characters", msg, re.IGNORECASE)
        if match:
            min_len = match.group(1)
            return f"{field_kr}는 최소 {min_len}자 이상 입력해주세요."
        return f"{field_kr}가 너무 짧습니다."

    # 최대 길이
    if "at most" in msg_lower and "characters" in msg_lower:
        match = re.search(r"at most (\d+) characters", msg, re.IGNORECASE)
        if match:
            max_len = match.group(1)
            return f"{field_kr}는 최대 {max_len}자까지 입력할 수 있습니다."
        return f"{field_kr}가 너무 깁니다."

    # 필수값 누락
    if "field required" in msg_lower or err_type == "missing":
        return f"{field_kr}를 입력해주세요."

    # 문자열 타입 오류
    if "input should be a valid string" in msg_lower:
        return f"{field_kr}를 올바르게 입력해주세요."

    # 너무 짧은 문자열 (pydantic v2 스타일)
    if err_type == "string_too_short":
        min_length = err.get("ctx", {}).get("min_length")
        if min_length:
            return f"{field_kr}는 최소 {min_length}자 이상 입력해주세요."
        return f"{field_kr}가 너무 짧습니다."

    # 너무 긴 문자열
    if err_type == "string_too_long":
        max_length = err.get("ctx", {}).get("max_length")
        if max_length:
            return f"{field_kr}는 최대 {max_length}자까지 입력할 수 있습니다."
        return f"{field_kr}가 너무 깁니다."

    return f"{field_kr} 입력값을 확인해주세요."


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = [translate_validation_error(err) for err in errors]

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": messages[0] if messages else "입력값을 확인해주세요.",
            "errors": messages,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail

    if isinstance(detail, str):
        message = detail
    elif isinstance(detail, list) and len(detail) > 0:
        message = str(detail[0])
    else:
        message = "요청 처리 중 오류가 발생했습니다."

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": message,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("❌ 서버 내부 오류:", repr(exc))
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 테이블 자동 생성
Base.metadata.create_all(bind=engine)


@app.on_event("startup")
def startup_event():
    load_model()


@app.get("/")
def root():
    return {"message": "MedicHubs API running"}


@app.get("/Arduino")
def test_arduino():

    return {"message": "Hello Arduino~~~~~"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.exception("🔥 서버 내부 에러")
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
    )


app.include_router(pill.router)
app.include_router(drug.router)
app.include_router(analyze.router)
app.include_router(pharmacy.router)
app.include_router(device.router)
app.include_router(pills.router)
app.include_router(pill_history.router)
app.include_router(board_router.router)
app.include_router(support_router.router)
app.include_router(auth_router)
app.include_router(auth_router2)
app.include_router(kakao_auth_router)

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)
