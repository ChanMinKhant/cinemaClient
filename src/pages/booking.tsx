import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Stores
import { useMovieStore } from '@/stores/movie.store';
import { useShowtimeStore } from '@/stores/showtime.store';
import { useSeatStore, type Room, type Seat } from '@/stores/seat.store';
import { useBookingStore } from '@/stores/booking.store';
import { useUserStore, type User } from '@/stores/user.store';

// Components
import { BookingFilters } from '@/pages/components/booking/BookingFilters';
import { SeatMap } from '@/pages/components/booking/SeatMap';
import { BookingSummary } from '@/pages/components/booking/BookingSummary';
import { AdminSeatModal } from '@/pages/components/booking/AdminSeatModal'; // Import external modal

export default function BookingPage() {
  const navigate = useNavigate();
  const currentUser = useUserStore((s) => s.currentUser);
  const isAdmin = currentUser?.role === 'admin';

  const { movies, fetchMovies, loading: moviesLoading } = useMovieStore();
  const { showtimes, fetchShowtimes, loading: showtimesLoading } = useShowtimeStore();
  
  const {
    seats, bookedSeatIds, myBookedSeatIds, selectedSeats,
    fetchSeats, fetchBookedSeats, fetchMyBookedSeats,
    selectSeat, clearSelection, updateSeat, loading: seatsLoading,
  } = useSeatStore();
  
  const { createBooking, fetchUserBySeat, loading: isBooking } = useBookingStore();

  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | ''>('');
  const [selectedTime, setSelectedTime] = useState('');

  // Admin States
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminSelectedSeat, setAdminSelectedSeat] = useState<Seat | null>(null);
  const [adminSeatUser, setAdminSeatUser] = useState<User | null>(null);
  const [adminLoadingUser, setAdminLoadingUser] = useState(false);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  // ... (Keep existing useEffects and formatters from previous version) ...
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

  useEffect(() => { if (!currentUser) navigate('/'); }, [currentUser, navigate]);
  useEffect(() => { fetchMovies(); fetchShowtimes(); }, [fetchMovies, fetchShowtimes]);

  const filteredMovies = useMemo(() => {
    const ids = new Set(showtimes.map((s) => s.movieId));
    return movies.filter((m) => ids.has(m.id));
  }, [movies, showtimes]);

  useEffect(() => {
    if (filteredMovies.length && !selectedMovie) setSelectedMovie(String(filteredMovies[0].id));
  }, [filteredMovies, selectedMovie]);

  const availableDates = useMemo(() => {
    if (!selectedMovie) return [];
    return Array.from(new Set(showtimes.filter((s) => String(s.movieId) === selectedMovie).map((s) => formatApiDate(s.showDate))));
  }, [selectedMovie, showtimes]);

  useEffect(() => {
    if (availableDates.length && (!selectedDate || !availableDates.includes(selectedDate))) setSelectedDate(availableDates[0]);
  }, [availableDates, selectedDate]);

  const availableRooms = useMemo(() => {
    if (!selectedMovie || !selectedDate) return [];
    return Array.from(new Set(showtimes.filter((s) => String(s.movieId) === selectedMovie && formatApiDate(s.showDate) === selectedDate).map((s) => s.room))) as Room[];
  }, [selectedMovie, selectedDate, showtimes]);

  useEffect(() => {
    if (availableRooms.length && (!selectedRoom || !availableRooms.includes(selectedRoom))) setSelectedRoom(availableRooms[0]);
  }, [availableRooms, selectedRoom]);

  const availableTimes = useMemo(() => {
    const filtered = showtimes.filter((s) => String(s.movieId) === selectedMovie && formatApiDate(s.showDate) === selectedDate && s.room === selectedRoom);
    return Array.from(new Map(filtered.map((s) => {
      const raw = s.showTime.substring(0, 5);
      return [raw, formatTimeAMPM(raw)];
    }))).map(([raw, label]) => ({ raw, label }));
  }, [selectedMovie, selectedDate, selectedRoom, showtimes]);

  useEffect(() => {
    if (availableTimes.length && (!selectedTime || !availableTimes.some((t) => t.raw === selectedTime))) {
      setSelectedTime(availableTimes[0]?.raw || '');
    }
  }, [availableTimes, selectedTime]);

  const currentShowtime = useMemo(() => {
    return showtimes.find((s) => String(s.movieId) === selectedMovie && formatApiDate(s.showDate) === selectedDate && s.room === selectedRoom && s.showTime.startsWith(selectedTime));
  }, [selectedMovie, selectedDate, selectedRoom, selectedTime, showtimes]);

  useEffect(() => { if (selectedRoom) fetchSeats(selectedRoom); }, [selectedRoom, fetchSeats]);

  useEffect(() => {
    if (currentShowtime) {
      fetchBookedSeats(currentShowtime.id);
      fetchMyBookedSeats(currentShowtime.id);
      clearSelection();
    }
  }, [currentShowtime, fetchBookedSeats, fetchMyBookedSeats, clearSelection]);

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, id) => {
      const seat = seats.find((s) => s.id === id);
      return sum + (seat?.price || 0);
    }, 0);
  }, [selectedSeats, seats]);

  const handleBooking = async () => {
    if (!currentShowtime || !selectedSeats.length) return;
    await createBooking({ showtimeId: currentShowtime.id, seatIds: selectedSeats, totalPrice });
    if (!useBookingStore.getState().error) {
      toast.success('Booking Confirmed!');
      fetchBookedSeats(currentShowtime.id);
      fetchMyBookedSeats(currentShowtime.id);
      clearSelection();
    }
  };

  /* =====================================
      ADMIN HANDLERS
  ===================================== */
  const handleAdminSeatClick = async (seat: Seat, isBooked: boolean) => {
    setAdminSelectedSeat(seat);
    setEditPrice(seat.price);
    setIsEditingPrice(false);
    setAdminSeatUser(null);
    setAdminModalOpen(true);

    if (isBooked && currentShowtime) {
      setAdminLoadingUser(true);
      const user = await fetchUserBySeat(currentShowtime.id, seat.id);
      setAdminSeatUser(user);
      setAdminLoadingUser(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!adminSelectedSeat) return;
    await updateSeat({ ...adminSelectedSeat, price: editPrice });
    toast.success("Seat price updated successfully!");
    setAdminModalOpen(false);
  };

  const handleAdminSelectForBooking = () => {
    if (adminSelectedSeat) {
      selectSeat(adminSelectedSeat.id);
      setAdminModalOpen(false);
    }
  };

  if (moviesLoading || showtimesLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>;

  return (
    <div className="grid lg:grid-cols-12 gap-8 p-6 relative">
      <div className="lg:col-span-8 space-y-8">
        <BookingFilters
          movies={filteredMovies}
          selectedMovie={selectedMovie}
          onSelectMovie={(v) => { setSelectedMovie(v); setSelectedDate(''); setSelectedRoom(''); setSelectedTime(''); }}
          availableDates={availableDates}
          selectedDate={selectedDate}
          onSelectDate={(v) => { setSelectedDate(v); setSelectedRoom(''); setSelectedTime(''); }}
          availableRooms={availableRooms}
          selectedRoom={selectedRoom}
          onSelectRoom={(v) => { setSelectedRoom(v); setSelectedTime(''); }}
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
          myBookedSeatIds={myBookedSeatIds}
          selectedSeats={selectedSeats}
          isLoading={seatsLoading}
          isAdmin={isAdmin}
          onSeatClick={(id) => !bookedSeatIds.includes(id) && selectSeat(id)}
          onAdminSeatClick={handleAdminSeatClick}
        />
      </div>

      <div className="lg:col-span-4">
        <BookingSummary
          movieTitle={movies.find((m) => String(m.id) === selectedMovie)?.title || '—'}
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

      {/* RENDER EXTERNAL MODAL */}
      <AdminSeatModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        seat={adminSelectedSeat}
        isBooked={adminSelectedSeat ? bookedSeatIds.includes(adminSelectedSeat.id) : false}
        bookedUser={adminSeatUser}
        isLoadingUser={adminLoadingUser}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
        isEditingPrice={isEditingPrice}
        setIsEditingPrice={setIsEditingPrice}
        onUpdatePrice={handleUpdatePrice}
        onSelectForBooking={handleAdminSelectForBooking}
      />
    </div>
  );
}