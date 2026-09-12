import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.db.base import Base

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="INVESTIGATOR")  # ADMIN, INVESTIGATOR, ANALYST
    created_at = Column(DateTime, default=utc_now)

class Station(Base):
    __tablename__ = "stations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    cases = relationship("Case", back_populates="station")

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    fir_number = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="FINANCIAL_CRIME", index=True)
    station_id = Column(String(36), ForeignKey("stations.id"), nullable=True)
    status = Column(String(50), default="OPEN", index=True)  # OPEN, UNDER_INVESTIGATION, CLOSED
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    station = relationship("Station", back_populates="cases")
    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")
    case_entities = relationship("CaseEntity", back_populates="case", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="case", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    notes = relationship("InvestigationNote", back_populates="case", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_hash = Column(String(64), nullable=False, index=True)  # SHA-256
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    status = Column(String(50), default="UPLOADED", index=True)  # UPLOADED, PROCESSING, EXTRACTED, FAILED
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    case = relationship("Case", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    extractions = relationship("Extraction", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    page_number = Column(Integer, default=1)
    chunk_index = Column(Integer, default=0)
    text_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    
    document = relationship("Document", back_populates="chunks")

class Extraction(Base):
    __tablename__ = "extractions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    raw_json = Column(JSON, nullable=False)
    validated_json = Column(JSON, nullable=False)
    status = Column(String(50), default="PENDING_REVIEW", index=True)  # PENDING_REVIEW, APPROVED, EDITED, REJECTED
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    document = relationship("Document", back_populates="extractions")

class Entity(Base):
    __tablename__ = "entities"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    type = Column(String(50), nullable=False, index=True)  # PERSON, PHONE, VEHICLE, LOCATION, ORGANIZATION, BANK_ACCOUNT, UPI, EMAIL
    raw_value = Column(String(255), nullable=False)
    canonical_name = Column(String(255), nullable=False, index=True)
    normalized_value = Column(String(255), nullable=False, index=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    case_associations = relationship("CaseEntity", back_populates="entity")

class CaseEntity(Base):
    __tablename__ = "case_entities"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    entity_id = Column(String(36), ForeignKey("entities.id"), nullable=False, index=True)
    role = Column(String(50), default="SUSPECT", index=True)  # ACCUSED, VICTIM, SUSPECT, WITNESS, CONTACT, OPERATOR
    confidence = Column(Float, default=1.0)
    source = Column(String(100), default="AI_EXTRACTION")
    extraction_id = Column(String(36), ForeignKey("extractions.id"), nullable=True)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    
    case = relationship("Case", back_populates="case_entities")
    entity = relationship("Entity", back_populates="case_associations")

class EntityMatch(Base):
    __tablename__ = "entity_matches"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_entity_id = Column(String(36), ForeignKey("entities.id"), nullable=False, index=True)
    target_entity_id = Column(String(36), ForeignKey("entities.id"), nullable=False, index=True)
    match_type = Column(String(50), default="FUZZY")  # EXACT, FUZZY, SHARED_IDENTIFIER
    score = Column(Float, nullable=False)
    match_reasons_json = Column(JSON, nullable=True)
    status = Column(String(50), default="SUGGESTED", index=True)  # SUGGESTED, CONFIRMED, REJECTED
    reviewed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class Event(Base):
    __tablename__ = "events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    occurred_at = Column(DateTime, nullable=True, index=True)
    location_id = Column(String(36), ForeignKey("entities.id"), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    case = relationship("Case", back_populates="events")

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    entity_id = Column(String(36), ForeignKey("entities.id"), nullable=True)
    chunk_id = Column(String(36), ForeignKey("document_chunks.id"), nullable=True)
    provenance_text = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=utc_now)
    
    case = relationship("Case", back_populates="evidence")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # UPLOAD_DOCUMENT, REVIEW_EXTRACTION, CONFIRM_MATCH, etc.
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(36), nullable=True)
    details_json = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)

class InvestigationNote(Base):
    __tablename__ = "investigation_notes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    
    case = relationship("Case", back_populates="notes")
