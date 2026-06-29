import React, { useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
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

import { ThemeProvider, useTheme } from './context/ThemeContext';


import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ActualToursPage from './pages/ActualToursPage';
import TourDetailPage from './pages/TourDetailPage';
import StaysPage from './pages/StaysPage';
import StayDetailPage from './pages/StayDetailPage';
import ActualToursAdmin from './pages/ActualToursAdmin';
import BusinessLandingPage from './pages/BusinessLandingPage';
import BusinessLoginPage from './pages/BusinessLoginPage';
import BusinessRegisterPage from './pages/BusinessRegisterPage';
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
    '/admin/home',
    '/admin/tours',
    '/admin/accommodations',
    '/admin/bookings',
    '/admin/users',
    '/admin/clients',
    '/admin/stats',
    '/admin/reports',
    '/admin/topups',
    '/admin/savings',
    '/admin/companies',
    '/admin/settings',
    '/business',
    '/travelpay-business',
    '/business/login',
    '/business/register',
    '/business/dashboard',
    '/business/tours',
    '/business/accommodations',
    '/business/bookings',
    '/business/clients',
    '/business/reports',
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
        <Route path="/business" element={<BusinessLandingPage />} />
        <Route path="/travelpay-business" element={<BusinessLandingPage />} />
        <Route path="/business/register" element={<BusinessRegisterPage />} />
        <Route path="/business/login" element={<BusinessLoginPage />} />

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
        <Route path="/stays" element={<StaysPage />} />
        <Route path="/stays/:id" element={<StayDetailPage />} />

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
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tours"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accommodations"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/topups"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/savings"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requireTravelPayAdmin>
              <ActualToursAdmin />
            </ProtectedRoute>
          }
        />

        {[
          '/business/dashboard',
          '/business/tours',
          '/business/accommodations',
          '/business/bookings',
          '/business/clients',
          '/business/reports',
        ].map((path) => (
          <Route
            key={path}
            path={path}
            element={(
              <ProtectedRoute requireBusiness>
                <ActualToursAdmin businessMode />
              </ProtectedRoute>
            )}
          />
        ))}

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

const travelPayThemeTokens = {
  colorPrimary: '#5b6cff',
  colorInfo: '#5b6cff',
  colorSuccess: '#1fa77a',
  colorWarning: '#f6b44b',
  colorError: '#ef5b68',
  colorBgBase: '#20242a',
  colorBgContainer: 'rgba(255,255,255,0.06)',
  colorBgElevated: '#242932',
  colorText: '#ffffff',
  colorTextSecondary: 'rgba(255,255,255,0.65)',
  colorBorder: 'rgba(255,255,255,0.10)',
  colorBorderSecondary: 'rgba(255,255,255,0.08)',
  borderRadius: 18,
  boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
};

function AppShell({ favorites, setFavorites }) {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      theme={theme === 'dark'
        ? {
            algorithm: antdTheme.darkAlgorithm,
            token: travelPayThemeTokens,
            components: {
              Button: { borderRadius: 18, controlHeight: 42 },
              Card: { borderRadiusLG: 22 },
              Modal: { borderRadiusLG: 22 },
              Drawer: { borderRadiusLG: 22 },
              Table: { headerBg: 'rgba(255,255,255,0.07)', rowHoverBg: 'rgba(91,108,255,0.12)' },
              Segmented: { itemSelectedBg: 'rgba(91,108,255,0.22)' },
            },
          }
        : undefined}
    >
      <Router>
        <ScrollToTop />
        <AppContent favorites={favorites} setFavorites={setFavorites} />
      </Router>
    </ConfigProvider>
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
      <AppShell favorites={favorites} setFavorites={setFavorites} />
    </ThemeProvider>
  );
}

export default App;
