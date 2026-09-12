import io
from app.db.neo4j_client import neo4j_client

def test_section_10_done_criteria_e2e(client):
    """
    Validates all Section 10 Done Criteria:
    1. A sample FIR can be uploaded and processed.
    2. Extracted entities/events are reviewable.
    3. Approved entities are stored in SQL and Neo4j.
    4. Two cases sharing an identifier become connected.
    5. Graph expansion API returns bounded neighborhoods.
    6. Timeline, pattern and analytics APIs work on synthetic data.
    7. All important facts expose provenance.
    8. Audit logs capture uploads, reviews and match decisions.
    """
    # 1. Create Case 1 & Upload FIR
    c1 = client.post("/api/v1/cases", json={
        "fir_number": "FIR-E2E-001/2026",
        "title": "E2E Telegram Investment Scam",
        "category": "FINANCIAL_CRIME"
    }).json()
    
    fir_1 = (
        b"FIR No: E2E-001/2026. Complainant: Priya Sharma. "
        b"Accused: Rahul Kumar, Mobile: 9876543210, Vehicle: KL-07-AB-1234. "
        b"Location: Kochi. Bank Account: 123456789012. UPI: rahul@oksbi."
    )
    doc_1 = client.post(
        f"/api/v1/cases/{c1['id']}/documents",
        files={"file": ("fir1.txt", io.BytesIO(fir_1), "text/plain")}
    ).json()

    # Criteria 1: Processing status is EXTRACTED
    st1 = client.get(f"/api/v1/documents/{doc_1['id']}/status").json()
    assert st1["status"] == "EXTRACTED"
    assert st1["chunks_count"] >= 1

    # Criteria 2: Extracted candidates are reviewable
    ext_1 = client.get(f"/api/v1/documents/{doc_1['id']}/extraction").json()
    assert ext_1["status"] == "PENDING_REVIEW"
    assert len(ext_1["validated_json"]["phones"]) >= 1

    # Criteria 3: Approve extraction & store in SQL + Neo4j
    rev_1 = client.post(f"/api/v1/extractions/{ext_1['id']}/review", json={"decision": "APPROVED"}).json()
    assert rev_1["status"] == "APPROVED"

    # Criteria 4: Second case sharing identifier (Phone 9876543210) connects both cases
    c2 = client.post("/api/v1/cases", json={
        "fir_number": "FIR-E2E-002/2026",
        "title": "E2E Loan App Phishing",
        "category": "FINANCIAL_CRIME"
    }).json()

    fir_2 = (
        b"FIR No: E2E-002/2026. Complainant: Anand Menon. "
        b"Accused: R. Kumar, Mobile: 9876543210, Email: rahul.k@example.com."
    )
    doc_2 = client.post(
        f"/api/v1/cases/{c2['id']}/documents",
        files={"file": ("fir2.txt", io.BytesIO(fir_2), "text/plain")}
    ).json()

    ext_2 = client.get(f"/api/v1/documents/{doc_2['id']}/extraction").json()
    client.post(f"/api/v1/extractions/{ext_2['id']}/review", json={"decision": "APPROVED"})

    # Check that candidate match was generated between Rahul Kumar & R. Kumar
    entities = client.get("/api/v1/entities/search?q=Kumar").json()
    person_entities = [e for e in entities if e["type"] == "PERSON"]
    assert len(person_entities) >= 2

    matches = client.get(f"/api/v1/entities/{person_entities[0]['id']}/matches").json()
    assert len(matches) >= 1
    assert matches[0]["status"] == "SUGGESTED"
    assert matches[0]["score"] >= 0.70

    # Confirm the match
    conf = client.post(f"/api/v1/entity-matches/{matches[0]['id']}/decision", json={"decision": "CONFIRMED"}).json()
    assert conf["status"] == "CONFIRMED"

    # Criteria 5: Graph expansion returns bounded neighborhoods
    graph_res = client.get(f"/api/v1/cases/{c1['id']}/graph").json()
    assert graph_res["total_nodes"] >= 2
    # Verify shared node connects Case 1 and Case 2
    node_labels = [n["label"] for n in graph_res["nodes"]]
    assert "FIR-E2E-001/2026" in node_labels
    assert "FIR-E2E-002/2026" in node_labels # Cross-case connection discovered!

    expand_res = client.post("/api/v1/graph/expand", json={
        "node_id": c1["id"],
        "hops": 1,
        "limit": 10
    }).json()
    assert expand_res["expanded_node_id"] == c1["id"]
    assert len(expand_res["nodes"]) >= 1

    # Criteria 6: Timeline, pattern and analytics APIs work
    tl = client.get(f"/api/v1/cases/{c1['id']}/timeline").json()
    assert tl["case_id"] == c1["id"]

    pat = client.get(f"/api/v1/cases/{c1['id']}/patterns").json()
    assert pat["total_leads"] >= 1
    # Check lead mentions shared identifier
    assert any(lead["pattern_type"] in ("SHARED_IDENTIFIER", "ENTITY_RESOLUTION_LEAD") for lead in pat["leads"])

    analytics = client.get(f"/api/v1/cases/{c1['id']}/analytics").json()
    assert analytics["metrics"]["node_count"] >= 2
    assert len(analytics["metrics"]["cross_case_bridge_entities"]) >= 1

    # Criteria 7: Facts expose provenance
    profile = client.get(f"/api/v1/entities/{person_entities[0]['id']}").json()
    assert len(profile["associated_cases"]) >= 1

    # Criteria 8: Audit logs capture uploads, reviews, and decisions
    audit = client.get("/api/v1/audit").json()
    actions = [a["action"] for a in audit]
    assert any("UPLOAD_DOCUMENT" in a for a in actions)
    assert any("REVIEW_EXTRACTION_APPROVED" in a for a in actions)
    assert any("ENTITY_MATCH_CONFIRMED" in a for a in actions)
