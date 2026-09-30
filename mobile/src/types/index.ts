export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  selected_domain?: string;
  course_duration?: string;
  batch_number?: string;
  onboarding_completed?: boolean;
}

export interface ModuleStatus {
  module_id: number;
  code: string;
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

export interface Task {
  id: number;
  module_id: number;
  learning_area_id?: number;
  learning_area_title?: string;
  topic_id?: number;
  topic_title?: string;
  title: string;
  description?: string;
  task_type: string;
  priority: string;
  user_status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  module_code?: string;
}

export interface DashboardOverview {
  overall_preparation_percent: number;
  modules: ModuleStatus[];
  learning_areas_progress: LearningAreaProgress[];
  focus_areas: Array<{
    area_id: number;
    area_title: string;
    module_code: string;
    pending_topics_count: number;
    completion_percent: number;
  }>;
  pending_tasks: Task[];
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
