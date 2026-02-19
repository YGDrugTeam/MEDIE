import requests
from datetime import datetime
from app.core.config import DUTY_PHARM_API_KEY
import math
from zoneinfo import ZoneInfo

KST = ZoneInfo("Asia/Seoul")

BASE_URL = (
    "https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService"
    "/getParmacyListInfoInqire"
)


# ===============================
# 거리 계산 (Haversine)
# ===============================
def calculate_distance(lat1, lon1, lat2, lon2):
    """
    두 좌표 간 거리 계산 (meter)
    """
    R = 6371000  # 지구 반지름 (m)

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return round(R * c, 1)


# ===============================
# 요일 관련
# ===============================
def get_today_qt():
    """
    월=1 ~ 일=7
    """
    now = datetime.now(tz=KST)
    return str(now.weekday() + 1)


def get_today_duty_keys():
    now = datetime.now(tz=KST)
    weekday = now.weekday()  # 월=0 ~ 일=6

    # 일요일
    if weekday == 6:
        return "dutyTime8s", "dutyTime8c"

    day = weekday + 1
    return f"dutyTime{day}s", f"dutyTime{day}c"


now = datetime.now(tz=KST)
print("KST NOW:", now)
print("QT:", get_today_qt())
print("DUTY KEYS:", get_today_duty_keys())


# ===============================
# 영업시간 처리
# ===============================
def normalize_time(value):
    """
    "900", 900 -> 900
    "0930" -> 930
    """
    if value is None:
        return None
    try:
        return int(str(value).strip())
    except ValueError:
        return None


def is_open_now(pharmacy: dict) -> bool:
    start_key, close_key = get_today_duty_keys()

    start = normalize_time(pharmacy.get(start_key))
    close = normalize_time(pharmacy.get(close_key))

    if start is None or close is None:
        return False

    now_dt = datetime.now(tz=KST)
    now = now_dt.hour * 100 + now_dt.minute

    return start <= now <= close


# ===============================
# 메인 함수
# ===============================
def fetch_duty_pharmacies(
    sido: str,
    sigungu: str,
    user_lat: float,
    user_lng: float,
):
    # ✅ 공백 방어
    sido = sido.strip()
    sigungu = sigungu.strip()

    params = {
        "serviceKey": DUTY_PHARM_API_KEY,
        "Q0": sido,
        "Q1": sigungu,
        "QT": get_today_qt(),
        "ORD": "ADDR",
        "pageNo": 1,
        "numOfRows": 50,
        "_type": "json",
    }

    response = requests.get(BASE_URL, params=params, timeout=10)
    response.raise_for_status()

    try:
        data = response.json()
    except ValueError:
        raise RuntimeError(f"공공데이터 JSON 파싱 실패:\n{response.text}")

    body = data.get("response", {}).get("body", {})
    items = body.get("items", {}).get("item", [])

    if isinstance(items, dict):
        items = [items]

    result = []

    for p in items:
        # 1️⃣ 영업중 필터
        if not is_open_now(p):
            continue

        # 2️⃣ 좌표 파싱 (문자열 방어)
        try:
            lat = float(p.get("wgs84Lat"))
            lng = float(p.get("wgs84Lon"))
        except (TypeError, ValueError):
            continue

        # 3️⃣ 거리 계산
        distance = calculate_distance(user_lat, user_lng, lat, lng)

        # 🚫 1km 초과 제거
        if distance > 500:
            continue

        p["distance"] = distance
        result.append(p)

    # 4️⃣ 가까운 순 정렬
    result.sort(key=lambda x: x["distance"])

    return result
