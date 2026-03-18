import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from app.schemas.board import BoardCreate
from app.services.board_cosmos_service import get_board_container

router = APIRouter(prefix="/boards", tags=["boards"])


def _get_board_by_id(container, board_id: str):
    query = "SELECT * FROM c WHERE c.id = @id"
    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@id", "value": board_id}],
            enable_cross_partition_query=True,
        )
    )

    if not items:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    return items[0]


@router.post("/")
def create_board(board: BoardCreate):
    container = get_board_container()

    item = {
        "id": str(uuid.uuid4()),
        "title": board.title,
        "content": board.content,
        "author": board.author,
        "boardType": board.boardType,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "views": 0,
        "likes": 0,
    }

    created_item = container.create_item(body=item)
    return {
        "message": "게시글 등록 완료",
        "item": created_item,
    }


@router.get("/type/{board_type}")
def get_boards_by_type(board_type: str):
    container = get_board_container()

    query = """
    SELECT * FROM c
    WHERE c.boardType = @boardType
    ORDER BY c.created_at DESC
    """

    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@boardType", "value": board_type}],
            enable_cross_partition_query=True,
        )
    )
    return items


@router.get("/type/{board_type}/latest")
def get_latest_boards_by_type(board_type: str):
    return get_boards_by_type(board_type)


@router.get("/type/{board_type}/popular")
def get_popular_boards_by_type(board_type: str):
    container = get_board_container()

    query = """
    SELECT * FROM c
    WHERE c.boardType = @boardType
    ORDER BY c.views DESC
    """

    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@boardType", "value": board_type}],
            enable_cross_partition_query=True,
        )
    )
    return items


@router.get("/type/{board_type}/recommend")
def get_recommend_boards_by_type(board_type: str):
    container = get_board_container()

    query = """
    SELECT * FROM c
    WHERE c.boardType = @boardType
    ORDER BY c.likes DESC
    """

    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@boardType", "value": board_type}],
            enable_cross_partition_query=True,
        )
    )
    return items


@router.get("/search")
def search_boards(q: str, board_type: str | None = None):
    container = get_board_container()

    if board_type:
        query = """
        SELECT * FROM c
        WHERE c.boardType = @boardType
          AND (
            CONTAINS(c.title, @q, true)
            OR CONTAINS(c.content, @q, true)
            OR CONTAINS(c.author, @q, true)
          )
        ORDER BY c.created_at DESC
        """
        parameters = [
            {"name": "@q", "value": q},
            {"name": "@boardType", "value": board_type},
        ]
    else:
        query = """
        SELECT * FROM c
        WHERE
          CONTAINS(c.title, @q, true)
          OR CONTAINS(c.content, @q, true)
          OR CONTAINS(c.author, @q, true)
        ORDER BY c.created_at DESC
        """
        parameters = [{"name": "@q", "value": q}]

    items = list(
        container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True,
        )
    )
    return items


@router.get("/{board_id}")
def get_board_detail(board_id: str):
    container = get_board_container()
    item = _get_board_by_id(container, board_id)

    try:
        current_views = item.get("views", 0)
        new_views = current_views + 1

        # 조회수만 패치
        container.patch_item(
            item=board_id,
            partition_key=item["boardType"],
            patch_operations=[{"op": "replace", "path": "/views", "value": new_views}],
        )

        # 응답에도 증가된 값 반영
        item["views"] = new_views
        return item

    except Exception:
        logging.exception("조회수 증가 실패")
        # 실패해도 원본 상세는 보여줌
        return item


@router.put("/{board_id}")
def update_board(board_id: str, board: BoardCreate):
    container = get_board_container()
    item = _get_board_by_id(container, board_id)

    # 파티션키(boardType) 변경은 위험해서 막는 걸 추천
    if item["boardType"] != board.boardType:
        raise HTTPException(
            status_code=400, detail="게시글 타입(boardType)은 수정할 수 없습니다."
        )

    item["title"] = board.title
    item["content"] = board.content
    item["author"] = board.author
    item["updated_at"] = datetime.now(timezone.utc).isoformat()

    try:
        updated_item = container.replace_item(
            item=item["id"],
            body=item,
            partition_key=item["boardType"],
        )
        return {
            "message": "게시글 수정 완료",
            "item": updated_item,
        }
    except Exception:
        logging.exception("게시글 수정 실패")
        raise HTTPException(
            status_code=500, detail="게시글 수정 중 오류가 발생했습니다."
        )


@router.post("/{board_id}/like")
def like_board(board_id: str):
    container = get_board_container()
    item = _get_board_by_id(container, board_id)

    try:
        current_likes = item.get("likes", 0)
        new_likes = current_likes + 1

        container.patch_item(
            item=board_id,
            partition_key=item["boardType"],
            patch_operations=[{"op": "replace", "path": "/likes", "value": new_likes}],
        )

        item["likes"] = new_likes
        return {
            "message": "좋아요 증가 완료",
            "item": item,
        }
    except Exception:
        logging.exception("좋아요 증가 실패")
        raise HTTPException(
            status_code=500, detail="좋아요 처리 중 오류가 발생했습니다."
        )


@router.post("/{board_id}/unlike")
def unlike_board(board_id: str):
    container = get_board_container()
    item = _get_board_by_id(container, board_id)

    try:
        current_likes = item.get("likes", 0)
        new_likes = max(0, current_likes - 1)

        container.patch_item(
            item=board_id,
            partition_key=item["boardType"],
            patch_operations=[{"op": "replace", "path": "/likes", "value": new_likes}],
        )

        item["likes"] = new_likes
        return {
            "message": "좋아요 감소 완료",
            "item": item,
        }
    except Exception:
        logging.exception("좋아요 감소 실패")
        raise HTTPException(
            status_code=500, detail="좋아요 처리 중 오류가 발생했습니다."
        )


@router.delete("/{board_id}")
def delete_board(board_id: str):
    container = get_board_container()
    item = _get_board_by_id(container, board_id)

    try:
        container.delete_item(
            item=item["id"],
            partition_key=item["boardType"],
        )
        return {"message": "게시글 삭제 완료"}
    except Exception:
        logging.exception("게시글 삭제 실패")
        raise HTTPException(
            status_code=500, detail="게시글 삭제 중 오류가 발생했습니다."
        )
