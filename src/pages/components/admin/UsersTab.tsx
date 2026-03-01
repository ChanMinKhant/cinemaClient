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
  Plus,
  ShieldAlert,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';

// Using a basic Dialog approach for "Add User"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add User Form State
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });

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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', newUser);
      if (res.data.success) {
        toast.success("User created successfully");
        setIsAddModalOpen(false);
        setNewUser({ username: '', email: '', phone: '', password: '' });
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId: number, currentRole: string) => {
    if (currentRole === 'admin') return;
    
    if (!confirm("Are you sure you want to promote this user to ADMIN?")) return;

    setUpdatingId(userId);
    try {
      const res = await api.put(`/users/${userId}`, { role: 'admin' });
      if (res.data.success) {
        toast.success("User promoted to Admin");
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
      }
    } catch (err) {
      toast.error("Failed to promote user");
    } finally {
      setUpdatingId(null);
    }
  };

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
      const res = await api.put(`/users/${userId}`, { balance: newBalance });

      if (res.data.success) {
        toast.success(`Updated ${targetUser.username}'s balance`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: newBalance } : u));
      }
    } catch (err) {
      toast.error("Failed to update balance.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Accessing User Base...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-white tracking-tight">User Management</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage staff & customers</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
            <Input 
              placeholder="Filter users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 h-10 rounded-xl text-sm"
            />
          </div>

          {/* ADD USER DIALOG */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-10 font-black uppercase text-[10px] tracking-widest gap-2">
                <Plus size={16} /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase italic">Register New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input 
                    required 
                    className="bg-white/5 border-white/10" 
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    required 
                    className="bg-white/5 border-white/10" 
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    className="bg-white/5 border-white/10" 
                    value={newUser.phone}
                    onChange={e => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    type="password" 
                    required 
                    className="bg-white/5 border-white/10" 
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full mt-4 font-bold uppercase" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                {/* <th className="px-6 py-5 font-black text-right">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{user.username}</p>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase italic">#{user.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Mail size={12} className="text-slate-600" /> {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone size={12} className="text-slate-600" /> {user.phone || '—'}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                        <Wallet size={12} className="text-primary/60" />
                        <span className="text-sm font-black italic text-primary">
                          {user.balance?.toLocaleString() || 0}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase not-italic">ks</span>
                      </div>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleTopUp(user.id)}
                        disabled={updatingId === user.id}
                        className="h-8 w-8 rounded-full bg-white/5 text-slate-400 hover:bg-primary hover:text-black transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </Button>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${
                      user.role === 'admin' 
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  {/* <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {user.role !== 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[9px] uppercase font-black tracking-tighter hover:bg-purple-500/10 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handlePromote(user.id, user.role)}
                          disabled={updatingId === user.id}
                        >
                          <ShieldAlert size={14} className="mr-1" />
                          Make Admin
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                        onClick={() => toast.info("Delete via database management only")}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}