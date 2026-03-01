import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Wallet, History, LogOut, ShieldCheck } from 'lucide-react'; 
import type { Seat } from '@/stores/seat.store';
import { useUserStore } from '@/stores/user.store';
import { Link, useNavigate } from 'react-router-dom'; 
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface BookingSummaryProps {
  movieTitle: string;
  room: string;
  date: string;
  time: string;
  selectedSeats: number[];
  seats: Seat[];
  totalPrice: number;
  isBooking: boolean;
  isDisabled: boolean;
  onBook: () => void;
}

export function BookingSummary({
  movieTitle,
  room,
  date,
  time,
  selectedSeats,
  seats,
  totalPrice,
  isBooking,
  isDisabled,
  onBook,
}: BookingSummaryProps) {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  
  const userBalance = currentUser?.balance ?? 0;
  const isInsufficientBalance = userBalance < totalPrice;

  // Logout Handler
  const handleLogout = async () => {
    try {
      const res = await api.post('/auth/logout');
      if (res.data.success) {
        setCurrentUser(null);
        toast.success("Logged out successfully");
        navigate('/login');
      }
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <Card className='glass border-primary/20 sticky top-24 shadow-2xl overflow-hidden'>
      {/* --- ACCOUNT & ADMIN SECTION --- */}
      <div className="bg-white/[0.03] border-b border-white/5 px-4 py-2 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
          Account: <span className="text-slate-300">{currentUser?.username || 'Guest'}</span>
        </span>
        
        <div className="flex items-center gap-2">
          {/* Admin Button - Only visible if role is admin */}
          {currentUser?.role === 'admin' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 gap-1.5 transition-all border border-amber-500/20"
            >
              <ShieldCheck size={12} />
              Admin
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-red-500/70 hover:text-red-500 hover:bg-red-500/10 gap-1.5 transition-all"
          >
            <LogOut size={12} />
            Logout
          </Button>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-xl italic font-black uppercase tracking-tight">
          Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent className='space-y-4'>
        {/* Movie Info Section */}
        <div className='text-sm space-y-3'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Movie</span>
            <span className='font-medium text-white'>{movieTitle}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Room</span>
            <span className='text-white'>{room || '—'}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Session</span>
            <span className='text-white'>
              {date || '—'} {time ? `@ ${time}` : ''}
            </span>
          </div>
        </div>

        {/* Selected Seats Section */}
        <div className='pt-4 border-t border-white/5'>
          <p className='text-[10px] font-bold text-muted-foreground mb-2 tracking-widest uppercase'>
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
                    className='bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-1 rounded'
                  >
                    {s.seatRow}{s.seatNumber}
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

        {/* User Balance Section */}
        <div className='pt-4 border-t border-white/5'>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground text-sm flex items-center gap-2'>
              <Wallet size={14} className="text-slate-400" /> Balance
            </span>
            <div className='flex items-center gap-2'>
              <span className={`text-sm font-bold ${isInsufficientBalance ? 'text-destructive' : 'text-white'}`}>
                {userBalance.toLocaleString()} ks
              </span>
              <Link 
                to="/user/deposit" 
                className='flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 hover:bg-primary/40 text-primary transition-all active:scale-90'
                title="Deposit Funds"
              >
                <Plus size={14} strokeWidth={3} />
              </Link>
            </div>
          </div>
          {isInsufficientBalance && selectedSeats.length > 0 && (
             <p className='text-[10px] text-destructive mt-1 text-right animate-pulse font-bold'>
                Insufficient balance
             </p>
          )}
        </div>

        {/* Final Action Section */}
        <div className='pt-2'>
          <div className='flex justify-between items-baseline mb-6'>
            <span className='text-muted-foreground'>Total Price</span>
            <span className='text-3xl font-black text-primary italic'>
              {totalPrice.toLocaleString()} ks
            </span>
          </div>
          
          <div className="space-y-3">
            <Button
              className='w-full font-bold'
              size='lg'
              disabled={isDisabled || isBooking || isInsufficientBalance}
              onClick={onBook}
            >
              {isBooking ? (
                <Loader2 className='animate-spin mr-2' />
              ) : isInsufficientBalance ? (
                'Insufficient Funds'
              ) : (
                'Pay & Confirm'
              )}
            </Button>

            <Link to="/user/booking" className="block w-full">
              <Button 
                variant="outline" 
                className="w-full h-12 bg-white/5 border-white/10 text-slate-300 hover:text-primary hover:border-primary/50 hover:bg-primary/10 gap-3 uppercase font-black tracking-tighter italic transition-all duration-300 group"
              >
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                  <History size={16} className="group-hover:rotate-[-10deg] transition-transform" />
                </div>
                <span className="text-xs">My Ticket History</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}