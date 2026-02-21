import React, { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';

// Types
export type Role = 'user' | 'admin';
export type Room = 'A' | 'B' | 'C';

export interface User {
  username: string;
  role: Role;
}

export interface Movie {
  id: string;
  title: string;
  duration: number; // minutes
}

export interface Seat {
  id: string; // "A1"
  row: string; // "A"
  number: number; // 1
  price: number;
}

export interface Booking {
  id: string;
  username: string;
  movieTitle: string;
  room: Room;
  date: string;
  time: string;
  seats: string[]; // ["A1", "A2"]
  totalPrice: number;
  timestamp: string;
}

interface StoreContextType {
  user: User | null;
  login: (username: string, role: Role) => void;
  logout: () => void;

  movies: Movie[];
  addMovie: (movie: Movie) => void;
  deleteMovie: (id: string) => void;

  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'timestamp'>) => void;

  isSeatBooked: (
    room: Room,
    date: string,
    time: string,
    seatId: string,
  ) => boolean;

  // Data for selectors
  availableDates: string[];
  availableTimes: string[];
  setAvailableDates: (dates: string[]) => void;
  setAvailableTimes: (times: string[]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Data
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>(INITIAL_DATES);
  const [availableTimes, setAvailableTimes] = useState<string[]>(INITIAL_TIMES);

  // Mock login
  const login = (username: string, role: Role) => {
    setUser({ username, role });
  };

  const logout = () => {
    setUser(null);
  };

  const addMovie = (movie: Movie) => {
    setMovies([...movies, movie]);
  };

  const deleteMovie = (id: string) => {
    setMovies(movies.filter((m) => m.id !== id));
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'timestamp'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setBookings([...bookings, newBooking]);
  };

  const isSeatBooked = (
    room: Room,
    date: string,
    time: string,
    seatId: string,
  ) => {
    return bookings.some(
      (b) =>
        b.room === room &&
        b.date === date &&
        b.time === time &&
        b.seats.includes(seatId),
    );
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        login,
        logout,
        movies,
        addMovie,
        deleteMovie,
        bookings,
        addBooking,
        isSeatBooked,
        availableDates,
        availableTimes,
        setAvailableDates,
        setAvailableTimes,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// Helper to generate grid and pricing
export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const SEATS_PER_ROW = 10;

export const getSeatPrice = (row: string): number => {
  if (['A', 'B'].includes(row)) return 5;
  if (['C', 'D'].includes(row)) return 10;
  if (['E', 'F'].includes(row)) return 15;
  if (['G', 'H'].includes(row)) return 20;
  if (['I', 'J'].includes(row)) return 25;
  return 0;
};
