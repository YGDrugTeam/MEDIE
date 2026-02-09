from pydantic import BaseModel


class PillImageRequest(BaseModel):
    image: str
