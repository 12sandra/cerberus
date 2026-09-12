from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.sql_models import Case
from app.schemas.graph import GraphDataResponse, GraphExpandRequest, GraphExpandResponse
from app.services.graph_service import graph_service
from app.core.audit import log_audit

router = APIRouter(tags=["Graph"])

@router.get("/cases/{id}/graph", response_model=GraphDataResponse)
def get_case_graph(id: str, db: Session = Depends(get_db)):
    """Retrieve root graph neighborhood for a case."""
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        
    return graph_service.get_case_graph(db, id)

@router.post("/graph/expand", response_model=GraphExpandResponse)
def expand_graph_node(
    req: GraphExpandRequest,
    db: Session = Depends(get_db)
):
    """Bounded graph expansion around a target node."""
    target_node_id = req.node_id or req.nodeId
    if not target_node_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="node_id or nodeId is required")
        
    actual_limit = req.maxCount or req.limit
    
    res = graph_service.expand_node(
        db=db,
        node_id=target_node_id,
        node_type=req.node_type,
        hops=req.hops,
        limit=actual_limit
    )
    # Populate camelCase added arrays for frontend compatibility
    res.addedNodes = res.nodes
    res.addedEdges = res.edges
    
    log_audit(
        db=db,
        action="EXPAND_GRAPH",
        entity_id=target_node_id,
        details={"hops": req.hops, "limit": actual_limit, "returned_nodes": res.new_nodes_count}
    )
    return res

