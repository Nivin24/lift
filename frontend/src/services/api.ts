import type {
  User, ModuleStatus, LearningAreaProgress, TopicSummary, TopicDetail,
  Task, DashboardOverview, AISettings, Material, AnalyticsOverview
} from '../types';

const API_BASE = 'http://localhost:8000/api/v1';

class ApiService {
  private token: string | null = localStorage.getItem('lift_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('lift_token', token);
    } else {
      localStorage.removeItem('lift_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = `Request failed: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorDetail;
      } catch (e) {
        // ignore
      }
      throw new Error(errorDetail);
    }

    return response.json();
  }

  // Auth
  async login(username_or_email: string, password: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username_or_email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(username: string, email: string, password: string, full_name?: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, full_name }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async forgotPassword(username_or_email: string): Promise<{ message: string; user_exists: boolean; username?: string; email?: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ username_or_email }),
    });
  }

  async resetPassword(username_or_email: string, new_password: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ username_or_email, new_password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('lift_current_user');
  }

  async updateOnboarding(data: Partial<import('../types').StudentOnboardingData>): Promise<User> {
    const updatedUser = await this.request<User>('/auth/onboarding', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    localStorage.setItem('lift_current_user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  // Local Storage Progress Persistence & Offline Hydration
  getLocalProgressMap(): Record<string, string> {
    try {
      const saved = localStorage.getItem('lift_local_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveLocalProgress(type: 'task' | 'topic', id: number, status: string) {
    try {
      const map = this.getLocalProgressMap();
      map[`${type}_${id}`] = status;
      localStorage.setItem('lift_local_progress', JSON.stringify(map));
    } catch (e) {
      console.warn('Failed to save to local storage', e);
    }
  }

  // Dashboard & Progress
  async getDashboard(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/progress');
  }

  async updateTopicProgress(topicId: number, status: string, notes?: string): Promise<any> {
    this.saveLocalProgress('topic', topicId, status);
    return this.request(`/progress/topics/${topicId}`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
  }

  async updateTaskProgress(taskId: number, status: string, notes?: string): Promise<Task> {
    this.saveLocalProgress('task', taskId, status);
    return this.request<Task>(`/tasks/${taskId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
  }

  async toggleModuleCompletion(moduleCode: string): Promise<any> {
    return this.request(`/progress/quick-toggle-module/${moduleCode}`, {
      method: 'POST',
    });
  }

  // Modules & Areas
  async getModules(): Promise<ModuleStatus[]> {
    return this.request<ModuleStatus[]>('/modules');
  }

  async getModuleAreas(moduleId: number): Promise<LearningAreaProgress[]> {
    return this.request<LearningAreaProgress[]>(`/modules/${moduleId}/areas`);
  }

  async getAreaTopics(areaId: number): Promise<TopicSummary[]> {
    return this.request<TopicSummary[]>(`/areas/${areaId}/topics`);
  }

  // Topics
  async getTopicDetail(topicId: number): Promise<TopicDetail> {
    return this.request<TopicDetail>(`/topics/${topicId}`);
  }

  async addMaterial(topicId: number, title: string, content: string): Promise<Material> {
    return this.request<Material>(`/topics/${topicId}/materials`, {
      method: 'POST',
      body: JSON.stringify({ title, content, format: 'MARKDOWN', author_type: 'USER' }),
    });
  }

  // Tasks
  async getTasks(moduleCode?: string, statusFilter?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (moduleCode) params.append('module_code', moduleCode);
    if (statusFilter) params.append('status_filter', statusFilter);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Task[]>(`/tasks${qs}`);
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // AI & BYOK
  async getAISettings(): Promise<AISettings> {
    return this.request<AISettings>('/settings/ai');
  }

  async saveAISettings(apiKey: string, modelName: string): Promise<AISettings> {
    return this.request<AISettings>('/settings/ai', {
      method: 'POST',
      body: JSON.stringify({ provider: 'gemini', api_key: apiKey, model_name: modelName }),
    });
  }

  async testAIConnection(apiKey?: string, modelName?: string): Promise<{ success: boolean; message: string }> {
    return this.request('/ai/test-provider', {
      method: 'POST',
      body: JSON.stringify({ provider: 'gemini', api_key: apiKey, model_name: modelName }),
    });
  }

  async generateContent(topicId: number, type: 'material' | 'questions' | 'quiz' | 'task' | 'revision', customInstruction?: string): Promise<any> {
    const endpoint = `/ai/generate/${type}`;
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ topic_id: topicId, generation_type: type, custom_instruction: customInstruction }),
    });
  }

  async saveAIGeneration(topicId: number, type: string, title: string, markdownContent: string, questions?: any[], tasks?: any[]): Promise<any> {
    return this.request('/ai/save-generation', {
      method: 'POST',
      body: JSON.stringify({
        topic_id: topicId,
        generation_type: type,
        title,
        markdown_content: markdownContent,
        questions,
        tasks
      }),
    });
  }

  // Self-Analytics & Struggling Area Diagnostics
  async getAnalytics(pacingDays: number = 7): Promise<AnalyticsOverview> {
    return this.request<AnalyticsOverview>(`/progress/analytics?pacing_days=${pacingDays}`);
  }

  // Machine Task Specification Parsing & AI Deconstruction
  async parseDocument(file: File): Promise<{
    filename: string;
    unique_filename: string;
    file_url: string;
    file_type: string;
    extracted_text: string;
    suggested_title: string;
    summary: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/tasks/parse-document`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to parse document' }));
      throw new Error(err.detail || 'Failed to parse document');
    }
    return response.json();
  }

  async deconstructSpec(
    specText: string,
    title?: string,
    moduleCode: string = 'BM1',
    customInstruction?: string
  ): Promise<any> {
    return this.request('/tasks/deconstruct-spec', {
      method: 'POST',
      body: JSON.stringify({
        spec_text: specText,
        title: title || 'Machine Task',
        module_code: moduleCode,
        custom_instruction: customInstruction,
      }),
    });
  }

  async createStructuredMachineTask(payload: {
    title: string;
    module_code?: string;
    week_number?: number;
    priority?: string;
    learning_area_id?: number;
    overview?: string;
    spec_markdown: string;
    attachment_url?: string;
    attachment_filename?: string;
    create_subtasks?: boolean;
    subtasks?: any[];
  }): Promise<Task> {
    return this.request<Task>('/tasks/create-structured-machine-task', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();
