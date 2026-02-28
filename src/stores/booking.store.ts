import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'react-toastify';

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
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/bookings'); // GET /api/bookings/*
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
      const res = await api.post('/bookings', payload); // POST /api/bookings
      console.log(res);
      
      if (res.data.success) {
        await get().fetchBookings(); // refresh bookings after creation
      } else {
        set({ error: res.data.message || 'Failed to create booking' });
      }
    } catch (err: any) {
      console.log(err.response?.data?.message);
      toast.error(err.response?.data?.message || "Network error")
      set({ error: err.response?.data?.message || 'Network error' });
    } finally {
      set({ loading: false });
    }
  },
}));
