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
import AdminDashboard from './pages/AdminDashboard'; // ✅ Добавлен импорт
import TravelBot from './components/TravelBot';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Header />}
      {!isAdminPage && <TravelBot />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tours" element={<ActualToursPage />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* ✅ Панель администратора */}
        <Route path="/admin/tours" element={<ActualToursAdmin />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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
