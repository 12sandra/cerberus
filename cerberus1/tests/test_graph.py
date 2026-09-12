import io

def test_case_graph_and_expand(client):
    # Setup case with entities
    case = client.post("/api/v1/cases", json={"fir_number": "FIR-GRAPH-01/2026", "title": "Graph Test"}).json()
    doc = client.post(
        f"/api/v1/cases/{case['id']}/documents",
        files={"file": ("g.txt", io.BytesIO(b"Accused: Vikram Seth, Mobile: 9822233344, Vehicle: MH01AB1234"), "text/plain")}
    ).json()
    ext = client.get(f"/api/v1/documents/{doc['id']}/extraction").json()
    client.post(f"/api/v1/extractions/{ext['id']}/review", json={"decision": "APPROVED"})

    # 1. Fetch Root Graph
    graph_res = client.get(f"/api/v1/cases/{case['id']}/graph")
    assert graph_res.status_code == 200
    graph_data = graph_res.json()
    assert graph_data["total_nodes"] >= 2
    assert graph_data["total_edges"] >= 1
    assert any(n["id"] == case["id"] for n in graph_data["nodes"])

    # 2. Bounded Expand Node
    first_entity_node = [n for n in graph_data["nodes"] if n["id"] != case["id"]][0]
    expand_res = client.post("/api/v1/graph/expand", json={
        "node_id": first_entity_node["id"],
        "hops": 1,
        "limit": 10
    })
    assert expand_res.status_code == 200
    expand_data = expand_res.json()
    assert expand_data["expanded_node_id"] == first_entity_node["id"]
    assert len(expand_data["nodes"]) >= 1
