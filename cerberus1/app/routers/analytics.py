from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.sql_models import Case
from app.schemas.analytics import TimelineResponse, PatternsResponse, NetworkAnalyticsResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/cases", tags=["Analytics & Leads"])

@router.get("/{id}/timeline", response_model=TimelineResponse)
def get_case_timeline(id: str, db: Session = Depends(get_db)):
    """Retrieve chronological case events with provenance and linked entities."""
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    return analytics_service.get_case_timeline(db, id)

@router.get("/{id}/patterns", response_model=PatternsResponse)
def get_case_patterns(id: str, db: Session = Depends(get_db)):
    """Detect investigative leads, shared cross-case identifiers, and suspicious clusters."""
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    return analytics_service.get_investigative_patterns(db, id)

@router.get("/{id}/analytics", response_model=NetworkAnalyticsResponse)
def get_case_network_analytics(id: str, db: Session = Depends(get_db)):
    """Compute network graph analytics, degree centrality, and bridge entities."""
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    return analytics_service.get_network_analytics(db, id)
