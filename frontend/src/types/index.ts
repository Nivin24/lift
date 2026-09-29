export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface ModuleStatus {
  module_id: number;
  code: string; // 'BM1' | 'BM2' | 'TOI'
  title: string;
  description?: string;
  status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';
  completion_percent: number;
  total_areas: number;
  completed_areas: number;
  total_topics: number;
  completed_topics: number;
  total_tasks: number;
  completed_tasks: number;
  unlock_requirement_message?: string;
}

export interface LearningAreaProgress {
  id: number;
  module_id: number;
  module_code: string;
  title: string;
  code: string;
  description?: string;
  icon: string;
  order_index: number;
  total_topics: number;
  completed_topics: number;
  in_progress_topics: number;
  completion_percent: number;
}

export interface TopicSummary {
  id: number;
  learning_area_id: number;
  title: string;
  slug: string;
  summary?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimated_minutes: number;
  order_index: number;
  user_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completed_at?: string;
  learning_objective?: string;
  subtopics?: string[];
}

export interface Material {
  id: number;
  topic_id: number;
  title: string;
  content: string;
  format: string;
  author_type: 'SYSTEM' | 'AI' | 'USER';
  created_at: string;
}

export interface Resource {
  id: number;
  topic_id: number;
  title: string;
  url?: string;
  resource_type: string;
  description?: string;
  created_at: string;
}

export interface Question {
  id: number;
  topic_id: number;
  question_text: string;
  answer_text?: string;
  difficulty: string;
  question_type: 'CONCEPTUAL' | 'INTERVIEW' | 'PRACTICE' | 'QUIZ';
  options?: string[];
  correct_option_index?: number;
  created_at: string;
}

export interface Task {
  id: number;
  module_id: number;
  learning_area_id?: number;
  topic_id?: number;
  title: string;
  description?: string;
  task_type: 'LEARNING' | 'PRACTICE' | 'CODING' | 'MACHINE_TASK' | 'PRACTICAL_TASK' | 'REVISION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date?: string;
  is_required: boolean;
  user_status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  created_at: string;
  module_code?: string;
  learning_area_title?: string;
  topic_title?: string;
}

export interface TopicDetail {
  id: number;
  learning_area_id: number;
  learning_area_title: string;
  module_id: number;
  module_code: string;
  title: string;
  slug: string;
  summary?: string;
  difficulty: string;
  estimated_minutes: number;
  order_index: number;
  user_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  completed_at?: string;
  learning_objective?: string;
  prerequisites?: string;
  expected_outcome?: string;
  practice_requirement?: string;
  machine_task_relevance?: string;
  practical_task_relevance?: string;
  interview_relevance?: string;
  subtopics?: string[];
  materials: Material[];
  resources: Resource[];
  questions: Question[];
  tasks: Task[];
}

export interface FocusAreaItem {
  area_id: number;
  area_title: string;
  module_code: string;
  pending_topics_count: number;
  pending_tasks_count: number;
  completion_percent: number;
}

export interface ActivityLog {
  id: number;
  action_type: string;
  description: string;
  metadata_json?: Record<string, any>;
  created_at: string;
}

export interface DashboardOverview {
  overall_preparation_percent: number;
  modules: ModuleStatus[];
  learning_areas_progress: LearningAreaProgress[];
  focus_areas: FocusAreaItem[];
  recent_activities: ActivityLog[];
  pending_tasks: Task[];
}

export interface AISettings {
  provider: string;
  model_name: string;
  is_configured: boolean;
  masked_key?: string;
  available_models: string[];
}

export interface StrugglingAreaItem {
  area_id: number;
  area_title: string;
  module_code: string;
  completion_percent: number;
  pending_topics_count: number;
  pending_tasks_count: number;
  urgency_level: 'HIGH_URGENCY' | 'MODERATE' | 'ON_TRACK';
  recommendation: string;
}

export interface BM1ReadinessChecklist {
  is_ready_to_unlock_bm2: boolean;
  completed_topics: number;
  total_topics: number;
  completed_tasks: number;
  total_tasks: number;
  topics_passed: boolean;
  tasks_passed: boolean;
  blocking_items: string[];
}

export interface AnalyticsOverview {
  daily_completed_count: number;
  weekly_completed_count: number;
  current_streak_days: number;
  study_velocity_topics_per_day: number;
  pacing_target_days: number;
  required_daily_pace: number;
  total_remaining_bm1_items: number;
  projected_days_to_bm1_pass: number;
  struggling_areas: StrugglingAreaItem[];
  bm1_readiness: BM1ReadinessChecklist;
}

