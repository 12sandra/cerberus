from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class StationBase(BaseModel):
    code: str
    name: str
    district: Optional[str] = None
    state: Optional[str] = None

class StationCreate(StationBase):
    pass

class StationResponse(StationBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CaseBase(BaseModel):
    fir_number: str
    title: str
    description: Optional[str] = None
    category: str = "FINANCIAL_CRIME"
    station_id: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None

class CaseSummary(CaseBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CaseDetailResponse(CaseSummary):
    station: Optional[StationResponse] = None
    documents_count: int = 0
    entities_count: int = 0
    events_count: int = 0
    model_config = ConfigDict(from_attributes=True)
