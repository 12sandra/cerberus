from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class DocumentChunkResponse(BaseModel):
    id: str
    page_number: int
    chunk_index: int
    text_content: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: str
    case_id: str
    filename: str
    file_hash: str
    mime_type: str
    file_size: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DocumentStatusResponse(BaseModel):
    id: str
    status: str
    file_hash: str
    chunks_count: int
    has_extraction: bool
    error_message: Optional[str] = None
