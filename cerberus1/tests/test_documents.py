import io
import hashlib

def test_upload_and_extract_document(client):
    # 1. Create a case
    case_res = client.post("/api/v1/cases", json={
        "fir_number": "FIR-DOC-001/2026",
        "title": "Document Processing Test",
        "category": "FINANCIAL_CRIME"
    })
    case_id = case_res.json()["id"]

    # 2. Upload sample FIR text
    raw_content = b"FIR: 100/2026. Accused: Rahul Kumar, Mobile: 9876543210. Location: Kochi. Cheated victim of 50000 via UPI rahul@oksbi."
    expected_hash = hashlib.sha256(raw_content).hexdigest()

    upload_res = client.post(
        f"/api/v1/cases/{case_id}/documents",
        files={"file": ("sample_fir.txt", io.BytesIO(raw_content), "text/plain")}
    )
    assert upload_res.status_code == 202
    doc_data = upload_res.json()
    assert doc_data["file_hash"] == expected_hash
    doc_id = doc_data["id"]

    # 3. Check status
    status_res = client.get(f"/api/v1/documents/{doc_id}/status")
    assert status_res.status_code == 200
    st = status_res.json()
    assert st["status"] == "EXTRACTED"
    assert st["chunks_count"] >= 1
    assert st["has_extraction"] is True

    # 4. Check extraction
    ext_res = client.get(f"/api/v1/documents/{doc_id}/extraction")
    assert ext_res.status_code == 200
    ext = ext_res.json()
    assert ext["status"] == "PENDING_REVIEW"
    validated = ext["validated_json"]
    assert any(p["value"] == "9876543210" for p in validated["phones"])
    assert any(u["value"] == "rahul@oksbi" for u in validated["upis"])
