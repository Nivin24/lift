from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional
import datetime
from app.models.entities import (
    Module, LearningArea, Topic, Task, UserProgress, UserTopicProgress, UserTaskProgress, User
)

class ProgressionEngine:
    @staticmethod
    def get_user_module_status(db: Session, user_id: int, module_code: str) -> Dict[str, Any]:
        """
        Determines the current progression state of a module for a specific user:
        LOCKED, UNLOCKED, IN_PROGRESS, or COMPLETED.
        """
        module = db.query(Module).filter(Module.code == module_code).first()
        if not module:
            raise HTTPException(status_code=404, detail=f"Module {module_code} not found")

        # 1. Check prerequisites
        if module_code == "BM1":
            # BM1 is always unlocked initially
            unlocked = True
            unlock_message = None
        elif module_code == "BM2":
            # BM2 requires BM1 to be COMPLETED
            bm1_status = ProgressionEngine.get_user_module_status(db, user_id, "BM1")
            unlocked = (bm1_status["status"] == "COMPLETED")
            unlock_message = None if unlocked else "Complete all BM1 learning areas, topics, and tasks to unlock BM2."
        elif module_code == "TOI":
            # TOI requires both BM1 and BM2 to be COMPLETED
            bm2_status = ProgressionEngine.get_user_module_status(db, user_id, "BM2")
            unlocked = (bm2_status["status"] == "COMPLETED")
            unlock_message = None if unlocked else "Complete all BM2 requirements to unlock TOI."
        else:
            unlocked = True
            unlock_message = None

        # 2. Gather stats for topics and tasks in this module
        areas = db.query(LearningArea).filter(LearningArea.module_id == module.id).all()
        total_areas = len(areas)
        completed_areas = 0

        total_topics = 0
        completed_topics = 0

        for area in areas:
            topics = db.query(Topic).filter(Topic.learning_area_id == area.id).all()
            area_total = len(topics)
            area_completed = 0
            for topic in topics:
                total_topics += 1
                tp = db.query(UserTopicProgress).filter(
                    UserTopicProgress.user_id == user_id,
                    UserTopicProgress.topic_id == topic.id
                ).first()
                if tp and tp.status == "COMPLETED":
                    completed_topics += 1
                    area_completed += 1
            if area_total > 0 and area_completed == area_total:
                completed_areas += 1

        # Tasks for module
        tasks = db.query(Task).filter(Task.module_id == module.id, Task.is_required == True).all()
        total_tasks = len(tasks)
        completed_tasks = 0
        for task in tasks:
            tkp = db.query(UserTaskProgress).filter(
                UserTaskProgress.user_id == user_id,
                UserTaskProgress.task_id == task.id
            ).first()
            if tkp and tkp.status == "COMPLETED":
                completed_tasks += 1

        # 3. Calculate completion percent
        total_items = total_topics + total_tasks
        completed_items = completed_topics + completed_tasks
        completion_percent = round((completed_items / total_items * 100.0), 1) if total_items > 0 else 0.0

        # Determine status
        if not unlocked:
            curr_status = "LOCKED"
        else:
            # Check if all requirements met
            is_all_topics_done = (total_topics > 0 and completed_topics >= total_topics)
            is_all_tasks_done = (total_tasks == 0 or completed_tasks >= total_tasks)
            is_all_areas_done = (total_areas > 0 and completed_areas >= total_areas)

            if is_all_topics_done and is_all_tasks_done and is_all_areas_done:
                curr_status = "COMPLETED"
                completion_percent = 100.0
            elif completed_topics > 0 or completed_tasks > 0:
                curr_status = "IN_PROGRESS"
            else:
                curr_status = "UNLOCKED"

        # Update or persist in user_progress table
        up = db.query(UserProgress).filter(
            UserProgress.user_id == user_id,
            UserProgress.module_id == module.id
        ).first()

        if not up:
            up = UserProgress(
                user_id=user_id,
                module_id=module.id,
                status=curr_status,
                completion_percent=completion_percent
            )
            db.add(up)
            db.commit()
        else:
            if up.status != curr_status or abs(up.completion_percent - completion_percent) > 0.01:
                up.status = curr_status
                up.completion_percent = completion_percent
                if curr_status == "COMPLETED" and not up.completed_at:
                    up.completed_at = datetime.datetime.utcnow()
                db.commit()

        return {
            "module_id": module.id,
            "code": module.code,
            "title": module.title,
            "description": module.description,
            "status": curr_status,
            "completion_percent": completion_percent,
            "total_areas": total_areas,
            "completed_areas": completed_areas,
            "total_topics": total_topics,
            "completed_topics": completed_topics,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "unlock_requirement_message": unlock_message
        }

    @staticmethod
    def enforce_module_unlocked(db: Session, user_id: int, module_code: str):
        """
        Strict backend authorization enforcement. Raises 403 Forbidden if the module is locked.
        """
        status_info = ProgressionEngine.get_user_module_status(db, user_id, module_code)
        if status_info["status"] == "LOCKED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Module {module_code} is locked. {status_info.get('unlock_requirement_message', '')}"
            )
        return status_info

    @staticmethod
    def enforce_area_unlocked(db: Session, user_id: int, area_id: int):
        area = db.query(LearningArea).filter(LearningArea.id == area_id).first()
        if not area:
            raise HTTPException(status_code=404, detail="Learning area not found")
        module = db.query(Module).filter(Module.id == area.module_id).first()
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        return ProgressionEngine.enforce_module_unlocked(db, user_id, module.code)

    @staticmethod
    def enforce_topic_unlocked(db: Session, user_id: int, topic_id: int):
        topic = db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        return ProgressionEngine.enforce_area_unlocked(db, user_id, topic.learning_area_id)

    @staticmethod
    def enforce_task_unlocked(db: Session, user_id: int, task_id: int):
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        module = db.query(Module).filter(Module.id == task.module_id).first()
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        return ProgressionEngine.enforce_module_unlocked(db, user_id, module.code)
