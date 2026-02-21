import { useState } from 'react';
import {
  useStore,
  ROWS,
  SEATS_PER_ROW,
  getSeatPrice,
  type Room,
} from '@/lib/store';
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

export default function BookingPage() {
  const {
    movies,
    availableDates,
    availableTimes,
    isSeatBooked,
    addBooking,
    user,
  } = useStore();
  const { toast } = useToast();

  console.log('movies', movies);
  console.log('availableDates', availableDates);
  console.log('availableTimes', availableTimes);
  console.log('isSeatBooked', isSeatBooked);
  console.log('addBooking', addBooking);

  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Room>('A');
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]);
  const [selectedTime, setSelectedTime] = useState<string>(availableTimes[0]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  // Calculate totals
  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const row = seatId.charAt(0);
    return sum + getSeatPrice(row);
  }, 0);

  const handleSeatClick = (seatId: string) => {
    if (isSeatBooked(selectedRoom, selectedDate, selectedTime, seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;

    setIsBooking(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const movie = movies.find((m) => m.id === selectedMovie);

    addBooking({
      username: user?.username || 'Guest',
      movieTitle: movie?.title || 'Unknown',
      room: selectedRoom,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats,
      totalPrice,
    });

    toast({
      title: 'Booking Confirmed!',
      description: `You have booked ${selectedSeats.length} seats for $${totalPrice}`,
      className: 'bg-green-600 text-white border-none',
    });

    setSelectedSeats([]);
    setIsBooking(false);
  };

  return (
    <div className='grid lg:grid-cols-12 gap-8 animate-in fade-in duration-500'>
      {/* LEFT: Controls & Grid */}
      <div className='lg:col-span-8 space-y-8'>
        {/* Booking Controls */}
        <Card className='glass border-white/5'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Ticket className='text-primary' />
              Select Your Experience
            </CardTitle>
          </CardHeader>
          <CardContent className='grid md:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <label className='text-xs font-medium text-muted-foreground uppercase'>
                Movie
              </label>
              <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                <SelectTrigger className='bg-background/50 border-white/10'>
                  <SelectValue placeholder='Select Movie' />
                </SelectTrigger>
                <SelectContent>
                  {movies.map((movie) => (
                    <SelectItem key={movie.id} value={movie.id}>
                      {movie.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-medium text-muted-foreground uppercase'>
                Room
              </label>
              <Select
                value={selectedRoom}
                onValueChange={(v: any) => setSelectedRoom(v as Room)}
              >
                <SelectTrigger className='bg-background/50 border-white/10'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='A'>Room A (IMAX)</SelectItem>
                  <SelectItem value='B'>Room B (Dolby)</SelectItem>
                  <SelectItem value='C'>Room C (Standard)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-medium text-muted-foreground uppercase'>
                Date
              </label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className='bg-background/50 border-white/10'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-medium text-muted-foreground uppercase'>
                Time
              </label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className='bg-background/50 border-white/10'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Seat Grid */}
        <Card className='bg-black/40 border-white/5 overflow-hidden relative'>
          {/* Screen Visual */}
          <div className='absolute top-0 left-0 right-0 h-24 bg-linear-to-b from-primary/10 to-transparent flex items-start justify-center pt-4'>
            <div className='w-1/2 h-1 bg-primary/50 blur-sm rounded-full' />
            <span className='absolute top-6 text-xs text-primary/50 tracking-[0.5em] font-medium'>
              SCREEN
            </span>
          </div>

          <CardContent className='pt-24 pb-12 overflow-x-auto'>
            <div className='min-w-150 flex flex-col items-center gap-2'>
              {ROWS.map((row) => (
                <div key={row} className='flex items-center gap-2 md:gap-3'>
                  <div className='w-6 text-center text-xs font-medium text-muted-foreground'>
                    {row}
                  </div>
                  {Array.from({ length: SEATS_PER_ROW }).map((_, i) => {
                    const seatNum = i + 1;
                    const seatId = `${row}${seatNum}`;
                    const price = getSeatPrice(row);
                    const booked = isSeatBooked(
                      selectedRoom,
                      selectedDate,
                      selectedTime,
                      seatId,
                    );
                    const selected = selectedSeats.includes(seatId);

                    return (
                      <button
                        key={seatId}
                        onClick={() => handleSeatClick(seatId)}
                        disabled={booked}
                        className={cn(
                          'w-8 h-8 md:w-10 md:h-10 rounded-t-lg rounded-b-md flex items-center justify-center text-[10px] font-medium transition-all duration-200 relative group',
                          booked
                            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                            : selected
                              ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-110 z-10'
                              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:scale-105 border border-white/10',
                        )}
                        title={`Row ${row}, Seat ${seatNum} - $${price}`}
                      >
                        <Armchair
                          className={cn(
                            'w-4 h-4 md:w-5 md:h-5',
                            selected && 'fill-current',
                          )}
                        />

                        {/* Tooltip for Price on Hover */}
                        {!booked && (
                          <div className='absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black border border-white/10 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20'>
                            ${price}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  <div className='w-6 text-center text-xs font-medium text-muted-foreground'>
                    {row}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          {/* Legend */}
          <div className='border-t border-white/5 p-4 flex justify-center gap-6 text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded bg-white/10 border border-white/10' />{' '}
              Available
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded bg-primary border border-primary' />{' '}
              Selected
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded bg-white/5 border border-white/5 opacity-50' />{' '}
              Booked
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT: Summary */}
      <div className='lg:col-span-4'>
        <Card className='glass border-primary/20 sticky top-24'>
          <CardHeader>
            <CardTitle className='text-xl'>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between py-2 border-b border-white/5'>
                <span className='text-muted-foreground'>Movie</span>
                <span className='font-medium text-right max-w-45 truncate'>
                  {movies.find((m) => m.id === selectedMovie)?.title ||
                    'Select a movie'}
                </span>
              </div>
              <div className='flex justify-between py-2 border-b border-white/5'>
                <span className='text-muted-foreground'>Room</span>
                <span className='font-medium'>Room {selectedRoom}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-white/5'>
                <span className='text-muted-foreground'>Date</span>
                <span className='font-medium'>{selectedDate}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-white/5'>
                <span className='text-muted-foreground'>Time</span>
                <span className='font-medium'>{selectedTime}</span>
              </div>
            </div>

            <div className='space-y-3'>
              <p className='text-sm font-medium text-muted-foreground'>
                Selected Seats
              </p>
              <div className='flex flex-wrap gap-2 min-h-10'>
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      className='px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold border border-primary/20'
                    >
                      {seat}
                    </span>
                  ))
                ) : (
                  <span className='text-xs text-muted-foreground italic'>
                    No seats selected
                  </span>
                )}
              </div>
            </div>

            <div className='pt-4 mt-4 border-t border-dashed border-white/10'>
              <div className='flex justify-between items-end mb-6'>
                <span className='text-muted-foreground'>Total</span>
                <span className='text-3xl font-heading font-bold text-primary'>
                  ${totalPrice}
                </span>
              </div>

              <Button
                className='w-full h-12 text-lg font-bold shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-shadow'
                onClick={handleBooking}
                disabled={
                  selectedSeats.length === 0 || !selectedMovie || isBooking
                }
              >
                {isBooking ? (
                  <Loader2 className='w-5 h-5 animate-spin mr-2' />
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Guide */}
        <div className='mt-6 bg-black/20 rounded-lg p-4 border border-white/5'>
          <h4 className='text-sm font-medium mb-3 text-muted-foreground'>
            Pricing Guide
          </h4>
          <div className='grid grid-cols-2 gap-2 text-xs'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Rows A-B</span>{' '}
              <span>$5</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Rows C-D</span>{' '}
              <span>$10</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Rows E-F</span>{' '}
              <span>$15</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Rows G-H</span>{' '}
              <span>$20</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Rows I-J</span>{' '}
              <span>$25</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
