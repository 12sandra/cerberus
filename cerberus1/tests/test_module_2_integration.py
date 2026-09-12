import io

def test_module_2_integration_endpoints(client):
    # 1. Create a Case
    c_res = client.post("/api/v1/cases", json={
        "fir_number": "FIR-INT-001/2026",
        "title": "Integration Test Case",
        "category": "FINANCIAL_CRIME"
    })
    assert c_res.status_code == 201
    case_id = c_res.json()["id"]

    # Listing cases
    cases_res = client.get("/api/v1/cases")
    assert cases_res.status_code == 200
    cases = cases_res.json()
    assert len(cases) >= 1


    # 2. Upload document via /upload alias endpoint
    sample_file = b"FIR No: INT-001/2026. Suspect: Test User, Mobile: 9111122222, Vehicle: KL01AB1111, Location: Kochi."
    up_res = client.post(
        f"/api/v1/cases/{case_id}/upload",
        files={"file": ("test.txt", io.BytesIO(sample_file), "text/plain")}
    )
    assert up_res.status_code == 202
    doc_id = up_res.json()["id"]

    # 3. Case documents listing
    docs_res = client.get(f"/api/v1/cases/{case_id}/documents")
    assert docs_res.status_code == 200
    docs = docs_res.json()
    assert len(docs) >= 1

    # 4. Document status
    st_res = client.get(f"/api/v1/documents/{doc_id}/status")
    assert st_res.status_code == 200


    # 5. Case extractions listing
    ext_res = client.get(f"/api/v1/cases/{case_id}/extractions")
    assert ext_res.status_code == 200
    exts = ext_res.json()
    assert isinstance(exts, list)
    if len(exts) > 0:
        cand_id = exts[0]["id"]
        # 6. Extraction action endpoint
        act_res = client.post(f"/api/v1/extractions/{cand_id}/action", json={"action": "APPROVE"})
        assert act_res.status_code == 200

    # 7. Case matches listing
    matches_res = client.get(f"/api/v1/cases/{case_id}/matches")
    assert matches_res.status_code == 200
    assert isinstance(matches_res.json(), list)

    # 8. Graph expansion with camelCase payload
    exp_res = client.post("/api/v1/graph/expand", json={
        "nodeId": case_id,
        "maxCount": 10
    })
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert "addedNodes" in exp_data
    assert "addedEdges" in exp_data

    # 9. Grounded AI query
    ai_res = client.post("/api/v1/ai/query", json={
        "caseId": case_id,
        "query": "What is the financial trail and suspects for this case?"
    })
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    assert "content" in ai_data
    assert "citations" in ai_data
