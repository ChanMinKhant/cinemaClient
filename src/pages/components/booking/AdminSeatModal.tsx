import { X, MousePointer2, Edit2, Loader2, Check, Ban, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Seat } from '@/stores/seat.store';
import type { User } from '@/stores/user.store';

interface AdminSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  isBooked: boolean;
  bookedUser: User | null;
  isLoadingUser: boolean;
  editPrice: number;
  setEditPrice: (price: number) => void;
  isEditingPrice: boolean;
  setIsEditingPrice: (val: boolean) => void;
  onUpdatePrice: () => void;
  onSelectForBooking: () => void;
}

export function AdminSeatModal({
  isOpen,
  onClose,
  seat,
  isBooked,
  bookedUser,
  isLoadingUser,
  editPrice,
  setEditPrice,
  isEditingPrice,
  setIsEditingPrice,
  onUpdatePrice,
  onSelectForBooking,
}: AdminSeatModalProps) {
  if (!isOpen || !seat) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.info(`${label} copied!`, { autoClose: 1000, hideProgressBar: true });
  };

  const handleCancelEdit = () => {
    setEditPrice(seat.price);
    setIsEditingPrice(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md p-6 relative shadow-2xl transition-all">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-primary">Seat {seat.seatRow}{seat.seatNumber}</span>
          <span className="text-white/20 text-sm font-normal">| Admin Panel</span>
        </h2>

        {/* Section 1: Booking Status & Selection */}
        {!isEditingPrice && (
          isBooked ? (
            <div className="mb-6 bg-blue-500/5 p-4 rounded-lg border border-blue-500/20">
              <h3 className="text-[10px] text-blue-400 mb-3 font-bold tracking-widest uppercase">Customer Information</h3>
              {isLoadingUser ? (
                <div className="flex items-center gap-2 text-white/50 text-xs py-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Fetching details...
                </div>
              ) : bookedUser ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between group">
                    <p><span className="text-white/40 mr-2">User:</span> {bookedUser.username}</p>
                  </div>

                  {/* Copyable Email */}
                  <div 
                    onClick={() => copyToClipboard(bookedUser.email, 'Email')}
                    className="flex items-center justify-between p-2 -mx-2 rounded hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <p className="truncate"><span className="text-white/40 mr-2">Email:</span> {bookedUser.email}</p>
                    <Copy className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />
                  </div>

                  {/* Copyable Phone */}
                  <div 
                    onClick={() => copyToClipboard(bookedUser.phone, 'Phone')}
                    className="flex items-center justify-between p-2 -mx-2 rounded hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <p><span className="text-white/40 mr-2">Phone:</span> {bookedUser.phone}</p>
                    <Copy className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-400">User details unavailable</p>
              )}
            </div>
          ) : (
            <div className="mb-6 bg-green-500/5 p-4 rounded-lg border border-green-500/20 flex flex-col items-center justify-center py-5 gap-3">
              <p className="text-xs text-green-400 font-medium italic">Available for booking</p>
              <button
                onClick={onSelectForBooking}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-black rounded-full text-xs font-bold hover:bg-primary/90 transition-transform active:scale-95 shadow-lg shadow-primary/20"
              >
                <MousePointer2 className="w-3.5 h-3.5" />
                Select for Booking
              </button>
            </div>
          )
        )}

        {/* Section 2: Price Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40 font-bold uppercase tracking-wider">Pricing (MMK)</label>
            {!isEditingPrice && (
              <button 
                onClick={() => setIsEditingPrice(true)}
                className="text-xs flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Edit Price
              </button>
            )}
          </div>
          
          <input
            type="number"
            value={editPrice}
            disabled={!isEditingPrice}
            onChange={(e) => setEditPrice(Number(e.target.value))}
            className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-lg font-mono transition-all focus:outline-none ${
              isEditingPrice 
                ? 'border-primary ring-2 ring-primary/10 text-white' 
                : 'border-white/5 text-white/60 opacity-100'
            }`}
          />
        </div>

        {/* Section 3: Dynamic Footer Actions (Hidden until Edit is clicked) */}
        {isEditingPrice && (
          <div className="mt-8 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={handleCancelEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
            >
              <Ban className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={onUpdatePrice}
              disabled={editPrice === seat.price}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-all disabled:opacity-30"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}