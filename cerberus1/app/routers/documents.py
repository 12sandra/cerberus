import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.sql_models import Case, Document, DocumentChunk, Extraction
from app.schemas.document import DocumentResponse, DocumentStatusResponse
from app.schemas.extraction import ExtractionResponse
from app.services.storage_service import storage_service
from app.services.ocr_service import ocr_service
from app.services.ai_extractor import ai_extractor
from app.core.audit import log_audit

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Documents"])

def process_document_pipeline(document_id: str, db: Session):
    """Background task to extract text chunks, run NLP extraction contract, and prepare for human review."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return
        
    try:
        doc.status = "PROCESSING"
        db.commit()
        
        # 1. OCR / Text Extraction
        chunks_data = ocr_service.extract_text_chunks(doc.file_path, doc.mime_type)
        combined_text = []
        for c in chunks_data:
            chunk = DocumentChunk(
                document_id=doc.id,
                page_number=c.get("page_number", 1),
                chunk_index=c.get("chunk_index", 0),
                text_content=c.get("text_content", "")
            )
            db.add(chunk)
            combined_text.append(c.get("text_content", ""))
        db.flush()
        
        full_text = "\n\n".join(combined_text)
        
        # 2. AI Extraction Contract execution
        contract = ai_extractor.extract(full_text)
        
        # 3. Create Extraction candidate record
        ext = Extraction(
            document_id=doc.id,
            raw_json=contract.model_dump(),
            validated_json=contract.model_dump(),
            status="PENDING_REVIEW"
        )
        db.add(ext)
        
        doc.status = "EXTRACTED"
        db.commit()
        
        log_audit(
            db=db,
            action="PROCESS_DOCUMENT_COMPLETE",
            entity_type="Document",
            entity_id=doc.id,
            details={"chunks": len(chunks_data), "extraction_status": "PENDING_REVIEW"}
        )
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}")
        doc.status = "FAILED"
        doc.error_message = str(e)
        db.commit()

@router.post("/cases/{case_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
@router.post("/cases/{case_id}/upload", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    case_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload FIR / report document, store immutably with SHA-256, and trigger processing."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    saved = await storage_service.save_upload(file)
    
    doc = Document(
        case_id=case_id,
        filename=saved["filename"],
        file_path=saved["file_path"],
        file_hash=saved["file_hash"],
        mime_type=saved["mime_type"],
        file_size=saved["file_size"],
        status="UPLOADED"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    log_audit(
        db=db,
        action="UPLOAD_DOCUMENT",
        entity_type="Document",
        entity_id=doc.id,
        details={"filename": doc.filename, "file_hash": doc.file_hash, "file_size": doc.file_size}
    )
    
    # Run pipeline synchronously or via background task
    process_document_pipeline(doc.id, db)
    db.refresh(doc)
    
    return doc

@router.get("/documents/{id}/status", response_model=DocumentStatusResponse)
def get_document_status(id: str, db: Session = Depends(get_db)):
    """Check processing status of an uploaded document."""
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    chunks_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == id).count()
    has_ext = db.query(Extraction).filter(Extraction.document_id == id).first() is not None
    
    return DocumentStatusResponse(
        id=doc.id,
        status=doc.status,
        file_hash=doc.file_hash,
        chunks_count=chunks_count,
        has_extraction=has_ext,
        error_message=doc.error_message
    )

@router.get("/documents/{id}/extraction", response_model=ExtractionResponse)
def get_document_extraction(id: str, db: Session = Depends(get_db)):
    """Retrieve extracted entities and event candidates awaiting human investigator review."""
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    ext = db.query(Extraction).filter(Extraction.document_id == id).order_by(Extraction.created_at.desc()).first()
    if not ext:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No extraction found for this document yet. Ensure status is EXTRACTED."
        )
        
    return ext
    
@router.get("/cases/{case_id}/documents", response_model=List[DocumentResponse])
def get_case_documents(case_id: str, db: Session = Depends(get_db)):
    """Retrieve all documents associated with a given case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return db.query(Document).filter(Document.case_id == case_id).order_by(Document.created_at.desc()).all()
