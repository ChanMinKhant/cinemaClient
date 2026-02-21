import React, { useState, useEffect } from 'react';
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

// --- Local UI Components ---
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

export default function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // Using the centralized API utility as requested
        const response = await api.get('/protected/bookings/');

        // Handling the standard ApiResponse wrapper from your Java Servlet
        if (response.data && response.data.success) {
          setBookings(response.data.data || []);
        } else {
          setError(response.data?.message || 'Failed to retrieve data.');
        }
      } catch (err: any) {
        console.error('Failed to fetch bookings:', err);
        setError(
          'Could not load recent activity. Please check your connection.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Polling for "live log" feel every 30 seconds
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

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
    <div className='space-y-6'>
      <style>{`
        :root { --primary: 234 179 8; }
        .text-primary { color: rgb(234 179 8); }
        .bg-primary { background-color: rgb(234 179 8); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Summary Header */}
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
                  .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                  .toLocaleString()}{' '}
                <span className='text-xs text-slate-500'>KS</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card className='overflow-hidden border-white/5'>
        <div className='p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.01]'>
          <div>
            <h2 className='text-xl font-black tracking-tight text-white uppercase italic'>
              Activity Log
            </h2>
            <p className='text-xs text-slate-500 font-medium'>
              Real-time customer reservation stream
            </p>
          </div>
          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
            <input
              type='text'
              placeholder='Search bookings...'
              className='w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-colors'
            />
          </div>
        </div>

        <div className='overflow-x-auto scrollbar-hide'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-white/[0.02]'>
                <th className='px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                  Customer
                </th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                  Movie & Venue
                </th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                  Schedule
                </th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                  Seats
                </th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right'>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/5'>
              {[...bookings].reverse().map((b) => (
                <tr
                  key={b.id}
                  className='group hover:bg-white/[0.02] transition-colors'
                >
                  <td className='px-8 py-6'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors'>
                        <UserIcon className='w-4 h-4 text-slate-400 group-hover:text-primary' />
                      </div>
                      <span className='font-bold text-sm text-slate-200'>
                        {b.username || `User #${b.userId}`}
                      </span>
                    </div>
                  </td>
                  <td className='px-8 py-6'>
                    <div className='space-y-1'>
                      <p className='font-bold text-sm text-white'>
                        {b.movieTitle || 'Movie Title'}
                      </p>
                      <p className='text-[10px] font-black text-primary uppercase tracking-tighter flex items-center gap-1.5'>
                        <MapPin className='w-3 h-3' /> Room {b.room || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className='px-8 py-6'>
                    <div className='space-y-1 text-slate-400'>
                      <div className='flex items-center gap-2 text-xs'>
                        <Calendar className='w-3.5 h-3.5 opacity-50' />
                        <span>
                          {b.date ||
                            (b.bookedAt
                              ? new Date(b.bookedAt).toLocaleDateString()
                              : 'N/A')}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-xs'>
                        <Clock className='w-3.5 h-3.5 opacity-50' />
                        <span>
                          {b.time ||
                            (b.bookedAt
                              ? new Date(b.bookedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className='px-8 py-6'>
                    <div className='flex flex-wrap gap-1.5 max-w-[200px]'>
                      {(b.seats || []).length > 0 ? (
                        b.seats.map((s: string) => (
                          <span
                            key={s}
                            className='px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 group-hover:border-primary/20 group-hover:text-primary transition-all'
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className='text-[10px] text-slate-600 italic'>
                          No seat labels
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-8 py-6 text-right'>
                    <div className='inline-flex flex-col items-end'>
                      <span className='text-lg font-black text-white italic'>
                        {b.totalPrice?.toLocaleString()}
                      </span>
                      <span className='text-[9px] font-black text-primary uppercase tracking-[0.2em]'>
                        Kyats
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {bookings.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className='px-8 py-24 text-center'>
                    <div className='flex flex-col items-center gap-3 opacity-20'>
                      <Armchair className='w-12 h-12' />
                      <p className='text-sm font-black uppercase tracking-widest'>
                        No active reservations
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className='p-4 bg-red-500/10 border-t border-red-500/20 text-center'>
            <p className='text-xs font-bold text-red-400 uppercase tracking-widest flex items-center justify-center gap-2'>
              <Info className='w-3 h-3' />
              {error}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
