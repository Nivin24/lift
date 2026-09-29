import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  switchDemoUser: (targetUsername: 'user1' | 'user2') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me);
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
    } catch (err) {
      console.error('Auto login error:', err);
    }
  };

  const login = async (username: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(username, pass);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, pass: string, fullName?: string) => {
    setLoading(true);
    try {
      const res = await api.register(username, email, pass, fullName);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const switchDemoUser = async (targetUsername: 'user1' | 'user2') => {
    setLoading(true);
    try {
      await quickLogin(targetUsername, 'password123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchDemoUser }}>
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
