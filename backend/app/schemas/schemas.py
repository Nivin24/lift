from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth & User ---
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None

# --- Modules & Progression ---
class ModuleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str  # 'BM1', 'BM2', 'TOI'
    title: str
    description: Optional[str] = None
    order_index: int
    is_active: bool

class ModuleStatusOut(BaseModel):
    module_id: int
    code: str
    title: str
    description: Optional[str] = None
    status: str  # 'LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'COMPLETED'
    completion_percent: float
    total_areas: int
    completed_areas: int
    total_topics: int
    completed_topics: int
    total_tasks: int
    completed_tasks: int
    unlock_requirement_message: Optional[str] = None

# --- Learning Areas ---
class LearningAreaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    module_id: int
    title: str
    code: str
    description: Optional[str] = None
    icon: str
    order_index: int
    created_at: datetime

class LearningAreaProgressOut(BaseModel):
    id: int
    module_id: int
    module_code: str
    title: str
    code: str
    description: Optional[str] = None
    icon: str
    order_index: int
    total_topics: int
    completed_topics: int
    in_progress_topics: int
    completion_percent: float

# --- Topics ---
class MaterialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    topic_id: int
    title: str
    content: str
    format: str
    author_type: str
    created_at: datetime

class MaterialCreate(BaseModel):
    title: str
    content: str
    format: str = "MARKDOWN"
    author_type: str = "USER"

class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    topic_id: int
    title: str
    url: Optional[str] = None
    resource_type: str
    description: Optional[str] = None
    created_at: datetime

class ResourceCreate(BaseModel):
    title: str
    url: Optional[str] = None
    resource_type: str = "DOCUMENTATION"
    description: Optional[str] = None

class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    topic_id: int
    question_text: str
    answer_text: Optional[str] = None
    difficulty: str
    question_type: str
    options: Optional[List[str]] = None
    correct_option_index: Optional[int] = None
    created_at: datetime

class QuestionCreate(BaseModel):
    question_text: str
    answer_text: Optional[str] = None
    difficulty: str = "INTERMEDIATE"
    question_type: str = "CONCEPTUAL"
    options: Optional[List[str]] = None
    correct_option_index: Optional[int] = None

class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: Optional[int] = None
    module_id: int
    learning_area_id: Optional[int] = None
    topic_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    task_type: str
    priority: str
    due_date: Optional[datetime] = None
    is_required: bool
    user_status: str = "TODO"  # 'TODO', 'IN_PROGRESS', 'COMPLETED'
    notes: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_filename: Optional[str] = None
    week_number: Optional[int] = None
    spec_markdown: Optional[str] = None
    created_at: datetime
    module_code: Optional[str] = None
    learning_area_title: Optional[str] = None
    topic_title: Optional[str] = None

class TaskCreate(BaseModel):
    module_id: int
    learning_area_id: Optional[int] = None
    topic_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    task_type: str = "PRACTICE"
    priority: str = "MEDIUM"
    due_date: Optional[datetime] = None
    is_required: bool = True
    attachment_url: Optional[str] = None
    attachment_filename: Optional[str] = None
    week_number: Optional[int] = None
    spec_markdown: Optional[str] = None

class TaskProgressUpdate(BaseModel):
    status: str  # 'TODO', 'IN_PROGRESS', 'COMPLETED'
    notes: Optional[str] = None

class TopicSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    learning_area_id: int
    title: str
    slug: str
    summary: Optional[str] = None
    difficulty: str
    estimated_minutes: int
    order_index: int
    user_status: str = "NOT_STARTED"
    subtopics: Optional[List[str]] = None
    completed_at: Optional[datetime] = None

class TopicDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    learning_area_id: int
    learning_area_title: str
    module_id: int
    module_code: str
    title: str
    slug: str
    summary: Optional[str] = None
    difficulty: str
    estimated_minutes: int
    order_index: int
    learning_objective: Optional[str] = None
    prerequisites: Optional[str] = None
    expected_outcome: Optional[str] = None
    practice_requirement: Optional[str] = None
    machine_task_relevance: Optional[str] = None
    practical_task_relevance: Optional[str] = None
    interview_relevance: Optional[str] = None
    subtopics: Optional[List[str]] = None
    metadata_json: Optional[Dict[str, Any]] = None
    user_status: str = "NOT_STARTED"
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None
    materials: List[MaterialOut] = []
    resources: List[ResourceOut] = []
    questions: List[QuestionOut] = []
    tasks: List[TaskOut] = []

class TopicCreate(BaseModel):
    learning_area_id: int
    title: str
    summary: Optional[str] = None
    difficulty: str = "INTERMEDIATE"
    estimated_minutes: int = 45

class TopicProgressUpdate(BaseModel):
    status: str  # 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'
    notes: Optional[str] = None
    time_spent_minutes: Optional[int] = None

# --- Dashboard & Progress Overview ---
class FocusAreaItem(BaseModel):
    area_id: int
    area_title: str
    module_code: str
    pending_topics_count: int
    pending_tasks_count: int
    completion_percent: float

class ActivityLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    action_type: str
    description: str
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime

class DashboardOverviewOut(BaseModel):
    overall_preparation_percent: float
    modules: List[ModuleStatusOut]
    learning_areas_progress: List[LearningAreaProgressOut]
    focus_areas: List[FocusAreaItem]
    recent_activities: List[ActivityLogOut]
    pending_tasks: List[TaskOut]

# --- Self-Analytics & Struggling Area Detection ---
class StrugglingAreaItem(BaseModel):
    area_id: int
    area_title: str
    module_code: str
    completion_percent: float
    pending_topics_count: int
    pending_tasks_count: int
    urgency_level: str  # 'HIGH_URGENCY', 'MODERATE', 'ON_TRACK'
    recommendation: str

class BM1ReadinessChecklist(BaseModel):
    is_ready_to_unlock_bm2: bool
    completed_topics: int
    total_topics: int
    completed_tasks: int
    total_tasks: int
    topics_passed: bool
    tasks_passed: bool
    blocking_items: List[str]

class AnalyticsOverviewOut(BaseModel):
    daily_completed_count: int
    weekly_completed_count: int
    current_streak_days: int
    study_velocity_topics_per_day: float
    pacing_target_days: int  # 7 days standard (1-week), 14 days (2-week), etc.
    required_daily_pace: float = 1.0
    total_remaining_bm1_items: int = 0
    projected_days_to_bm1_pass: int
    struggling_areas: List[StrugglingAreaItem]
    bm1_readiness: BM1ReadinessChecklist

# --- AI & BYOK Settings ---
class AISettingsCreate(BaseModel):
    provider: str = "gemini"
    api_key: str
    model_name: str = "gemini-2.5-flash"

class AISettingsOut(BaseModel):
    provider: str
    model_name: str
    is_configured: bool
    masked_key: Optional[str] = None
    available_models: List[str] = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ]

class TestConnectionRequest(BaseModel):
    provider: str = "gemini"
    api_key: Optional[str] = None
    model_name: Optional[str] = "gemini-2.5-flash"

class TestConnectionResponse(BaseModel):
    success: bool
    message: str
    provider: str
    model_name: str

class AIGenerateRequest(BaseModel):
    topic_id: int
    generation_type: str = "material"  # 'material', 'questions', 'quiz', 'task', 'revision'
    custom_instruction: Optional[str] = None

class AIGenerateResponse(BaseModel):
    topic_id: int
    generation_type: str
    prompt: str
    structured_content: Dict[str, Any]
    markdown_content: str
    preview_only: bool = True

class SaveAIGenerationRequest(BaseModel):
    topic_id: int
    generation_type: str
    title: str
    markdown_content: str
    questions: Optional[List[QuestionCreate]] = None
    tasks: Optional[List[TaskCreate]] = None
