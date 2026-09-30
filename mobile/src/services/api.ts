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
  subtopics?: string[];
  materials: Array<{ id: number; title: string; content: string }>;
  questions: Array<{ id: number; question_text: string; answer_text?: string; question_type: string; difficulty: string }>;
  tasks: Task[];
}

export interface MobileUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  selected_domain?: string;
  course_duration?: string;
  batch_number?: string;
  experience_level?: string;
  primary_goal?: string;
  daily_commitment_hours?: number;
  target_completion_date?: string;
  onboarding_completed?: boolean;
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

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@lift_mobile_auth_token';
const USER_KEY = '@lift_mobile_user';
const PROGRESS_KEY = '@lift_mobile_local_progress';

export class MobileApi {
  private static token: string | null = null;
  private static currentUser: MobileUser | null = null;
  private static localProgressMap: Record<string, string> = {};

  static async initLocalStorage(): Promise<{ token: string | null; user: MobileUser | null }> {
    try {
      const [savedToken, savedUser, savedProgress] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(PROGRESS_KEY),
      ]);
      if (savedToken) {
        this.token = savedToken;
      }
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
      if (savedProgress) {
        this.localProgressMap = JSON.parse(savedProgress);
      }
      return { token: this.token, user: this.currentUser };
    } catch (e) {
      console.warn('[LIFT Mobile] Failed to read from local storage:', e);
      return { token: null, user: null };
    }
  }

  static async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }

  static async setCurrentUser(user: MobileUser | null) {
    this.currentUser = user;
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(USER_KEY);
    }
  }

  static getCurrentUser(): MobileUser | null {
    return this.currentUser;
  }

  static getLocalProgress(type: 'task' | 'topic', id: number): string | undefined {
    return this.localProgressMap[`${type}_${id}`];
  }

  static async saveLocalProgress(type: 'task' | 'topic', id: number, status: string) {
    try {
      this.localProgressMap[`${type}_${id}`] = status;
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(this.localProgressMap));
    } catch (e) {
      console.warn('[LIFT Mobile] Failed to save local progress:', e);
    }
  }

  static async logout() {
    this.token = null;
    this.currentUser = null;
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } catch (e) {}
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
    await this.setToken(res.access_token);
    await this.setCurrentUser(res.user);
    return res;
  }

  static async register(email: string, password: string, fullName?: string, customUsername?: string) {
    const cleanEmail = email.trim();
    const cleanUsername = (customUsername || (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail)).trim();
    const res = await this.request<{ access_token: string; user: MobileUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: cleanUsername,
        email: cleanEmail,
        password,
        full_name: fullName || cleanUsername,
      }),
    });
    await this.setToken(res.access_token);
    await this.setCurrentUser(res.user);
    return res;
  }

  static async forgotPassword(usernameOrEmail: string) {
    return this.request<{ message: string; user_exists: boolean; username?: string; email?: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ username_or_email: usernameOrEmail.trim() }),
      }
    );
  }

  static async resetPassword(usernameOrEmail: string, newPassword: string) {
    const res = await this.request<{ access_token: string; user: MobileUser }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ username_or_email: usernameOrEmail.trim(), new_password: newPassword }),
    });
    await this.setToken(res.access_token);
    await this.setCurrentUser(res.user);
    return res;
  }

  static async updateOnboarding(data: Partial<MobileUser>): Promise<MobileUser> {
    const updated = await this.request<MobileUser>('/auth/onboarding', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await this.setCurrentUser(updated);
    return updated;
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
    await this.setCurrentUser(user);
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
