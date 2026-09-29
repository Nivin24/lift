import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.entities import User, Module, LearningArea, Topic, Task, UserTopicProgress, UserTaskProgress

client = TestClient(app)

@pytest.fixture(scope="module")
def user1_token():
    # Login as User 1
    resp = client.post("/api/v1/auth/login", json={
        "username_or_email": "user1",
        "password": "password123"
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]

@pytest.fixture(scope="module")
def user2_token():
    # Login as User 2
    resp = client.post("/api/v1/auth/login", json={
        "username_or_email": "user2",
        "password": "password123"
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]

def test_auth_me(user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    resp = client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["username"] == "user1"

def test_progression_initial_state(user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    resp = client.get("/api/v1/modules", headers=headers)
    assert resp.status_code == 200
    modules = {m["code"]: m for m in resp.json()}
    
    # BM1 must be UNLOCKED or IN_PROGRESS
    assert modules["BM1"]["status"] in ["UNLOCKED", "IN_PROGRESS"]
    # BM2 must be LOCKED initially
    assert modules["BM2"]["status"] == "LOCKED"
    # TOI must be LOCKED initially
    assert modules["TOI"]["status"] == "LOCKED"

def test_strict_backend_lock_enforcement(user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}
    
    # Get BM2 module id
    resp = client.get("/api/v1/modules", headers=headers)
    modules = {m["code"]: m for m in resp.json()}
    bm2_id = modules["BM2"]["module_id"]

    # Attempting to fetch BM2 learning areas must return 403 Forbidden!
    resp_areas = client.get(f"/api/v1/modules/{bm2_id}/areas", headers=headers)
    assert resp_areas.status_code == 403
    assert "locked" in resp_areas.json()["detail"].lower()

def test_independent_user_progress(user1_token, user2_token):
    # Both users request dashboard
    h1 = {"Authorization": f"Bearer {user1_token}"}
    h2 = {"Authorization": f"Bearer {user2_token}"}

    r1 = client.get("/api/v1/progress", headers=h1)
    r2 = client.get("/api/v1/progress", headers=h2)
    assert r1.status_code == 200
    assert r2.status_code == 200

    prep1 = r1.json()["overall_preparation_percent"]
    prep2 = r2.json()["overall_preparation_percent"]

    # In our seed data, User 1 has completed more items than User 2
    assert prep1 != prep2

def test_byok_settings_encryption_and_masking(user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}

    # Save a test key
    test_key = "AIzaSyFakeKeyForTest1234567890TestKey"
    save_resp = client.post("/api/v1/settings/ai", json={
        "provider": "gemini",
        "api_key": test_key,
        "model_name": "gemini-2.5-flash"
    }, headers=headers)
    assert save_resp.status_code == 200
    data = save_resp.json()
    assert data["is_configured"] == True
    # Crucial: raw key is never exposed!
    assert test_key not in data["masked_key"]
    assert data["masked_key"].endswith("tKey")

    # Fetch settings
    get_resp = client.get("/api/v1/settings/ai", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["is_configured"] == True
    assert test_key not in get_resp.json()["masked_key"]

def test_progression_unlock_flow(user1_token):
    headers = {"Authorization": f"Bearer {user1_token}"}

    # Toggle BM1 to completed using our progression test endpoint
    toggle_resp = client.post("/api/v1/progress/quick-toggle-module/BM1", headers=headers)
    assert toggle_resp.status_code == 200
    assert toggle_resp.json()["new_status"]["status"] == "COMPLETED"

    # Now verify that BM2 is UNLOCKED
    mod_resp = client.get("/api/v1/modules", headers=headers)
    modules = {m["code"]: m for m in mod_resp.json()}
    assert modules["BM1"]["status"] == "COMPLETED"
    assert modules["BM2"]["status"] in ["UNLOCKED", "IN_PROGRESS"]
    assert modules["TOI"]["status"] == "LOCKED"

    # Now BM2 areas should be accessible without 403!
    bm2_id = modules["BM2"]["module_id"]
    areas_resp = client.get(f"/api/v1/modules/{bm2_id}/areas", headers=headers)
    assert areas_resp.status_code == 200

    # Reset BM1 back to original state for realistic demonstration
    client.post("/api/v1/progress/quick-toggle-module/BM1", headers=headers)
