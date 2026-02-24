import '@/App.css';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import BookingPage from './pages/booking';
import AdminPage from './pages/admin';
import { StoreProvider } from './lib/store';
import { useEffect } from 'react';
import { useUserStore } from './stores/user.store';

function App() {
  const fetchMe = useUserStore((state) => state.fetchMe);

  // Fetch current user on app load
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <StoreProvider>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/booking' element={<BookingPage />} />
        <Route path='/admin' element={<AdminPage />} />
      </Routes>
    </StoreProvider>
  );
}

export default App;
