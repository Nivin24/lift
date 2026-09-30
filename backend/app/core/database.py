import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger("lift.database")

def get_engine():
    try:
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            echo=False
        )
        # Test connection
        with engine.connect() as conn:
            pass
        return engine
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL at {settings.DATABASE_URL}: {e}. Falling back to SQLite for local reliability.")
        fallback_url = "sqlite:///./lift.db"
        return create_engine(fallback_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_schema_migrations(engine):
    from sqlalchemy import text, inspect
    inspector = inspect(engine)
    
    # 1. Tasks columns
    if "tasks" in inspector.get_table_names():
        existing_task_cols = {col["name"] for col in inspector.get_columns("tasks")}
        task_cols = [
            ("user_id", "INTEGER REFERENCES users(id)"),
            ("attachment_url", "VARCHAR(500)"),
            ("attachment_filename", "VARCHAR(255)"),
            ("week_number", "INTEGER"),
            ("spec_markdown", "TEXT"),
        ]
        for col, col_type in task_cols:
            if col not in existing_task_cols:
                try:
                    with engine.begin() as conn:
                        conn.execute(text(f"ALTER TABLE tasks ADD COLUMN {col} {col_type}"))
                except Exception as e:
                    logger.warning(f"Could not add column {col} to tasks: {e}")

    # 2. Topics columns
    if "topics" in inspector.get_table_names():
        existing_topic_cols = {col["name"] for col in inspector.get_columns("topics")}
        topic_cols = [
            ("learning_objective", "TEXT"),
            ("prerequisites", "TEXT"),
            ("expected_outcome", "TEXT"),
            ("practice_requirement", "TEXT"),
            ("machine_task_relevance", "TEXT"),
            ("practical_task_relevance", "TEXT"),
            ("interview_relevance", "TEXT"),
            ("subtopics", "JSON"),
            ("metadata_json", "JSON"),
        ]
        for col, col_type in topic_cols:
            if col not in existing_topic_cols:
                try:
                    with engine.begin() as conn:
                        conn.execute(text(f"ALTER TABLE topics ADD COLUMN {col} {col_type}"))
                except Exception as e:
                    logger.warning(f"Could not add column {col} to topics: {e}")

    # 3. Users columns (Student Onboarding & Multi-Domain Tracks)
    if "users" in inspector.get_table_names():
        existing_user_cols = {col["name"] for col in inspector.get_columns("users")}
        user_cols = [
            ("selected_domain", "VARCHAR(100) DEFAULT 'data_science'"),
            ("course_duration", "VARCHAR(50)"),
            ("batch_number", "VARCHAR(50)"),
            ("experience_level", "VARCHAR(50)"),
            ("primary_goal", "VARCHAR(100)"),
            ("daily_commitment_hours", "FLOAT DEFAULT 2.0"),
            ("target_completion_date", "VARCHAR(50)"),
            ("onboarding_completed", "BOOLEAN DEFAULT FALSE"),
        ]
        for col, col_type in user_cols:
            if col not in existing_user_cols:
                try:
                    with engine.begin() as conn:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                except Exception as e:
                    logger.warning(f"Could not add column {col} to users: {e}")

try:
    ensure_schema_migrations(engine)
except Exception as _e:
    pass

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
