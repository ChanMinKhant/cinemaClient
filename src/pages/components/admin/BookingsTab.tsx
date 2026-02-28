import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Loader2,
  History,
  Search,
  User as UserIcon,
  Calendar,
  Clock,
  Armchair,
  TrendingUp,
  MapPin,
  Info,
} from 'lucide-react';

/* =======================
   Types
======================= */
type BookingView = {
  id: number;
  totalPrice: number;
  bookedAt: number;
  username: string;
  movieTitle: string;
  room: string;
  showDate: string; // yyyy-mm-dd
  showTime: string; // HH:mm:ss
  seats: string[];
};

/* =======================
   UI Components
======================= */
const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`rounded-3xl border border-white/5 bg-[#121216] text-slate-200 shadow-2xl ${className}`}
  >
    {children}
  </div>
);

/* =======================
   Main Component
======================= */
export default function BookingsTab() {
  const [bookings, setBookings] = useState<BookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =======================
     Fetch Bookings
  ======================= */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/bookings');

        if (res.data?.success) {
          setBookings(res.data.data ?? []);
          setError(null);
        } else {
          setError(res.data?.message || 'Failed to retrieve bookings');
        }
      } catch (err) {
        console.error(err);
        setError('Could not load bookings. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  /* =======================
     Loading State
  ======================= */
  if (loading && bookings.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 space-y-4'>
        <Loader2 className='animate-spin text-primary w-10 h-10' />
        <p className='text-xs font-bold text-slate-500 uppercase tracking-widest'>
          Syncing Reservations...
        </p>
      </div>
    );
  }

  /* =======================
     Render
  ======================= */
  return (
    <div className='space-y-6'>
      <style>{`
        :root { --primary: 234 179 8; }
        .text-primary { color: rgb(234 179 8); }
        .bg-primary { background-color: rgb(234 179 8); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* =======================
          Summary
      ======================= */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-6 bg-linear-to-br from-white/[0.03] to-transparent'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-primary/10 rounded-2xl'>
              <History className='w-5 h-5 text-primary' />
            </div>
            <div>
              <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                Total Bookings
              </p>
              <p className='text-2xl font-black text-white'>
                {bookings.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-6 bg-linear-to-br from-white/[0.03] to-transparent'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-green-500/10 rounded-2xl'>
              <TrendingUp className='w-5 h-5 text-green-500' />
            </div>
            <div>
              <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                Revenue
              </p>
              <p className='text-2xl font-black text-white'>
                {bookings
                  .reduce((sum, b) => sum + b.totalPrice, 0)
                  .toLocaleString()}{' '}
                <span className='text-xs text-slate-500'>KS</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* =======================
          Table
      ======================= */}
      <Card className='overflow-hidden'>
        <div className='p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between gap-4'>
          <div>
            <h2 className='text-xl font-black text-white uppercase italic'>
              Activity Log
            </h2>
            <p className='text-xs text-slate-500'>
              Real-time customer reservation stream
            </p>
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
            <input
              placeholder='Search bookings...'
              className='w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs'
            />
          </div>
        </div>

        <div className='overflow-x-auto scrollbar-hide'>
          <table className='w-full'>
            <thead>
              <tr className='bg-white/[0.02]'>
                <th className='px-8 py-4 text-[10px] uppercase'>Customer</th>
                <th className='px-8 py-4 text-[10px] uppercase'>
                  Movie & Venue
                </th>
                <th className='px-8 py-4 text-[10px] uppercase'>Schedule</th>
                <th className='px-8 py-4 text-[10px] uppercase'>Seats</th>
                <th className='px-8 py-4 text-[10px] uppercase text-right'>
                  Amount
                </th>
              </tr>
            </thead>

            <tbody className='divide-y divide-white/5'>
              {[...bookings].reverse().map((b) => (
                <tr key={b.id} className='hover:bg-white/[0.02]'>
                  {/* Customer */}
                  <td className='px-8 py-6'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-white/5 flex items-center justify-center'>
                        <UserIcon className='w-4 h-4 text-slate-400' />
                      </div>
                      <span className='font-bold text-sm'>{b.username}</span>
                    </div>
                  </td>

                  {/* Movie */}
                  <td className='px-8 py-6'>
                    <p className='font-bold text-sm'>{b.movieTitle}</p>
                    <p className='text-[10px] text-primary flex items-center gap-1'>
                      <MapPin className='w-3 h-3' />
                      Room {b.room}
                    </p>
                  </td>

                  {/* Schedule */}
                  <td className='px-8 py-6 text-xs text-slate-400'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='w-3.5 h-3.5' />
                      {new Date(b.showDate).toLocaleDateString()}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Clock className='w-3.5 h-3.5' />
                      {b.showTime.slice(0, 5)}
                    </div>
                  </td>

                  {/* Seats */}
                  <td className='px-8 py-6'>
                    <div className='flex flex-wrap gap-1'>
                      {b.seats.map((s) => (
                        <span
                          key={s}
                          className='px-2 py-0.5 text-[10px] rounded bg-white/5'
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className='px-8 py-6 text-right'>
                    <p className='text-lg font-black'>
                      {b.totalPrice.toLocaleString()}
                    </p>
                    <p className='text-[9px] text-primary uppercase'>Kyats</p>
                  </td>
                </tr>
              ))}

              {bookings.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className='py-24 text-center opacity-30'>
                    <Armchair className='mx-auto w-12 h-12' />
                    <p>No reservations</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className='p-4 bg-red-500/10 text-center text-xs text-red-400'>
            <Info className='inline w-3 h-3 mr-2' />
            {error}
          </div>
        )}
      </Card>
    </div>
  );
}
