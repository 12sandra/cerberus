# Module 2 Integration Guide: CyberSaarthi Data Intelligence Backend

This document specifies the exact API contracts, workflows, and response schemas exposed by **Module 1 (Data Intelligence & Graph Backend)** for seamless consumption by **Module 2 (Investigator UI, Dashboards & Workflow Management)**.

---

## 1. Quick Integration Overview

- **Base URL**: `http://localhost:8000/api/v1`
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **OpenAPI 3.1 Spec**: `http://localhost:8000/api/v1/openapi.json`
- **CORS Support**: Enabled out-of-the-box for `http://localhost:3000`, `http://localhost:3001`, `http://localhost:5173`, etc.
- **Authentication**: Bearer JWT token obtained via `POST /api/v1/auth/token`.

---

## 2. API Endpoints Map (17 Required Endpoints)

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Cases** | `POST` | `/api/v1/cases` | Register a new FIR / case |
| | `GET` | `/api/v1/cases` | List / search cases (filter by `category`, `status`, `q`) |
| | `GET` | `/api/v1/cases/{id}` | Case summary with document and entity counts |
| **Documents** | `POST` | `/api/v1/cases/{id}/documents` | Upload FIR / report file (PDF, TXT, images) |
| | `GET` | `/api/v1/documents/{id}/status` | Check processing status (`UPLOADED`, `EXTRACTED`, `FAILED`) |
| | `GET` | `/api/v1/documents/{id}/extraction` | Preview AI extraction candidates awaiting review |
| **Review** | `POST` | `/api/v1/extractions/{id}/review` | Human approval, editing, or rejection of extraction |
| **Entities** | `GET` | `/api/v1/entities/search` | Global entity search across cases |
| | `GET` | `/api/v1/entities/{id}` | Complete entity 360 profile with case history and evidence |
| | `GET` | `/api/v1/entities/{id}/matches` | Identity resolution candidate suggestions |
| | `POST` | `/api/v1/entity-matches/{id}/decision` | Confirm or reject identity match |
| **Graph** | `GET` | `/api/v1/cases/{id}/graph` | Root bounded graph for case visualization |
| | `POST` | `/api/v1/graph/expand` | 1-hop on-demand node expansion on user click |
| **Analytics** | `GET` | `/api/v1/cases/{id}/timeline` | Chronological case events with evidence provenance |
| | `GET` | `/api/v1/cases/{id}/patterns` | Detected investigative leads and shared identifiers |
| | `GET` | `/api/v1/cases/{id}/analytics` | Network centrality, bridge nodes, graph density |
| **Audit** | `GET` | `/api/v1/audit` | Immutable audit log trail |

---

## 3. Key UI Workflows in Module 2

### A. Document Upload & Review Flow
1. User uploads an FIR file in Module 2 UI -> `POST /api/v1/cases/{id}/documents` (multipart form).
2. UI polls `GET /api/v1/documents/{id}/status` until status is `EXTRACTED`.
3. UI displays side-by-side document preview and extracted facts from `GET /api/v1/documents/{id}/extraction`.
4. Investigator approves or edits candidates -> `POST /api/v1/extractions/{id}/review` (`decision: "APPROVED"`).
5. Module 1 normalizes entities, persists them, updates Neo4j, and calculates identity match candidates.

### B. Identity Resolution Review Flow
1. Investigator opens Entity Profile or Cases Lead view in Module 2.
2. Call `GET /api/v1/entities/{id}/matches`.
3. If matches exist (status `SUGGESTED`), UI displays a banner (e.g. *“Possible match with R. Kumar (FIR 002/2026) sharing phone 9876543210. Score: 99%”*).
4. Investigator clicks **Confirm Match** or **Reject Match**:
   - `POST /api/v1/entity-matches/{id}/decision` with `{"decision": "CONFIRMED"}` or `{"decision": "REJECTED"}`.
5. Confirmed match automatically establishes a `SAME_AS` edge in Neo4j and updates investigative patterns.

### C. Interactive Graph Visualization
Module 1 returns standard graph JSON compatible with React Flow, Cytoscape.js, or Vis.js:
```json
{
  "root_case_id": "case-uuid",
  "nodes": [
    {"id": "node-1", "label": "001/2026/CYBER", "type": "Case", "properties": {}},
    {"id": "node-2", "label": "Rahul Kumar", "type": "Person", "properties": {"canonical_name": "Rahul Kumar"}},
    {"id": "node-3", "label": "9876543210", "type": "Phone", "properties": {"normalized_value": "9876543210"}}
  ],
  "edges": [
    {"id": "edge-1", "source": "node-1", "target": "node-2", "type": "INVOLVES", "label": "ACCUSED"},
    {"id": "edge-2", "source": "node-1", "target": "node-3", "type": "HAS_PHONE", "label": "COMMUNICATION"}
  ],
  "total_nodes": 3,
  "total_edges": 2
}
```
When user double-clicks a node in the graph, UI calls:
- `POST /api/v1/graph/expand` with `{"node_id": "node-3", "hops": 1, "limit": 25}` to dynamically render the 1-hop neighborhood without freezing the UI.
