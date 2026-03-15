import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routes import sessions, surveys, recommendations
from app.logger import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)

# Create tables on startup
Base.metadata.create_all(bind=engine)
logger.info("Database tables verified/created")

app = FastAPI(title="Couple's Restaurant Recommender", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(sessions.router, prefix="/api")
app.include_router(surveys.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    level = logger.warning if response.status_code >= 400 else logger.info
    level(
        "%s %s -> %d (%.1fms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.get("/api/health")
def health():
    return {"status": "ok"}
