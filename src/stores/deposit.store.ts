import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export interface Deposit {
  id: number;
  userId: number;
  amount: number;
  paymentMethod: 'Wave Pay' | 'KBZ Pay' | 'AYA Pay' | 'uabpay';
  senderName: string;
  transactionLast6: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
}

interface DepositStore {
  deposits: Deposit[];
  loading: boolean;
  error: string | null;
  
  // For Users & Admin: Fetch history
  fetchDeposits: () => Promise<void>;
  
  // For Users: Submit a new request
  submitDeposit: (payload: {
    amount: number;
    paymentMethod: string;
    senderName: string;
    transactionLast6: string;
  }) => Promise<boolean>;

  // For Admin: Approve or Reject
  processDeposit: (payload: {
    id: number;
    status: 'approved' | 'rejected';
    adminNote?: string;
  }) => Promise<void>;
}

export const useDepositStore = create<DepositStore>((set, get) => ({
  deposits: [],
  loading: false,
  error: null,

  fetchDeposits: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/deposits');
      if (res.data.success) {
        set({ deposits: res.data.data, loading: false });
      } else {
        set({ error: res.data.message, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Network error', loading: false });
    }
  },

  submitDeposit: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/deposits', payload);
      if (res.data.success) {
        toast.success("Payment submitted! Please wait for admin approval.");
        await get().fetchDeposits();
        return true;
      } else {
        toast.error(res.data.message);
        return false;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Network error";
      toast.error(msg);
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  processDeposit: async (payload) => {
    set({ loading: true, error: null });
    try {
      // Using PUT for updates (admin processing)
      const res = await api.put('/admin/deposits', payload);
      if (res.data.success) {
        toast.success(`Deposit ${payload.status} successfully`);
        await get().fetchDeposits();
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      set({ loading: false });
    }
  },
}));