import io

def test_cross_case_entity_resolution(client):
    # Case A
    case_a = client.post("/api/v1/cases", json={
        "fir_number": "FIR-RES-A/2026",
        "title": "Case A - Loan fraud"
    }).json()
    
    doc_a = client.post(
        f"/api/v1/cases/{case_a['id']}/documents",
        files={"file": ("fir_a.txt", io.BytesIO(b"Accused: Rahul Kumar, Mobile: 9811122233"), "text/plain")}
    ).json()
    
    ext_a = client.get(f"/api/v1/documents/{doc_a['id']}/extraction").json()
    client.post(f"/api/v1/extractions/{ext_a['id']}/review", json={"decision": "APPROVED"})

    # Case B sharing same mobile and similar name
    case_b = client.post("/api/v1/cases", json={
        "fir_number": "FIR-RES-B/2026",
        "title": "Case B - Cyber extortion"
    }).json()
    
    doc_b = client.post(
        f"/api/v1/cases/{case_b['id']}/documents",
        files={"file": ("fir_b.txt", io.BytesIO(b"Accused: R. Kumar, Phone: 9811122233"), "text/plain")}
    ).json()
    
    ext_b = client.get(f"/api/v1/documents/{doc_b['id']}/extraction").json()
    client.post(f"/api/v1/extractions/{ext_b['id']}/review", json={"decision": "APPROVED"})

    # Find the Person entity for R. Kumar
    search_res = client.get("/api/v1/entities/search?q=Kumar")
    assert search_res.status_code == 200
    persons = [e for e in search_res.json() if e["type"] == "PERSON"]
    assert len(persons) >= 2
    
    target_person = persons[0]
    
    # Check match suggestions
    matches_res = client.get(f"/api/v1/entities/{target_person['id']}/matches")
    assert matches_res.status_code == 200
    matches = matches_res.json()
    assert len(matches) >= 1
    
    match_candidate = matches[0]
    assert match_candidate["status"] == "SUGGESTED"
    assert match_candidate["score"] >= 0.70
    assert any("9811122233" in r for r in match_candidate["match_reasons_json"])

    # Confirm the match
    decision_res = client.post(
        f"/api/v1/entity-matches/{match_candidate['id']}/decision",
        json={"decision": "CONFIRMED"}
    )
    assert decision_res.status_code == 200
    assert decision_res.json()["status"] == "CONFIRMED"
