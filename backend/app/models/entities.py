import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    topic_progress = relationship("UserTopicProgress", back_populates="user", cascade="all, delete-orphan")
    task_progress = relationship("UserTaskProgress", back_populates="user", cascade="all, delete-orphan")
    module_progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    ai_credentials = relationship("AICredentials", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)  # 'BM1', 'BM2', 'TOI'
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    learning_areas = relationship("LearningArea", back_populates="module", cascade="all, delete-orphan", order_by="LearningArea.order_index")
    tasks = relationship("Task", back_populates="module", cascade="all, delete-orphan")
    user_progress = relationship("UserProgress", back_populates="module", cascade="all, delete-orphan")


class LearningArea(Base):
    __tablename__ = "learning_areas"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)  # 'python', 'statistics', 'dsa'
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="code")
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    module = relationship("Module", back_populates="learning_areas")
    topics = relationship("Topic", back_populates="learning_area", cascade="all, delete-orphan", order_by="Topic.order_index")
    tasks = relationship("Task", back_populates="learning_area", cascade="all, delete-orphan")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    learning_area_id = Column(Integer, ForeignKey("learning_areas.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    slug = Column(String(150), index=True, nullable=False)
    summary = Column(Text, nullable=True)
    difficulty = Column(String(20), default="INTERMEDIATE")  # BEGINNER, INTERMEDIATE, ADVANCED
    estimated_minutes = Column(Integer, default=45)
    order_index = Column(Integer, default=0)
    learning_objective = Column(Text, nullable=True)
    prerequisites = Column(Text, nullable=True)
    expected_outcome = Column(Text, nullable=True)
    practice_requirement = Column(Text, nullable=True)
    machine_task_relevance = Column(Text, nullable=True)
    practical_task_relevance = Column(Text, nullable=True)
    interview_relevance = Column(Text, nullable=True)
    subtopics = Column(JSON, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    learning_area = relationship("LearningArea", back_populates="topics")
    materials = relationship("Material", back_populates="topic", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="topic", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="topic", cascade="all, delete-orphan")
    user_progress = relationship("UserTopicProgress", back_populates="topic", cascade="all, delete-orphan")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)  # Markdown or structured text
    format = Column(String(20), default="MARKDOWN")  # MARKDOWN, STRUCTURED_JSON
    author_type = Column(String(20), default="SYSTEM")  # SYSTEM, AI, USER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    topic = relationship("Topic", back_populates="materials")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    url = Column(String(500), nullable=True)
    resource_type = Column(String(30), default="DOCUMENTATION")  # DOCUMENTATION, ARTICLE, VIDEO, REPO, LINK
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    topic = relationship("Topic", back_populates="resources")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=True)
    difficulty = Column(String(20), default="INTERMEDIATE")
    question_type = Column(String(30), default="CONCEPTUAL")  # CONCEPTUAL, INTERVIEW, PRACTICE, QUIZ
    options = Column(JSON, nullable=True)  # JSON array for multiple choice quiz
    correct_option_index = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    topic = relationship("Topic", back_populates="questions")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Nullable: if null, shared curriculum task; if set, user-specific task
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False, index=True)
    learning_area_id = Column(Integer, ForeignKey("learning_areas.id"), nullable=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    task_type = Column(String(30), default="PRACTICE")  # LEARNING, PRACTICE, CODING, MACHINE_TASK, PRACTICAL_TASK, REVISION
    priority = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, URGENT
    due_date = Column(DateTime, nullable=True)
    is_required = Column(Boolean, default=True)  # Required for module completion
    attachment_url = Column(String(500), nullable=True)  # Path/URL to uploaded PDF/DOC
    attachment_filename = Column(String(255), nullable=True)  # Original filename
    week_number = Column(Integer, nullable=True)  # Week number for machine tasks
    spec_markdown = Column(Text, nullable=True)  # Extracted markdown / specification text
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User")
    module = relationship("Module", back_populates="tasks")
    learning_area = relationship("LearningArea", back_populates="tasks")
    topic = relationship("Topic", back_populates="tasks")
    user_progress = relationship("UserTaskProgress", back_populates="task", cascade="all, delete-orphan")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False, index=True)
    status = Column(String(20), default="LOCKED")  # LOCKED, UNLOCKED, IN_PROGRESS, COMPLETED
    completion_percent = Column(Float, default=0.0)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="module_progress")
    module = relationship("Module", back_populates="user_progress")


class UserTopicProgress(Base):
    __tablename__ = "user_topic_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    status = Column(String(20), default="NOT_STARTED")  # NOT_STARTED, IN_PROGRESS, COMPLETED
    notes = Column(Text, nullable=True)  # Personal notes
    time_spent_minutes = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="topic_progress")
    topic = relationship("Topic", back_populates="user_progress")


class UserTaskProgress(Base):
    __tablename__ = "user_task_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, index=True)
    status = Column(String(20), default="TODO")  # TODO, IN_PROGRESS, COMPLETED
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="task_progress")
    task = relationship("Task", back_populates="user_progress")


class AICredentials(Base):
    __tablename__ = "ai_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(50), default="gemini")  # 'gemini', future 'openai', 'claude'
    model_name = Column(String(100), default="gemini-2.5-flash")
    encrypted_api_key = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ai_credentials")


class AIGenerationHistory(Base):
    __tablename__ = "ai_generation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True, index=True)
    prompt_type = Column(String(50), nullable=False)  # MATERIAL, QUESTIONS, QUIZ, TASK, REVISION
    prompt = Column(Text, nullable=False)
    raw_response = Column(Text, nullable=True)
    structured_content = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False)  # TOPIC_COMPLETED, TASK_COMPLETED, MATERIAL_GENERATED, etc.
    description = Column(String(255), nullable=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="activity_logs")
