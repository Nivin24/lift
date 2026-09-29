from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.entities import LearningArea, Topic, UserTopicProgress, User, Module
from app.schemas.schemas import LearningAreaOut, TopicSummaryOut
from app.services.progression import ProgressionEngine
from app.api.deps import get_current_user

router = APIRouter(prefix="/areas", tags=["Learning Areas"])

@router.get("/{area_id}", response_model=LearningAreaOut)
def get_area(
    area_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    area = db.query(LearningArea).filter(LearningArea.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Learning area not found")
    
    # Enforce module unlock
    ProgressionEngine.enforce_area_unlocked(db, current_user.id, area_id)
    return area

@router.get("/{area_id}/topics", response_model=List[TopicSummaryOut])
def get_area_topics(
    area_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns topics for a learning area with user-specific progress.
    Enforces module unlocked state on backend.
    """
    area = db.query(LearningArea).filter(LearningArea.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Learning area not found")

    ProgressionEngine.enforce_area_unlocked(db, current_user.id, area_id)

    topics = db.query(Topic).filter(
        Topic.learning_area_id == area_id
    ).order_by(Topic.order_index).all()

    results = []
    for t in topics:
        tp = db.query(UserTopicProgress).filter(
            UserTopicProgress.user_id == current_user.id,
            UserTopicProgress.topic_id == t.id
        ).first()

        results.append({
            "id": t.id,
            "learning_area_id": t.learning_area_id,
            "title": t.title,
            "slug": t.slug,
            "summary": t.summary,
            "difficulty": t.difficulty,
            "estimated_minutes": t.estimated_minutes,
            "order_index": t.order_index,
            "subtopics": t.subtopics,
            "user_status": tp.status if tp else "NOT_STARTED",
            "completed_at": tp.completed_at if tp else None
        })

    return results
