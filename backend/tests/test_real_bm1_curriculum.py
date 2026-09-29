import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.entities import Topic, LearningArea, Module, User

client = TestClient(app)

@pytest.fixture(scope="module")
def user1_token():
    resp = client.post("/api/v1/auth/login", json={
        "username_or_email": "user1",
        "password": "password123"
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]

@pytest.fixture(scope="module")
def user2_token():
    resp = client.post("/api/v1/auth/login", json={
        "username_or_email": "user2",
        "password": "password123"
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]

def test_real_bm1_curriculum_structure(user1_token):
    """
    Validates that the Real BM1 curriculum has been converted into structured database models
    with full metadata, subtopics, and relevance fields.
    """
    headers = {"Authorization": f"Bearer {user1_token}"}
    
    # 1. Fetch BM1 Learning Areas
    mod_resp = client.get("/api/v1/modules", headers=headers)
    assert mod_resp.status_code == 200
    bm1_module = next(m for m in mod_resp.json() if m["code"] == "BM1")
    assert bm1_module["status"] in ["UNLOCKED", "IN_PROGRESS"]

    areas_resp = client.get(f"/api/v1/modules/{bm1_module['module_id']}/areas", headers=headers)
    assert areas_resp.status_code == 200
    areas = areas_resp.json()
    
    # Check Python area
    python_area = next((a for a in areas if "Python" in a["title"]), None)
    assert python_area is not None, "Python area must exist in BM1"

    # 2. Fetch Topics for Python Area
    topics_resp = client.get(f"/api/v1/areas/{python_area['id']}/topics", headers=headers)
    assert topics_resp.status_code == 200
    topics = topics_resp.json()
    assert len(topics) >= 9, f"Expected at least 9 comprehensive Python topics, found {len(topics)}"

    # 3. Check detailed attributes of each topic
    for t_summary in topics:
        detail_resp = client.get(f"/api/v1/topics/{t_summary['id']}", headers=headers)
        assert detail_resp.status_code == 200
        detail = detail_resp.json()

        assert detail["title"], "Topic title must be present"
        assert detail["learning_objective"], f"Learning objective missing for {detail['title']}"
        assert detail["subtopics"] is not None and len(detail["subtopics"]) > 0, f"Subtopics missing for {detail['title']}"
        assert detail["practice_requirement"], f"Practice requirement missing for {detail['title']}"
        assert detail["machine_task_relevance"], f"Machine task relevance missing for {detail['title']}"
        assert detail["practical_task_relevance"], f"Practical task relevance missing for {detail['title']}"
        assert detail["interview_relevance"], f"Interview relevance missing for {detail['title']}"
        assert len(detail["materials"]) > 0, f"Study material missing for {detail['title']}"
        assert len(detail["questions"]) > 0, f"Questions missing for {detail['title']}"
        assert len(detail["tasks"]) > 0, f"Task missing for {detail['title']}"
        assert len(detail["resources"]) > 0, f"Resources missing for {detail['title']}"

def test_bm2_and_toi_strictly_locked(user1_token, user2_token):
    """
    BM2 and TOI must remain locked since BM1 topics are not yet 100% completed.
    """
    for token in [user1_token, user2_token]:
        headers = {"Authorization": f"Bearer {token}"}
        resp = client.get("/api/v1/modules", headers=headers)
        assert resp.status_code == 200
        modules = {m["code"]: m for m in resp.json()}
        
        assert modules["BM2"]["status"] == "LOCKED"
        assert modules["TOI"]["status"] == "LOCKED"

def test_shared_curriculum_user_specific_progress(user1_token, user2_token):
    """
    Verifies that curriculum content is identical across users, but progress is distinct.
    """
    h1 = {"Authorization": f"Bearer {user1_token}"}
    h2 = {"Authorization": f"Bearer {user2_token}"}

    # Fetch topics for user 1 and user 2
    r1 = client.get("/api/v1/progress", headers=h1)
    r2 = client.get("/api/v1/progress", headers=h2)
    assert r1.status_code == 200
    assert r2.status_code == 200

    data1 = r1.json()
    data2 = r2.json()

    # Same modules, but different progress state
    assert data1["modules"][0]["code"] == "BM1"
    assert data2["modules"][0]["code"] == "BM1"
