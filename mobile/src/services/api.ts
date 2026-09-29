import Constants from 'expo-constants';
import { DashboardOverview, Task, ModuleStatus, LearningAreaProgress, AnalyticsOverview } from '../types';

export interface MobileTopicSummary {
  id: number;
  learning_area_id: number;
  title: string;
  slug: string;
  summary?: string;
  difficulty: string;
  estimated_minutes: number;
  user_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface MobileTopicDetail {
  id: number;
  learning_area_id: number;
  learning_area_title: string;
  module_code: string;
  title: string;
  slug: string;
  summary?: string;
  difficulty: string;
  estimated_minutes: number;
  user_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  materials: Array<{ id: number; title: string; content: string }>;
  questions: Array<{ id: number; question_text: string; answer_text?: string; question_type: string; difficulty: string }>;
  tasks: Task[];
}

export interface MobileUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
}

export interface MobileAISettings {
  provider: string;
  model_name: string;
  is_configured: boolean;
  masked_key?: string;
  available_models: string[];
}

const getBaseUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8000/api/v1`;
  }
  return 'http://192.168.1.7:8000/api/v1';
};

const API_BASE = getBaseUrl();
console.log('[LIFT Mobile] Backend URL:', API_BASE);

export class MobileApi {
  private static token: string | null = null;
  private static currentUser: MobileUser | null = null;

  static setToken(token: string | null) {
    this.token = token;
  }

  static getCurrentUser(): MobileUser | null {
    return this.currentUser;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      let msg = `HTTP error ${res.status}`;
      try {
        const j = await res.json();
        msg = j.detail || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return res.json();
  }

  static async login(usernameOrEmail: string = 'user1', password: string = 'password123') {
    const res = await this.request<{ access_token: string; user: MobileUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username_or_email: usernameOrEmail.trim(), password }),
    });
    this.token = res.access_token;
    this.currentUser = res.user;
    return res;
  }

  static async register(email: string, password: string, fullName?: string) {
    const cleanEmail = email.trim();
    const cleanUsername = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
    const res = await this.request<{ access_token: string; user: MobileUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: cleanUsername,
        email: cleanEmail,
        password,
        full_name: fullName || cleanUsername,
      }),
    });
    this.token = res.access_token;
    this.currentUser = res.user;
    return res;
  }

  static async loginOrRegister(email: string, password: string, isRegisterMode: boolean = false) {
    if (isRegisterMode) {
      return this.register(email, password);
    }
    try {
      return await this.login(email, password);
    } catch (err: any) {
      // If user not found, attempt register
      if (err.message && (err.message.includes('Incorrect') || err.message.includes('not found'))) {
        return this.register(email, password);
      }
      throw err;
    }
  }

  static async getMe(): Promise<MobileUser> {
    const user = await this.request<MobileUser>('/auth/me');
    this.currentUser = user;
    return user;
  }

  static async getDashboard(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/progress');
  }

  static async getAreaTopics(areaId: number): Promise<MobileTopicSummary[]> {
    return this.request<MobileTopicSummary[]>(`/areas/${areaId}/topics`);
  }

  static async getTopicDetail(topicId: number): Promise<MobileTopicDetail> {
    return this.request<MobileTopicDetail>(`/topics/${topicId}`);
  }

  static async getAllTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks');
  }

  static async updateTopicProgress(topicId: number, status: string): Promise<any> {
    return this.request(`/progress/topics/${topicId}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  static async updateTaskProgress(taskId: number, status: string): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  static async toggleModuleCompletion(moduleCode: string): Promise<any> {
    return this.request(`/progress/quick-toggle-module/${moduleCode}`, {
      method: 'POST',
    });
  }

  static async getAISettings(): Promise<MobileAISettings> {
    return this.request<MobileAISettings>('/settings/ai');
  }

  static async saveAISettings(apiKey: string, modelName: string): Promise<MobileAISettings> {
    return this.request<MobileAISettings>('/settings/ai', {
      method: 'POST',
      body: JSON.stringify({ provider: 'gemini', api_key: apiKey, model_name: modelName }),
    });
  }

  static async testAIConnection(apiKey?: string, modelName?: string): Promise<{ success: boolean; message: string }> {
    return this.request('/ai/test-provider', {
      method: 'POST',
      body: JSON.stringify({ provider: 'gemini', api_key: apiKey, model_name: modelName }),
    });
  }

  static async getAnalytics(pacingDays: number = 7): Promise<AnalyticsOverview> {
    return this.request<AnalyticsOverview>(`/progress/analytics?pacing_days=${pacingDays}`);
  }
}
