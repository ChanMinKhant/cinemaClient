import { create } from 'zustand';
import api from '@/lib/api';
import type { AxiosError } from 'axios';

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  balance?: number;
  role: string;
  createdAt: number;
}

interface UserStore {
  currentUser: User | null;
  loading: boolean;
  error: string | null;

  fetchMe: () => Promise<void>;
  setCurrentUser: (user: User | null) => void; // <-- add this
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  loading: false,
  error: null,

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{
        success: boolean;
        message: string;
        data: User;
      }>('/users/me');
      if (res.data.success) {
        set({ currentUser: res.data.data, loading: false });
      } else {
        set({ error: res.data.message, loading: false });
      }
    } catch (err) {
      const error = err as AxiosError;
      set({ error: error.message, loading: false });
    }
  },

  setCurrentUser: (user: User | null) => set({ currentUser: user }),
}));
