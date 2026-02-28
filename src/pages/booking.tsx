import { useState, useEffect, useMemo } from 'react';
import { useStore, ROWS, SEATS_PER_ROW } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Ticket, Armchair } from 'lucide-react';

// Zustand Stores
import { useMovieStore } from '@/stores/movie.store';
import { useShowtimeStore } from '@/stores/showtime.store';
import { useSeatStore, type Room } from '@/stores/seat.store';
import { useBookingStore } from '@/stores/booking.store';

export default function BookingPage() {
  const { toast } = useToast();

  // 1. Store Connections
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

  // 2. Local Filter State
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  /* =====================
      Helper: Date Formatting
  ===================== */
  const formatApiDate = (dateVal: number | string) => {
    const d = new Date(dateVal);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  };

  /* =====================
      Initial Data Fetch
  ===================== */
  useEffect(() => {
    fetchMovies();
    fetchShowtimes();
  }, [fetchMovies, fetchShowtimes]);

  /* =====================
      Cascading Filters
  ===================== */
  const filteredMovies = useMemo(() => {
    const scheduledIds = new Set(showtimes.map((s) => s.movieId));
    return movies.filter((m) => scheduledIds.has(m.id));
  }, [showtimes, movies]);

  const availableRooms = useMemo(() => {
    const filtered = showtimes.filter(
      (s) => String(s.movieId) === selectedMovie,
    );
    return Array.from(new Set(filtered.map((s) => s.room)));
  }, [selectedMovie, showtimes]);

  const availableDates = useMemo(() => {
    const filtered = showtimes.filter(
      (s) => String(s.movieId) === selectedMovie && s.room === selectedRoom,
    );
    return Array.from(new Set(filtered.map((s) => formatApiDate(s.showDate))));
  }, [selectedMovie, selectedRoom, showtimes]);

  const availableTimes = useMemo(() => {
    const filtered = showtimes.filter(
      (s) =>
        String(s.movieId) === selectedMovie &&
        s.room === selectedRoom &&
        formatApiDate(s.showDate) === selectedDate,
    );
    return Array.from(new Set(filtered.map((s) => s.showTime.substring(0, 5))));
  }, [selectedMovie, selectedRoom, selectedDate, showtimes]);

  const currentShowtime = useMemo(() => {
    return showtimes.find(
      (s) =>
        String(s.movieId) === selectedMovie &&
        s.room === selectedRoom &&
        formatApiDate(s.showDate) === selectedDate &&
        s.showTime.startsWith(selectedTime),
    );
  }, [selectedMovie, selectedRoom, selectedDate, selectedTime, showtimes]);

  /* =====================
      Effects for Auto-Selecting & Fetching Details
  ===================== */
  // Auto-select first available movie
  useEffect(() => {
    if (filteredMovies.length > 0 && !selectedMovie) {
      setSelectedMovie(String(filteredMovies[0].id));
    }
  }, [filteredMovies, selectedMovie]);

  // Auto-select room
  useEffect(() => {
    if (
      availableRooms.length > 0 &&
      !availableRooms.includes(selectedRoom as Room)
    ) {
      setSelectedRoom(availableRooms[0]);
    }
  }, [availableRooms, selectedRoom]);

  // Auto-select date
  useEffect(() => {
    if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Auto-select time
  useEffect(() => {
    if (availableTimes.length > 0 && !availableTimes.includes(selectedTime)) {
      setSelectedTime(availableTimes[0]);
    }
  }, [availableTimes, selectedTime]);

  // Fetch Seats when Room changes
  useEffect(() => {
    if (selectedRoom) {
      fetchSeats(selectedRoom as Room);
      clearSelection();
    }
  }, [selectedRoom, fetchSeats, clearSelection]);

  // Fetch Booked Seats when Showtime changes
  useEffect(() => {
    if (currentShowtime) {
      fetchBookedSeats(currentShowtime.id);
      clearSelection();
    }
  }, [currentShowtime, fetchBookedSeats, clearSelection]);

  /* =====================
      Booking Logic
  ===================== */
  const getSeatData = (row: string, num: number) => {
    return seats.find((s) => s.seatRow === row && s.seatNumber === num);
  };

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return sum + (seat?.price || 0);
    }, 0);
  }, [selectedSeats, seats]);

  const handleSeatClick = (seatId: number) => {
    if (bookedSeatIds.includes(seatId)) return;
    selectSeat(seatId);
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0 || !currentShowtime) return;

    await createBooking({
      showtimeId: currentShowtime.id,
      totalPrice: totalPrice,
      seatIds: selectedSeats,
    });

    const error = useBookingStore.getState().error;

    if (!error) {
      toast({
        title: 'Booking Confirmed!',
        description: `Enjoy your movie! ${selectedSeats.length} seats reserved.`,
        className: 'bg-green-600 text-white border-none',
      });
      // Refresh booked seats to block them out and clear local selection
      fetchBookedSeats(currentShowtime.id);
      clearSelection();
    } else {
      toast({
        title: 'Booking Failed',
        description: error,
        variant: 'destructive',
      });
    }
  };

  // UI Loaders
  if (moviesLoading && showtimesLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='animate-spin text-primary w-12 h-12' />
      </div>
    );
  }

  return (
    <div className='grid lg:grid-cols-12 gap-8 animate-in fade-in duration-500'>
      <div className='lg:col-span-8 space-y-8'>
        {/* Selection Controls */}
        <Card className='glass border-white/5'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Ticket className='text-primary' /> Choose Movie & Session
            </CardTitle>
          </CardHeader>
          <CardContent className='grid md:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <label className='text-[10px] font-bold text-muted-foreground uppercase'>
                Movie
              </label>
              <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                <SelectTrigger className='bg-background/50 border-white/10'>
                  <SelectValue placeholder='Select Movie' />
                </SelectTrigger>
                <SelectContent>
                  {filteredMovies.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-bold text-muted-foreground uppercase'>
                Room
              </label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className='bg-background/50 border-white/10'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((r) => (
                    <SelectItem key={r} value={r}>
                      Room {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-bold text-muted-foreground uppercase'>
                Date
              </label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className='bg-background/50 border-white/10'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-bold text-muted-foreground uppercase'>
                Time
              </label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className='bg-background/50 border-white/10'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Seat Map */}
        <Card className='bg-black/40 border-white/5 overflow-hidden relative'>
          <div className='absolute top-0 left-0 right-0 h-24 bg-linear-to-b from-primary/10 to-transparent flex items-start justify-center pt-4'>
            <div className='w-1/2 h-1 bg-primary/50 blur-sm rounded-full' />
            <span className='absolute top-6 text-[10px] text-primary/50 tracking-[0.6em]'>
              SCREEN
            </span>
          </div>

          <CardContent
            className={cn(
              'pt-24 pb-12 overflow-x-auto transition-opacity',
              seatsLoading ? 'opacity-50 pointer-events-none' : 'opacity-100',
            )}
          >
            <div className='min-w-150 flex flex-col items-center gap-2'>
              {ROWS.map((row) => (
                <div key={row} className='flex items-center gap-3'>
                  <div className='w-5 text-center text-[10px] text-muted-foreground'>
                    {row}
                  </div>
                  {Array.from({ length: SEATS_PER_ROW }).map((_, i) => {
                    const seatNumber = i + 1;
                    const seatLabel = `${row}${seatNumber}`;
                    const seatData = getSeatData(row, seatNumber);

                    const isApiValid = !!seatData;
                    const booked =
                      isApiValid && bookedSeatIds.includes(seatData.id);
                    const disabled = booked || !isApiValid || seatsLoading;
                    const selected =
                      isApiValid && selectedSeats.includes(seatData.id);

                    return (
                      <button
                        key={seatLabel}
                        disabled={disabled}
                        title={
                          !isApiValid
                            ? 'Unavailable'
                            : booked
                              ? `${seatLabel} - Booked`
                              : `${seatLabel} - ${seatData.price} ks`
                        }
                        onClick={() => seatData && handleSeatClick(seatData.id)}
                        className={cn(
                          'w-9 h-9 rounded-t-lg transition-all flex items-center justify-center',
                          disabled
                            ? 'bg-white/5 text-white/10 cursor-not-allowed'
                            : selected
                              ? 'bg-primary text-black scale-110 shadow-lg'
                              : 'bg-white/10 text-white/60 hover:bg-white/20',
                        )}
                      >
                        <Armchair className='w-4 h-4' />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='lg:col-span-4'>
        <Card className='glass border-primary/20 sticky top-24'>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-sm space-y-3'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Movie</span>
                <span className='font-medium'>
                  {movies.find((m) => String(m.id) === selectedMovie)?.title ||
                    '—'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Room</span>
                <span>{selectedRoom}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Session</span>
                <span>
                  {selectedDate} {selectedTime ? `@ ${selectedTime}` : ''}
                </span>
              </div>
            </div>

            <div className='pt-4 border-t border-white/5'>
              <p className='text-[10px] font-bold text-muted-foreground mb-2'>
                SELECTED SEATS
              </p>
              <div className='flex flex-wrap gap-2'>
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((id) => {
                    const s = seats.find((seat) => seat.id === id);
                    if (!s) return null;
                    return (
                      <span
                        key={id}
                        className='bg-primary/20 text-primary text-[10px] px-2 py-1 rounded'
                      >
                        {s.seatRow}
                        {s.seatNumber}
                      </span>
                    );
                  })
                ) : (
                  <span className='text-xs italic text-muted-foreground'>
                    None selected
                  </span>
                )}
              </div>
            </div>

            <div className='pt-4'>
              <div className='flex justify-between items-baseline mb-6'>
                <span className='text-muted-foreground'>Total Price</span>
                <span className='text-3xl font-bold text-primary'>
                  {totalPrice.toLocaleString()} ks
                </span>
              </div>
              <Button
                className='w-full'
                size='lg'
                disabled={
                  !currentShowtime ||
                  selectedSeats.length === 0 ||
                  isBooking ||
                  seatsLoading
                }
                onClick={handleBooking}
              >
                {isBooking ? (
                  <Loader2 className='animate-spin mr-2' />
                ) : (
                  'Pay & Confirm'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
