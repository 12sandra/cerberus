from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class TimelineEvent(BaseModel):
    id: str
    case_id: str
    event_type: str
    description: str
    occurred_at: Optional[str] = None
    location: Optional[str] = None
    linked_entities: List[Dict[str, Any]] = []
    provenance_text: Optional[str] = None

class TimelineResponse(BaseModel):
    case_id: str
    events: List[TimelineEvent] = []
    total_events: int = 0

class PatternLead(BaseModel):
    pattern_type: str # SHARED_IDENTIFIER, MULTI_CASE_BRIDGE, HUB_OPERATOR, FINANCIAL_CLUSTER
    severity: str = "HIGH" # HIGH, MEDIUM, LOW
    title: str
    description: str
    confidence: float
    involved_cases: List[Dict[str, Any]] = []
    involved_entities: List[Dict[str, Any]] = []
    evidence_trail: List[str] = []

class PatternsResponse(BaseModel):
    case_id: str
    leads: List[PatternLead] = []
    total_leads: int = 0

class CentralityNode(BaseModel):
    entity_id: str
    entity_name: str
    entity_type: str
    degree: int
    connected_cases_count: int

class NetworkMetrics(BaseModel):
    node_count: int
    edge_count: int
    density: float
    top_central_entities: List[CentralityNode] = []
    cross_case_bridge_entities: List[CentralityNode] = []

class NetworkAnalyticsResponse(BaseModel):
    case_id: str
    metrics: NetworkMetrics
