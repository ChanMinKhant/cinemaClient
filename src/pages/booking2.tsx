import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Ticket, Armchair } from 'lucide-react';

// =====================================================================
// 🛠️ MOCKS & STUBS FOR PREVIEW ENVIRONMENT
// These are included solely so the component compiles and runs in this browser preview.
// When pasting back into your project, you can ignore this section and keep
// your original imports (e.g., import api from '@/lib/api'; import { Button } ...)
// =====================================================================

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ');

// Mock Constants
const ROWS = ['A', 'B', 'C', 'D', 'E'];
const SEATS_PER_ROW = 8;
type Room = string;

// Mock Hooks
const useStore = () => ({ user: { name: 'Movie Fan' } });
const useToast = () => ({
  toast: (props: any) =>
    console.log('Toast Notification:', props.title, props.description),
});

// Mock API that mimics your backend
const api = {
  get: async <T,>(url: string): Promise<{ data: T }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (url === '/movies') {
      return {
        data: {
          success: true,
          message: '',
          data: [
            { id: 1, title: 'Inception' },
            { id: 2, title: 'Interstellar' },
          ],
        },
      } as any;
    }
    if (url === '/showtimes') {
      return {
        data: {
          success: true,
          message: '',
          data: [
            {
              id: 101,
              movieId: 1,
              room: '1',
              showDate: Date.now(),
              showTime: '18:00:00',
            },
            {
              id: 102,
              movieId: 1,
              room: '2',
              showDate: Date.now(),
              showTime: '21:00:00',
            },
            {
              id: 103,
              movieId: 2,
              room: '1',
              showDate: Date.now(),
              showTime: '22:30:00',
            },
          ],
        },
      } as any;
    }
    if (url.startsWith('/seats/?room=')) {
      const room = new URLSearchParams(url.split('?')[1]).get('room') || '1';
      const fakeSeats = [];
      let seatId = 1;
      for (const row of ROWS) {
        for (let i = 1; i <= SEATS_PER_ROW; i++) {
          fakeSeats.push({
            id: seatId++,
            room,
            seatRow: row,
            seatNumber: i,
            price: 5000,
          });
        }
      }
      return { data: { success: true, message: '', data: fakeSeats } } as any;
    }
    if (url.startsWith('/seats/booked')) {
      // Mock some randomly booked seats based on showtimeId
      return {
        data: { success: true, message: '', data: [2, 5, 12, 13, 20] },
      } as any;
    }
    return { data: { success: true, message: '', data: [] } } as any;
  },
  post: async <T,>(url: string, payload: any): Promise<{ data: T }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: { success: true, message: 'Success', data: {} } } as any;
  },
};

// Mock UI Components (Tailwind HTML fallbacks for Shadcn)
const Card = ({ className, children }: any) => (
  <div
    className={cn(
      'rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-sm',
      className,
    )}
  >
    {children}
  </div>
);
const CardHeader = ({ className, children }: any) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
    {children}
  </div>
);
const CardTitle = ({ className, children }: any) => (
  <h3 className={cn('font-semibold leading-none tracking-tight', className)}>
    {children}
  </h3>
);
const CardContent = ({ className, children }: any) => (
  <div className={cn('p-6 pt-0', className)}>{children}</div>
);
const Button = ({ className, size, disabled, onClick, children }: any) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white shadow hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2',
      size === 'lg' && 'h-10 rounded-md px-8',
      className,
    )}
  >
    {children}
  </button>
);

// Fallback Select (Maps Shadcn sub-components into a native HTML select)
const Select = ({ value, onValueChange, children }: any) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className='flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50'
  >
    {children}
  </select>
);
const SelectTrigger = ({ children }: any) => <>{children}</>;
const SelectValue = ({ placeholder }: any) => (
  <option value='' disabled>
    {placeholder}
  </option>
);
const SelectContent = ({ children }: any) => <>{children}</>;
const SelectItem = ({ value, children }: any) => (
  <option value={value}>{children}</option>
);

// =====================================================================
// 🎬 ACTUAL BOOKING PAGE LOGIC
// =====================================================================

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
  const { user } = useStore();
  const { toast } = useToast();

  // API Data State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [schedules, setSchedules] = useState<Showtime[]>([]);
  const [apiSeats, setApiSeats] = useState<Seat[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<number[]>([]); // Added tracking for booked seat IDs
  const [loading, setLoading] = useState(true);
  const [isFetchingBooked, setIsFetchingBooked] = useState(false);

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
      Fetch Booked Seats (NEW)
  ===================== */
  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!currentShowtime) {
        setBookedSeatIds([]);
        return;
      }

      setIsFetchingBooked(true);
      setSelectedSeats([]); // Clear selected seats when changing session

      try {
        const res = await api.get<ApiResponse<number[]>>(
          `/seats/booked?showtimeId=${currentShowtime.id}`,
        );

        if (res.data.success) {
          setBookedSeatIds(res.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch booked seats', error);
        setBookedSeatIds([]);
      } finally {
        setIsFetchingBooked(false);
      }
    };

    fetchBookedSeats();
  }, [currentShowtime]);

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
    const seatData = getSeatData(seatLabel);
    if (!seatData) return;

    // Prevent selecting a seat that is already booked via API
    if (bookedSeatIds.includes(seatData.id)) return;

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

        // Push newly booked seats into state to visually disable them
        setBookedSeatIds((prev) => [...prev, ...seatIds]);
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
      <div className='flex h-screen items-center justify-center bg-slate-950 text-white'>
        <Loader2 className='animate-spin text-blue-500 w-12 h-12' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-950 text-slate-200 p-8'>
      <div className='max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 animate-in fade-in duration-500'>
        <div className='lg:col-span-8 space-y-8'>
          {/* Selection Controls */}
          <Card className='border-slate-800 bg-slate-900/50 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Ticket className='text-blue-500' /> Choose Movie & Session
              </CardTitle>
            </CardHeader>
            <CardContent className='grid md:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <label className='text-[10px] font-bold text-slate-400 uppercase'>
                  Movie
                </label>
                <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                  <SelectTrigger>
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
                <label className='text-[10px] font-bold text-slate-400 uppercase'>
                  Room
                </label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Room' />
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
                <label className='text-[10px] font-bold text-slate-400 uppercase'>
                  Date
                </label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Date' />
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
                <label className='text-[10px] font-bold text-slate-400 uppercase'>
                  Time
                </label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Time' />
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
          <Card className='bg-black/60 border-slate-800 overflow-hidden relative'>
            <div className='absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-500/10 to-transparent flex items-start justify-center pt-4'>
              <div className='w-1/2 h-1 bg-blue-500/50 blur-sm rounded-full' />
              <span className='absolute top-6 text-[10px] text-blue-500/50 tracking-[0.6em]'>
                SCREEN
              </span>
            </div>

            <CardContent
              className={cn(
                'pt-24 pb-12 overflow-x-auto transition-opacity',
                isFetchingBooked
                  ? 'opacity-50 pointer-events-none'
                  : 'opacity-100',
              )}
            >
              <div className='min-w-fit flex flex-col items-center gap-2'>
                {ROWS.map((row) => (
                  <div key={row} className='flex items-center gap-3'>
                    <div className='w-5 text-center text-[10px] text-slate-500 font-bold'>
                      {row}
                    </div>
                    {Array.from({ length: SEATS_PER_ROW }).map((_, i) => {
                      const seatLabel = `${row}${i + 1}`;
                      const seatData = getSeatData(seatLabel);

                      const isApiValid = !!seatData;

                      // Using API ID array instead of client store
                      const booked =
                        isApiValid && bookedSeatIds.includes(seatData.id);

                      const disabled =
                        booked || !isApiValid || isFetchingBooked;
                      const selected = selectedSeats.includes(seatLabel);

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
                          onClick={() => handleSeatClick(seatLabel)}
                          className={cn(
                            'w-9 h-9 rounded-t-lg transition-all flex items-center justify-center',
                            disabled
                              ? 'bg-white/5 text-white/10 cursor-not-allowed'
                              : selected
                                ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700',
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
          <Card className='border-blue-900/50 bg-slate-900/50 backdrop-blur-sm sticky top-8'>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-sm space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Movie</span>
                  <span className='font-medium'>
                    {movies.find((m) => String(m.id) === selectedMovie)
                      ?.title || '—'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Room</span>
                  <span>{selectedRoom}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>Session</span>
                  <span>
                    {selectedDate} @ {selectedTime}
                  </span>
                </div>
              </div>

              <div className='pt-4 border-t border-slate-800'>
                <p className='text-[10px] font-bold text-slate-400 mb-2'>
                  SELECTED SEATS
                </p>
                <div className='flex flex-wrap gap-2'>
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map((s) => (
                      <span
                        key={s}
                        className='bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 rounded'
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className='text-xs italic text-slate-500'>
                      None selected
                    </span>
                  )}
                </div>
              </div>

              <div className='pt-4'>
                <div className='flex justify-between items-baseline mb-6'>
                  <span className='text-slate-400'>Total Price</span>
                  <span className='text-3xl font-bold text-blue-500'>
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
                    isFetchingBooked
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
    </div>
  );
}
