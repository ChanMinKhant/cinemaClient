import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepositStore } from '@/stores/deposit.store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Wallet,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  Info
} from 'lucide-react';

export default function DepositHistoryPage() {
  const navigate = useNavigate();
  const { deposits, loading, fetchDeposits } = useDepositStore();

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  // Format date helper
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 p-6 pb-20">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full bg-white/5 hover:bg-white/10 text-white"
          >
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tight text-white">Transaction History</h1>
            <p className="text-xs text-slate-500 font-medium">Verify your top-up status and IDs</p>
          </div>
        </div>

        {/* Loading & History List */}
        {loading && deposits.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {deposits.length === 0 && (
              <Card className="glass border-white/5 border-dashed bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Wallet className="w-12 h-12 text-slate-700 mb-4" />
                  <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No Records Found</p>
                </CardContent>
              </Card>
            )}

            {deposits.map((deposit) => (
              <Card key={deposit.id} className="glass border-white/5 hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                {/* ID Watermark for a premium look */}
                <div className="absolute -right-2 -top-2 text-5xl font-black text-white/[0.02] italic select-none">
                  #{deposit.id}
                </div>

                <CardContent className="p-5 flex items-center justify-between relative z-10">
                  {/* Left: Reference & Method */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-[10px] font-black text-primary italic leading-none">ID</span>
                      <span className="text-sm font-black text-white leading-none mt-1">{deposit.id}</span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-tighter flex items-center gap-2">
                        {deposit.paymentMethod}
                        <span className="h-1 w-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] text-slate-500 font-mono">TX: {deposit.transactionLast6}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        {formatDate(deposit.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount & Status Pill */}
                  <div className="text-right">
                    <p className="text-lg font-black italic text-primary">
                      +{deposit.amount.toLocaleString()} <span className="text-[10px] not-italic text-slate-500">KS</span>
                    </p>
                    
                    <div className="flex justify-end mt-1.5">
                      {deposit.status === 'pending' && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          <Clock size={10} className="animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-widest">In Review</span>
                        </div>
                      )}
                      {deposit.status === 'approved' && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                          <CheckCircle2 size={10} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                        </div>
                      )}
                      {deposit.status === 'rejected' && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                          <XCircle size={10} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Declined</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Admin Feedback Section */}
                {deposit.status === 'rejected' && deposit.adminNote && (
                  <div className="mx-5 mb-5 p-3 bg-red-500/5 rounded-xl border border-red-500/10 flex items-start gap-3">
                    <AlertCircle size={14} className="text-red-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none">Admin Feedback</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">"{deposit.adminNote}"</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Support Section */}
        <div className="pt-8 space-y-4">
          <div className="flex items-center gap-2 text-slate-500 px-1">
            <Info size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Support Center</span>
          </div>
          
          <Card className="glass border-white/5 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6">
                <p className="text-xs text-slate-400 leading-relaxed text-center italic">
                  Something wrong? Provide your <span className="text-primary font-bold">Deposit ID</span> to our support team for faster assistance.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a 
                    href="tel:0912345678" 
                    className="flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-primary/10 rounded-xl border border-white/5 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-primary" />
                      <span className="text-[11px] font-bold text-white">0912345678</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary">Call</span>
                  </a>
                  
                  <a 
                    href="mailto:abcd@gmail.com" 
                    className="flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-primary/10 rounded-xl border border-white/5 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Mail size={14} className="text-primary" />
                      <span className="text-[11px] font-bold text-white">abcd@gmail.com</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary">Email</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}