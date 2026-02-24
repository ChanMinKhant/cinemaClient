import { create } from 'zustand';
import api from '@/lib/api';
import type { AxiosError } from 'axios';
import type { Room } from './seat.store';

export interface Showtime {
  id: number;
  movieId: number;
  room: Room;
  showDate: number; // timestamp
  showTime: string; // "HH:mm:ss"
}

interface ShowtimeStore {
  showtimes: Showtime[];
  loading: boolean;
  error: string | null;

  fetchShowtimes: () => Promise<void>;
  addShowtime: (showtime: Omit<Showtime, 'id'>) => Promise<void>;
  updateShowtime: (showtime: Showtime) => Promise<void>;
  deleteShowtime: (id: number) => Promise<void>;
}

export const useShowtimeStore = create<ShowtimeStore>((set, get) => ({
  showtimes: [],
  loading: false,
  error: null,

  fetchShowtimes: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{
        success: boolean;
        message: string;
        data: Showtime[];
      }>('/showtimes');
      if (res.data.success) {
        set({ showtimes: res.data.data, loading: false });
      } else {
        set({ error: res.data.message, loading: false });
      }
    } catch (err) {
      const error = err as AxiosError;
      set({ error: error.message, loading: false });
    }
  },

  addShowtime: async (showtime) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/showtimes', showtime);
      if (res.data.success) {
        await get().fetchShowtimes(); // refresh cache
      } else {
        set({ error: res.data.message });
      }
    } catch (err) {
      const error = err as AxiosError;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateShowtime: async (showtime) => {
    if (!showtime.id) {
      set({ error: 'Showtime ID required' });
      return;
    }
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/showtimes`, showtime);
      if (res.data.success) {
        await get().fetchShowtimes();
      } else {
        set({ error: res.data.message });
      }
    } catch (err) {
      const error = err as AxiosError;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deleteShowtime: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.delete(`/showtimes/${id}`);
      if (res.data.success) {
        set({ showtimes: get().showtimes.filter((s) => s.id !== id) });
      } else {
        set({ error: res.data.message });
      }
    } catch (err) {
      const error = err as AxiosError;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
