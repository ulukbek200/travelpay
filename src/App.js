import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Header from './components/Header';
import TravelBot from './components/TravelBot';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import { ThemeProvider } from './context/ThemeContext';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ActualToursPage from './pages/ActualToursPage';
import ActualToursAdmin from './pages/ActualToursAdmin';
import TourBookingPage from './pages/TourBookingPage';
import AgreementsPage from './pages/AgreementsPage';
import VisaPaymentPage from './pages/VisaPaymentPage';
import FavoritesPage from './pages/FavoritesPage';
import SavingsPlanPage from './pages/SavingsPlanPage';

function AppContent({ favorites, setFavorites }) {
  const location = useLocation();

  const hideLayoutPaths = [
    '/login',
    '/register',
    '/tours',
    '/booking',
    '/admin',
    '/admin/tours',
    '/admin/users',
    '/admin/stats',
    '/VisaPaymentPage',
    '/favorites',
    '/savings-plan'
  ];

  const hideLayout = hideLayoutPaths.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Header />}
      {!hideLayout && <TravelBot />}

      {location.pathname === '/tours' && (
        <div
          onClick={() => (window.location.href = '/')}
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            cursor: 'pointer',
            zIndex: 1000,
            userSelect: 'none',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          TravelPay
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/tours"
          element={
            <ActualToursPage
              favorites={favorites}
              setFavorites={setFavorites}
            />
          }
        />

        <Route
          path="/favorites"
          element={
            <FavoritesPage
              favorites={favorites}
              setFavorites={setFavorites}
            />
          }
        />

        <Route path="/booking" element={<TourBookingPage />} />

        <Route path="/admin" element={<ActualToursAdmin />} />
        <Route path="/admin/tours" element={<ActualToursAdmin />} />
        <Route path="/admin/users" element={<ActualToursAdmin />} />
        <Route path="/admin/stats" element={<ActualToursAdmin />} />

        <Route path="/AgreePage" element={<AgreementsPage />} />
        <Route path="/VisaPaymentPage" element={<VisaPaymentPage />} />
        <Route path="/savings-plan" element={<SavingsPlanPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <>
                <ProfilePage />
                <AgreementsPage />
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  });

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <AppContent favorites={favorites} setFavorites={setFavorites} />
      </Router>
    </ThemeProvider>
  );
}

export default App;