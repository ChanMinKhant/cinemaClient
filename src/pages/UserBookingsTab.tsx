import React, { useEffect } from 'react';
import { useBookingStore } from '@/stores/booking.store';
import { Link } from 'react-router-dom'; // Added Link for navigation
import {
  Loader2,
  History,
  Search,
  Calendar,
  Clock,
  Armchair,
  Wallet,
  MapPin,
  Info,
  Ticket,
  ChevronLeft, // Added for the back icon
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
export default function UserBookingsTab() {
  const { bookings, loading, error, fetchBookings } = useBookingStore();

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  if (loading && bookings.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 space-y-4'>
        <Loader2 className='animate-spin text-primary w-10 h-10' />
        <p className='text-xs font-bold text-slate-500 uppercase tracking-widest'>
          Loading your tickets...
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <style>{`
        :root { --primary: 234 179 8; }
        .text-primary { color: rgb(234 179 8); }
        .bg-primary { background-color: rgb(234 179 8); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* --- NEW BACK BUTTON SECTION --- */}
      <div className="flex items-center mt-5 justify-between">
        <Link 
          to="/booking" 
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors group"
        >
          <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
            <ChevronLeft size={16} />
          </div>
          Back to Bookings
        </Link>
      </div>

      {/* =======================
          User Summary
      ======================= */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card className='p-6 bg-linear-to-br from-white/[0.03] to-transparent'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-primary/10 rounded-2xl'>
              <History className='w-5 h-5 text-primary' />
            </div>
            <div>
              <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                My Reservations
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
              <Wallet className='w-5 h-5 text-green-500' />
            </div>
            <div>
              <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                Total Spent
              </p>
              <p className='text-2xl font-black text-white'>
                {bookings
                  .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                  .toLocaleString()}{' '}
                <span className='text-xs text-slate-500'>KS</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* =======================
          Tickets Table
      ======================= */}
      <Card className='overflow-hidden'>
        <div className='p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between gap-4'>
          <div>
            <h2 className='text-xl font-black text-white uppercase italic'>
              Purchase History
            </h2>
            <p className='text-xs text-slate-500'>
              Manage and view your cinema bookings
            </p>
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
            <input
              placeholder='Search by movie...'
              className='w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs'
            />
          </div>
        </div>

        <div className='overflow-x-auto scrollbar-hide'>
          <table className='w-full'>
            <thead>
              <tr className='bg-white/[0.02]'>
                <th className='px-8 py-4 text-[10px] uppercase text-left'>Ticket ID</th>
                <th className='px-8 py-4 text-[10px] uppercase text-left'>Movie & Venue</th>
                <th className='px-8 py-4 text-[10px] uppercase text-left'>Showtime</th>
                <th className='px-8 py-4 text-[10px] uppercase text-left'>Seats</th>
                <th className='px-8 py-4 text-[10px] uppercase text-right'>Paid</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-white/5'>
              {[...bookings].reverse().map((b) => (
                <tr key={b.id} className='hover:bg-white/[0.02] transition-colors'>
                  <td className='px-8 py-6'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-white/5 flex items-center justify-center'>
                        <Ticket className='w-4 h-4 text-slate-400' />
                      </div>
                      <span className='font-mono text-xs text-slate-500'>#{b.id}</span>
                    </div>
                  </td>

                  <td className='px-8 py-6'>
                    <p className='font-bold text-sm text-white'>{(b as any).movieTitle || 'Movie'}</p>
                    <p className='text-[10px] text-primary flex items-center gap-1 mt-1'>
                      <MapPin className='w-3 h-3' />
                      Room {(b as any).room || 'A'}
                    </p>
                  </td>

                  <td className='px-8 py-6 text-xs text-slate-400'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='w-3.5 h-3.5' />
                      {(b as any).showDate ? new Date((b as any).showDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className='flex items-center gap-2 mt-1'>
                      <Clock className='w-3.5 h-3.5' />
                      {(b as any).showTime?.slice(0, 5) || '--:--'}
                    </div>
                  </td>

                  <td className='px-8 py-6'>
                    <div className='flex flex-wrap gap-1'>
                      {((b as any).seats || []).map((s: string) => (
                        <span
                          key={s}
                          className='px-2 py-0.5 text-[10px] font-bold rounded bg-primary/10 text-primary border border-primary/20'
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className='px-8 py-6 text-right'>
                    <p className='text-lg font-black text-white'>
                      {b.totalPrice.toLocaleString()}
                    </p>
                    <p className='text-[9px] text-slate-500 uppercase font-bold'>Kyats</p>
                  </td>
                </tr>
              ))}

              {bookings.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className='py-24 text-center opacity-30'>
                    <Armchair className='mx-auto w-12 h-12 mb-2' />
                    <p className='text-xs font-bold uppercase tracking-widest'>No tickets found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className='p-4 bg-red-500/10 text-center text-xs text-red-400 border-t border-red-500/20'>
            <Info className='inline w-3 h-3 mr-2' />
            {error}
          </div>
        )}
      </Card>
    </div>
  );
}