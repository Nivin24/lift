from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import datetime
from app.core.database import get_db
from app.models.entities import (
    Topic, LearningArea, Module, Material, Question, Task,
    AIGenerationHistory, ActivityLog, User
)
from app.schemas.schemas import (
    TestConnectionRequest, TestConnectionResponse,
    AIGenerateRequest, AIGenerateResponse, SaveAIGenerationRequest,
    MaterialOut
)
from app.services.ai.service import AIService
from app.services.progression import ProgressionEngine
from app.api.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Generation"])

@router.post("/test-provider", response_model=TestConnectionResponse)
async def test_ai_provider(
    req: TestConnectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    provider = AIService.get_provider(req.provider)
    api_key = req.api_key
    model_name = req.model_name or "gemini-2.5-flash"

    # If no key was supplied directly in request, fetch saved user credential
    if not api_key:
        api_key, saved_model = AIService.get_user_credentials(db, current_user.id, req.provider)
        if not req.model_name:
            model_name = saved_model

    result = await provider.test_connection(api_key, model_name)
    return {
        "success": result["success"],
        "message": result["message"],
        "provider": req.provider,
        "model_name": model_name
    }

@router.post("/generate/material", response_model=AIGenerateResponse)
async def generate_study_material(
    req: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(Topic).filter(Topic.id == req.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic.id)
    area = db.query(LearningArea).filter(LearningArea.id == topic.learning_area_id).first()
    mod = db.query(Module).filter(Module.id == area.module_id).first()

    api_key, model_name = AIService.get_user_credentials(db, current_user.id, "gemini")
    provider = AIService.get_provider("gemini")

    try:
        structured_data = await provider.generate_structured_material(
            api_key=api_key,
            model_name=model_name,
            topic_title=topic.title,
            area_title=area.title,
            module_code=mod.code,
            custom_instruction=req.custom_instruction
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    markdown = AIService.format_material_to_markdown(structured_data, topic.title)

    # Save to history for audit and retrieval
    history = AIGenerationHistory(
        user_id=current_user.id,
        topic_id=topic.id,
        prompt_type="MATERIAL",
        prompt=f"Generate structured material for {topic.title}",
        structured_content=structured_data,
        raw_response=markdown
    )
    db.add(history)
    db.commit()

    return {
        "topic_id": topic.id,
        "generation_type": "material",
        "prompt": f"Generate material for {topic.title}",
        "structured_content": structured_data,
        "markdown_content": markdown,
        "preview_only": True
    }

@router.post("/generate/questions", response_model=AIGenerateResponse)
async def generate_questions(
    req: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(Topic).filter(Topic.id == req.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic.id)
    area = db.query(LearningArea).filter(LearningArea.id == topic.learning_area_id).first()

    api_key, model_name = AIService.get_user_credentials(db, current_user.id, "gemini")
    provider = AIService.get_provider("gemini")

    questions_list = await provider.generate_questions(
        api_key=api_key,
        model_name=model_name,
        topic_title=topic.title,
        area_title=area.title,
        count=5
    )

    md = [f"# Technical Interview & Practice Questions: {topic.title}\n"]
    for i, q in enumerate(questions_list, 1):
        md.append(f"### Q{i}: {q.get('question_text')}\n")
        md.append(f"**Difficulty:** `{q.get('difficulty', 'INTERMEDIATE')}` | **Type:** `{q.get('question_type', 'INTERVIEW')}`\n")
        md.append(f"**Answer:**\n{q.get('answer_text')}\n")

    return {
        "topic_id": topic.id,
        "generation_type": "questions",
        "prompt": f"Generate questions for {topic.title}",
        "structured_content": {"questions": questions_list},
        "markdown_content": "\n".join(md),
        "preview_only": True
    }

@router.post("/generate/quiz", response_model=AIGenerateResponse)
async def generate_quiz(
    req: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(Topic).filter(Topic.id == req.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic.id)
    area = db.query(LearningArea).filter(LearningArea.id == topic.learning_area_id).first()

    api_key, model_name = AIService.get_user_credentials(db, current_user.id, "gemini")
    provider = AIService.get_provider("gemini")

    quiz_list = await provider.generate_quiz(
        api_key=api_key,
        model_name=model_name,
        topic_title=topic.title,
        area_title=area.title,
        count=5
    )

    md = [f"# Quiz: {topic.title}\n"]
    for i, q in enumerate(quiz_list, 1):
        md.append(f"### Q{i}: {q.get('question_text')}\n")
        for idx, opt in enumerate(q.get("options", [])):
            letter = chr(65 + idx)
            md.append(f"- **{letter})** {opt}")
        correct_letter = chr(65 + q.get("correct_option_index", 0))
        md.append(f"\n*Correct Answer: Option {correct_letter}*\n")
        md.append(f"**Explanation:** {q.get('answer_text')}\n")

    return {
        "topic_id": topic.id,
        "generation_type": "quiz",
        "prompt": f"Generate quiz for {topic.title}",
        "structured_content": {"quiz": quiz_list},
        "markdown_content": "\n".join(md),
        "preview_only": True
    }

@router.post("/generate/task", response_model=AIGenerateResponse)
async def generate_task(
    req: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(Topic).filter(Topic.id == req.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic.id)
    area = db.query(LearningArea).filter(LearningArea.id == topic.learning_area_id).first()

    api_key, model_name = AIService.get_user_credentials(db, current_user.id, "gemini")
    provider = AIService.get_provider("gemini")

    task_data = await provider.generate_task(
        api_key=api_key,
        model_name=model_name,
        topic_title=topic.title,
        area_title=area.title
    )

    md = f"# Practical Task: {task_data.get('title', topic.title)}\n\n{task_data.get('description', '')}"

    return {
        "topic_id": topic.id,
        "generation_type": "task",
        "prompt": f"Generate task for {topic.title}",
        "structured_content": task_data,
        "markdown_content": md,
        "preview_only": True
    }

@router.post("/generate/revision", response_model=AIGenerateResponse)
async def generate_revision(
    req: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(Topic).filter(Topic.id == req.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic.id)
    area = db.query(LearningArea).filter(LearningArea.id == topic.learning_area_id).first()

    api_key, model_name = AIService.get_user_credentials(db, current_user.id, "gemini")
    provider = AIService.get_provider("gemini")

    rev_data = await provider.generate_revision_notes(
        api_key=api_key,
        model_name=model_name,
        topic_title=topic.title,
        area_title=area.title
    )

    md = [f"# {rev_data.get('title', f'Revision Notes: {topic.title}')}\n"]
    if "summary" in rev_data:
        md.append(f"{rev_data['summary']}\n")
    if "cheat_sheet" in rev_data:
        md.append("### Cheat Sheet\n")
        for item in rev_data["cheat_sheet"]:
            md.append(f"- {item}")
        md.append("")
    if "mental_models" in rev_data:
        md.append(f"### Mental Model\n{rev_data['mental_models']}\n")
    if "formula_or_syntax" in rev_data:
        md.append(f"### Key Syntax\n```python\n{rev_data['formula_or_syntax']}\n```\n")

    return {
        "topic_id": topic.id,
        "generation_type": "revision",
        "prompt": f"Generate revision for {topic.title}",
        "structured_content": rev_data,
        "markdown_content": "\n".join(md),
        "preview_only": True
    }

@router.post("/save-generation")
def save_ai_generation(
    req: SaveAIGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Saves previewed AI-generated content after user review.
    Does not automatically overwrite; creates verified study materials, questions, or tasks.
    """
    topic = db.query(Topic).filter(Topic.id == req.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic.id)
    area = db.query(LearningArea).filter(LearningArea.id == topic.learning_area_id).first()
    mod = db.query(Module).filter(Module.id == area.module_id).first()

    saved_items = {}

    # Save as study material
    if req.markdown_content:
        mat = Material(
            topic_id=topic.id,
            title=req.title,
            content=req.markdown_content,
            format="MARKDOWN",
            author_type="AI"
        )
        db.add(mat)
        db.commit()
        db.refresh(mat)
        saved_items["material_id"] = mat.id

    # Save questions if provided
    if req.questions:
        q_ids = []
        for q in req.questions:
            new_q = Question(
                topic_id=topic.id,
                question_text=q.question_text,
                answer_text=q.answer_text,
                difficulty=q.difficulty,
                question_type=q.question_type,
                options=q.options,
                correct_option_index=q.correct_option_index
            )
            db.add(new_q)
            db.commit()
            q_ids.append(new_q.id)
        saved_items["question_ids"] = q_ids

    # Save tasks if provided
    if req.tasks:
        task_ids = []
        for tk in req.tasks:
            new_task = Task(
                module_id=mod.id,
                learning_area_id=area.id,
                topic_id=topic.id,
                title=tk.title,
                description=tk.description,
                task_type=tk.task_type,
                priority=tk.priority,
                due_date=tk.due_date,
                is_required=tk.is_required
            )
            db.add(new_task)
            db.commit()
            task_ids.append(new_task.id)
        saved_items["task_ids"] = task_ids

    # Log activity
    act = ActivityLog(
        user_id=current_user.id,
        action_type="MATERIAL_GENERATED",
        description=f"Saved AI {req.generation_type} for '{topic.title}'",
        metadata_json={"topic_id": topic.id, "type": req.generation_type}
    )
    db.add(act)
    db.commit()

    return {
        "success": True,
        "message": f"Successfully saved {req.generation_type} content to curriculum.",
        "saved_items": saved_items
    }
