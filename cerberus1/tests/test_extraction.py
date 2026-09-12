import io

def test_extraction_review_lifecycle(client):
    # 1. Setup case & document
    case_res = client.post("/api/v1/cases", json={
        "fir_number": "FIR-EXT-001/2026",
        "title": "Extraction Review Test"
    })
    case_id = case_res.json()["id"]

    content = b"FIR: Accused: Suresh Nair, Phone: 9876500000, Vehicle: KL-01-AZ-9999, Location: Trivandrum."
    upload_res = client.post(
        f"/api/v1/cases/{case_id}/documents",
        files={"file": ("fir.txt", io.BytesIO(content), "text/plain")}
    )
    doc_id = upload_res.json()["id"]

    ext_res = client.get(f"/api/v1/documents/{doc_id}/extraction")
    ext_id = ext_res.json()["id"]

    # 2. Approve extraction
    review_res = client.post(f"/api/v1/extractions/{ext_id}/review", json={
        "decision": "APPROVED",
        "reviewer_notes": "Entities verified by IO"
    })
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "APPROVED"

    # 3. Verify entities persisted in SQL system of record
    entities_res = client.get("/api/v1/entities/search?q=9876500000")
    assert entities_res.status_code == 200
    entities = entities_res.json()
    assert len(entities) >= 1
    assert entities[0]["normalized_value"] == "9876500000"
