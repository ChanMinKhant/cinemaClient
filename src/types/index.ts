export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
}

export interface Movie {
  id: number;
  title: string;
  duration: number;
}

export interface Seat {
  id: number;
  room: string;
  seat_row: string;
  seat_number: number;
  price: number;
}

export interface Showtime {
  id: number;
  movie_id: number;
  room: string;
  show_date: string;
  show_time: string;
}

export interface Booking {
  id: number;
  user_id: number;
  showtime_id: number;
  total_price: number;
  booked_at: string;
  seats: number[]; // seat IDs
}
