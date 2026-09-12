from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class GraphNode(BaseModel):
    id: str
    label: str
    type: str # Case, Person, Phone, Vehicle, Location, Organization, BankAccount, UPI, Email, Event
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str # INVOLVES, USES_PHONE, OPERATES_VEHICLE, LOCATED_AT, ASSOCIATED_WITH, HOLDS_ACCOUNT, USES_UPI, HAS_EMAIL, HAS_EVENT, OCCURRED_AT, SAME_AS
    label: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphDataResponse(BaseModel):
    root_case_id: Optional[str] = None
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []
    total_nodes: int = 0
    total_edges: int = 0

class GraphExpandRequest(BaseModel):
    node_id: Optional[str] = None
    nodeId: Optional[str] = None
    caseId: Optional[str] = None
    case_id: Optional[str] = None
    node_type: Optional[str] = None
    hops: int = Field(default=1, ge=1, le=3)
    limit: int = Field(default=25, ge=1, le=100)
    maxCount: Optional[int] = None

class GraphExpandResponse(BaseModel):
    expanded_node_id: str
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []
    addedNodes: List[GraphNode] = []
    addedEdges: List[GraphEdge] = []
    new_nodes_count: int = 0
    new_edges_count: int = 0

