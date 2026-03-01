import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User as UserIcon, 
  Wallet, 
  Mail, 
  Phone, 
  Trash2,
  Loader2,
  Search,
  Plus 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  balance: number;
  role: 'admin' | 'user';
  createdAt: string;
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTopUp = async (userId: number) => {
    const amountStr = prompt("Enter amount to add to user balance (ks):");
    if (!amountStr) return;
    
    const amountToAdd = Number(amountStr);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    setUpdatingId(userId);
    try {
      const newBalance = (targetUser.balance || 0) + amountToAdd;
      
      // We send ONLY the balance to the PUT endpoint 
      // This prevents the "Password cannot be null" error in the backend
      const res = await api.put(`/users/${userId}`, { 
        balance: newBalance 
      });

      if (res.data.success) {
        toast.success(`Updated ${targetUser.username}'s balance to ${newBalance.toLocaleString()}ks`);
        // Update local state immediately
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: newBalance } : u));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update balance. Check server logs.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Loading Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-white tracking-tight">User Management</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Control access & credits</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <Input 
            placeholder="Search by username or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card className="glass border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                <th className="px-6 py-5 font-black">Identity</th>
                <th className="px-6 py-5 font-black">Contact Info</th>
                <th className="px-6 py-5 font-black">Account Balance</th>
                <th className="px-6 py-5 font-black">Access Level</th>
                {/* <th className="px-6 py-5 font-black text-right">Management</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Identity */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/30 transition-all">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{user.username}</p>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">Ref ID: {user.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Mail size={12} className="text-slate-600" /> {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone size={12} className="text-slate-600" /> {user.phone || 'No Phone'}
                      </div>
                    </div>
                  </td>

                  {/* Balance + Top Up */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                        <Wallet size={12} className="text-primary/60" />
                        <span className="text-sm font-black italic text-primary">
                          {user.balance?.toLocaleString() || 0}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase not-italic">ks</span>
                      </div>
                      
                      {/* THE PLUS BUTTON */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleTopUp(user.id)}
                        disabled={updatingId === user.id}
                        className="h-8 w-8 rounded-full bg-white/5 text-slate-400 hover:bg-primary hover:text-black hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                      >
                        {updatingId === user.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Plus size={14} strokeWidth={3} />
                        )}
                      </Button>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${
                      user.role === 'admin' 
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Actions */}
                  {/* <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                      onClick={() => toast.warn("Deletion requires Database Cascade clearance.")}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Footer Info */}
      <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest pt-4 italic">
        * Use the <span className="text-primary">+</span> icon to manually credit user accounts
      </p>
    </div>
  );
}