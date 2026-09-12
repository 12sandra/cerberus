import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sql_models import Case, Entity, CaseEntity, Event, Evidence, EntityMatch
from app.schemas.analytics import (
    TimelineResponse, TimelineEvent, PatternsResponse, PatternLead,
    NetworkAnalyticsResponse, NetworkMetrics, CentralityNode
)

logger = logging.getLogger(__name__)

class AnalyticsService:
    def get_case_timeline(self, db: Session, case_id: str) -> TimelineResponse:
        """Fetch chronological events with provenance and linked entities."""
        events = db.query(Event).filter(Event.case_id == case_id).order_by(Event.occurred_at.asc()).all()
        timeline_events = []
        
        for ev in events:
            # Find evidence provenance for this event if any
            evidence = db.query(Evidence).filter(Evidence.case_id == case_id).first()
            provenance = evidence.provenance_text if evidence else "FIR statement recorded on intake"
            
            # Find linked case entities
            case_entities = db.query(CaseEntity).filter(CaseEntity.case_id == case_id).all()
            linked = [
                {"id": ce.entity.id, "name": ce.entity.canonical_name, "type": ce.entity.type, "role": ce.role}
                for ce in case_entities if ce.entity
            ]
            
            timeline_events.append(TimelineEvent(
                id=ev.id,
                case_id=case_id,
                event_type=ev.event_type,
                description=ev.description,
                occurred_at=ev.occurred_at.isoformat() if ev.occurred_at else None,
                linked_entities=linked[:5],
                provenance_text=provenance
            ))
            
        return TimelineResponse(
            case_id=case_id,
            events=timeline_events,
            total_events=len(timeline_events)
        )

    def get_investigative_patterns(self, db: Session, case_id: str) -> PatternsResponse:
        """Detect cross-case investigative leads, shared identifiers, and suspicious patterns."""
        leads: List[PatternLead] = []
        
        # 1. Check for entities in this case that appear in OTHER cases
        case_entities = db.query(CaseEntity).filter(CaseEntity.case_id == case_id).all()
        for ce in case_entities:
            entity = ce.entity
            if not entity:
                continue
                
            other_cases = (
                db.query(CaseEntity)
                .filter(CaseEntity.entity_id == entity.id, CaseEntity.case_id != case_id)
                .all()
            )
            
            if other_cases:
                other_case_ids = [oc.case_id for oc in other_cases]
                other_case_objs = db.query(Case).filter(Case.id.in_(other_case_ids)).all()
                cases_info = [{"id": c.id, "fir_number": c.fir_number, "title": c.title} for c in other_case_objs]
                
                leads.append(PatternLead(
                    pattern_type="SHARED_IDENTIFIER",
                    severity="HIGH",
                    title=f"Cross-Case Shared Identifier: {entity.canonical_name} ({entity.type})",
                    description=(
                        f"The {entity.type} '{entity.canonical_name}' links this case directly to "
                        f"{len(other_case_objs)} other registered case(s): {', '.join([c.fir_number for c in other_case_objs])}."
                    ),
                    confidence=0.95,
                    involved_cases=cases_info,
                    involved_entities=[{
                        "id": entity.id,
                        "canonical_name": entity.canonical_name,
                        "type": entity.type,
                        "normalized_value": entity.normalized_value
                    }],
                    evidence_trail=[f"Appeared in FIR documents across multiple cases as {ce.role}."]
                ))

        # 2. Check for SUGGESTED or CONFIRMED Entity Matches involving entities of this case
        entity_ids = [ce.entity_id for ce in case_entities]
        matches = db.query(EntityMatch).filter(
            (EntityMatch.source_entity_id.in_(entity_ids)) | (EntityMatch.target_entity_id.in_(entity_ids))
        ).all()
        
        for m in matches:
            src = db.query(Entity).filter(Entity.id == m.source_entity_id).first()
            tgt = db.query(Entity).filter(Entity.id == m.target_entity_id).first()
            if src and tgt:
                leads.append(PatternLead(
                    pattern_type="ENTITY_RESOLUTION_LEAD",
                    severity="HIGH" if m.status == "CONFIRMED" else "MEDIUM",
                    title=f"Potential Identity Link: {src.canonical_name} ↔ {tgt.canonical_name} ({int(m.score*100)}%)",
                    description=f"Status: {m.status}. Reasons: {'; '.join(m.match_reasons_json or [])}",
                    confidence=m.score,
                    involved_cases=[],
                    involved_entities=[
                        {"id": src.id, "canonical_name": src.canonical_name, "type": src.type},
                        {"id": tgt.id, "canonical_name": tgt.canonical_name, "type": tgt.type}
                    ],
                    evidence_trail=m.match_reasons_json or []
                ))

        # 3. Hub Person Detection
        for ce in case_entities:
            if ce.entity and ce.entity.type == "PERSON":
                # Count total connected entities across all cases
                p_cases = db.query(CaseEntity).filter(CaseEntity.entity_id == ce.entity_id).all()
                if len(p_cases) > 1:
                    leads.append(PatternLead(
                        pattern_type="HUB_OPERATOR",
                        severity="HIGH",
                        title=f"Repeat Offender / Syndicate Hub: {ce.entity.canonical_name}",
                        description=f"Subject is involved across {len(p_cases)} independent FIR investigations.",
                        confidence=0.92,
                        involved_cases=[{"id": pc.case_id, "role": pc.role} for pc in p_cases],
                        involved_entities=[{"id": ce.entity.id, "name": ce.entity.canonical_name, "type": "PERSON"}],
                        evidence_trail=[f"Multiple case filings registered with identical personal identifiers."]
                    ))

        return PatternsResponse(
            case_id=case_id,
            leads=leads,
            total_leads=len(leads)
        )

    def get_network_analytics(self, db: Session, case_id: str) -> NetworkAnalyticsResponse:
        """Calculate degree centrality, network density, and cross-case bridges."""
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return NetworkAnalyticsResponse(
                case_id=case_id,
                metrics=NetworkMetrics(node_count=0, edge_count=0, density=0.0)
            )

        case_entities = db.query(CaseEntity).filter(CaseEntity.case_id == case_id).all()
        entities = [ce.entity for ce in case_entities if ce.entity]

        centralities: List[CentralityNode] = []
        bridge_entities: List[CentralityNode] = []

        total_nodes = 1 + len(entities)
        total_edges = len(case_entities)

        for ce in case_entities:
            e = ce.entity
            if not e:
                continue
            # Total degree: connected cases + other case entities
            case_count = db.query(CaseEntity).filter(CaseEntity.entity_id == e.id).count()
            degree = case_count + (len(entities) - 1 if e.type == "PERSON" else 1)
            
            c_node = CentralityNode(
                entity_id=e.id,
                entity_name=e.canonical_name,
                entity_type=e.type,
                degree=degree,
                connected_cases_count=case_count
            )
            centralities.append(c_node)
            
            if case_count > 1:
                bridge_entities.append(c_node)

        centralities.sort(key=lambda x: x.degree, reverse=True)
        bridge_entities.sort(key=lambda x: x.connected_cases_count, reverse=True)

        density = (2 * total_edges) / (total_nodes * (total_nodes - 1)) if total_nodes > 1 else 0.0

        return NetworkAnalyticsResponse(
            case_id=case_id,
            metrics=NetworkMetrics(
                node_count=total_nodes,
                edge_count=total_edges,
                density=round(density, 3),
                top_central_entities=centralities[:5],
                cross_case_bridge_entities=bridge_entities
            )
        )

analytics_service = AnalyticsService()
