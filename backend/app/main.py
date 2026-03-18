# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.api import pill
from app.models.pill_predictor import load_model
from app.api import drug
from app.api import analyze
from app.api import pharmacy
from app.routers import device, pills, pill_history
from app.routers import board_router, support_router
from app.core.database import Base, engine

app = FastAPI(title="MedicHubs API", version="2.0")

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
