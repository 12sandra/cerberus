import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db.base import Base
from app.db.session import engine
from app.db.neo4j_client import neo4j_client
from app.routers import (
    cases, documents, extractions, entities, graph, analytics, audit, auth, system, evidence, ai
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables
    logger.info("Initializing relational database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Connect Neo4j
    logger.info("Connecting to Neo4j graph database...")
    neo4j_client.connect()
    
    yield
    
    # Shutdown
    logger.info("Shutting down resources...")
    neo4j_client.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "CyberSaarthi Module 1: Data Intelligence, Document Ingestion, "
        "AI Extraction, Entity Resolution & Graph Backend.\n\n"
        "Provides trusted, structured data, bounded graph expansions, "
        "timelines, and pattern analytics for Module 2 UI integration."
    ),
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for Module 2 UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(cases.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(extractions.router, prefix=settings.API_V1_STR)
app.include_router(entities.router, prefix=settings.API_V1_STR)
app.include_router(graph.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(evidence.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(system.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "Welcome to CyberSaarthi Module 1 Backend API",
        "docs": "/docs",
        "version": settings.VERSION,
        "spec": "Parallel Development Specification v1.0"
    }
