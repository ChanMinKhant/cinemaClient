import '@/App.css';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import BookingPage from './pages/booking';
import AdminPage from './pages/admin';
import { useEffect } from 'react';
import { useUserStore } from './stores/user.store';
import { Loader2 } from 'lucide-react';
import { ToastContainer, Zoom } from 'react-toastify';
import UserBookingsTab from './pages/UserBookingsTab';
import DepositPage from './pages/DepositPage';
import DepositHistoryPage from './pages/DepositHistoryPage';
import NotFoundPage from './pages/NotFoundPage';

// import { lazy } from 'react';
// const LoginPage = lazy(() => import('./pages/login'));
// const BookingPage = lazy(() => import('./pages/booking'));
// const AdminPage = lazy(() => import('./pages/admin'));
// const UserBookingsTab =  lazy(() => import( './pages/UserBookingsTab'));
// const DepositPage = lazy(() => import('./pages/DepositPage'));
// const DepositHistoryPage = lazy(() => import('./pages/DepositHistoryPage'));

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
        style={{ zIndex: 9999 }}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
        transition={Zoom}
      />
      <Routes>
        {/* basename="/cinema" */}
        <Route path='/' element={<LoginPage />} />
        <Route path='/booking' element={<BookingPage />} />
        <Route path='/user/booking' element={<UserBookingsTab />} />
        <Route path='/user/deposit' element={<DepositPage />} />
        <Route path='/user/deposit/history' element={<DepositHistoryPage />} />
        <Route path='/admin' element={<AdminPage />} />
         {/* 🔥 GLOBAL 40 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
