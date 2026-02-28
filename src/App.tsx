import '@/App.css';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import BookingPage from './pages/booking';
import AdminPage from './pages/admin';
import { useEffect } from 'react';
import { useUserStore } from './stores/user.store';
import { Loader2 } from 'lucide-react';
import { toast, ToastContainer, Zoom } from 'react-toastify';
import UserBookingsTab from './pages/UserBookingsTab';
import DepositPage from './pages/DepositPage';

function App() {
  const fetchMe = useUserStore((state) => state.fetchMe);
  const loading = useUserStore((state) => state.loading);
  // Fetch current user on app load
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <Loader2 className='animate-spin' size={48} />
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position='top-center'
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
        transition={Zoom}
      />
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/booking' element={<BookingPage />} />
        <Route path='/user/booking' element={<UserBookingsTab />} />
        <Route path='/user/deposit' element={<DepositPage />} />
        <Route path='/admin' element={<AdminPage />} />
      </Routes>
    </>
  );
}

export default App;
