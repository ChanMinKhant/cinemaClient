import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Stores
import { useMovieStore } from '@/stores/movie.store';
import { useShowtimeStore } from '@/stores/showtime.store';
import { useSeatStore, type Room } from '@/stores/seat.store';
import { useBookingStore } from '@/stores/booking.store';
import { useUserStore } from '@/stores/user.store';

// Components
import { BookingFilters } from '@/pages/components/booking/BookingFilters';
import { SeatMap } from '@/pages/components/booking/SeatMap';
import { BookingSummary } from '@/pages/components/booking/BookingSummary';

export default function BookingPage() {
  const navigate = useNavigate();
  const currentUser = useUserStore((s) => s.currentUser);

  // Stores
  const { movies, fetchMovies, loading: moviesLoading } = useMovieStore();
  const { showtimes, fetchShowtimes, loading: showtimesLoading } =
    useShowtimeStore();
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

  // Local state
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | ''>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(''); // RAW HH:mm

  /* =====================================
      HELPERS
  ===================================== */

  const formatApiDate = (dateVal: number | string) => {
    const d = new Date(dateVal);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const formatTimeAMPM = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hour = Number(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  /* =====================================
      AUTH GUARD
  ===================================== */

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchMovies();
    fetchShowtimes();
  }, [fetchMovies, fetchShowtimes]);

  /* =====================================
      DATA PIPELINE
  ===================================== */

  // Movies that have showtimes
  const filteredMovies = useMemo(() => {
    const ids = new Set(showtimes.map((s) => s.movieId));
    return movies.filter((m) => ids.has(m.id));
  }, [movies, showtimes]);

  // Auto select movie
  useEffect(() => {
    if (filteredMovies.length && !selectedMovie) {
      setSelectedMovie(String(filteredMovies[0].id));
    }
  }, [filteredMovies, selectedMovie]);

  // Rooms
  const availableRooms = useMemo(() => {
    return Array.from(
      new Set(
        showtimes
          .filter((s) => String(s.movieId) === selectedMovie)
          .map((s) => s.room),
      ),
    ) as Room[];
  }, [selectedMovie, showtimes]);

  useEffect(() => {
    if (
      availableRooms.length &&
      (!selectedRoom || !availableRooms.includes(selectedRoom))
    ) {
      setSelectedRoom(availableRooms[0]);
    }
  }, [availableRooms, selectedRoom]);

  // Dates
  const availableDates = useMemo(() => {
    return Array.from(
      new Set(
        showtimes
          .filter(
            (s) =>
              String(s.movieId) === selectedMovie && s.room === selectedRoom,
          )
          .map((s) => formatApiDate(s.showDate)),
      ),
    );
  }, [selectedMovie, selectedRoom, showtimes]);

  useEffect(() => {
    if (
      availableDates.length &&
      (!selectedDate || !availableDates.includes(selectedDate))
    ) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Times (RAW + LABEL)
  const availableTimes = useMemo(() => {
    const filtered = showtimes.filter(
      (s) =>
        String(s.movieId) === selectedMovie &&
        s.room === selectedRoom &&
        formatApiDate(s.showDate) === selectedDate,
    );

    return Array.from(
      new Map(
        filtered.map((s) => {
          const raw = s.showTime.substring(0, 5);
          return [raw, formatTimeAMPM(raw)];
        }),
      ),
    ).map(([raw, label]) => ({ raw, label }));
  }, [selectedMovie, selectedRoom, selectedDate, showtimes]);

  useEffect(() => {
    if (
      availableTimes.length &&
      (!selectedTime ||
        !availableTimes.some((t) => t.raw === selectedTime))
    ) {
      setSelectedTime(availableTimes[0].raw);
    }
  }, [availableTimes, selectedTime]);

  // Current showtime
  const currentShowtime = useMemo(() => {
    return showtimes.find(
      (s) =>
        String(s.movieId) === selectedMovie &&
        s.room === selectedRoom &&
        formatApiDate(s.showDate) === selectedDate &&
        s.showTime.startsWith(selectedTime),
    );
  }, [selectedMovie, selectedRoom, selectedDate, selectedTime, showtimes]);

  /* =====================================
      SEAT SYNC
  ===================================== */

  useEffect(() => {
    if (selectedRoom) fetchSeats(selectedRoom);
  }, [selectedRoom, fetchSeats]);

  useEffect(() => {
    if (currentShowtime) {
      fetchBookedSeats(currentShowtime.id);
      clearSelection();
    }
  }, [currentShowtime, fetchBookedSeats, clearSelection]);

  /* =====================================
      BOOKING
  ===================================== */

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, id) => {
      const seat = seats.find((s) => s.id === id);
      return sum + (seat?.price || 0);
    }, 0);
  }, [selectedSeats, seats]);

  const handleBooking = async () => {
    if (!currentShowtime || !selectedSeats.length) return;

    await createBooking({
      showtimeId: currentShowtime.id,
      seatIds: selectedSeats,
      totalPrice,
    });

    if (!useBookingStore.getState().error) {
      toast.success('Booking Confirmed!');
      fetchBookedSeats(currentShowtime.id);
      currentUser.balance -= totalPrice;
      clearSelection();
    }
  };

  /* =====================================
      LOADING
  ===================================== */

  if (moviesLoading || showtimesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    );
  }

  /* =====================================
      RENDER
  ===================================== */

  return (
    <div className="grid lg:grid-cols-12 gap-8 p-6">
      <div className="lg:col-span-8 space-y-8">
        <BookingFilters
          movies={filteredMovies}
          selectedMovie={selectedMovie}
          onSelectMovie={setSelectedMovie}
          availableRooms={availableRooms}
          selectedRoom={selectedRoom}
          onSelectRoom={(v) => setSelectedRoom(v as Room)}
          availableDates={availableDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          availableTimes={availableTimes.map((t) => t.label)}
          selectedTime={formatTimeAMPM(selectedTime)}
          onSelectTime={(label) => {
            const found = availableTimes.find((t) => t.label === label);
            if (found) setSelectedTime(found.raw);
          }}
        />

        <SeatMap
          seats={seats}
          bookedSeatIds={bookedSeatIds}
          selectedSeats={selectedSeats}
          isLoading={seatsLoading}
          onSeatClick={(id) =>
            !bookedSeatIds.includes(id) && selectSeat(id)
          }
        />
      </div>

      <div className="lg:col-span-4">
        <BookingSummary
          movieTitle={
            movies.find((m) => String(m.id) === selectedMovie)?.title || '—'
          }
          room={selectedRoom}
          date={selectedDate}
          time={formatTimeAMPM(selectedTime)}
          selectedSeats={selectedSeats}
          seats={seats}
          totalPrice={totalPrice}
          isBooking={isBooking}
          isDisabled={!currentShowtime || !selectedSeats.length}
          onBook={handleBooking}
        />
      </div>
    </div>
  );
}