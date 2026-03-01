import React, { useEffect, useState, useMemo } from 'react';
import { useBookingStore } from '@/stores/booking.store';
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
  RefreshCcw,
} from 'lucide-react';

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
  // 1. Consume Zustand Store
  const { bookings, loading, error, fetchBookings } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Initial Fetch and Auto-Refresh
  useEffect(() => {
    fetchBookings();
    // Refresh every 30 seconds to keep the "Activity Log" live
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  // 3. Filtered and Sorted Data
  // We reverse it to show the newest bookings at the top
  const processedBookings = useMemo(() => {
    const sorted = [...bookings].reverse();
    if (!searchQuery) return sorted;
    
    return sorted.filter((b: any) => 
      b.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.movieTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toString().includes(searchQuery)
    );
  }, [bookings, searchQuery]);

  const totalRevenue = useMemo(() => 
    bookings.reduce((sum, b) => sum + b.totalPrice, 0), 
  [bookings]);

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

  return (
    <div className='space-y-6 animate-in fade-in duration-700'>
      <style>{`
        :root { --primary: 234 179 8; }
        .text-primary { color: rgb(234 179 8); }
        .bg-primary { background-color: rgb(234 179 8); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* =======================
          Summary Cards
      ======================= */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-6 bg-linear-to-br from-white/[0.03] to-transparent relative overflow-hidden group'>
          <div className='flex items-center gap-4 relative z-10'>
            <div className='p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform'>
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
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <History size={100} />
          </div>
        </Card>

        <Card className='p-6 bg-linear-to-br from-white/[0.03] to-transparent relative overflow-hidden group'>
          <div className='flex items-center gap-4 relative z-10'>
            <div className='p-3 bg-green-500/10 rounded-2xl group-hover:scale-110 transition-transform'>
              <TrendingUp className='w-5 h-5 text-green-500' />
            </div>
            <div>
              <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                Gross Revenue
              </p>
              <p className='text-2xl font-black text-white'>
                {totalRevenue.toLocaleString()}{' '}
                <span className='text-xs text-slate-500 font-bold'>KS</span>
              </p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <TrendingUp size={100} />
          </div>
        </Card>

        <Card className='p-6 bg-linear-to-br from-white/[0.03] to-transparent flex items-center justify-center border-dashed border-white/10'>
           <button 
             onClick={() => fetchBookings()}
             className="flex flex-col items-center gap-2 group"
           >
             <div className={`p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors ${loading ? 'animate-spin' : ''}`}>
               <RefreshCcw size={20} className="text-slate-400" />
             </div>
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Manual Sync</span>
           </button>
        </Card>
      </div>

      {/* =======================
          Table Container
      ======================= */}
      <Card className='overflow-hidden border-white/10 shadow-black'>
        <div className='p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.01]'>
          <div>
            <h2 className='text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2'>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Activity Log
            </h2>
            <p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest'>
              Real-time customer reservation stream
            </p>
          </div>

          <div className='relative w-full sm:w-80'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by Customer or Movie...'
              className='w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs focus:border-primary/50 focus:ring-0 transition-all outline-none placeholder:text-slate-600'
            />
          </div>
        </div>

        <div className='overflow-x-auto scrollbar-hide'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-white/[0.03]'>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left'>Customer</th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left'>Movie & Venue</th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left'>Schedule</th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left'>Seats</th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right'>Amount</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-white/5'>
              {processedBookings.map((b: any) => (
                <tr key={b.id} className='hover:bg-white/[0.02] transition-colors group'>
                  {/* Customer */}
                  <td className='px-8 py-6'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-colors'>
                        <UserIcon className='w-5 h-5 text-slate-400 group-hover:text-primary transition-colors' />
                      </div>
                      <div className="flex flex-col">
                        <span className='font-black text-sm text-white uppercase tracking-tighter'>{b.username || `User #${b.userId}`}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">TXN: {b.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Movie */}
                  <td className='px-8 py-6'>
                    <p className='font-black text-sm text-white uppercase tracking-tight'>{b.movieTitle || 'Unknown Film'}</p>
                    <div className='text-[10px] font-bold text-primary flex items-center gap-1 uppercase italic'>
                      <MapPin className='w-3 h-3' />
                      Room {b.room || 'N/A'}
                    </div>
                  </td>

                  {/* Schedule */}
                  <td className='px-8 py-6'>
                    <div className='flex flex-col gap-1 text-[11px] font-bold uppercase'>
                      <div className='flex items-center gap-2 text-slate-300'>
                        <Calendar className='w-3 h-3 text-slate-500' />
                        {b.showDate ? new Date(b.showDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '---'}
                      </div>
                      <div className='flex items-center gap-2 text-slate-500'>
                        <Clock className='w-3 h-3' />
                        {b.showTime ? b.showTime.slice(0, 5) : '--:--'}
                      </div>
                    </div>
                  </td>

                  {/* Seats */}
                  <td className='px-8 py-6'>
                    <div className='flex flex-wrap gap-1 max-w-[150px]'>
                      {b.seats?.map((s: string) => (
                        <span
                          key={s}
                          className='px-2 py-0.5 text-[9px] font-black rounded-md bg-white/5 border border-white/5 text-slate-400 group-hover:text-white transition-colors'
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className='px-8 py-6 text-right'>
                    <p className='text-lg font-black text-white italic tracking-tighter'>
                      {b.totalPrice?.toLocaleString()}
                    </p>
                    <p className='text-[9px] font-black text-primary uppercase tracking-widest'>Kyats</p>
                  </td>
                </tr>
              ))}

              {processedBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className='py-24 text-center'>
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Armchair className='mx-auto w-16 h-16' />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">No reservations found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className='p-4 bg-red-500/10 border-t border-red-500/20 text-center text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center justify-center gap-2'>
            <Info size={14} />
            {error}
          </div>
        )}
      </Card>
    </div>
  );
}