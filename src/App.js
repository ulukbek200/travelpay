import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import ActualToursPage from './pages/ActualToursPage';
import ActualToursAdmin from './pages/ActualToursAdmin';
import TravelBot from './components/TravelBot';
import { ThemeProvider } from './context/ThemeContext';
import TourBookingPage from './pages/TourBookingPage';
import AgreementsPage from './pages/AgreementsPage';

function AppContent() {
  const location = useLocation();
  const hideLayout = ['/login', '/register', '/tours', '/booking', '/admin/tours'].includes(location.pathname);

  return (
    <>
      {!hideLayout && <Header />}
      {!hideLayout && <TravelBot />}

      {/* Логотип для страницы /tours */}
      {location.pathname === '/tours' && (
        <div
          onClick={() => window.location.href = '/'}
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
        <Route path="/tours" element={<ActualToursPage />} />
        <Route path="/booking" element={<TourBookingPage />} />
        <Route path="/admin/tours" element={<ActualToursAdmin />} />
        <Route path="/AgreePage" element={<AgreementsPage />} />


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
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
