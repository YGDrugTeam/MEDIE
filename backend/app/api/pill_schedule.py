import uuid
from fastapi import APIRouter, HTTPException
from app.db.cosmos import get_container
from app.schemas.pill_schedule import PillScheduleCreate

router = APIRouter(prefix="/pill-schedules", tags=["pill-schedules"])


@router.post("/")
def create_pill_schedule(data: PillScheduleCreate):
    container = get_container()

    item = {
        "id": str(uuid.uuid4()),
        "userId": data.userId,
        "pillName": data.pillName,
        "time": data.time,
        "enabled": data.enabled,
    }

    created_item = container.create_item(body=item)
    return {"message": "복약 알람 저장 성공", "item": created_item}


@router.get("/{user_id}")
def get_pill_schedules(user_id: str):
    container = get_container()

    query = "SELECT * FROM c WHERE c.userId = @userId"
    parameters = [{"name": "@userId", "value": user_id}]

    items = list(
        container.query_items(
            query=query, parameters=parameters, enable_cross_partition_query=True
        )
    )

    return {"count": len(items), "items": items}


@router.put("/{item_id}")
def update_pill_schedule(item_id: str, data: PillScheduleCreate):
    container = get_container()

    try:
        item = container.read_item(item=item_id, partition_key=data.userId)
    except Exception:
        raise HTTPException(status_code=404, detail="해당 일정이 없습니다.")

    item["pillName"] = data.pillName
    item["time"] = data.time
    item["enabled"] = data.enabled

    updated_item = container.replace_item(item=item_id, body=item)

    return {"message": "복약 알람 수정 성공", "item": updated_item}


@router.delete("/{item_id}/{user_id}")
def delete_pill_schedule(item_id: str, user_id: str):
    container = get_container()

    try:
        container.delete_item(item=item_id, partition_key=user_id)
        return {"message": "복약 알람 삭제 성공"}
    except Exception:
        raise HTTPException(status_code=404, detail="해당 일정이 없습니다.")
