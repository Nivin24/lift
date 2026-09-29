import pytest
from app.core.database import SessionLocal
from app.models.entities import UserTopicProgress, UserTaskProgress

@pytest.fixture(scope="session", autouse=True)
def reset_test_user_progress():
    """
    Ensure user1 and user2 start in a clean initial progression state for test runs.
    """
    db = SessionLocal()
    try:
        db.query(UserTopicProgress).filter(UserTopicProgress.user_id.in_([1, 2])).update(
            {"status": "NOT_STARTED", "completed_at": None}, synchronize_session=False
        )
        db.query(UserTaskProgress).filter(UserTaskProgress.user_id.in_([1, 2])).update(
            {"status": "TODO", "completed_at": None}, synchronize_session=False
        )
        # Give User 1 one completed topic to reflect real differential progression
        first_p = db.query(UserTopicProgress).filter(UserTopicProgress.user_id == 1).first()
        if first_p:
            first_p.status = "COMPLETED"
        db.commit()
    finally:
        db.close()
    yield
    # Reset again after test session
    db = SessionLocal()
    try:
        db.query(UserTopicProgress).filter(UserTopicProgress.user_id.in_([1, 2])).update(
            {"status": "NOT_STARTED", "completed_at": None}, synchronize_session=False
        )
        db.query(UserTaskProgress).filter(UserTaskProgress.user_id.in_([1, 2])).update(
            {"status": "TODO", "completed_at": None}, synchronize_session=False
        )
        db.commit()
    finally:
        db.close()
