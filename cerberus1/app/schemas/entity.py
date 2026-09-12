from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, validator

class EntityResponse(BaseModel):
    id: str
    type: str
    raw_value: str
    canonical_name: str
    normalized_value: str
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CaseEntityResponse(BaseModel):
    id: str
    case_id: str
    entity_id: str
    role: str
    confidence: float
    source: str
    is_approved: bool
    entity: Optional[EntityResponse] = None
    model_config = ConfigDict(from_attributes=True)

class EvidenceResponse(BaseModel):
    id: str
    case_id: str
    document_id: str
    provenance_text: str
    confidence: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EntityMatchResponse(BaseModel):
    id: str
    source_entity_id: str
    target_entity_id: str
    match_type: str
    score: float
    match_reasons_json: Optional[List[str]] = None
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    source_entity: Optional[EntityResponse] = None
    target_entity: Optional[EntityResponse] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EntityMatchDecisionRequest(BaseModel):
    decision: str  # CONFIRMED, REJECTED (synonyms accepted)
    reviewer_notes: Optional[str] = None
    officerName: Optional[str] = None

    @validator("decision")
    def normalize_decision(cls, v: str) -> str:
        v_up = v.upper()
        if v_up in ("CONFIRM", "CONFIRMED"):
            return "CONFIRMED"
        if v_up in ("REJECT", "REJECTED"):
            return "REJECTED"
        raise ValueError("Decision must be CONFIRMED or REJECTED")


class EntityDetailResponse(EntityResponse):
    associated_cases: List[Dict[str, Any]] = []
    evidence_trail: List[EvidenceResponse] = []
    potential_matches: List[EntityMatchResponse] = []
    model_config = ConfigDict(from_attributes=True)
