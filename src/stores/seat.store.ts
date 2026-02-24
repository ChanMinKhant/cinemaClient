import { create } from 'zustand';
import api from '@/lib/api';
import type { AxiosError } from 'axios';

export type Room = 'A' | 'B' | 'C';

export interface Seat {
  id: number;
  room: Room;
  seatRow: string;
  seatNumber: number;
  price: number;
}

interface SeatStore {
  seats: Seat[];
  bookedSeatIds: number[];
  selectedSeats: number[];
  loading: boolean;
  error: string | null;

  fetchSeats: (room?: Room) => Promise<void>;
  fetchBookedSeats: (showtimeId: number) => Promise<void>;
  selectSeat: (seatId: number) => void;
  clearSelection: () => void;

  addSeat: (seat: Omit<Seat, 'id'>) => Promise<void>;
  updateSeat: (seat: Seat) => Promise<void>;
  deleteSeat: (id: number) => Promise<void>;
}

export const useSeatStore = create<SeatStore>((set, get) => ({
  seats: [],
  bookedSeatIds: [],
  selectedSeats: [],
  loading: false,
  error: null,

  fetchSeats: async (room) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{
        success: boolean;
        message: string;
        data: Seat[];
      }>('/seats', { params: room ? { room } : undefined });
      if (res.data.success) {
        set({ seats: res.data.data, loading: false });
      } else {
        set({ error: res.data.message, loading: false });
      }
    } catch (err) {
      const error = err as AxiosError;
      set({ error: error.message, loading: false });
    }
  },

  fetchBookedSeats: async (showtimeId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{
        success: boolean;
        message: string;
        data: number[];
      }>('/seats/booked', {
        params: { showtimeId },
      });
      if (res.data.success) {
        set({ bookedSeatIds: res.data.data, loading: false });
      } else {
        set({ error: res.data.message, loading: false });
      }
    } catch (err) {
      const error = err as AxiosError;
      set({ error: error.message, loading: false });
    }
  },

  selectSeat: (seatId) => {
    set((state) => {
      if (state.selectedSeats.includes(seatId)) {
        return {
          selectedSeats: state.selectedSeats.filter((id) => id !== seatId),
        };
      } else {
        return { selectedSeats: [...state.selectedSeats, seatId] };
      }
    });
  },

  clearSelection: () => set({ selectedSeats: [] }),

  addSeat: async (seat) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/seats', seat);
      if (res.data.success) {
        await get().fetchSeats();
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

  updateSeat: async (seat) => {
    if (!seat.id) {
      set({ error: 'Seat ID required' });
      return;
    }
    set({ loading: true, error: null });
    try {
      const res = await api.put('/seats', seat);
      if (res.data.success) {
        await get().fetchSeats();
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

  deleteSeat: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.delete(`/seats/${id}`);
      if (res.data.success) {
        set({ seats: get().seats.filter((s) => s.id !== id) });
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
