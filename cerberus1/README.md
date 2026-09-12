# CyberSaarthi — Module 1 Backend

> **Data Intelligence, Ingestion, AI Extraction, Entity Resolution & Graph Backend**  
> *CyberSaarthi Prototype | Parallel Development Specification v1.0*

Module 1 turns raw FIRs, police reports, and seizure documents into trusted, traceable structured intelligence and exposes graph, timeline, and analytics APIs designed for parallel integration with Module 2 (Investigation UI & Workflow).

---

## Key Features

1. **Document Ingestion & Immutable Storage**: Stores raw uploads immutably with SHA-256 verification and automatic text chunking.
2. **Pluggable OCR & AI Extraction**: Native PDF (`pdfplumber`) and text extraction with a robust NLP extractor strictly conforming to the Section 5 AI contract.
3. **Investigator Human-in-the-Loop Review**: Staged extractions (`PENDING_REVIEW` -> `APPROVED` / `EDITED` / `REJECTED`).
4. **Entity Normalization & Resolution Engine**:
   - Normalizes Indian phones (`+91`), vehicle numbers (`KL07AB1234`), UPI IDs, and masked bank accounts (`XXXX-XXXX-1234`).
   - Generates conservative candidate matches (fuzzy name similarity + shared strong identifiers like phone/UPI across cases) with explainable reasons.
5. **Neo4j Graph Backend**:
   - Idempotent graph synchronization with node constraints and indexes.
   - Bounded 1-hop / multi-hop graph expansion API (`POST /api/v1/graph/expand`).
   - In-memory/database graph fallback for high reliability when Neo4j is offline.
6. **Timeline, Patterns & Analytics**:
   - Chronological event feeds with provenance evidence.
   - Cross-case pattern detection (shared identifiers, syndicate hub detection).
   - Graph network metrics (degree centrality, cross-case bridge entities, graph density).
7. **Complete 17 REST API Endpoints**: Ready for Module 2 UI consumption.

---

## Quickstart

### 1. Local Development (Fastest)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Seed synthetic demonstration data
python -c "from app.db.session import SessionLocal; from app.services.seed_service import seed_synthetic_data; db=SessionLocal(); seed_synthetic_data(db); db.close()"

# 3. Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Interactive Swagger API docs: **[http://localhost:8000/docs](http://localhost:8000/docs)**
- OpenAPI Schema: **[http://localhost:8000/api/v1/openapi.json](http://localhost:8000/api/v1/openapi.json)**

### 2. Running with Docker Compose

```bash
docker compose up -d --build
```
This launches:
- `cerberus-postgres` on port `5433`
- `cerberus-neo4j` on ports `7474` (HTTP) and `7687` (Bolt)
- `cerberus-backend` on port `8000`

---

## Running the Automated Test Suite

```bash
python -m pytest -v
```

All 9 comprehensive unit, integration, and Section 10 E2E tests will run in ~1.5s:
- `test_cases.py`: Case creation and filtering
- `test_documents.py`: Upload, SHA-256 hash calculation, chunking
- `test_extraction.py`: AI extraction contract and review lifecycle
- `test_entity_resolution.py`: Normalization, candidate scoring, and match decisions
- `test_graph.py`: Graph retrieval and bounded 1-hop expansion
- `test_analytics.py`: Timeline, patterns, and network centrality
- `test_audit.py`: Audit trail logging
- `test_section_10_e2e.py`: Full end-to-end verification of all Done Criteria

---

## Integration with Module 2

For detailed endpoint schemas, payload examples, and UI integration workflows, please refer to:
- **[MODULE_2_INTEGRATION.md](MODULE_2_INTEGRATION.md)**
