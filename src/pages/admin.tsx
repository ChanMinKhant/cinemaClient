import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import AdminStats from './components/admin/AdminStats';
import DashboardTab from './components/admin/DashboardTab';
import MoviesTab from './components/admin/MoviesTab';
import SchedulesTab from './components/admin/SchedulesTab';
import BookingsTab from './components/admin/BookingsTab';
import { useUserStore } from '@/stores/user.store';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DepositsTab from './components/admin/DepositsTab';
import { ChevronLeft, CloudCog } from 'lucide-react';
import UsersTab from './components/admin/UsersTab';

export default function AdminPage() {
  const currentUser = useUserStore((state) => state.currentUser);
  const loading = useUserStore((state) => state.loading);
  const navigate = useNavigate()
  useEffect(() => {
    console.log(loading);
    
    if (loading) return;
    console.log(currentUser);
    
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/booking');
    }
  }, [loading, currentUser, navigate]);
  return (
    <div className='space-y-8 animate-in fade-in duration-500'>
      {/* <AdminStats /> */}
            {/* --- NEW BACK BUTTON SECTION --- */}
      <div className="flex items-center mt-5 justify-between">
        <Link
          to="/booking" 
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors group"
        >
          <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
            <ChevronLeft size={16} />
          </div>
          Back to Bookings
        </Link>
      </div>
      <Tabs defaultValue='dashboard' className='w-full'>
        <TabsList className='bg-white/5 border border-white/10 mb-6'>
          <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
          <TabsTrigger value='movies'>Movies</TabsTrigger>
          <TabsTrigger value='schedules'>Schedules</TabsTrigger>
          <TabsTrigger value='bookings'>Bookings</TabsTrigger>
          <TabsTrigger value='deposits'>Deposits</TabsTrigger>
          <TabsTrigger value='users'>Users</TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard'>
          <DashboardTab />
        </TabsContent>

        <TabsContent value='movies'>
          <MoviesTab />
        </TabsContent>

        <TabsContent value='schedules'>
          <SchedulesTab />
        </TabsContent>

        <TabsContent value='bookings'>
          <BookingsTab />
        </TabsContent>

        <TabsContent value='deposits'>
          <DepositsTab />
        </TabsContent>

        <TabsContent value='users'>
          <UsersTab /> 
        </TabsContent>
      </Tabs>
    </div>
  );
}
