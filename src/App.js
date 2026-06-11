import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import TravelBotWidget from "./components/TravelBotWidget";

import { ThemeProvider } from './context/ThemeContext';


import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ActualToursPage from './pages/ActualToursPage';
import TourDetailPage from './pages/TourDetailPage';
import ActualToursAdmin from './pages/ActualToursAdmin';
import TourBookingPage from './pages/TourBookingPage';
import AgreementsPage from './pages/AgreementsPage';
import VisaPaymentPage from './pages/VisaPaymentPage';
import FavoritesPage from './pages/FavoritesPage';
import SavingsPlanPage from './pages/SavingsPlanPage';
import { readCurrentUser, subscribeToCurrentUser } from './utils/currentUser';

function AppContent({ favorites, setFavorites }) {
  const location = useLocation();

  const hideLayoutPaths = [
    '/login',
    '/register',
    '/booking',
    '/profile',
    '/savings',
    '/savings-plan',
    '/admin',
    '/admin/tours',
    '/admin/users',
    '/admin/stats',
    '/admin/topups',
    '/VisaPaymentPage',
  ];

  const hideLayout = hideLayoutPaths.includes(location.pathname);

  return (
    <>
      {/* HEADER */}
      {!hideLayout && <Header />}

      {/* ROUTES */}
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

        <Route path="/tours/:id" element={<TourDetailPage />} />

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
        <Route path="/tour-booking" element={<TourBookingPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tours"
          element={
            <ProtectedRoute requireAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <ProtectedRoute requireAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/topups"
          element={
            <ProtectedRoute requireAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />

        <Route path="/AgreePage" element={<AgreementsPage />} />
        <Route path="/VisaPaymentPage" element={<VisaPaymentPage />} />
        <Route
          path="/savings"
          element={(
            <ProtectedRoute>
              <SavingsPlanPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/savings-plan"
          element={(
            <ProtectedRoute>
              <SavingsPlanPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* 🔥 AI CHAT WIDGET (ГЛОБАЛЬНО НА ВСЁМ САЙТЕ) */}
      {location.pathname === '/' && <TravelBotWidget />}
    </>
  );
}

function App() {
  const [favorites, setFavorites] = useState(() => {
    return readCurrentUser()?.favorites || [];
  });

  React.useEffect(() => subscribeToCurrentUser((user) => {
    setFavorites(user?.favorites || []);
  }), []);

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
