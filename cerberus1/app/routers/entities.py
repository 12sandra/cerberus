from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.sql_models import Entity, CaseEntity, EntityMatch, Case, Evidence
from app.schemas.entity import (
    EntityResponse, EntityDetailResponse, EntityMatchResponse,
    EntityMatchDecisionRequest, EvidenceResponse
)
from app.services.resolution_service import resolution_service
from app.services.graph_service import graph_service

router = APIRouter(tags=["Entities"])

@router.get("/entities/search", response_model=List[EntityResponse])
def search_entities(
    q: Optional[str] = Query(None, description="Search term for name or normalized value"),
    entity_type: Optional[str] = Query(None, alias="type", description="Filter by entity type"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Search registered entities across all cases."""
    query = db.query(Entity)
    if entity_type:
        query = query.filter(Entity.type == entity_type.upper())
    if q:
        term = f"%{q}%"
        query = query.filter(or_(
            Entity.canonical_name.ilike(term),
            Entity.normalized_value.ilike(term),
            Entity.raw_value.ilike(term)
        ))
    return query.order_by(Entity.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/entities/{id}", response_model=EntityDetailResponse)
def get_entity_profile(id: str, db: Session = Depends(get_db)):
    """Get complete entity profile with associated cases and provenance."""
    entity = db.query(Entity).filter(Entity.id == id).first()
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")
        
    # Associated cases
    case_associations = db.query(CaseEntity).filter(CaseEntity.entity_id == id).all()
    cases_list = []
    for ca in case_associations:
        c = db.query(Case).filter(Case.id == ca.case_id).first()
        if c:
            cases_list.append({
                "case_id": c.id,
                "fir_number": c.fir_number,
                "title": c.title,
                "role": ca.role,
                "confidence": ca.confidence
            })
            
    # Evidence trail
    evidence_records = db.query(Evidence).filter(Evidence.entity_id == id).all()
    
    # Potential matches
    matches = db.query(EntityMatch).filter(
        or_(EntityMatch.source_entity_id == id, EntityMatch.target_entity_id == id)
    ).all()
    
    resp = EntityDetailResponse.model_validate(entity)
    resp.associated_cases = cases_list
    resp.evidence_trail = [EvidenceResponse.model_validate(ev) for ev in evidence_records]
    resp.potential_matches = [EntityMatchResponse.model_validate(m) for m in matches]
    return resp

@router.get("/entities/{id}/matches", response_model=List[EntityMatchResponse])
def get_entity_matches(id: str, db: Session = Depends(get_db)):
    """Retrieve identity resolution suggestions for this entity."""
    entity = db.query(Entity).filter(Entity.id == id).first()
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")
        
    matches = db.query(EntityMatch).filter(
        or_(EntityMatch.source_entity_id == id, EntityMatch.target_entity_id == id)
    ).all()
    
    res = []
    for m in matches:
        m_resp = EntityMatchResponse.model_validate(m)
        m_resp.source_entity = EntityResponse.model_validate(db.query(Entity).filter(Entity.id == m.source_entity_id).first())
        m_resp.target_entity = EntityResponse.model_validate(db.query(Entity).filter(Entity.id == m.target_entity_id).first())
        res.append(m_resp)
        
        
    return res

@router.get("/cases/{case_id}/matches", response_model=List[EntityMatchResponse])
def get_case_matches(case_id: str, db: Session = Depends(get_db)):
    """Retrieve identity resolution suggestions for all entities involved in a given case."""
    case_entities = db.query(CaseEntity).filter(CaseEntity.case_id == case_id).all()
    entity_ids = [ce.entity_id for ce in case_entities]
    
    if not entity_ids:
        return []
        
    matches = db.query(EntityMatch).filter(
        or_(
            EntityMatch.source_entity_id.in_(entity_ids),
            EntityMatch.target_entity_id.in_(entity_ids)
        )
    ).all()
    
    res = []
    for m in matches:
        m_resp = EntityMatchResponse.model_validate(m)
        src_e = db.query(Entity).filter(Entity.id == m.source_entity_id).first()
        tgt_e = db.query(Entity).filter(Entity.id == m.target_entity_id).first()
        if src_e:
            m_resp.source_entity = EntityResponse.model_validate(src_e)
        if tgt_e:
            m_resp.target_entity = EntityResponse.model_validate(tgt_e)
        res.append(m_resp)
        
    return res

@router.post("/entity-matches/{id}/decision", response_model=EntityMatchResponse)
@router.post("/matches/{id}/action", response_model=EntityMatchResponse)
def decide_entity_match(
    id: str,
    body: EntityMatchDecisionRequest,
    db: Session = Depends(get_db)
):
    """Confirm or reject a suggested entity identity resolution match."""
    raw_decision = body.decision.upper()
    decision = "CONFIRMED" if raw_decision in ("CONFIRM", "CONFIRMED") else ("REJECTED" if raw_decision in ("REJECT", "REJECTED") else None)
    if not decision:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Decision must be CONFIRMED or REJECTED")
        
    match_record = resolution_service.record_decision(db, id, decision, reviewer_id=body.officerName or "investigator-01")
    if not match_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity match not found")

        
    # If confirmed, update Neo4j with SAME_AS relationship
    if decision == "CONFIRMED":
        try:
            from app.db.neo4j_client import neo4j_client
            if neo4j_client.is_available:
                neo4j_client.run_query(
                    """
                    MATCH (a {id: $src})
                    MATCH (b {id: $tgt})
                    MERGE (a)-[r:SAME_AS]-(b)
                    SET r.confirmed_at = datetime()
                    """,
                    {"src": match_record.source_entity_id, "tgt": match_record.target_entity_id}
                )
        except Exception:
            pass

    res = EntityMatchResponse.model_validate(match_record)
    res.source_entity = EntityResponse.model_validate(db.query(Entity).filter(Entity.id == match_record.source_entity_id).first())
    res.target_entity = EntityResponse.model_validate(db.query(Entity).filter(Entity.id == match_record.target_entity_id).first())
    return res

