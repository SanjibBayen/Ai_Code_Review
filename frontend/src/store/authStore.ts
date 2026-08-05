import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../api/auth.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  pendingEmail: string | null;
  demoOtp: string | null;
  setAuth: (user: User, token: string) => void;
  setPendingEmail: (email: string, demoOtp?: string) => void;
  checkAuth: () => Promise<void>;
  login: (email: string, password?: string) => Promise<{ email: string; demoOtp?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ email: string; demoOtp?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('ai_code_review_user') || 'null'),
  token: localStorage.getItem('ai_code_review_token'),
  isAuthenticated: !!localStorage.getItem('ai_code_review_token'),
  loading: false,
  pendingEmail: null,
  demoOtp: null,

  setAuth: (user, token) => {
    localStorage.setItem('ai_code_review_token', token);
    localStorage.setItem('ai_code_review_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  setPendingEmail: (email, demoOtp) => {
    set({ pendingEmail: email, demoOtp: demoOtp || null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('ai_code_review_token');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    try {
      set({ loading: true });
      const data = await authApi.getCurrentUser();
      set({ user: data.user, isAuthenticated: true, loading: false });
    } catch {
      localStorage.removeItem('ai_code_review_token');
      localStorage.removeItem('ai_code_review_user');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email: string, password?: string) => {
    set({ loading: true });
    try {
      const res = await authApi.login({ email, password });
      set({ pendingEmail: email, demoOtp: res.demoOtp || null, loading: false });
      return { email, demoOtp: res.demoOtp };
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (name: string, email: string, password?: string) => {
    set({ loading: true });
    try {
      const res = await authApi.register({ name, email, password });
      set({ pendingEmail: email, demoOtp: res.demoOtp || null, loading: false });
      return { email, demoOtp: res.demoOtp };
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  verifyOTP: async (email: string, otp: string) => {
    set({ loading: true });
    try {
      const res = await authApi.verifyOTP({ email, otp });
      localStorage.setItem('ai_code_review_token', res.token);
      localStorage.setItem('ai_code_review_user', JSON.stringify(res.user));
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        pendingEmail: null,
        demoOtp: null,
        loading: false
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('ai_code_review_token');
    localStorage.removeItem('ai_code_review_user');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
