import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
import networkx as nx

from app.db.neo4j_client import neo4j_client
from app.models.sql_models import Case, Entity, CaseEntity, Event, EntityMatch
from app.schemas.graph import GraphDataResponse, GraphNode, GraphEdge, GraphExpandResponse

logger = logging.getLogger(__name__)

class GraphService:
    def sync_case_to_graph(self, db: Session, case_id: str):
        """Idempotently synchronizes a case, its approved entities, and relationships to Neo4j."""
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return

        if not neo4j_client.is_available:
            logger.info("Neo4j not connected. Skipping graph sync (fallback in-memory mode active).")
            return

        try:
            # 1. Merge Case Node
            neo4j_client.run_query(
                """
                MERGE (c:Case {id: $id})
                SET c.fir_number = $fir_number,
                    c.category = $category,
                    c.station_id = $station_id,
                    c.title = $title
                """,
                {
                    "id": case.id,
                    "fir_number": case.fir_number,
                    "category": case.category,
                    "station_id": case.station_id or "",
                    "title": case.title
                }
            )

            # 2. Merge Entities and Case Relationships
            case_entities = db.query(CaseEntity).filter(CaseEntity.case_id == case_id).all()
            for ce in case_entities:
                entity = db.query(Entity).filter(Entity.id == ce.entity_id).first()
                if not entity:
                    continue

                node_label = self._map_entity_type_to_label(entity.type)
                props = self._build_node_props(entity)

                # Upsert entity node
                cypher_entity = f"""
                MERGE (n:{node_label} {{id: $id}})
                SET n += $props
                """
                neo4j_client.run_query(cypher_entity, {"id": entity.id, "props": props})

                # Link Case to Entity
                rel_type = "INVOLVES" if entity.type == "PERSON" else f"HAS_{entity.type}"
                cypher_rel = f"""
                MATCH (c:Case {{id: $case_id}})
                MATCH (n:{node_label} {{id: $entity_id}})
                MERGE (c)-[r:{rel_type}]->(n)
                SET r.role = $role, r.confidence = $confidence
                """
                neo4j_client.run_query(cypher_rel, {
                    "case_id": case.id,
                    "entity_id": entity.id,
                    "role": ce.role,
                    "confidence": ce.confidence
                })

            # 3. Inter-entity connections (e.g. Person to Phone/Vehicle/UPI in this case)
            person_entities = [ce for ce in case_entities if ce.entity and ce.entity.type == "PERSON"]
            non_person_entities = [ce for ce in case_entities if ce.entity and ce.entity.type != "PERSON"]
            
            for pe in person_entities:
                for npe in non_person_entities:
                    rel_name = self._infer_relationship_name(npe.entity.type)
                    target_label = self._map_entity_type_to_label(npe.entity.type)
                    cypher_link = f"""
                    MATCH (p:Person {{id: $p_id}})
                    MATCH (t:{target_label} {{id: $t_id}})
                    MERGE (p)-[r:{rel_name}]->(t)
                    """
                    neo4j_client.run_query(cypher_link, {"p_id": pe.entity_id, "t_id": npe.entity_id})

            # 4. Sync Confirmed Entity Matches (SAME_AS edges)
            confirmed_matches = db.query(EntityMatch).filter(EntityMatch.status == "CONFIRMED").all()
            for m in confirmed_matches:
                neo4j_client.run_query(
                    """
                    MATCH (a:Person {id: $source_id})
                    MATCH (b:Person {id: $target_id})
                    MERGE (a)-[r:SAME_AS]-(b)
                    SET r.score = $score
                    """,
                    {"source_id": m.source_entity_id, "target_id": m.target_entity_id, "score": m.score}
                )

        except Exception as e:
            logger.error(f"Error syncing case {case_id} to Neo4j: {e}")

    def get_case_graph(self, db: Session, case_id: str) -> GraphDataResponse:
        """Fetch bounded graph for a case (from Neo4j if available, or database fallback)."""
        if neo4j_client.is_available:
            try:
                return self._get_graph_from_neo4j(case_id)
            except Exception as e:
                logger.warning(f"Neo4j query failed ({e}), falling back to SQL graph projection.")

        return self._get_graph_from_db(db, case_id)

    def expand_node(self, db: Session, node_id: str, node_type: Optional[str] = None, hops: int = 1, limit: int = 25) -> GraphExpandResponse:
        """Bounded 1-hop or n-hop expansion for a given node."""
        if neo4j_client.is_available:
            try:
                return self._expand_from_neo4j(node_id, hops, limit)
            except Exception as e:
                logger.warning(f"Neo4j expansion failed ({e}), falling back to SQL expansion.")

        return self._expand_from_db(db, node_id, limit)

    def _get_graph_from_neo4j(self, case_id: str) -> GraphDataResponse:
        cypher = """
        MATCH (c:Case {id: $case_id})-[r]-(n)
        OPTIONAL MATCH (n)-[r2]-(m) WHERE m:Phone OR m:Vehicle OR m:UPI OR m:BankAccount OR m:Case
        RETURN c, r, n, r2, m LIMIT 100
        """
        records = neo4j_client.run_query(cypher, {"case_id": case_id})
        nodes_dict: Dict[str, GraphNode] = {}
        edges_dict: Dict[str, GraphEdge] = {}

        for rec in records:
            c = rec.get("c")
            if c:
                nodes_dict[c["id"]] = GraphNode(
                    id=c["id"],
                    label=c.get("fir_number", "Case"),
                    type="Case",
                    properties=dict(c)
                )

            n = rec.get("n")
            if n and "id" in n:
                label = n.get("canonical_name") or n.get("normalized_value") or n.get("registration") or n.get("fir_number") or n["id"]
                node_type = "Entity"
                for t in ["Person", "Phone", "Vehicle", "Location", "Organization", "BankAccount", "UPI", "Email", "Event", "Case"]:
                    if t in str(rec):
                        node_type = t
                        break
                nodes_dict[n["id"]] = GraphNode(
                    id=n["id"],
                    label=label,
                    type=node_type,
                    properties=dict(n)
                )

            r = rec.get("r")
            if r and c and n:
                edge_id = f"{c['id']}->{n['id']}"
                edges_dict[edge_id] = GraphEdge(
                    id=edge_id,
                    source=c["id"],
                    target=n["id"],
                    type="INVOLVES",
                    label="INVOLVES"
                )

            m = rec.get("m")
            if m and "id" in m and m["id"] != case_id:
                m_label = m.get("fir_number") or m.get("canonical_name") or m.get("normalized_value") or m.get("registration") or m["id"]
                m_type = "Case" if "fir_number" in m else "Entity"
                nodes_dict[m["id"]] = GraphNode(
                    id=m["id"],
                    label=m_label,
                    type=m_type,
                    properties=dict(m)
                )

            r2 = rec.get("r2")
            if r2 and n and m:
                edge_id2 = f"{n['id']}->{m['id']}"
                edges_dict[edge_id2] = GraphEdge(
                    id=edge_id2,
                    source=n["id"],
                    target=m["id"],
                    type="LINKED_ACROSS_CASE" if m.get("fir_number") else "CONNECTED",
                    label="SHARED_IDENTIFIER" if m.get("fir_number") else "CONNECTED"
                )

        nodes = list(nodes_dict.values())
        edges = list(edges_dict.values())
        return GraphDataResponse(
            root_case_id=case_id,
            nodes=nodes,
            edges=edges,
            total_nodes=len(nodes),
            total_edges=len(edges)
        )

    def _get_graph_from_db(self, db: Session, case_id: str) -> GraphDataResponse:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return GraphDataResponse(root_case_id=case_id)

        nodes: List[GraphNode] = [
            GraphNode(
                id=case.id,
                label=case.fir_number,
                type="Case",
                properties={"fir_number": case.fir_number, "category": case.category, "title": case.title}
            )
        ]
        edges: List[GraphEdge] = []

        case_entities = db.query(CaseEntity).filter(CaseEntity.case_id == case_id).all()
        for ce in case_entities:
            e = db.query(Entity).filter(Entity.id == ce.entity_id).first()
            if not e:
                continue
            
            nodes.append(GraphNode(
                id=e.id,
                label=e.canonical_name,
                type=self._format_title(e.type),
                properties={"canonical_name": e.canonical_name, "normalized_value": e.normalized_value, "role": ce.role}
            ))
            
            edges.append(GraphEdge(
                id=f"{case.id}-{e.id}",
                source=case.id,
                target=e.id,
                type="INVOLVES" if e.type == "PERSON" else f"HAS_{e.type}",
                label=ce.role or "INVOLVED"
            ))

        # Add inter-case connections if an entity belongs to other cases too!
        for ce in case_entities:
            other_cases = db.query(CaseEntity).filter(
                CaseEntity.entity_id == ce.entity_id,
                CaseEntity.case_id != case_id
            ).all()
            for oc in other_cases:
                other_case_obj = db.query(Case).filter(Case.id == oc.case_id).first()
                if other_case_obj:
                    # Add other case node
                    if not any(n.id == other_case_obj.id for n in nodes):
                        nodes.append(GraphNode(
                            id=other_case_obj.id,
                            label=other_case_obj.fir_number,
                            type="Case",
                            properties={"fir_number": other_case_obj.fir_number, "category": other_case_obj.category}
                        ))
                    edge_id = f"{other_case_obj.id}-{ce.entity_id}"
                    if not any(ed.id == edge_id for ed in edges):
                        edges.append(GraphEdge(
                            id=edge_id,
                            source=other_case_obj.id,
                            target=ce.entity_id,
                            type="LINKED_ACROSS_CASE",
                            label="SHARED_IDENTIFIER"
                        ))

        return GraphDataResponse(
            root_case_id=case_id,
            nodes=nodes,
            edges=edges,
            total_nodes=len(nodes),
            total_edges=len(edges)
        )

    def _expand_from_neo4j(self, node_id: str, hops: int, limit: int) -> GraphExpandResponse:
        cypher = f"""
        MATCH (start {{id: $node_id}})-[r]-(target)
        RETURN start, r, target LIMIT $limit
        """
        records = neo4j_client.run_query(cypher, {"node_id": node_id, "limit": limit})
        nodes_dict: Dict[str, GraphNode] = {}
        edges_dict: Dict[str, GraphEdge] = {}

        for rec in records:
            start = rec.get("start")
            target = rec.get("target")
            r = rec.get("r")

            for item in (start, target):
                if item and "id" in item:
                    lbl = item.get("canonical_name") or item.get("fir_number") or item.get("normalized_value") or item["id"]
                    nodes_dict[item["id"]] = GraphNode(id=item["id"], label=lbl, type="Entity", properties=dict(item))

            if start and target:
                eid = f"{start['id']}->{target['id']}"
                edges_dict[eid] = GraphEdge(
                    id=eid,
                    source=start["id"],
                    target=target["id"],
                    type="CONNECTED",
                    label="CONNECTED"
                )

        new_nodes = list(nodes_dict.values())
        new_edges = list(edges_dict.values())
        return GraphExpandResponse(
            expanded_node_id=node_id,
            nodes=new_nodes,
            edges=new_edges,
            new_nodes_count=len(new_nodes),
            new_edges_count=len(new_edges)
        )

    def _expand_from_db(self, db: Session, node_id: str, limit: int) -> GraphExpandResponse:
        nodes = []
        edges = []

        # Check if node is an entity
        entity = db.query(Entity).filter(Entity.id == node_id).first()
        if entity:
            nodes.append(GraphNode(
                id=entity.id,
                label=entity.canonical_name,
                type=self._format_title(entity.type),
                properties={"normalized_value": entity.normalized_value}
            ))
            # Find all cases and other entities connected via case
            cases_linked = db.query(CaseEntity).filter(CaseEntity.entity_id == entity.id).limit(limit).all()
            for cl in cases_linked:
                c = db.query(Case).filter(Case.id == cl.case_id).first()
                if c:
                    nodes.append(GraphNode(
                        id=c.id,
                        label=c.fir_number,
                        type="Case",
                        properties={"title": c.title, "category": c.category}
                    ))
                    edges.append(GraphEdge(
                        id=f"{c.id}-{entity.id}",
                        source=c.id,
                        target=entity.id,
                        type="INVOLVES",
                        label=cl.role
                    ))
        else:
            # Maybe node is a Case
            c = db.query(Case).filter(Case.id == node_id).first()
            if c:
                nodes.append(GraphNode(
                    id=c.id,
                    label=c.fir_number,
                    type="Case",
                    properties={"title": c.title}
                ))
                ces = db.query(CaseEntity).filter(CaseEntity.case_id == c.id).limit(limit).all()
                for ce in ces:
                    e = db.query(Entity).filter(Entity.id == ce.entity_id).first()
                    if e:
                        nodes.append(GraphNode(
                            id=e.id,
                            label=e.canonical_name,
                            type=self._format_title(e.type),
                            properties={"normalized_value": e.normalized_value}
                        ))
                        edges.append(GraphEdge(
                            id=f"{c.id}-{e.id}",
                            source=c.id,
                            target=e.id,
                            type="INVOLVES",
                            label=ce.role
                        ))

        return GraphExpandResponse(
            expanded_node_id=node_id,
            nodes=nodes,
            edges=edges,
            new_nodes_count=len(nodes),
            new_edges_count=len(edges)
        )

    def _map_entity_type_to_label(self, entity_type: str) -> str:
        mapping = {
            "PERSON": "Person",
            "PHONE": "Phone",
            "VEHICLE": "Vehicle",
            "LOCATION": "Location",
            "ORGANIZATION": "Organization",
            "BANK_ACCOUNT": "BankAccount",
            "UPI": "UPI",
            "EMAIL": "Email",
            "EVENT": "Event",
            "CASE": "Case"
        }
        return mapping.get(entity_type.upper(), "Entity")

    def _format_title(self, text: str) -> str:
        return text.replace("_", " ").title().replace(" ", "")

    def _infer_relationship_name(self, entity_type: str) -> str:
        mapping = {
            "PHONE": "USES_PHONE",
            "VEHICLE": "OPERATES_VEHICLE",
            "BANK_ACCOUNT": "HOLDS_ACCOUNT",
            "UPI": "USES_UPI",
            "EMAIL": "HAS_EMAIL",
            "LOCATION": "LOCATED_AT",
            "ORGANIZATION": "ASSOCIATED_WITH"
        }
        return mapping.get(entity_type.upper(), "ASSOCIATED_WITH")

    def _build_node_props(self, entity: Entity) -> Dict[str, Any]:
        props = {
            "id": entity.id,
            "raw_value": entity.raw_value,
            "canonical_name": entity.canonical_name,
            "normalized_value": entity.normalized_value
        }
        if entity.type == "VEHICLE":
            props["registration"] = entity.normalized_value
        elif entity.type == "BANK_ACCOUNT":
            props["masked_identifier"] = entity.canonical_name
        return props

graph_service = GraphService()
