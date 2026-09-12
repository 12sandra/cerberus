def test_audit_logs(client):
    # Perform an action that logs audit trail
    client.post("/api/v1/cases", json={
        "fir_number": "FIR-AUDIT-01/2026",
        "title": "Audit Test Case"
    })
    
    # Query audit logs
    res = client.get("/api/v1/audit")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) >= 1
    assert any("CREATE_CASE" in log["action"] for log in logs)
