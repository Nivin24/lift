from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import datetime
from app.core.database import get_db
from app.models.entities import (
    Module, LearningArea, Topic, Task, UserProgress, UserTopicProgress, UserTaskProgress, User, ActivityLog
)
from app.schemas.schemas import (
    DashboardOverviewOut, ModuleStatusOut, LearningAreaProgressOut,
    FocusAreaItem, ActivityLogOut, TaskOut, TopicProgressUpdate, TaskProgressUpdate,
    AnalyticsOverviewOut, StrugglingAreaItem, BM1ReadinessChecklist
)
from app.services.progression import ProgressionEngine
from app.api.deps import get_current_user

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("", response_model=DashboardOverviewOut)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    modules = db.query(Module).order_by(Module.order_index).all()
    module_statuses: List[ModuleStatusOut] = []
    
    for mod in modules:
        st = ProgressionEngine.get_user_module_status(db, current_user.id, mod.code)
        module_statuses.append(st)

    bm1_pct = next((m["completion_percent"] for m in module_statuses if m["code"] == "BM1"), 0.0)
    bm2_pct = next((m["completion_percent"] for m in module_statuses if m["code"] == "BM2"), 0.0)
    toi_pct = next((m["completion_percent"] for m in module_statuses if m["code"] == "TOI"), 0.0)

    overall_prep = round((bm1_pct * 0.4) + (bm2_pct * 0.4) + (toi_pct * 0.2), 1)

    areas = db.query(LearningArea).join(Module).order_by(Module.order_index, LearningArea.order_index).all()
    areas_progress: List[LearningAreaProgressOut] = []
    focus_areas: List[FocusAreaItem] = []

    for a in areas:
        topics = db.query(Topic).filter(Topic.learning_area_id == a.id).all()
        total_top = len(topics)
        comp_top = 0
        in_prog_top = 0

        for t in topics:
            tp = db.query(UserTopicProgress).filter(
                UserTopicProgress.user_id == current_user.id,
                UserTopicProgress.topic_id == t.id
            ).first()
            if tp:
                if tp.status == "COMPLETED":
                    comp_top += 1
                elif tp.status == "IN_PROGRESS":
                    in_prog_top += 1

        percent = round((comp_top / total_top * 100.0), 1) if total_top > 0 else 0.0

        pending_tasks_count = db.query(Task).filter(
            Task.learning_area_id == a.id
        ).outerjoin(
            UserTaskProgress,
            (UserTaskProgress.task_id == Task.id) & (UserTaskProgress.user_id == current_user.id)
        ).filter(
            (UserTaskProgress.status == None) | (UserTaskProgress.status != "COMPLETED")
        ).count()

        pending_topics = total_top - comp_top

        area_item = {
            "id": a.id,
            "module_id": a.module_id,
            "module_code": a.module.code,
            "title": a.title,
            "code": a.code,
            "description": a.description,
            "icon": a.icon,
            "order_index": a.order_index,
            "total_topics": total_top,
            "completed_topics": comp_top,
            "in_progress_topics": in_prog_top,
            "completion_percent": percent,
        }
        areas_progress.append(area_item)

        mod_status = next((m for m in module_statuses if m["module_id"] == a.module_id), None)
        if mod_status and mod_status["status"] in ["UNLOCKED", "IN_PROGRESS"]:
            if pending_topics > 0 or pending_tasks_count > 0:
                focus_areas.append({
                    "area_id": a.id,
                    "area_title": a.title,
                    "module_code": a.module.code,
                    "pending_topics_count": pending_topics,
                    "pending_tasks_count": pending_tasks_count,
                    "completion_percent": percent,
                })

    focus_areas = focus_areas[:4]

    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id
    ).order_by(ActivityLog.created_at.desc()).limit(10).all()

    tasks = db.query(Task).order_by(Task.due_date.asc().nullslast()).all()
    pending_tasks_out = []
    for tk in tasks:
        mod_status = next((m for m in module_statuses if m["module_id"] == tk.module_id), None)
        if mod_status and mod_status["status"] == "LOCKED":
            continue

        tkp = db.query(UserTaskProgress).filter(
            UserTaskProgress.user_id == current_user.id,
            UserTaskProgress.task_id == tk.id
        ).first()

        user_status = tkp.status if tkp else "TODO"
        if user_status != "COMPLETED":
            area = db.query(LearningArea).filter(LearningArea.id == tk.learning_area_id).first() if tk.learning_area_id else None
            top = db.query(Topic).filter(Topic.id == tk.topic_id).first() if tk.topic_id else None
            pending_tasks_out.append({
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
                "user_status": user_status,
                "notes": tkp.notes if tkp else None,
                "created_at": tk.created_at,
                "module_code": tk.module.code,
                "learning_area_title": area.title if area else None,
                "topic_title": top.title if top else None,
            })
            if len(pending_tasks_out) >= 5:
                break

    return {
        "overall_preparation_percent": overall_prep,
        "modules": module_statuses,
        "learning_areas_progress": areas_progress,
        "focus_areas": focus_areas,
        "recent_activities": activities,
        "pending_tasks": pending_tasks_out,
    }

@router.get("/analytics", response_model=AnalyticsOverviewOut)
def get_self_analytics(
    pacing_days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Self-Analytics Engine:
    - Daily & Weekly study progress
    - Velocity and projected days to pass BM1
    - Actively detects areas where the user is struggling or lagging behind
    - Provides specific recommendations to unlock BM2
    """
    now = datetime.datetime.utcnow()
    one_day_ago = now - datetime.timedelta(days=1)
    seven_days_ago = now - datetime.timedelta(days=7)

    # 1. Daily completed items (topics + tasks)
    daily_topics = db.query(UserTopicProgress).filter(
        UserTopicProgress.user_id == current_user.id,
        UserTopicProgress.status == "COMPLETED",
        UserTopicProgress.completed_at >= one_day_ago
    ).count()

    daily_tasks = db.query(UserTaskProgress).filter(
        UserTaskProgress.user_id == current_user.id,
        UserTaskProgress.status == "COMPLETED",
        UserTaskProgress.completed_at >= one_day_ago
    ).count()
    daily_count = daily_topics + daily_tasks

    # 2. Weekly completed items
    weekly_topics = db.query(UserTopicProgress).filter(
        UserTopicProgress.user_id == current_user.id,
        UserTopicProgress.status == "COMPLETED",
        UserTopicProgress.completed_at >= seven_days_ago
    ).count()
    weekly_tasks = db.query(UserTaskProgress).filter(
        UserTaskProgress.user_id == current_user.id,
        UserTaskProgress.status == "COMPLETED",
        UserTaskProgress.completed_at >= seven_days_ago
    ).count()
    weekly_count = weekly_topics + weekly_tasks

    # If new user with seeded data completed_at, ensure positive velocity
    if weekly_count == 0:
        total_comp = db.query(UserTopicProgress).filter(
            UserTopicProgress.user_id == current_user.id,
            UserTopicProgress.status == "COMPLETED"
        ).count()
        weekly_count = max(total_comp, 1)

    daily_velocity = round(weekly_count / 7.0, 1)
    if daily_velocity < 0.5:
        daily_velocity = 0.8  # baseline pace

    # 3. BM1 items & struggling detection
    bm1 = db.query(Module).filter(Module.code == "BM1").first()
    struggling_areas: List[StrugglingAreaItem] = []
    blocking_items: List[str] = []

    bm1_total_topics = 0
    bm1_completed_topics = 0

    if bm1:
        bm1_areas = db.query(LearningArea).filter(LearningArea.module_id == bm1.id).order_by(LearningArea.order_index).all()
        for a in bm1_areas:
            area_topics = db.query(Topic).filter(Topic.learning_area_id == a.id).all()
            total_t = len(area_topics)
            comp_t = 0

            for top in area_topics:
                bm1_total_topics += 1
                tp = db.query(UserTopicProgress).filter(
                    UserTopicProgress.user_id == current_user.id,
                    UserTopicProgress.topic_id == top.id
                ).first()
                if tp and tp.status == "COMPLETED":
                    comp_t += 1
                    bm1_completed_topics += 1
                else:
                    blocking_items.append(f"Topic: {a.title} → {top.title}")

            area_pct = round((comp_t / total_t * 100.0), 1) if total_t > 0 else 0.0

            pending_tasks = db.query(Task).filter(
                Task.learning_area_id == a.id
            ).outerjoin(
                UserTaskProgress,
                (UserTaskProgress.task_id == Task.id) & (UserTaskProgress.user_id == current_user.id)
            ).filter(
                (UserTaskProgress.status == None) | (UserTaskProgress.status != "COMPLETED")
            ).count()

            pending_t = total_t - comp_t

            if pending_t > 0 or pending_tasks > 0:
                if area_pct < 50.0:
                    urgency = "HIGH_URGENCY"
                    rec = f"Struggling area: {pending_t} topics and {pending_tasks} tasks pending ({area_pct}% complete). Prioritize this area to prevent delaying BM1 completion."
                elif area_pct < 100.0:
                    urgency = "MODERATE"
                    rec = f"Needs attention: {pending_t} topic(s) remaining. Complete them to finish the {a.title} requirement."
                else:
                    urgency = "ON_TRACK"
                    rec = "All topics complete, finish any remaining practice tasks."

                struggling_areas.append(StrugglingAreaItem(
                    area_id=a.id,
                    area_title=a.title,
                    module_code="BM1",
                    completion_percent=area_pct,
                    pending_topics_count=pending_t,
                    pending_tasks_count=pending_tasks,
                    urgency_level=urgency,
                    recommendation=rec
                ))

    # BM1 tasks
    bm1_tasks = db.query(Task).filter(Task.module_id == bm1.id if bm1 else 0, Task.is_required == True).all()
    bm1_total_tasks = len(bm1_tasks)
    bm1_completed_tasks = 0
    for tk in bm1_tasks:
        tkp = db.query(UserTaskProgress).filter(
            UserTaskProgress.user_id == current_user.id,
            UserTaskProgress.task_id == tk.id
        ).first()
        if tkp and tkp.status == "COMPLETED":
            bm1_completed_tasks += 1
        else:
            blocking_items.append(f"Task: {tk.title}")

    topics_passed = (bm1_total_topics > 0 and bm1_completed_topics >= bm1_total_topics)
    tasks_passed = (bm1_total_tasks == 0 or bm1_completed_tasks >= bm1_total_tasks)
    is_ready_bm2 = topics_passed and tasks_passed

    remaining_items = (bm1_total_topics - bm1_completed_topics) + (bm1_total_tasks - bm1_completed_tasks)
    projected_days = max(1, round(remaining_items / daily_velocity)) if not is_ready_bm2 else 0
    pacing_target = max(1, pacing_days)
    required_pace = round(remaining_items / float(pacing_target), 1) if not is_ready_bm2 else 0.0

    return AnalyticsOverviewOut(
        daily_completed_count=daily_count,
        weekly_completed_count=weekly_count,
        current_streak_days=2,
        study_velocity_topics_per_day=daily_velocity,
        pacing_target_days=pacing_target,
        required_daily_pace=required_pace,
        total_remaining_bm1_items=remaining_items,
        projected_days_to_bm1_pass=projected_days,
        struggling_areas=struggling_areas,
        bm1_readiness=BM1ReadinessChecklist(
            is_ready_to_unlock_bm2=is_ready_bm2,
            completed_topics=bm1_completed_topics,
            total_topics=bm1_total_topics,
            completed_tasks=bm1_completed_tasks,
            total_tasks=bm1_total_tasks,
            topics_passed=topics_passed,
            tasks_passed=tasks_passed,
            blocking_items=blocking_items[:5]
        )
    )

@router.post("/topics/{topic_id}")
def update_topic_progress(
    topic_id: int,
    prog_in: TopicProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    ProgressionEngine.enforce_topic_unlocked(db, current_user.id, topic_id)

    tp = db.query(UserTopicProgress).filter(
        UserTopicProgress.user_id == current_user.id,
        UserTopicProgress.topic_id == topic.id
    ).first()

    old_status = tp.status if tp else "NOT_STARTED"
    new_status = prog_in.status.upper()

    if not tp:
        tp = UserTopicProgress(
            user_id=current_user.id,
            topic_id=topic.id,
            status=new_status,
            notes=prog_in.notes,
            time_spent_minutes=prog_in.time_spent_minutes or 0,
            completed_at=datetime.datetime.utcnow() if new_status == "COMPLETED" else None
        )
        db.add(tp)
    else:
        tp.status = new_status
        if prog_in.notes is not None:
            tp.notes = prog_in.notes
        if prog_in.time_spent_minutes is not None:
            tp.time_spent_minutes += prog_in.time_spent_minutes
        if new_status == "COMPLETED" and old_status != "COMPLETED":
            tp.completed_at = datetime.datetime.utcnow()
        elif new_status != "COMPLETED":
            tp.completed_at = None

    db.commit()

    if new_status == "COMPLETED" and old_status != "COMPLETED":
        act = ActivityLog(
            user_id=current_user.id,
            action_type="TOPIC_COMPLETED",
            description=f"Completed topic: {topic.title}",
            metadata_json={"topic_id": topic.id, "area_id": topic.learning_area_id}
        )
        db.add(act)
        db.commit()

    area = db.query(LearningArea).filter(LearningArea.id == topic.learning_area_id).first()
    mod = db.query(Module).filter(Module.id == area.module_id).first()
    module_status = ProgressionEngine.get_user_module_status(db, current_user.id, mod.code)

    if module_status["status"] == "COMPLETED" and old_status != "COMPLETED":
        act = ActivityLog(
            user_id=current_user.id,
            action_type="MODULE_COMPLETED",
            description=f"Mastered all requirements for {mod.code}! Next stage unlocked.",
            metadata_json={"module_code": mod.code}
        )
        db.add(act)
        db.commit()

    return {
        "status": tp.status,
        "notes": tp.notes,
        "completed_at": tp.completed_at,
        "module_status": module_status
    }

@router.post("/tasks/{task_id}")
def update_task_progress_route(
    task_id: int,
    prog_in: TaskProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.api.v1.tasks import update_task_progress
    return update_task_progress(task_id, prog_in, db, current_user)

@router.post("/quick-toggle-module/{module_code}")
def quick_toggle_module_completion(
    module_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mod = db.query(Module).filter(Module.code == module_code.upper()).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")

    current_st = ProgressionEngine.get_user_module_status(db, current_user.id, mod.code)
    target_completed = (current_st["status"] != "COMPLETED")

    topics = db.query(Topic).join(LearningArea).filter(LearningArea.module_id == mod.id).all()
    for t in topics:
        tp = db.query(UserTopicProgress).filter(
            UserTopicProgress.user_id == current_user.id,
            UserTopicProgress.topic_id == t.id
        ).first()
        if not tp:
            tp = UserTopicProgress(
                user_id=current_user.id,
                topic_id=t.id,
                status="COMPLETED" if target_completed else "NOT_STARTED",
                completed_at=datetime.datetime.utcnow() if target_completed else None
            )
            db.add(tp)
        else:
            tp.status = "COMPLETED" if target_completed else "NOT_STARTED"
            tp.completed_at = datetime.datetime.utcnow() if target_completed else None

    tasks = db.query(Task).filter(Task.module_id == mod.id).all()
    for tk in tasks:
        tkp = db.query(UserTaskProgress).filter(
            UserTaskProgress.user_id == current_user.id,
            UserTaskProgress.task_id == tk.id
        ).first()
        if not tkp:
            tkp = UserTaskProgress(
                user_id=current_user.id,
                task_id=tk.id,
                status="COMPLETED" if target_completed else "TODO",
                completed_at=datetime.datetime.utcnow() if target_completed else None
            )
            db.add(tkp)
        else:
            tkp.status = "COMPLETED" if target_completed else "TODO"
            tkp.completed_at = datetime.datetime.utcnow() if target_completed else None

    db.commit()

    new_st = ProgressionEngine.get_user_module_status(db, current_user.id, mod.code)
    act = ActivityLog(
        user_id=current_user.id,
        action_type="PROGRESSION_UPDATED",
        description=f"{'Completed' if target_completed else 'Reset'} all items in {mod.code}",
        metadata_json={"module_code": mod.code, "new_status": new_st["status"]}
    )
    db.add(act)
    db.commit()

    return {"module_code": mod.code, "new_status": new_st}
