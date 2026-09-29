from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import re
from app.core.database import get_db
from app.models.entities import (
    Topic, LearningArea, Module, Material, Resource, Question, Task,
    UserTopicProgress, UserTaskProgress, User, ActivityLog
)
from app.schemas.schemas import (
    TopicDetailOut, TopicCreate, MaterialOut, MaterialCreate,
    ResourceOut, ResourceCreate, QuestionOut, QuestionCreate
)
from app.services.progression import ProgressionEngine
from app.api.deps import get_current_user

router = APIRouter(prefix="/topics", tags=["Topics"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[-\s]+', '-', text)

@router.get("/{topic_id}", response_model=TopicDetailOut)
def get_topic_detail(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns full topic details including materials, resources, questions, tasks, and user personal notes.
    STRICT BACKEND ENFORCEMENT: rejects if module is locked.
    """
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    area = db.query(LearningArea).filter(LearningArea.id == topic.learning_area_id).first()
    mod = db.query(Module).filter(Module.id == area.module_id).first()

    # Enforce access
    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic_id)

    # User topic progress
    tp = db.query(UserTopicProgress).filter(
        UserTopicProgress.user_id == current_user.id,
        UserTopicProgress.topic_id == topic.id
    ).first()

    materials = db.query(Material).filter(
        Material.topic_id == topic.id,
        Material.is_active == True
    ).order_by(Material.created_at.desc()).all()

    resources = db.query(Resource).filter(
        Resource.topic_id == topic.id
    ).order_by(Resource.created_at.asc()).all()

    questions = db.query(Question).filter(
        Question.topic_id == topic.id
    ).order_by(Question.created_at.asc()).all()

    # Tasks for this topic
    tasks = db.query(Task).filter(
        Task.topic_id == topic.id
    ).order_by(Task.created_at.asc()).all()

    tasks_out = []
    for tk in tasks:
        tkp = db.query(UserTaskProgress).filter(
            UserTaskProgress.user_id == current_user.id,
            UserTaskProgress.task_id == tk.id
        ).first()
        tasks_out.append({
            "id": tk.id,
            "module_id": tk.module_id,
            "learning_area_id": tk.learning_area_id,
            "topic_id": tk.topic_id,
            "title": tk.title,
            "description": tk.description,
            "task_type": tk.task_type,
            "priority": tk.priority,
            "due_date": tk.due_date,
            "is_required": tk.is_required,
            "user_status": tkp.status if tkp else "TODO",
            "notes": tkp.notes if tkp else None,
            "created_at": tk.created_at,
            "module_code": mod.code,
            "learning_area_title": area.title,
            "topic_title": topic.title,
        })

    return {
        "id": topic.id,
        "learning_area_id": area.id,
        "learning_area_title": area.title,
        "module_id": mod.id,
        "module_code": mod.code,
        "title": topic.title,
        "slug": topic.slug,
        "summary": topic.summary,
        "difficulty": topic.difficulty,
        "estimated_minutes": topic.estimated_minutes,
        "order_index": topic.order_index,
        "learning_objective": topic.learning_objective,
        "prerequisites": topic.prerequisites,
        "expected_outcome": topic.expected_outcome,
        "practice_requirement": topic.practice_requirement,
        "machine_task_relevance": topic.machine_task_relevance,
        "practical_task_relevance": topic.practical_task_relevance,
        "interview_relevance": topic.interview_relevance,
        "subtopics": topic.subtopics,
        "metadata_json": topic.metadata_json,
        "user_status": tp.status if tp else "NOT_STARTED",
        "notes": tp.notes if tp else None,
        "completed_at": tp.completed_at if tp else None,
        "materials": materials,
        "resources": resources,
        "questions": questions,
        "tasks": tasks_out,
    }

@router.post("", response_model=TopicDetailOut)
def create_topic(
    topic_in: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    area = db.query(LearningArea).filter(LearningArea.id == topic_in.learning_area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Learning area not found")

    ProgressionEngine.enforce_area_unlocked(db, current_user.id, area.id)

    max_order = db.query(Topic).filter(Topic.learning_area_id == area.id).count()

    topic = Topic(
        learning_area_id=area.id,
        title=topic_in.title,
        slug=slugify(topic_in.title),
        summary=topic_in.summary,
        difficulty=topic_in.difficulty,
        estimated_minutes=topic_in.estimated_minutes,
        order_index=max_order + 1
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)

    return get_topic_detail(topic.id, db, current_user)

@router.post("/{topic_id}/materials", response_model=MaterialOut)
def add_material(
    topic_id: int,
    mat_in: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic_id)
    mat = Material(
        topic_id=topic_id,
        title=mat_in.title,
        content=mat_in.content,
        format=mat_in.format,
        author_type=mat_in.author_type
    )
    db.add(mat)
    db.commit()
    db.refresh(mat)
    return mat

@router.post("/{topic_id}/resources", response_model=ResourceOut)
def add_resource(
    topic_id: int,
    res_in: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic_id)
    res = Resource(
        topic_id=topic_id,
        title=res_in.title,
        url=res_in.url,
        resource_type=res_in.resource_type,
        description=res_in.description
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return res

@router.post("/{topic_id}/questions", response_model=QuestionOut)
def add_question(
    topic_id: int,
    q_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic_id)
    q = Question(
        topic_id=topic_id,
        question_text=q_in.question_text,
        answer_text=q_in.answer_text,
        difficulty=q_in.difficulty,
        question_type=q_in.question_type,
        options=q_in.options,
        correct_option_index=q_in.correct_option_index
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q
