import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import type { User } from '@/stores/user.store';

export interface Booking {
  id: number;
  userId: number;
  totalPrice: number;
  bookedAt: number;
  seatIds: number[];
  showtimeId: number;
}

interface BookingStore {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (payload: {
    showtimeId: number;
    totalPrice: number;
    seatIds: number[];
  }) => Promise<void>;
  // ADD THIS: Function to get user by seat and showtime
  fetchUserBySeat: (showtimeId: number, seatId: number) => Promise<User | null>;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        set({ bookings: res.data.data, loading: false });
      } else {
        set({
          error: res.data.message || 'Failed to fetch bookings',
          loading: false,
        });
      }
    } catch (err: any) {
      set({ error: err.message || 'Network error', loading: false });
    }
  },

  createBooking: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        await get().fetchBookings();
      } else {
        set({ error: res.data.message || 'Failed to create booking' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Network error");
      set({ error: err.response?.data?.message || 'Network error' });
    } finally {
      set({ loading: false });
    }
  },

  // ADD THIS IMPLEMENTATION
  fetchUserBySeat: async (showtimeId, seatId) => {
    try {
      const res = await api.get('/bookings/seat-user', {
        params: { showtimeId, seatId },
      });
      if (res.data.success) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  },
}));