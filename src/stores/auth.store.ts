import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  username: string;
  email?: string;
  phone?: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: {
    username: string;
    password: string;
    email: string;
    phone: string;
  }) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>; // optional: get user info
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { username, password });

      if (res.data.success) {
        set({ user: { username }, loading: false });
        return true;
      } else {
        set({ error: res.data.message || 'Login failed', loading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message || 'Network error', loading: false });
      return false;
    }
  },

  register: async ({ username, password, email, phone }) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', {
        username,
        password,
        email,
        phone,
      });

      if (res.data.success) {
        set({ user: { username, email, phone }, loading: false });
        return true;
      } else {
        set({
          error: res.data.message || 'Registration failed',
          loading: false,
        });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message || 'Network error', loading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null });
    // optionally call API to clear cookie server-side if needed
  },

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/auth/me'); // optional endpoint
      if (res.data.success) {
        set({ user: res.data.data, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (err) {
      set({ user: null, loading: false });
    }
  },
}));
