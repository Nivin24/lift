from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.entities import Module, LearningArea, User
from app.schemas.schemas import ModuleOut, ModuleStatusOut, LearningAreaProgressOut
from app.services.progression import ProgressionEngine
from app.api.deps import get_current_user

router = APIRouter(prefix="/modules", tags=["Modules"])

@router.get("", response_model=List[ModuleStatusOut])
def get_all_modules_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all curriculum modules with the current user's individual progression state:
    BM1, BM2 (locked unless BM1 is complete), TOI (locked unless BM2 is complete).
    """
    modules = db.query(Module).order_by(Module.order_index).all()
    results = []
    for mod in modules:
        status_info = ProgressionEngine.get_user_module_status(db, current_user.id, mod.code)
        results.append(status_info)
    return results

@router.get("/{module_id}", response_model=ModuleOut)
def get_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    return mod

@router.get("/{module_id}/status", response_model=ModuleStatusOut)
def get_module_status(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    return ProgressionEngine.get_user_module_status(db, current_user.id, mod.code)

@router.get("/{module_id}/areas", response_model=List[LearningAreaProgressOut])
def get_module_areas(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns learning areas for the module.
    STRICT ENFORCEMENT: If the module is locked for the user, throws HTTP 403 Forbidden.
    """
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")

    # Backend Lock Enforcement
    ProgressionEngine.enforce_module_unlocked(db, current_user.id, mod.code)

    areas = db.query(LearningArea).filter(
        LearningArea.module_id == module_id
    ).order_by(LearningArea.order_index).all()

    from app.models.entities import Topic, UserTopicProgress
    results = []
    for area in areas:
        topics = db.query(Topic).filter(Topic.learning_area_id == area.id).all()
        total_topics = len(topics)
        completed_topics = 0
        in_progress_topics = 0

        for topic in topics:
            tp = db.query(UserTopicProgress).filter(
                UserTopicProgress.user_id == current_user.id,
                UserTopicProgress.topic_id == topic.id
            ).first()
            if tp:
                if tp.status == "COMPLETED":
                    completed_topics += 1
                elif tp.status == "IN_PROGRESS":
                    in_progress_topics += 1

        percent = round((completed_topics / total_topics * 100.0), 1) if total_topics > 0 else 0.0

        results.append({
            "id": area.id,
            "module_id": area.module_id,
            "module_code": mod.code,
            "title": area.title,
            "code": area.code,
            "description": area.description,
            "icon": area.icon,
            "order_index": area.order_index,
            "total_topics": total_topics,
            "completed_topics": completed_topics,
            "in_progress_topics": in_progress_topics,
            "completion_percent": percent,
        })

    return results
