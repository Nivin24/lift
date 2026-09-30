import logging
import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.entities import (
    User, Module, LearningArea, Topic, Material, Resource, Question, Task,
    UserTopicProgress, UserTaskProgress, UserProgress, ActivityLog
)
from app.services.progression import ProgressionEngine
from app.seed.dsa_curriculum_data import DSA_TOPICS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lift.populate_dsa")

def populate_dsa_area():
    """
    Populates the DSA Learning Area with EXACTLY the 14 specified topics from the Brocamp curriculum.
    Removes any old/unspecified topics from the DSA area.
    """
    db: Session = SessionLocal()
    try:
        bm1 = db.query(Module).filter(Module.code == "BM1").first()
        if not bm1:
            logger.error("BM1 module not found.")
            return

        dsa_area = db.query(LearningArea).filter(LearningArea.code == "dsa").first()
        if not dsa_area:
            dsa_area = LearningArea(
                module_id=bm1.id,
                code="dsa",
                title="Data Structures & Algorithms",
                description="Brocamp technical workouts: Week 1 & Week 2 topics and DSA basics.",
                icon="layers",
                order_index=3
            )
            db.add(dsa_area)
            db.commit()
            db.refresh(dsa_area)

        # Update description
        dsa_area.description = "Brocamp technical workouts: Week 1 & Week 2 topics and DSA basics."
        db.commit()

        new_slugs = {t["slug"] for t in DSA_TOPICS}

        # 1. Clean up old placeholder topics in DSA area that are not in the new 14
        old_topics = db.query(Topic).filter(
            Topic.learning_area_id == dsa_area.id,
            ~Topic.slug.in_(new_slugs)
        ).all()

        for old_t in old_topics:
            logger.info(f"Removing legacy DSA topic: {old_t.slug} ({old_t.title})")
            # Delete related child records
            db.query(UserTopicProgress).filter(UserTopicProgress.topic_id == old_t.id).delete(synchronize_session=False)
            task_ids = [t.id for t in db.query(Task).filter(Task.topic_id == old_t.id).all()]
            if task_ids:
                db.query(UserTaskProgress).filter(UserTaskProgress.task_id.in_(task_ids)).delete(synchronize_session=False)
            db.query(Task).filter(Task.topic_id == old_t.id).delete(synchronize_session=False)
            db.query(Material).filter(Material.topic_id == old_t.id).delete(synchronize_session=False)
            db.query(Question).filter(Question.topic_id == old_t.id).delete(synchronize_session=False)
            db.query(Resource).filter(Resource.topic_id == old_t.id).delete(synchronize_session=False)
            db.delete(old_t)
        db.commit()

        # 2. Insert or update the exact 14 DSA topics
        users = db.query(User).all()

        for idx, t_cfg in enumerate(DSA_TOPICS, start=1):
            slug = t_cfg["slug"]
            topic = db.query(Topic).filter(Topic.slug == slug).first()

            if not topic:
                topic = Topic(
                    learning_area_id=dsa_area.id,
                    slug=slug,
                    title=t_cfg["title"],
                    summary=t_cfg["summary"],
                    difficulty=t_cfg["difficulty"],
                    order_index=idx,
                    learning_objective=t_cfg["learning_objective"],
                    prerequisites=t_cfg["prerequisites"],
                    expected_outcome=t_cfg["expected_outcome"],
                    practice_requirement=t_cfg["practice_requirement"],
                    machine_task_relevance=t_cfg["machine_task_relevance"],
                    practical_task_relevance=t_cfg["practical_task_relevance"],
                    interview_relevance=t_cfg["interview_relevance"],
                    subtopics=t_cfg["subtopics"],
                    metadata_json={
                        "stage": "BM1",
                        "area": dsa_area.title,
                        "rag_indexed": True,
                        "mcp_exposed": True,
                        "source": "BROCAMP_DSA_WORKOUTS"
                    }
                )
                db.add(topic)
                db.commit()
                db.refresh(topic)
                logger.info(f"Created topic {idx}/14: {topic.title}")
            else:
                topic.learning_area_id = dsa_area.id
                topic.title = t_cfg["title"]
                topic.summary = t_cfg["summary"]
                topic.difficulty = t_cfg["difficulty"]
                topic.order_index = idx
                topic.learning_objective = t_cfg["learning_objective"]
                topic.prerequisites = t_cfg["prerequisites"]
                topic.expected_outcome = t_cfg["expected_outcome"]
                topic.practice_requirement = t_cfg["practice_requirement"]
                topic.machine_task_relevance = t_cfg["machine_task_relevance"]
                topic.practical_task_relevance = t_cfg["practical_task_relevance"]
                topic.interview_relevance = t_cfg["interview_relevance"]
                topic.subtopics = t_cfg["subtopics"]
                db.commit()
                logger.info(f"Updated topic {idx}/14: {topic.title}")

            # 3. Create or update Material
            if "material" in t_cfg:
                mat = db.query(Material).filter(Material.topic_id == topic.id).first()
                if not mat:
                    mat = Material(
                        topic_id=topic.id,
                        title=f"Study Material: {topic.title}",
                        content=t_cfg["material"],
                        format="MARKDOWN",
                        author_type="SYSTEM"
                    )
                    db.add(mat)
                else:
                    mat.title = f"Study Material: {topic.title}"
                    mat.content = t_cfg["material"]
                db.commit()

            # 4. Questions
            for q_spec in t_cfg.get("questions", []):
                existing_q = db.query(Question).filter(
                    Question.topic_id == topic.id,
                    Question.question_text == q_spec["question_text"]
                ).first()
                if not existing_q:
                    db.add(Question(
                        topic_id=topic.id,
                        question_text=q_spec["question_text"],
                        answer_text=q_spec["answer_text"],
                        difficulty=q_spec["difficulty"],
                        question_type=q_spec["question_type"]
                    ))
            db.commit()

            # 5. Resources
            for r_spec in t_cfg.get("resources", []):
                existing_r = db.query(Resource).filter(
                    Resource.topic_id == topic.id,
                    Resource.url == r_spec["url"]
                ).first()
                if not existing_r:
                    db.add(Resource(
                        topic_id=topic.id,
                        title=r_spec["title"],
                        url=r_spec["url"],
                        resource_type=r_spec["resource_type"]
                    ))
            db.commit()

            # 6. Task
            existing_task = db.query(Task).filter(Task.topic_id == topic.id).first()
            if not existing_task:
                task = Task(
                    module_id=bm1.id,
                    learning_area_id=dsa_area.id,
                    topic_id=topic.id,
                    title=f"Technical Workout: {topic.title}",
                    description=f"Complete hands-on coding and problem-solving exercises for {topic.title}.",
                    task_type="PRACTICE",
                    priority="HIGH" if idx <= 6 else "MEDIUM",
                    is_required=True
                )
                db.add(task)
                db.commit()

            # 7. Ensure UserTopicProgress exists for all users
            for u in users:
                utp = db.query(UserTopicProgress).filter(
                    UserTopicProgress.user_id == u.id,
                    UserTopicProgress.topic_id == topic.id
                ).first()
                if not utp:
                    # User 1 starts with first 2 topics completed as part of demo baseline
                    status = "COMPLETED" if (u.username == "user1" and idx <= 2) else "NOT_STARTED"
                    completed_at = datetime.datetime.utcnow() if status == "COMPLETED" else None
                    db.add(UserTopicProgress(
                        user_id=u.id,
                        topic_id=topic.id,
                        status=status,
                        time_spent_minutes=45 if status == "COMPLETED" else 0,
                        completed_at=completed_at
                    ))
            db.commit()

        # Recalculate progress for all users
        for u in users:
            ProgressionEngine.get_user_module_status(db, u.id, "BM1")

        # Final verification
        final_topics = db.query(Topic).filter(Topic.learning_area_id == dsa_area.id).order_by(Topic.order_index).all()
        logger.info(f"Verification: DSA Area now has exactly {len(final_topics)} topics:")
        for t in final_topics:
            logger.info(f"  {t.order_index}. {t.title} ({len(t.subtopics or [])} subtopics)")

    except Exception as e:
        db.rollback()
        logger.error(f"Error populating DSA area: {e}", exc_info=True)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    populate_dsa_area()
