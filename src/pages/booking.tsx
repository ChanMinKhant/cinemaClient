import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

// Stores
import { useMovieStore } from '@/stores/movie.store';
import { useShowtimeStore } from '@/stores/showtime.store';
import { useSeatStore, type Room } from '@/stores/seat.store';
import { useBookingStore } from '@/stores/booking.store';

// Split Components
import { BookingFilters } from '@/pages/components/booking/BookingFilters';
import { SeatMap } from '@/pages/components/booking/SeatMap';
import { BookingSummary } from '@/pages/components/booking/BookingSummary';
import { useUserStore } from '@/stores/user.store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function BookingPage() {
  const currentUser = useUserStore((state) => state.currentUser);
  // Zustand Store Hooks
  const { movies, fetchMovies, loading: moviesLoading } = useMovieStore();
  const {
    showtimes,
    fetchShowtimes,
    loading: showtimesLoading,
  } = useShowtimeStore();
  const {
    seats,
    bookedSeatIds,
    selectedSeats,
    fetchSeats,
    fetchBookedSeats,
    selectSeat,
    clearSelection,
    loading: seatsLoading,
  } = useSeatStore();
  const { createBooking, loading: isBooking } = useBookingStore();

  // Selection States
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Room | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const formatApiDate = (dateVal: number | string) => {
    const d = new Date(dateVal);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate('/');
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMovies();
    fetchShowtimes();
  }, [fetchMovies, fetchShowtimes]);

  
  /* ==========================================
      REACTIVE WATERFALL (Auto-Selection)
  ========================================== */

  // A. Filter movies that actually have showtimes
  const filteredMovies = useMemo(() => {
    const scheduledIds = new Set(showtimes.map((s) => s.movieId));
    return movies.filter((m) => scheduledIds.has(m.id));
  }, [showtimes, movies]);

  // B. Auto-select first Movie
  useEffect(() => {
    if (filteredMovies.length > 0 && !selectedMovie) {
      setSelectedMovie(String(filteredMovies[0].id));
    }
  }, [filteredMovies, selectedMovie]);

  // C. Calculate available Rooms & Auto-select first
  const availableRooms = useMemo(() => {
    const filtered = showtimes.filter(
      (s) => String(s.movieId) === selectedMovie,
    );
    return Array.from(new Set(filtered.map((s) => s.room))) as Room[];
  }, [selectedMovie, showtimes]);

  useEffect(() => {
    if (availableRooms.length > 0) {
      // If current room is no longer available for this movie, or nothing is selected
      if (!selectedRoom || !availableRooms.includes(selectedRoom as Room)) {
        setSelectedRoom(availableRooms[0]);
      }
    }
  }, [availableRooms, selectedRoom]);

  // D. Calculate available Dates & Auto-select first
  const availableDates = useMemo(() => {
    const filtered = showtimes.filter(
      (s) => String(s.movieId) === selectedMovie && s.room === selectedRoom,
    );
    return Array.from(new Set(filtered.map((s) => formatApiDate(s.showDate))));
  }, [selectedMovie, selectedRoom, showtimes]);

  useEffect(() => {
    if (availableDates.length > 0) {
      if (!selectedDate || !availableDates.includes(selectedDate)) {
        setSelectedDate(availableDates[0]);
      }
    }
  }, [availableDates, selectedDate]);

  // E. Calculate available Times & Auto-select first
  const availableTimes = useMemo(() => {
    const filtered = showtimes.filter(
      (s) =>
        String(s.movieId) === selectedMovie &&
        s.room === selectedRoom &&
        formatApiDate(s.showDate) === selectedDate,
    );
    return Array.from(new Set(filtered.map((s) => s.showTime.substring(0, 5))));
  }, [selectedMovie, selectedRoom, selectedDate, showtimes]);

  useEffect(() => {
    if (availableTimes.length > 0) {
      if (!selectedTime || !availableTimes.includes(selectedTime)) {
        setSelectedTime(availableTimes[0]);
      }
    }
  }, [availableTimes, selectedTime]);

  /* ==========================================
      DATA LOADING SYNC
  ========================================== */

  // Find the exact showtime ID for the current combination
  const currentShowtime = useMemo(() => {
    return showtimes.find(
      (s) =>
        String(s.movieId) === selectedMovie &&
        s.room === selectedRoom &&
        formatApiDate(s.showDate) === selectedDate &&
        s.showTime.startsWith(selectedTime),
    );
  }, [selectedMovie, selectedRoom, selectedDate, selectedTime, showtimes]);

  // Sync Seats and Bookings with the selected Room/Showtime
  useEffect(() => {
    if (selectedRoom) fetchSeats(selectedRoom as Room);
  }, [selectedRoom, fetchSeats]);

  useEffect(() => {
    if (currentShowtime) {
      fetchBookedSeats(currentShowtime.id);
      clearSelection(); // Clear previous user picks when session changes
    }
  }, [currentShowtime, fetchBookedSeats, clearSelection]);

  /* ==========================================
      HANDLERS & RENDER
  ========================================== */

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, id) => {
      const seat = seats.find((s) => s.id === id);
      return sum + (seat?.price || 0);
    }, 0);
  }, [selectedSeats, seats]);

  const handleBooking = async () => {
    if (!currentShowtime || selectedSeats.length === 0) return;

    await createBooking({
      showtimeId: currentShowtime.id,
      totalPrice,
      seatIds: selectedSeats,
    });

    if (!useBookingStore.getState().error) {
      toast.success('Booking Confirmed!');
      fetchBookedSeats(currentShowtime.id);
      clearSelection();
    }
  };

  if (moviesLoading || showtimesLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='animate-spin text-primary w-12 h-12' />
      </div>
    );
  }

  return (
    <div className='grid lg:grid-cols-12 gap-8 p-6'>
      <div className='lg:col-span-8 space-y-8'>
        <BookingFilters
          movies={filteredMovies}
          selectedMovie={selectedMovie}
          onSelectMovie={setSelectedMovie}
          availableRooms={availableRooms}
          selectedRoom={selectedRoom}
          onSelectRoom={(val) => setSelectedRoom(val as Room)}
          availableDates={availableDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          availableTimes={availableTimes}
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
        />

        <SeatMap
          seats={seats}
          bookedSeatIds={bookedSeatIds}
          selectedSeats={selectedSeats}
          isLoading={seatsLoading}
          onSeatClick={(id) => !bookedSeatIds.includes(id) && selectSeat(id)}
        />
      </div>

      <div className='lg:col-span-4'>
        <BookingSummary
          movieTitle={
            movies.find((m) => String(m.id) === selectedMovie)?.title || '—'
          }
          room={selectedRoom}
          date={selectedDate}
          time={selectedTime}
          selectedSeats={selectedSeats}
          seats={seats}
          totalPrice={totalPrice}
          isBooking={isBooking}
          isDisabled={!currentShowtime || selectedSeats.length === 0}
          onBook={handleBooking}
        />
      </div>
    </div>
  );
}
