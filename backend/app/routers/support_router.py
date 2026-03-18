import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from app.schemas.support import SupportTicketCreate, SupportTicketAnswer
from app.services.support_cosmos_service import get_support_container

router = APIRouter(prefix="/support", tags=["support"])


def _get_ticket_by_id(container, ticket_id: str):
    query = "SELECT * FROM c WHERE c.id = @id"
    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@id", "value": ticket_id}],
            enable_cross_partition_query=True,
        )
    )

    if not items:
        raise HTTPException(status_code=404, detail="문의글을 찾을 수 없습니다.")

    return items[0]


@router.post("/")
def create_ticket(ticket: SupportTicketCreate):
    container = get_support_container()

    item = {
        "id": str(uuid.uuid4()),
        "title": ticket.title,
        "content": ticket.content,
        "author": ticket.author,
        "category": ticket.category,
        "status": "OPEN",  # OPEN / ANSWERED / CLOSED
        "answer": None,
        "answered_by": None,
        "answered_at": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    created_item = container.create_item(body=item)

    return {
        "message": "문의가 등록되었습니다.",
        "item": created_item,
    }


@router.get("/")
def get_tickets():
    container = get_support_container()

    query = """
    SELECT * FROM c
    ORDER BY c.created_at DESC
    """

    items = list(
        container.query_items(
            query=query,
            enable_cross_partition_query=True,
        )
    )
    return items


@router.get("/{ticket_id}")
def get_ticket_detail(ticket_id: str):
    container = get_support_container()
    return _get_ticket_by_id(container, ticket_id)


@router.post("/{ticket_id}/answer")
def answer_ticket(ticket_id: str, payload: SupportTicketAnswer):
    container = get_support_container()
    item = _get_ticket_by_id(container, ticket_id)

    item["answer"] = payload.answer
    item["answered_by"] = payload.answered_by
    item["answered_at"] = datetime.now(timezone.utc).isoformat()
    item["status"] = "ANSWERED"

    try:
        updated_item = container.replace_item(
            item=item["id"],
            body=item,
            partition_key=item[
                "author"
            ],  # support-tickets 컨테이너 파티션키가 /author 라고 가정
        )
        return {
            "message": "답변 등록 완료",
            "item": updated_item,
        }
    except Exception:
        logging.exception("문의 답변 등록 실패")
        raise HTTPException(
            status_code=500, detail="문의 답변 등록 중 오류가 발생했습니다."
        )


@router.patch("/{ticket_id}/close")
def close_ticket(ticket_id: str):
    container = get_support_container()
    item = _get_ticket_by_id(container, ticket_id)

    item["status"] = "CLOSED"

    try:
        updated_item = container.replace_item(
            item=item["id"],
            body=item,
            partition_key=item["author"],  # support-tickets 파티션키 /author 가정
        )
        return {
            "message": "문의가 종료되었습니다.",
            "item": updated_item,
        }
    except Exception:
        logging.exception("문의 종료 실패")
        raise HTTPException(status_code=500, detail="문의 종료 중 오류가 발생했습니다.")


@router.delete("/{ticket_id}")
def delete_ticket(ticket_id: str):
    container = get_support_container()
    item = _get_ticket_by_id(container, ticket_id)

    try:
        container.delete_item(
            item=item["id"],
            partition_key=item["author"],  # support-tickets 파티션키 /author 가정
        )
        return {"message": "문의글 삭제 완료"}
    except Exception:
        logging.exception("문의글 삭제 실패")
        raise HTTPException(
            status_code=500, detail="문의글 삭제 중 오류가 발생했습니다."
        )
