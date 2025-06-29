import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import ActualToursPage from './pages/ActualToursPage'; // страница для пользователей
import ActualToursAdmin from './pages/ActualToursAdmin'; // страница для админа
import TravelBot from './components/TravelBot';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider> {/* 👈 Оборачиваем всё в ThemeProvider */}
      <Router>
        <Header />
        <TravelBot />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tours" element={<ActualToursPage />} />
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
      </Router>
    </ThemeProvider>
  );
}

export default App;
