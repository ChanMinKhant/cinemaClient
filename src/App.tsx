import '@/App.css';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import BookingPage from './pages/booking';
import { StoreProvider } from './lib/store';
import AdminPage from './pages/admin';

function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/booking' element={<BookingPage />} />
        <Route path='/admin' element={<AdminPage />} />
      </Routes>
    </StoreProvider>
  );
}

export default App;
