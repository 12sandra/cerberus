def test_create_and_get_case(client):
    payload = {
        "fir_number": "FIR-TEST-001/2026",
        "title": "Crypto Scam Investigation",
        "description": "Victim defrauded of funds via phishing portal",
        "category": "FINANCIAL_CRIME"
    }
    response = client.post("/api/v1/cases", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["fir_number"] == payload["fir_number"]
    case_id = data["id"]
    
    # Get details
    get_res = client.get(f"/api/v1/cases/{case_id}")
    assert get_res.status_code == 200
    detail = get_res.json()
    assert detail["title"] == payload["title"]
    assert detail["status"] == "OPEN"

def test_list_and_filter_cases(client):
    client.post("/api/v1/cases", json={
        "fir_number": "FIR-TEST-002/2026",
        "title": "Phishing Incident",
        "category": "CYBER_ATTACK"
    })
    
    # Filter by category
    res = client.get("/api/v1/cases?category=CYBER_ATTACK")
    assert res.status_code == 200
    cases = res.json()
    assert len(cases) >= 1
    assert all(c["category"] == "CYBER_ATTACK" for c in cases)
