from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

# Section 5 Sub-models
class ExtractedCase(BaseModel):
    crime_category: str = "FINANCIAL_CRIME"
    fir_number: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None

class ExtractedPerson(BaseModel):
    name: str
    role: str = "ACCUSED" # ACCUSED, VICTIM, SUSPECT, WITNESS, CONTACT, OPERATOR
    aliases: Optional[List[str]] = Field(default_factory=list)
    notes: Optional[str] = None

class ExtractedPhone(BaseModel):
    value: str
    owner_name: Optional[str] = None

class ExtractedVehicle(BaseModel):
    registration: str
    make_model: Optional[str] = None
    owner_name: Optional[str] = None

class ExtractedLocation(BaseModel):
    name: str
    coordinates: Optional[str] = None

class ExtractedOrganization(BaseModel):
    name: str
    registration_id: Optional[str] = None

class ExtractedBankAccount(BaseModel):
    account_number: str
    ifsc: Optional[str] = None
    bank_name: Optional[str] = None
    holder_name: Optional[str] = None

class ExtractedUPI(BaseModel):
    value: str
    holder_name: Optional[str] = None

class ExtractedEmail(BaseModel):
    value: str
    owner_name: Optional[str] = None

class ExtractedEvent(BaseModel):
    event_type: str # FRAUD_CALL, MONEY_TRANSFER, SIM_PURCHASE, MEETING, FIR_FILED
    description: str
    occurred_at: Optional[str] = None
    location: Optional[str] = None

class ExtractedRelationship(BaseModel):
    source_type: str # Person, Organization, Case
    source_name: str
    relationship: str # OWNS_PHONE, OPERATES_VEHICLE, TRANSFERRED_TO, ASSOCIATED_WITH
    target_type: str # Phone, Vehicle, BankAccount, UPI, Person, Organization
    target_value: str

# Section 5 AI Extraction Contract Schema
class AIExtractionContract(BaseModel):
    case: ExtractedCase = Field(default_factory=ExtractedCase)
    persons: List[ExtractedPerson] = Field(default_factory=list)
    phones: List[ExtractedPhone] = Field(default_factory=list)
    vehicles: List[ExtractedVehicle] = Field(default_factory=list)
    locations: List[ExtractedLocation] = Field(default_factory=list)
    organizations: List[ExtractedOrganization] = Field(default_factory=list)
    bank_accounts: List[ExtractedBankAccount] = Field(default_factory=list)
    upis: List[ExtractedUPI] = Field(default_factory=list)
    emails: List[ExtractedEmail] = Field(default_factory=list)
    events: List[ExtractedEvent] = Field(default_factory=list)
    relationships: List[ExtractedRelationship] = Field(default_factory=list)

class ExtractionReviewRequest(BaseModel):
    decision: str = "APPROVED" # APPROVED, EDITED, REJECTED
    reviewed_payload: Optional[AIExtractionContract] = None
    reviewer_notes: Optional[str] = None

class ExtractionResponse(BaseModel):
    id: str
    document_id: str
    status: str
    validated_json: AIExtractionContract
    reviewer_id: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
