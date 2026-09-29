from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal, ensure_schema_migrations
from app.seed.seed_data import seed_database

# Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.modules import router as modules_router
from app.api.v1.areas import router as areas_router
from app.api.v1.topics import router as topics_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.progress import router as progress_router
from app.api.v1.ai import router as ai_router
from app.api.v1.settings import router as settings_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lift")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    ensure_schema_migrations(engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown
    logger.info("Shutting down LIFT backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="LIFT — BM1 → BM2 → TOI Learning & Preparation Management Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
api_v1_str = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1_str)
app.include_router(modules_router, prefix=api_v1_str)
app.include_router(areas_router, prefix=api_v1_str)
app.include_router(topics_router, prefix=api_v1_str)
app.include_router(tasks_router, prefix=api_v1_str)
app.include_router(progress_router, prefix=api_v1_str)
app.include_router(ai_router, prefix=api_v1_str)
app.include_router(settings_router, prefix=api_v1_str)

@app.get("/")
def root():
    return {
        "app": "LIFT",
        "description": "BM1 → BM2 → TOI Preparation Platform",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
