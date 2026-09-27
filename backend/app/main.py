from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import init_db
from .routers import auth, campaigns
from .seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    if settings.seed_on_start:
        seed()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="API پلتفرم کمک هدفمند دست‌یار | HandUp Iran",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")] or ["*"],
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(campaigns.router)


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok", "service": settings.app_name}
