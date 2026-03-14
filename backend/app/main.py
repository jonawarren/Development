from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routes import sessions, surveys, recommendations

# Create tables on startup
Base.metadata.create_all(bind=engine)

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


@app.get("/api/health")
def health():
    return {"status": "ok"}
