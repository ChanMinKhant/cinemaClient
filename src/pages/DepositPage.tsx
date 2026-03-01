import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDepositStore } from '@/stores/deposit.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  History, 
  Info, 
  Copy, 
  ArrowRight, 
  Loader2,
  Wallet 
} from 'lucide-react';
import { toast } from 'react-toastify';

const PAYMENT_METHODS = [
  { id: 'Wave Pay', name: 'Wave Pay', color: 'bg-yellow-500', icon: 'W' },
  { id: 'KBZ Pay', name: 'KBZ Pay', color: 'bg-blue-600', icon: 'K' },
  { id: 'AYA Pay', name: 'AYA Pay', color: 'bg-red-600', icon: 'A' },
  { id: 'uabpay', name: 'uabpay', color: 'bg-red-500', icon: 'U' },
];

export default function DepositPage() {
  const navigate = useNavigate();
  const { submitDeposit, loading } = useDepositStore();
  
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [senderName, setSenderName] = useState('');
  const [last6, setLast6] = useState('');

  // Hardcoded Admin Account Details
  const adminAccount = {
    name: "Mg Mg",
    phone: "0912345678"
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard");
  };

  const handleFinalSubmit = async () => {
    if (!senderName || last6.length !== 6) {
      toast.error("Please provide sender name and exact last 6 digits of transaction");
      return;
    }

    const success = await submitDeposit({
      amount: Number(amount),
      paymentMethod: selectedMethod as any,
      senderName,
      transactionLast6: last6
    });

    if (success) {
      // Redirect to history to see the pending status
      navigate('/user/deposit/history');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 p-6 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => step > 1 ? setStep(1) : navigate(-1)}
            className="rounded-full bg-white/5 hover:bg-white/10 text-white"
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-xl font-black uppercase italic tracking-tight text-white">Add Funds</h1>
      </div>
  
      {/* ENHANCED HISTORY BUTTON */}
      <Link to="/user/deposit/history">
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-full bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 px-4 py-1.5 flex gap-2 group"
        >
          <History size={15} className="group-hover:rotate-[-20deg] transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">View History</span>
        </Button>
      </Link>
    </div>

        {/* Progress Bar */}
        <div className="flex gap-2">
          <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-white/10'}`} />
          <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-white/10'}`} />
        </div>

        {step === 1 ? (
          /* STEP 1: Amount & Method Selection */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="glass border-white/5 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                  Enter Deposit Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-4xl h-24 font-black bg-white/5 border-none text-center focus-visible:ring-primary/30 rounded-2xl"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-600 italic">KS</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 group ${
                    selectedMethod === method.id 
                    ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.1)]' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg transition-transform group-active:scale-90 ${method.color}`}>
                    {method.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{method.name}</span>
                </button>
              ))}
            </div>

            <Button 
              className="w-full h-16 text-lg font-black uppercase italic rounded-2xl shadow-xl shadow-primary/10" 
              disabled={!amount || Number(amount) <= 0 || !selectedMethod}
              onClick={() => setStep(2)}
            >
              Continue to Payment <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        ) : (
          /* STEP 2: Payment Instructions & Proof Submission */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="border-primary/20 bg-primary/5 overflow-hidden">
              <div className="bg-primary/10 px-4 py-2 flex items-center gap-2">
                <Info size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Transfer Instructions</span>
              </div>
              <CardContent className="pt-6 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Please transfer <span className="text-white font-bold">{Number(amount).toLocaleString()} KS</span> using <span className="text-white font-bold">{selectedMethod}</span> to the following account:
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Account Holder</p>
                      <p className="font-bold text-lg text-white">{adminAccount.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Phone Number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-lg text-primary">{adminAccount.phone}</p>
                        <button 
                          onClick={() => handleCopy(adminAccount.phone)} 
                          className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 hover:text-primary transition-all"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sender's Name</label>
                <Input 
                  placeholder="The name on your banking app" 
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="bg-white/5 border-white/10 h-14 rounded-xl focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last 6 Digits of Transaction ID</label>
                <Input 
                  placeholder="0 0 0 0 0 0" 
                  maxLength={6}
                  value={last6}
                  onChange={(e) => setLast6(e.target.value)}
                  className="bg-white/5 border-white/10 h-14 rounded-xl font-mono tracking-[0.8em] text-center text-xl focus:border-primary/50"
                />
              </div>
            </div>

            <Button 
              className="w-full h-16 text-lg font-black uppercase italic rounded-2xl shadow-xl" 
              onClick={handleFinalSubmit}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Confirm Payment Done'}
            </Button>
            
            <button 
              onClick={() => setStep(1)}
              className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Go Back & Change Amount
            </button>
          </div>
        )}

        <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
          <Info size={16} className="text-slate-500 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-normal font-medium">
            Verification is manual. Our team will check the transaction ID and sender name against our records. Once verified, funds will appear in your balance (usually within 5-30 mins).
          </p>
        </div>
      </div>
    </div>
  );
}