# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.api import pill
from app.models.pill_predictor import load_model

app = FastAPI(title="MedicLens API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    load_model()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.exception("🔥 서버 내부 에러")
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
    )


app.include_router(pill.router)
