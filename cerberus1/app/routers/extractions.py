from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.sql_models import Extraction, Document, Case, DocumentChunk
from app.schemas.extraction import ExtractionReviewRequest, ExtractionResponse, AIExtractionContract
from app.services.resolution_service import resolution_service
from app.services.graph_service import graph_service
from app.core.audit import log_audit

router = APIRouter(tags=["Extractions"])

class ExtractionActionRequest(BaseModel):
    action: Optional[str] = None # APPROVE, REJECT, EDIT
    decision: Optional[str] = None # APPROVED, REJECTED, EDITED
    editedValue: Optional[str] = None
    rejectionReason: Optional[str] = None
    reviewerNotes: Optional[str] = None
    reviewer_notes: Optional[str] = None
    officerName: Optional[str] = None
    reviewed_payload: Optional[AIExtractionContract] = None

def _resolve_extraction_id(id_str: str, db: Session) -> Optional[Extraction]:
    ext = db.query(Extraction).filter(Extraction.id == id_str).first()
    if ext:
        return ext
    if "_" in id_str:
        candidate_ext_id = id_str.split("_")[0]
        ext = db.query(Extraction).filter(Extraction.id == candidate_ext_id).first()
        if ext:
            return ext
    return None

@router.post("/extractions/{id}/review", response_model=ExtractionResponse)
@router.post("/extractions/{id}/action")
def review_or_action_extraction(
    id: str,
    body: ExtractionActionRequest,
    db: Session = Depends(get_db)
):
    """Approve, edit, or reject extraction candidates (accepts both review and action schemas)."""
    ext = _resolve_extraction_id(id, db)
    if not ext:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extraction not found")
        
    doc = db.query(Document).filter(Document.id == ext.document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated document not found")
        
    raw_decision = (body.decision or body.action or "APPROVED").upper()
    decision_map = {
        "APPROVE": "APPROVED",
        "APPROVED": "APPROVED",
        "REJECT": "REJECTED",
        "REJECTED": "REJECTED",
        "EDIT": "EDITED",
        "EDITED": "EDITED"
    }
    decision = decision_map.get(raw_decision)
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decision must be APPROVED, EDITED, or REJECTED"
        )
        
    ext.status = decision
    ext.reviewed_at = datetime.now(timezone.utc)
    ext.reviewer_id = body.officerName or "investigator-01"
    
    if decision in ("APPROVED", "EDITED"):
        payload_data = body.reviewed_payload.model_dump() if body.reviewed_payload else ext.validated_json
        ext.validated_json = payload_data
        contract = AIExtractionContract.model_validate(payload_data)
        
        resolution_service.process_and_persist_approved_extraction(
            db=db,
            case_id=doc.case_id,
            extraction_id=ext.id,
            contract=contract
        )
        
        try:
            graph_service.sync_case_to_graph(db, doc.case_id)
        except Exception:
            pass

    db.commit()
    db.refresh(ext)
    
    log_audit(
        db=db,
        action=f"REVIEW_EXTRACTION_{decision}",
        entity_type="Extraction",
        entity_id=ext.id,
        details={"decision": decision, "document_id": ext.document_id, "case_id": doc.case_id}
    )
    return ext

@router.get("/cases/{case_id}/extractions")
def get_case_extractions(case_id: str, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Retrieve all extraction candidates across all documents for a case formatted for Module 2 UI."""
    docs = db.query(Document).filter(Document.case_id == case_id).all()
    candidates: List[Dict[str, Any]] = []
    
    for doc in docs:
        exts = db.query(Extraction).filter(Extraction.document_id == doc.id).all()
        chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).all()
        first_chunk_text = chunks[0].text_content if chunks else f"Document: {doc.filename}"
        
        for ext in exts:
            data = ext.validated_json or ext.raw_json or {}
            
            for i, p in enumerate(data.get("persons", [])):
                name = p.get("name", "")
                candidates.append({
                    "id": f"{ext.id}_per_{i}",
                    "caseId": case_id,
                    "documentId": doc.id,
                    "documentName": doc.filename,
                    "entityType": "PERSON",
                    "extractedValue": name,
                    "standardizedValue": name,
                    "pageNumber": 1,
                    "chunkSnippet": first_chunk_text[:200] + ("..." if len(first_chunk_text) > 200 else ""),
                    "confidence": 0.95,
                    "reviewStatus": "APPROVED" if ext.status == "APPROVED" else ("REJECTED" if ext.status == "REJECTED" else "PENDING"),
                    "reviewerNotes": p.get("role", "ACCUSED")
                })
            
            for i, ph in enumerate(data.get("phones", [])):
                val = ph.get("value", "")
                candidates.append({
                    "id": f"{ext.id}_phn_{i}",
                    "caseId": case_id,
                    "documentId": doc.id,
                    "documentName": doc.filename,
                    "entityType": "PHONE",
                    "extractedValue": val,
                    "standardizedValue": val,
                    "pageNumber": 1,
                    "chunkSnippet": first_chunk_text[:200] + ("..." if len(first_chunk_text) > 200 else ""),
                    "confidence": 0.98,
                    "reviewStatus": "APPROVED" if ext.status == "APPROVED" else ("REJECTED" if ext.status == "REJECTED" else "PENDING")
                })

            for i, b in enumerate(data.get("bank_accounts", [])):
                val = b.get("account_number", "")
                candidates.append({
                    "id": f"{ext.id}_bnk_{i}",
                    "caseId": case_id,
                    "documentId": doc.id,
                    "documentName": doc.filename,
                    "entityType": "BANK_ACCOUNT",
                    "extractedValue": val,
                    "standardizedValue": f"A/C {val} ({b.get('ifsc', 'IFSC')})",
                    "pageNumber": 1,
                    "chunkSnippet": first_chunk_text[:200] + ("..." if len(first_chunk_text) > 200 else ""),
                    "confidence": 0.99,
                    "reviewStatus": "APPROVED" if ext.status == "APPROVED" else ("REJECTED" if ext.status == "REJECTED" else "PENDING")
                })

            for i, v in enumerate(data.get("vehicles", [])):
                val = v.get("registration", "")
                candidates.append({
                    "id": f"{ext.id}_veh_{i}",
                    "caseId": case_id,
                    "documentId": doc.id,
                    "documentName": doc.filename,
                    "entityType": "VEHICLE",
                    "extractedValue": val,
                    "standardizedValue": val,
                    "pageNumber": 1,
                    "chunkSnippet": first_chunk_text[:200] + ("..." if len(first_chunk_text) > 200 else ""),
                    "confidence": 0.92,
                    "reviewStatus": "APPROVED" if ext.status == "APPROVED" else ("REJECTED" if ext.status == "REJECTED" else "PENDING")
                })

            for i, loc in enumerate(data.get("locations", [])):
                val = loc.get("name", "")
                candidates.append({
                    "id": f"{ext.id}_loc_{i}",
                    "caseId": case_id,
                    "documentId": doc.id,
                    "documentName": doc.filename,
                    "entityType": "LOCATION",
                    "extractedValue": val,
                    "standardizedValue": val,
                    "pageNumber": 1,
                    "chunkSnippet": first_chunk_text[:200] + ("..." if len(first_chunk_text) > 200 else ""),
                    "confidence": 0.88,
                    "reviewStatus": "APPROVED" if ext.status == "APPROVED" else ("REJECTED" if ext.status == "REJECTED" else "PENDING")
                })

            for i, org in enumerate(data.get("organizations", [])):
                val = org.get("name", "")
                candidates.append({
                    "id": f"{ext.id}_org_{i}",
                    "caseId": case_id,
                    "documentId": doc.id,
                    "documentName": doc.filename,
                    "entityType": "ORGANIZATION",
                    "extractedValue": val,
                    "standardizedValue": val,
                    "pageNumber": 1,
                    "chunkSnippet": first_chunk_text[:200] + ("..." if len(first_chunk_text) > 200 else ""),
                    "confidence": 0.90,
                    "reviewStatus": "APPROVED" if ext.status == "APPROVED" else ("REJECTED" if ext.status == "REJECTED" else "PENDING")
                })

            for i, u in enumerate(data.get("upis", [])):
                val = u.get("value", "")
                candidates.append({
                    "id": f"{ext.id}_upi_{i}",
                    "caseId": case_id,
                    "documentId": doc.id,
                    "documentName": doc.filename,
                    "entityType": "BANK_ACCOUNT",
                    "extractedValue": val,
                    "standardizedValue": f"UPI: {val}",
                    "pageNumber": 1,
                    "chunkSnippet": first_chunk_text[:200] + ("..." if len(first_chunk_text) > 200 else ""),
                    "confidence": 0.95,
                    "reviewStatus": "APPROVED" if ext.status == "APPROVED" else ("REJECTED" if ext.status == "REJECTED" else "PENDING")
                })

            for i, em in enumerate(data.get("emails", [])):
                val = em.get("value", "")
                candidates.append({
                    "id": f"{ext.id}_em_{i}",
                    "caseId": case_id,
                    "documentId": doc.id,
                    "documentName": doc.filename,
                    "entityType": "PHONE",
                    "extractedValue": val,
                    "standardizedValue": val,
                    "pageNumber": 1,
                    "chunkSnippet": first_chunk_text[:200] + ("..." if len(first_chunk_text) > 200 else ""),
                    "confidence": 0.90,
                    "reviewStatus": "APPROVED" if ext.status == "APPROVED" else ("REJECTED" if ext.status == "REJECTED" else "PENDING")
                })
                
    return candidates

