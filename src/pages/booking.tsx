import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { useStore, ROWS, SEATS_PER_ROW, type Room } from '@/lib/store';
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

type Movie = {
  id: number;
  title: string;
};

type Showtime = {
  id: number;
  movieId: number;
  room: string;
  showDate: number | string;
  showTime: string;
};

type Seat = {
  id: number;
  room: string;
  seatRow: string;
  seatNumber: number;
  price: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export default function BookingPage() {
  const { isSeatBooked, user } = useStore();
  const { toast } = useToast();

  // API Data State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [schedules, setSchedules] = useState<Showtime[]>([]);
  const [apiSeats, setApiSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);

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
      Fetch Movies & Schedules
  ===================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, scheduleRes] = await Promise.all([
          api.get<ApiResponse<Movie[]>>('/movies'),
          api.get<ApiResponse<Showtime[]>>('/showtimes'),
        ]);

        setMovies(movieRes.data.data);
        setSchedules(scheduleRes.data.data);

        const firstScheduledMovie = movieRes.data.data.find((m) =>
          scheduleRes.data.data.some((s) => s.movieId === m.id),
        );

        if (firstScheduledMovie) {
          setSelectedMovie(String(firstScheduledMovie.id));
        }
      } catch (err) {
        console.error('Failed to fetch booking data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* =====================
      Fetch Seats for Selected Room
  ===================== */
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedRoom) return;
      try {
        const res = await api.get<ApiResponse<Seat[]>>(
          `/seats/?room=${selectedRoom}`,
        );
        setApiSeats(res.data.data);
        setSelectedSeats([]);
      } catch (err) {
        console.error('Failed to fetch seats', err);
      }
    };
    fetchSeats();
  }, [selectedRoom]);

  /* =====================
      Cascading Filters
  ===================== */
  const filteredMovies = useMemo(() => {
    const scheduledIds = new Set(schedules.map((s) => s.movieId));
    return movies.filter((m) => scheduledIds.has(m.id));
  }, [schedules, movies]);

  const availableRooms = useMemo(() => {
    const filtered = schedules.filter(
      (s) => String(s.movieId) === selectedMovie,
    );
    return Array.from(new Set(filtered.map((s) => s.room)));
  }, [selectedMovie, schedules]);

  const availableDates = useMemo(() => {
    const filtered = schedules.filter(
      (s) => String(s.movieId) === selectedMovie && s.room === selectedRoom,
    );
    return Array.from(new Set(filtered.map((s) => formatApiDate(s.showDate))));
  }, [selectedMovie, selectedRoom, schedules]);

  const availableTimes = useMemo(() => {
    const filtered = schedules.filter(
      (s) =>
        String(s.movieId) === selectedMovie &&
        s.room === selectedRoom &&
        formatApiDate(s.showDate) === selectedDate,
    );
    return Array.from(new Set(filtered.map((s) => s.showTime.substring(0, 5))));
  }, [selectedMovie, selectedRoom, selectedDate, schedules]);

  const currentShowtime = useMemo(() => {
    return schedules.find(
      (s) =>
        String(s.movieId) === selectedMovie &&
        s.room === selectedRoom &&
        formatApiDate(s.showDate) === selectedDate &&
        s.showTime.startsWith(selectedTime),
    );
  }, [selectedMovie, selectedRoom, selectedDate, selectedTime, schedules]);

  /* =====================
      UX: Auto-Select Defaults
  ===================== */
  useEffect(() => {
    if (availableRooms.length > 0 && !availableRooms.includes(selectedRoom)) {
      setSelectedRoom(availableRooms[0]);
    }
  }, [availableRooms, selectedRoom]);

  useEffect(() => {
    if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  useEffect(() => {
    if (availableTimes.length > 0 && !availableTimes.includes(selectedTime)) {
      setSelectedTime(availableTimes[0]);
    }
  }, [availableTimes, selectedTime]);

  /* =====================
      Booking Logic
  ===================== */

  const getSeatData = (seatLabel: string) => {
    return apiSeats.find((s) => `${s.seatRow}${s.seatNumber}` === seatLabel);
  };

  const totalPrice = selectedSeats.reduce((sum, seatLabel) => {
    const seat = getSeatData(seatLabel);
    return sum + (seat?.price || 0);
  }, 0);

  const handleSeatClick = (seatLabel: string) => {
    if (
      isSeatBooked(selectedRoom as Room, selectedDate, selectedTime, seatLabel)
    )
      return;
    setSelectedSeats((prev) =>
      prev.includes(seatLabel)
        ? prev.filter((id) => id !== seatLabel)
        : [...prev, seatLabel],
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0 || !currentShowtime) return;

    setIsBooking(true);

    try {
      const seatIds = selectedSeats
        .map((label) => getSeatData(label)?.id)
        .filter((id): id is number => id !== undefined);

      // Changed 'showtime_id' to 'showtimeId' based on backend response error
      const bookingPayload = {
        showtimeId: currentShowtime.id,
        totalPrice: totalPrice,
        seatIds: seatIds,
      };

      const response = await api.post<ApiResponse<any>>(
        '/protected/bookings',
        bookingPayload,
      );

      if (response.data.success) {
        toast({
          title: 'Booking Confirmed!',
          description: `Enjoy your movie! ${selectedSeats.length} seats reserved.`,
          className: 'bg-green-600 text-white border-none',
        });
        setSelectedSeats([]);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: any) {
      toast({
        title: 'Booking Failed',
        description:
          err.response?.data?.message || err.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
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

          <CardContent className='pt-24 pb-12 overflow-x-auto'>
            <div className='min-w-150 flex flex-col items-center gap-2'>
              {ROWS.map((row) => (
                <div key={row} className='flex items-center gap-3'>
                  <div className='w-5 text-center text-[10px] text-muted-foreground'>
                    {row}
                  </div>
                  {Array.from({ length: SEATS_PER_ROW }).map((_, i) => {
                    const seatLabel = `${row}${i + 1}`;
                    const seatData = getSeatData(seatLabel);

                    const isApiValid = !!seatData;
                    const booked = isSeatBooked(
                      selectedRoom as Room,
                      selectedDate,
                      selectedTime,
                      seatLabel,
                    );
                    const disabled = booked || !isApiValid;
                    const selected = selectedSeats.includes(seatLabel);

                    return (
                      <button
                        key={seatLabel}
                        disabled={disabled}
                        title={
                          isApiValid
                            ? `${seatLabel} - ${seatData.price} ks`
                            : 'Unavailable'
                        }
                        onClick={() => handleSeatClick(seatLabel)}
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
                  {selectedDate} @ {selectedTime}
                </span>
              </div>
            </div>

            <div className='pt-4 border-t border-white/5'>
              <p className='text-[10px] font-bold text-muted-foreground mb-2'>
                SELECTED SEATS
              </p>
              <div className='flex flex-wrap gap-2'>
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((s) => (
                    <span
                      key={s}
                      className='bg-primary/20 text-primary text-[10px] px-2 py-1 rounded'
                    >
                      {s}
                    </span>
                  ))
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
                  !currentShowtime || selectedSeats.length === 0 || isBooking
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
