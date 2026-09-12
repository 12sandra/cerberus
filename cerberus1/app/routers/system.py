from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.neo4j_client import neo4j_client
from app.services.seed_service import seed_synthetic_data
from app.config import settings

router = APIRouter(tags=["System"])

@router.get("/health")
def health_check():
    """Health check for service monitoring and container probes."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "neo4j_connected": neo4j_client.is_available
    }

@router.post("/seed")
def trigger_seed(db: Session = Depends(get_db)):
    """Seed synthetic FIRs, entities, and cross-case links for demo and verification."""
    seed_synthetic_data(db)
    return {"message": "Synthetic dataset seeded successfully"}
