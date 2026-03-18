import re
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


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

    # 문자열 too short (pydantic v2)
    if err_type == "string_too_short":
        min_length = err.get("ctx", {}).get("min_length")
        if min_length:
            return f"{field_kr}는 최소 {min_length}자 이상 입력해주세요."
        return f"{field_kr}가 너무 짧습니다."

    # 문자열 too long
    if err_type == "string_too_long":
        max_length = err.get("ctx", {}).get("max_length")
        if max_length:
            return f"{field_kr}는 최대 {max_length}자까지 입력할 수 있습니다."
        return f"{field_kr}가 너무 깁니다."

    return f"{field_kr} 입력값을 확인해주세요."


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


async def global_exception_handler(request: Request, exc: Exception):
    print("❌ 서버 내부 오류:", repr(exc))
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
    )
