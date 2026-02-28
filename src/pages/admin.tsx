import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import AdminStats from './components/admin/AdminStats';
import DashboardTab from './components/admin/DashboardTab';
import MoviesTab from './components/admin/MoviesTab';
import SchedulesTab from './components/admin/SchedulesTab';
import BookingsTab from './components/admin/BookingsTab';
import { useUserStore } from '@/stores/user.store';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DepositsTab from './components/admin/DepositsTab';
import { CloudCog } from 'lucide-react';

export default function AdminPage() {
  const currentUser = useUserStore((state) => state.currentUser);
  const loading = useUserStore((state) => state.loading);
  const navigate = useNavigate()
  useEffect(() => {
    console.log(loading);
    
    if (loading || !currentUser) return;
    console.log(currentUser);
    
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/booking');
    }
  }, [loading, currentUser, navigate]);
  return (
    <div className='space-y-8 animate-in fade-in duration-500'>
      {/* <AdminStats /> */}

      <Tabs defaultValue='dashboard' className='w-full'>
        <TabsList className='bg-white/5 border border-white/10 mb-6'>
          <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
          <TabsTrigger value='movies'>Movies</TabsTrigger>
          <TabsTrigger value='schedules'>Schedules</TabsTrigger>
          <TabsTrigger value='bookings'>Bookings</TabsTrigger>
          <TabsTrigger value='deposits'>Deposits</TabsTrigger>
        </TabsList>

        {/* <TabsContent value='dashboard'>
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
        </TabsContent> */}

        <TabsContent value='deposits'>
          <DepositsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
