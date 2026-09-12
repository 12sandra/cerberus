from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.sql_models import Case, Station, Document, CaseEntity, Event
from app.schemas.case import CaseCreate, CaseSummary, CaseDetailResponse
from app.core.audit import log_audit

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("", response_model=CaseSummary, status_code=status.HTTP_201_CREATED)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    """Create a new FIR/Case record."""
    existing = db.query(Case).filter(Case.fir_number == case_in.fir_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Case with FIR number '{case_in.fir_number}' already exists."
        )
        
    case = Case(
        fir_number=case_in.fir_number,
        title=case_in.title,
        description=case_in.description,
        category=case_in.category,
        station_id=case_in.station_id,
        status="OPEN"
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    
    log_audit(
        db=db,
        action="CREATE_CASE",
        entity_type="Case",
        entity_id=case.id,
        details={"fir_number": case.fir_number, "category": case.category}
    )
    return case

@router.get("", response_model=List[CaseSummary])
def list_cases(
    q: Optional[str] = Query(None, description="Search term across fir_number, title, description"),
    category: Optional[str] = Query(None, description="Filter by crime category"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List or search cases."""
    query = db.query(Case)
    if category:
        query = query.filter(Case.category == category)
    if status_filter:
        query = query.filter(Case.status == status_filter)
    if q:
        term = f"%{q}%"
        query = query.filter(or_(
            Case.fir_number.ilike(term),
            Case.title.ilike(term),
            Case.description.ilike(term)
        ))
        
    return query.order_by(Case.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=CaseDetailResponse)
def get_case(id: str, db: Session = Depends(get_db)):
    """Get detailed case information including document and entity counts."""
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    docs_cnt = db.query(Document).filter(Document.case_id == id).count()
    entities_cnt = db.query(CaseEntity).filter(CaseEntity.case_id == id).count()
    events_cnt = db.query(Event).filter(Event.case_id == id).count()
    
    res = CaseDetailResponse.model_validate(case)
    res.documents_count = docs_cnt
    res.entities_count = entities_cnt
    res.events_count = events_cnt
    return res
