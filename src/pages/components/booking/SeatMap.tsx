import { Card, CardContent } from '@/components/ui/card';
import { Armchair } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Seat } from '@/stores/seat.store';

interface SeatMapProps {
  seats: Seat[];
  bookedSeatIds: number[];
  myBookedSeatIds: number[];
  selectedSeats: number[];
  isLoading: boolean;
  onSeatClick: (seatId: number) => void;
}

export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
export const SEATS_PER_ROW = 10;

export function SeatMap({
  seats,
  bookedSeatIds,
  myBookedSeatIds,
  selectedSeats,
  isLoading,
  onSeatClick,
}: SeatMapProps) {
  const getSeatData = (row: string, num: number) => {
    return seats.find((s) => s.seatRow === row && s.seatNumber === num);
  };

  return (
    <Card className='bg-black/40 border-white/5 overflow-hidden relative'>
      <div className='absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/10 to-transparent flex items-start justify-center pt-4'>
        <div className='w-1/2 h-1 bg-primary/50 blur-sm rounded-full' />
        <span className='absolute top-6 text-[10px] text-primary/50 tracking-[0.6em]'>
          SCREEN
        </span>
      </div>

      <CardContent
        className={cn(
          'pt-24 pb-8 overflow-x-auto transition-opacity',
          isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100',
        )}
      >
        <div className='min-w-[600px] flex flex-col items-center gap-2'>
          
          {/* --- COLUMN NUMBERS HEADER --- */}
          <div className='flex items-center gap-3 mb-2'>
            {/* Empty space for the row letter column */}
            <div className='w-5' /> 
            {Array.from({ length: SEATS_PER_ROW }).map((_, i) => (
              <div 
                key={`col-head-${i}`} 
                className='w-9 text-center text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter'
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Seat Grid */}
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
                const booked = isApiValid && bookedSeatIds.includes(seatData.id);
                const myBooked = isApiValid && myBookedSeatIds.includes(seatData.id);
                const disabled = booked || !isApiValid || isLoading;
                const selected = isApiValid && selectedSeats.includes(seatData.id);

                return (
                  <button
                    key={seatLabel}
                    disabled={disabled}
                    title={
                      !isApiValid
                        ? 'Unavailable'
                        : myBooked
                          ? `${seatLabel} - Your Booking`
                          : booked
                            ? `${seatLabel} - Booked`
                            : `${seatLabel} - ${seatData.price} ks`
                    }
                    onClick={() => seatData && onSeatClick(seatData.id)}
                    className={cn(
                      'w-9 h-9 rounded-t-lg transition-all flex items-center justify-center',
                      !isApiValid
                        ? 'bg-white/5 text-white/10 cursor-not-allowed'
                        : myBooked
                          ? 'bg-blue-500/80 text-white cursor-not-allowed border border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : booked
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

          {/* Status Indicator Legend */}
          <div className='flex flex-wrap items-center justify-center gap-6 mt-10 pt-6 border-t border-white/5 w-full'>
            <div className='flex items-center gap-2'>
              <div className='w-5 h-5 rounded-t-sm bg-white/10 border border-white/5' />
              <span className='text-xs text-muted-foreground'>Available</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-5 h-5 rounded-t-sm bg-primary' />
              <span className='text-xs text-muted-foreground'>Selected</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-5 h-5 rounded-t-sm bg-blue-500/80 shadow-[0_0_5px_rgba(59,130,246,0.5)]' />
              <span className='text-xs text-muted-foreground'>Your Seats</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-5 h-5 rounded-t-sm bg-white/5' />
              <span className='text-xs text-muted-foreground'>Sold</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}