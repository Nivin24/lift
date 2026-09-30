"""
Populate and update the Data Handling & Visualization learning area in BM1 with the 17 revision checklist topics:
1. 1. NumPy: Introduction
2. 2. NumPy: Advanced
3. 3. Pandas: Introduction
4. 4. Pandas: Advanced
5. 5. Matplotlib: Introduction
6. 6. Data Visualization with Matplotlib
7. 7. Seaborn
8. 8. Other Viz Libraries and EDA
9. 9. Practical Session: NumPy, Pandas, Matplotlib
10. 10. Data Wrangling: Collection and Import
11. 11. Data Wrangling: Cleaning Techniques
12. 12. Data Wrangling: Transformation
13. 13. Data Wrangling: Integration
14. 14. Advanced Data Wrangling
15. 15. Practical Data Wrangling
16. 16. Assignment and Project
17. 17. Revision and Interview Prep
"""

import logging
from app.core.database import SessionLocal, engine, Base, ensure_schema_migrations
from app.models.entities import (
    Module, LearningArea, Topic, Material, Question, Task, Resource,
    User, UserTopicProgress, UserTaskProgress
)
from app.services.progression import ProgressionEngine
from app.seed.data_handling_curriculum_data import DATA_HANDLING_TOPICS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lift.populate_data_handling")

def populate_data_handling_area():
    ensure_schema_migrations(engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Find BM1 and Data Handling area
        bm1 = db.query(Module).filter(Module.code == "BM1").first()
        if not bm1:
            raise ValueError("BM1 module not found.")

        dh_area = db.query(LearningArea).filter(
            LearningArea.module_id == bm1.id,
            LearningArea.code == "data-handling"
        ).first()

        if not dh_area:
            dh_area = LearningArea(
                module_id=bm1.id,
                title="Data Handling & Visualization",
                code="data-handling",
                description="NumPy, Pandas, Matplotlib, Seaborn, and comprehensive Data Wrangling pipelines.",
                order_index=2
            )
            db.add(dh_area)
            db.commit()
            db.refresh(dh_area)

        # 1. Clean up legacy placeholder topics if any
        legacy_slugs = [
            "numpy-vectorization-and-arrays",
            "pandas-dataframes-and-manipulation",
            "matplotlib-data-visualization"
        ]
        
        legacy_to_new_mapping = {
            "numpy-vectorization-and-arrays": "numpy-introduction",
            "pandas-dataframes-and-manipulation": "pandas-introduction",
            "matplotlib-data-visualization": "matplotlib-introduction"
        }

        # Check existing topics
        target_slugs = [t["slug"] for t in DATA_HANDLING_TOPICS]

        for old_slug in legacy_slugs:
            old_top = db.query(Topic).filter(
                Topic.learning_area_id == dh_area.id,
                Topic.slug == old_slug
            ).first()
            if old_top:
                logger.info(f"Removing legacy Data Handling topic: {old_top.slug} ({old_top.title})")
                # Remove child records
                db.query(Material).filter(Material.topic_id == old_top.id).delete()
                db.query(Question).filter(Question.topic_id == old_top.id).delete()
                db.query(Resource).filter(Resource.topic_id == old_top.id).delete()
                
                # Delete user task progress before deleting tasks
                old_tasks = db.query(Task).filter(Task.topic_id == old_top.id).all()
                for ot in old_tasks:
                    db.query(UserTaskProgress).filter(UserTaskProgress.task_id == ot.id).delete(synchronize_session=False)
                    db.delete(ot)
                
                # Delete user topic progress
                db.query(UserTopicProgress).filter(UserTopicProgress.topic_id == old_top.id).delete(synchronize_session=False)
                db.delete(old_top)
                db.commit()

        # Also remove any topics in dh_area that are not in our 17 target slugs
        extraneous_topics = db.query(Topic).filter(
            Topic.learning_area_id == dh_area.id,
            ~Topic.slug.in_(target_slugs)
        ).all()
        for ext_top in extraneous_topics:
            logger.info(f"Removing extraneous Data Handling topic: {ext_top.slug} ({ext_top.title})")
            db.query(Material).filter(Material.topic_id == ext_top.id).delete()
            db.query(Question).filter(Question.topic_id == ext_top.id).delete()
            db.query(Resource).filter(Resource.topic_id == ext_top.id).delete()
            ext_tasks = db.query(Task).filter(Task.topic_id == ext_top.id).all()
            for et in ext_tasks:
                db.query(UserTaskProgress).filter(UserTaskProgress.task_id == et.id).delete(synchronize_session=False)
                db.delete(et)
            db.query(UserTopicProgress).filter(UserTopicProgress.topic_id == ext_top.id).delete(synchronize_session=False)
            db.delete(ext_top)
            db.commit()

        # 2. Seed/update the 17 exact topics in order
        for idx, t_cfg in enumerate(DATA_HANDLING_TOPICS, start=1):
            topic = db.query(Topic).filter(
                Topic.learning_area_id == dh_area.id,
                Topic.slug == t_cfg["slug"]
            ).first()

            if not topic:
                topic = Topic(
                    learning_area_id=dh_area.id,
                    title=t_cfg["title"],
                    slug=t_cfg["slug"],
                    summary=t_cfg["summary"],
                    difficulty=t_cfg["difficulty"],
                    estimated_minutes=45,
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
                        "area": dh_area.title,
                        "rag_indexed": True,
                        "mcp_exposed": True,
                        "source": "LIFT_BM1_DATA_HANDLING_REVISION_CHECKLIST"
                    }
                )
                db.add(topic)
                db.commit()
                db.refresh(topic)
                logger.info(f"Created topic {idx}/17: {topic.title}")
            else:
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
                logger.info(f"Updated topic {idx}/17: {topic.title}")

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
                    learning_area_id=dh_area.id,
                    topic_id=topic.id,
                    title=f"Hands-on Workout: {topic.title}",
                    description=f"Complete practical code exercises and checklist problems for {topic.title}.",
                    task_type="PRACTICE",
                    priority="HIGH",
                    is_required=True
                )
                db.add(task)
                db.commit()

        # 7. Ensure demo users have UserTopicProgress entries
        users = db.query(User).all()
        all_dh_topics = db.query(Topic).filter(Topic.learning_area_id == dh_area.id).all()
        for u in users:
            for top in all_dh_topics:
                utp = db.query(UserTopicProgress).filter(
                    UserTopicProgress.user_id == u.id,
                    UserTopicProgress.topic_id == top.id
                ).first()
                if not utp:
                    db.add(UserTopicProgress(
                        user_id=u.id,
                        topic_id=top.id,
                        status="NOT_STARTED",
                        time_spent_minutes=0
                    ))
            db.commit()

        # Recalculate progress for all users
        for u in users:
            ProgressionEngine.get_user_module_status(db, u.id, "BM1")

        # Final verification
        final_topics = db.query(Topic).filter(Topic.learning_area_id == dh_area.id).order_by(Topic.order_index).all()
        logger.info(f"Verification: Data Handling & Visualization Area now has exactly {len(final_topics)} topics:")
        for t in final_topics:
            logger.info(f"  {t.order_index}. {t.title} ({len(t.subtopics) if t.subtopics else 0} subtopics)")

    except Exception as e:
        logger.error(f"Error populating Data Handling area: {e}", exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    populate_data_handling_area()
