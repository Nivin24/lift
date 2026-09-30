import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  forgotPassword: (username_or_email: string) => Promise<{ message: string; user_exists: boolean; username?: string; email?: string }>;
  resetPassword: (username_or_email: string, new_pass: string) => Promise<void>;
  logout: () => void;
  updateOnboarding: (data: Partial<import('../types').StudentOnboardingData>) => Promise<User>;
  switchDemoUser: (targetUsername: 'user1' | 'user2') => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup' | 'forgot';
  setAuthModalMode: (mode: 'signin' | 'signup' | 'forgot') => void;
  openAuthModal: (mode?: 'signin' | 'signup' | 'forgot') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('lift_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me);
          localStorage.setItem('lift_current_user', JSON.stringify(me));
        } catch (e) {
          // Token expired or invalid, auto-login user1 for seamless developer workspace UX
          await quickLogin('user1', 'password123');
        }
      } else {
        // Auto login default demo user1
        await quickLogin('user1', 'password123');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const quickLogin = async (username: string, pass: string) => {
    try {
      const res = await api.login(username, pass);
      setUser(res.user);
      localStorage.setItem('lift_current_user', JSON.stringify(res.user));
    } catch (err) {
      console.error('Auto login error:', err);
    }
  };

  const login = async (username: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(username, pass);
      setUser(res.user);
      localStorage.setItem('lift_current_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, pass: string, fullName?: string) => {
    setLoading(true);
    try {
      const res = await api.register(username, email, pass, fullName);
      setUser(res.user);
      localStorage.setItem('lift_current_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (username_or_email: string) => {
    return api.forgotPassword(username_or_email);
  };

  const resetPassword = async (username_or_email: string, new_pass: string) => {
    setLoading(true);
    try {
      const res = await api.resetPassword(username_or_email, new_pass);
      setUser(res.user);
      localStorage.setItem('lift_current_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    localStorage.removeItem('lift_current_user');
  };

  const updateOnboarding = async (data: Partial<import('../types').StudentOnboardingData>) => {
    const updated = await api.updateOnboarding(data);
    setUser(updated);
    return updated;
  };

  const switchDemoUser = async (targetUsername: 'user1' | 'user2') => {
    setLoading(true);
    try {
      await quickLogin(targetUsername, 'password123');
    } finally {
      setLoading(false);
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup' | 'forgot' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        updateOnboarding,
        switchDemoUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
