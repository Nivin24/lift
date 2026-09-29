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

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Dashboard & Progress
  async getDashboard(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/progress');
  }

  async updateTopicProgress(topicId: number, status: string, notes?: string): Promise<any> {
    return this.request(`/progress/topics/${topicId}`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
  }

  async updateTaskProgress(taskId: number, status: string, notes?: string): Promise<Task> {
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
}

export const api = new ApiService();
