import io

def test_timeline_patterns_and_analytics(client):
    # Setup case
    case = client.post("/api/v1/cases", json={"fir_number": "FIR-ANA-01/2026", "title": "Analytics Test"}).json()
    doc = client.post(
        f"/api/v1/cases/{case['id']}/documents",
        files={"file": ("ana.txt", io.BytesIO(b"Cheated via payment call. Accused: John Doe, Phone: 9833344455, UPI: john@oksbi"), "text/plain")}
    ).json()
    ext = client.get(f"/api/v1/documents/{doc['id']}/extraction").json()
    client.post(f"/api/v1/extractions/{ext['id']}/review", json={"decision": "APPROVED"})

    # 1. Timeline
    tl_res = client.get(f"/api/v1/cases/{case['id']}/timeline")
    assert tl_res.status_code == 200
    tl = tl_res.json()
    assert tl["case_id"] == case["id"]

    # 2. Patterns
    pat_res = client.get(f"/api/v1/cases/{case['id']}/patterns")
    assert pat_res.status_code == 200
    pat = pat_res.json()
    assert pat["case_id"] == case["id"]

    # 3. Analytics
    ana_res = client.get(f"/api/v1/cases/{case['id']}/analytics")
    assert ana_res.status_code == 200
    metrics = ana_res.json()["metrics"]
    assert metrics["node_count"] >= 2
    assert metrics["edge_count"] >= 1
