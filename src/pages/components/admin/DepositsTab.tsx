import React, { useEffect } from 'react';
import { useDepositStore } from '@/stores/deposit.store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  Clock, 
  User, 
  Wallet, 
  Hash, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

export default function DepositsTab() {
  const { deposits, loading, fetchDeposits, processDeposit } = useDepositStore();

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const handleAction = async (id: number, status: 'approved' | 'rejected') => {
    const note = status === 'approved' ? 'Verified' : prompt('Reason for rejection?');
    if (status === 'rejected' && note === null) return; // Cancelled prompt
    
    await processDeposit({ id, status, adminNote: note || '' });
  };

  if (loading && deposits.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-white">Deposit Requests</h2>
          <p className="text-xs text-slate-500">Review and verify user manual payments</p>
        </div>
      </div>

      <Card className="glass border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4 font-black">User / Sender</th>
                <th className="px-6 py-4 font-black">Method</th>
                <th className="px-6 py-4 font-black">Amount</th>
                <th className="px-6 py-4 font-black">Trans ID (Last 6)</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {deposits.map((d) => (
                <tr key={d.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{d.senderName}</p>
                        <p className="text-[10px] text-slate-500 italic">User ID: #{d.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                      {d.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-primary italic">
                      {d.amount.toLocaleString()} <span className="text-[10px] not-italic">KS</span>
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono text-sm text-slate-400">
                      <Hash size={12} />
                      {d.transactionLast6}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {d.status === 'pending' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full w-fit">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                    {d.status === 'approved' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-green-500 bg-green-500/10 px-2 py-1 rounded-full w-fit">
                        <Check size={12} /> Approved
                      </span>
                    )}
                    {d.status === 'rejected' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-500 bg-red-500/10 px-2 py-1 rounded-full w-fit">
                        <X size={12} /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {d.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                          onClick={() => handleAction(d.id, 'rejected')}
                        >
                          <X size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 bg-green-600 hover:bg-green-500 text-white gap-1 px-3"
                          onClick={() => handleAction(d.id, 'approved')}
                        >
                          <Check size={14} /> <span className="text-[10px] font-bold">Approve</span>
                        </Button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-600 italic">{d.adminNote || 'No notes'}</p>
                    )}
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <AlertCircle className="mx-auto text-slate-700 mb-2" size={32} />
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">No deposits found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}