from pydantic import BaseModel


class DrugInfoRequest(BaseModel):
    itemSeq: str
