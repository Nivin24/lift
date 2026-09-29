from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import re
import shutil
import uuid
import datetime

from app.core.database import get_db
from app.models.entities import (
    Task, Module, LearningArea, Topic, UserTaskProgress, User, ActivityLog
)
from app.schemas.schemas import TaskOut, TaskCreate, TaskProgressUpdate
from app.services.progression import ProgressionEngine
from app.api.deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

# Ensure uploads directory exists
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../uploads/tasks"))
os.makedirs(UPLOAD_DIR, exist_ok=True)


def extract_document_text(file_path: str, filename: str) -> str:
    """Extracts readable text content from PDF, DOCX, TXT, or MD files."""
    ext = os.path.splitext(filename)[1].lower()
    text_content = ""

    try:
        if ext == ".pdf":
            import pypdf
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_content += extracted + "\n\n"
        elif ext in [".docx", ".doc"]:
            try:
                import docx
                doc = docx.Document(file_path)
                for para in doc.paragraphs:
                    if para.text.strip():
                        text_content += para.text + "\n"
            except Exception:
                # If binary .doc fallback to text reading
                with open(file_path, "r", errors="ignore") as f:
                    text_content = f.read()
        elif ext in [".txt", ".md", ".json"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text_content = f.read()
        else:
            text_content = f"Attached document: {filename}"
    except Exception as e:
        text_content = f"Attached document: {filename} (Content extraction notice: {str(e)})"

    return text_content.strip()


@router.get("", response_model=List[TaskOut])
def get_all_tasks(
    module_code: Optional[str] = None,
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    task_type: Optional[str] = None,
    week_number: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only return tasks that are shared curriculum (user_id is None) OR created specifically for this user
    query = db.query(Task).filter(
        (Task.user_id == None) | (Task.user_id == current_user.id)
    )

    if module_code:
        mod = db.query(Module).filter(Module.code == module_code.upper()).first()
        if mod:
            query = query.filter(Task.module_id == mod.id)

    if priority_filter:
        query = query.filter(Task.priority == priority_filter.upper())

    if task_type:
        query = query.filter(Task.task_type == task_type.upper())

    if week_number:
        query = query.filter(Task.week_number == week_number)

    tasks = query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc()).all()

    results = []
    for tk in tasks:
        mod = db.query(Module).filter(Module.id == tk.module_id).first()
        area = db.query(LearningArea).filter(LearningArea.id == tk.learning_area_id).first() if tk.learning_area_id else None
        top = db.query(Topic).filter(Topic.id == tk.topic_id).first() if tk.topic_id else None

        tkp = db.query(UserTaskProgress).filter(
            UserTaskProgress.user_id == current_user.id,
            UserTaskProgress.task_id == tk.id
        ).first()

        user_status = tkp.status if tkp else "TODO"

        if status_filter and user_status != status_filter.upper():
            continue

        results.append({
            "id": tk.id,
            "user_id": tk.user_id,
            "module_id": tk.module_id,
            "learning_area_id": tk.learning_area_id,
            "topic_id": tk.topic_id,
            "title": tk.title,
            "description": tk.description,
            "task_type": tk.task_type,
            "priority": tk.priority,
            "due_date": tk.due_date,
            "is_required": tk.is_required,
            "user_status": user_status,
            "notes": tkp.notes if tkp else None,
            "attachment_url": tk.attachment_url,
            "attachment_filename": tk.attachment_filename,
            "week_number": tk.week_number,
            "spec_markdown": tk.spec_markdown,
            "created_at": tk.created_at,
            "module_code": mod.code if mod else None,
            "learning_area_title": area.title if area else None,
            "topic_title": top.title if top else None,
        })

    return results


@router.post("/upload-machine-task", response_model=TaskOut)
async def upload_machine_task(
    file: UploadFile = File(...),
    week_number: int = Form(1),
    title: Optional[str] = Form(None),
    module_code: str = Form("BM1"),
    priority: str = Form("HIGH"),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a user-specific machine task document (PDF or DOC/DOCX/TXT).
    Each user has their own distinct weekly machine tasks.
    Parses the document, extracts specification requirements, and creates a private task for this user.
    """
    mod = db.query(Module).filter(Module.code == module_code.upper()).first()
    if not mod:
        mod = db.query(Module).filter(Module.code == "BM1").first()
    if not mod:
        raise HTTPException(status_code=404, detail="Target module not found")

    ProgressionEngine.enforce_module_unlocked(db, current_user.id, mod.code)

    # Clean & safe filename
    original_filename = file.filename or "machine_task.pdf"
    safe_name = re.sub(r'[^a-zA-Z0-9_\.-]', '_', original_filename)
    unique_filename = f"user{current_user.id}_w{week_number}_{uuid.uuid4().hex[:8]}_{safe_name}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from PDF / Word / Text
    extracted_text = extract_document_text(file_path, original_filename)

    # Determine title
    task_title = title
    if not task_title or not task_title.strip():
        # Derive clean title from filename or first line
        clean_base = os.path.splitext(original_filename)[0].replace("_", " ").replace("-", " ")
        task_title = f"Week {week_number} Machine Task: {clean_base.title()}"

    # Generate clean spec markdown
    spec_summary = description if description and description.strip() else None
    if not spec_summary and extracted_text:
        # First 300 characters as summary
        spec_summary = extracted_text[:300].strip() + ("..." if len(extracted_text) > 300 else "")

    spec_markdown = f"""# {task_title}
**Assigned Student:** {current_user.full_name or current_user.username}
**Week:** {week_number}
**Stage:** {mod.code}
**Attachment:** `{original_filename}`

---

### Machine Task Specification
{extracted_text if extracted_text else "Refer to the attached document for full machine test instructions."}
"""

    task = Task(
        user_id=current_user.id,  # Specific to this user!
        module_id=mod.id,
        title=task_title,
        description=spec_summary or f"Personalized machine task for Week {week_number}",
        task_type="MACHINE_TASK",
        priority=priority.upper(),
        is_required=True,
        attachment_url=f"/api/v1/tasks/attachments/{unique_filename}",
        attachment_filename=original_filename,
        week_number=week_number,
        spec_markdown=spec_markdown,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Initialize user progress as TODO
    tkp = UserTaskProgress(
        user_id=current_user.id,
        task_id=task.id,
        status="TODO"
    )
    db.add(tkp)

    # Log activity
    act = ActivityLog(
        user_id=current_user.id,
        action_type="TASK_UPLOADED",
        description=f"Uploaded Week {week_number} Machine Task: {task.title}",
        metadata_json={"task_id": task.id, "filename": original_filename, "week_number": week_number}
    )
    db.add(act)
    db.commit()

    return {
        "id": task.id,
        "user_id": task.user_id,
        "module_id": task.module_id,
        "learning_area_id": None,
        "topic_id": None,
        "title": task.title,
        "description": task.description,
        "task_type": task.task_type,
        "priority": task.priority,
        "due_date": task.due_date,
        "is_required": task.is_required,
        "user_status": "TODO",
        "notes": None,
        "attachment_url": task.attachment_url,
        "attachment_filename": task.attachment_filename,
        "week_number": task.week_number,
        "spec_markdown": task.spec_markdown,
        "created_at": task.created_at,
        "module_code": mod.code,
        "learning_area_title": None,
        "topic_title": None,
    }


@router.get("/attachments/{filename}")
def get_task_attachment(filename: str):
    """Securely serves uploaded machine task documents (PDFs, DOCs, TXT)."""
    # Prevent directory traversal
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Attachment file not found")

    return FileResponse(file_path, filename=safe_filename)


@router.post("", response_model=TaskOut)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mod = db.query(Module).filter(Module.id == task_in.module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")

    ProgressionEngine.enforce_module_unlocked(db, current_user.id, mod.code)

    task = Task(
        user_id=current_user.id,
        module_id=task_in.module_id,
        learning_area_id=task_in.learning_area_id,
        topic_id=task_in.topic_id,
        title=task_in.title,
        description=task_in.description,
        task_type=task_in.task_type,
        priority=task_in.priority,
        due_date=task_in.due_date,
        is_required=task_in.is_required,
        attachment_url=task_in.attachment_url,
        attachment_filename=task_in.attachment_filename,
        week_number=task_in.week_number,
        spec_markdown=task_in.spec_markdown,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    area = db.query(LearningArea).filter(LearningArea.id == task.learning_area_id).first() if task.learning_area_id else None
    top = db.query(Topic).filter(Topic.id == task.topic_id).first() if task.topic_id else None

    return {
        "id": task.id,
        "user_id": task.user_id,
        "module_id": task.module_id,
        "learning_area_id": task.learning_area_id,
        "topic_id": task.topic_id,
        "title": task.title,
        "description": task.description,
        "task_type": task.task_type,
        "priority": task.priority,
        "due_date": task.due_date,
        "is_required": task.is_required,
        "user_status": "TODO",
        "notes": None,
        "attachment_url": task.attachment_url,
        "attachment_filename": task.attachment_filename,
        "week_number": task.week_number,
        "spec_markdown": task.spec_markdown,
        "created_at": task.created_at,
        "module_code": mod.code,
        "learning_area_title": area.title if area else None,
        "topic_title": top.title if top else None,
    }


@router.post("/{task_id}/progress", response_model=TaskOut)
def update_task_progress(
    task_id: int,
    prog_in: TaskProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates the task status for the current user (TODO, IN_PROGRESS, COMPLETED).
    Recalculates module progress and checks progression unlock.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # If it's a private task for another user, deny access
    if task.user_id is not None and task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this user's machine task")

    mod = db.query(Module).filter(Module.id == task.module_id).first()
    ProgressionEngine.enforce_module_unlocked(db, current_user.id, mod.code)

    tkp = db.query(UserTaskProgress).filter(
        UserTaskProgress.user_id == current_user.id,
        UserTaskProgress.task_id == task.id
    ).first()

    old_status = tkp.status if tkp else "TODO"
    new_status = prog_in.status.upper()

    if not tkp:
        tkp = UserTaskProgress(
            user_id=current_user.id,
            task_id=task.id,
            status=new_status,
            notes=prog_in.notes,
            completed_at=datetime.datetime.utcnow() if new_status == "COMPLETED" else None
        )
        db.add(tkp)
    else:
        tkp.status = new_status
        if prog_in.notes is not None:
            tkp.notes = prog_in.notes
        if new_status == "COMPLETED" and old_status != "COMPLETED":
            tkp.completed_at = datetime.datetime.utcnow()
        elif new_status != "COMPLETED":
            tkp.completed_at = None

    db.commit()

    # Log activity
    if new_status == "COMPLETED" and old_status != "COMPLETED":
        act = ActivityLog(
            user_id=current_user.id,
            action_type="TASK_COMPLETED",
            description=f"Completed task: {task.title}",
            metadata_json={"task_id": task.id, "module": mod.code}
        )
        db.add(act)
        db.commit()

    # Recalculate module progress
    ProgressionEngine.get_user_module_status(db, current_user.id, mod.code)

    area = db.query(LearningArea).filter(LearningArea.id == task.learning_area_id).first() if task.learning_area_id else None
    top = db.query(Topic).filter(Topic.id == task.topic_id).first() if task.topic_id else None

    return {
        "id": task.id,
        "user_id": task.user_id,
        "module_id": task.module_id,
        "learning_area_id": task.learning_area_id,
        "topic_id": task.topic_id,
        "title": task.title,
        "description": task.description,
        "task_type": task.task_type,
        "priority": task.priority,
        "due_date": task.due_date,
        "is_required": task.is_required,
        "user_status": tkp.status,
        "notes": tkp.notes,
        "attachment_url": task.attachment_url,
        "attachment_filename": task.attachment_filename,
        "week_number": task.week_number,
        "spec_markdown": task.spec_markdown,
        "created_at": task.created_at,
        "module_code": mod.code,
        "learning_area_title": area.title if area else None,
        "topic_title": top.title if top else None,
    }
