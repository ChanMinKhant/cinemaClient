import { create } from 'zustand';
import { format } from 'date-fns';

/* =======================
   TYPES (same as yours)
======================= */

export type Role = 'user' | 'admin';
export type Room = 'A' | 'B' | 'C';

export interface User {
  username: string;
  role: Role;
}

export interface Movie {
  id: string;
  title: string;
  duration: number;
}

export interface Booking {
  id: string;
  username: string;
  movieTitle: string;
  room: Room;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  timestamp: string;
}

/* =======================
   INITIAL DATA
======================= */

const INITIAL_MOVIES: Movie[] = [
  { id: '1', title: 'Interstellar 2: The Return', duration: 160 },
  { id: '2', title: 'Cyberpunk: Edgerunners Live', duration: 120 },
  { id: '3', title: 'The Matrix: Resurrections Redux', duration: 140 },
];

const INITIAL_DATES = [
  format(new Date(), 'yyyy-MM-dd'),
  format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
  format(new Date(Date.now() + 86400000 * 2), 'yyyy-MM-dd'),
];

const INITIAL_TIMES = ['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM'];

/* =======================
   STORE
======================= */

interface CinemaStore {
  /* Auth */
  user: User | null;
  login: (username: string, role: Role) => void;
  logout: () => void;

  /* Movies */
  movies: Movie[];
  addMovie: (movie: Movie) => void;
  deleteMovie: (id: string) => void;

  /* Bookings */
  bookings: Booking[];
  addBooking: (data: Omit<Booking, 'id' | 'timestamp'>) => void;
  isSeatBooked: (
    room: Room,
    date: string,
    time: string,
    seatId: string,
  ) => boolean;

  /* UI Data */
  availableDates: string[];
  availableTimes: string[];
  setAvailableDates: (dates: string[]) => void;
  setAvailableTimes: (times: string[]) => void;
}

export const useCinemaStore = create<CinemaStore>((set, get) => ({
  /* Auth */
  user: null,
  login: (username, role) => set({ user: { username, role } }),
  logout: () => set({ user: null }),

  /* Movies */
  movies: INITIAL_MOVIES,
  addMovie: (movie) => set((state) => ({ movies: [...state.movies, movie] })),
  deleteMovie: (id) =>
    set((state) => ({
      movies: state.movies.filter((m) => m.id !== id),
    })),

  /* Bookings */
  bookings: [],
  addBooking: (data) =>
    set((state) => ({
      bookings: [
        ...state.bookings,
        {
          ...data,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  isSeatBooked: (room, date, time, seatId) =>
    get().bookings.some(
      (b) =>
        b.room === room &&
        b.date === date &&
        b.time === time &&
        b.seats.includes(seatId),
    ),

  /* UI Data */
  availableDates: INITIAL_DATES,
  availableTimes: INITIAL_TIMES,
  setAvailableDates: (dates) => set({ availableDates: dates }),
  setAvailableTimes: (times) => set({ availableTimes: times }),
}));
