import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepositStore } from '@/stores/deposit.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Wallet, 
  ChevronLeft, 
  CheckCircle2, 
  Info,
  CreditCard,
  Copy,
  ArrowRight,
  Loader2
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

  // Hardcoded Admin Info (as requested)
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
      toast.error("Please provide valid sender name and 6-digit transaction ID");
      return;
    }

    const success = await submitDeposit({
      amount: Number(amount),
      paymentMethod: selectedMethod,
      senderName,
      transactionLast6: last6
    });

    if (success) navigate('/user/booking');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 p-6 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="rounded-full bg-white/5"
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-xl font-black uppercase italic tracking-tight">Add Funds</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </div>

        {step === 1 ? (
          /* STEP 1: Amount & Method */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="text-sm text-slate-400 uppercase tracking-widest">Enter Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-3xl h-20 font-black bg-white/5 border-none text-center focus-visible:ring-primary/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">KS</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                    selectedMethod === method.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${method.color}`}>
                    {method.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-tighter">{method.name}</span>
                </button>
              ))}
            </div>

            <Button 
              className="w-full h-14 text-lg font-black uppercase italic" 
              disabled={!amount || !selectedMethod}
              onClick={() => setStep(2)}
            >
              Continue <ArrowRight className="ml-2" />
            </Button>
          </div>
        ) : (
          /* STEP 2: Payment & Proof */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Info size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Transfer to this account</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Account Name</p>
                    <p className="font-bold text-lg">{adminAccount.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-lg text-primary">{adminAccount.phone}</p>
                      <button onClick={() => handleCopy(adminAccount.phone)} className="p-1 hover:text-white transition-colors">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Sender's Name</label>
                <Input 
                  placeholder="e.g. Kyaw Kyaw" 
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="bg-white/5 border-white/10 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Last 6 Digits of Transaction</label>
                <Input 
                  placeholder="123456" 
                  maxLength={6}
                  value={last6}
                  onChange={(e) => setLast6(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 font-mono tracking-[0.5em] text-center"
                />
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-black uppercase italic" 
              onClick={handleFinalSubmit}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Payment Done'}
            </Button>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-600 font-medium px-6">
          Your deposit will be verified by our admin. Once approved, the balance will be added to your wallet automatically.
        </p>
      </div>
    </div>
  );
}