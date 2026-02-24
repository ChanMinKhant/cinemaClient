import { create } from 'zustand';
import api from '@/lib/api'; // your axios instance
import type { AxiosError } from 'axios';

export interface Movie {
  id: number;
  title: string;
  duration: number;
  income: number;
}

interface MovieStore {
  movies: Movie[];
  loading: boolean;
  error: string | null;

  fetchMovies: () => Promise<void>;
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<void>;
  updateMovie: (movie: Movie) => Promise<void>;
  deleteMovie: (id: number) => Promise<void>;
}

export const useMovieStore = create<MovieStore>((set, get) => ({
  movies: [],
  loading: false,
  error: null,

  fetchMovies: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{
        success: boolean;
        message: string;
        data: Movie[];
      }>('/movies');
      if (res.data.success) {
        set({ movies: res.data.data, loading: false });
      } else {
        set({ error: res.data.message, loading: false });
      }
    } catch (err) {
      const error = err as AxiosError;
      set({ error: error.message, loading: false });
    }
  },

  addMovie: async (movie) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/movies', movie);
      if (res.data.success) {
        await get().fetchMovies(); // refresh cache
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

  updateMovie: async (movie) => {
    if (!movie.id) {
      set({ error: 'Movie ID is required' });
      return;
    }
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/movies`, movie);
      if (res.data.success) {
        await get().fetchMovies();
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

  deleteMovie: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.delete(`/movies/${id}`);
      if (res.data.success) {
        set({ movies: get().movies.filter((m) => m.id !== id) });
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
