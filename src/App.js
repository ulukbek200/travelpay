import React, { Suspense, lazy, useMemo, useState } from 'react';
import { App as AntApp, ConfigProvider, theme as antdTheme } from 'antd';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import { ThemeProvider, useTheme } from './context/ThemeContext';


import HomePage from './pages/HomePage';
import { readCurrentUser, subscribeToCurrentUser } from './utils/currentUser';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const AccountSavingsPage = lazy(() => import('./pages/AccountSavingsPage'));
const ActualToursAdmin = lazy(() => import('./pages/ActualToursAdmin'));
const ActualToursPage = lazy(() => import('./pages/ActualToursPage'));
const AdminFinancePage = lazy(() => import('./pages/AdminFinancePage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AgreementsPage = lazy(() => import('./pages/AgreementsPage'));
const BusinessLandingPage = lazy(() => import('./pages/BusinessLandingPage'));
const BusinessLoginPage = lazy(() => import('./pages/BusinessLoginPage'));
const BusinessManagersPage = lazy(() => import('./pages/BusinessManagersPage'));
const BusinessPaymentSettingsPage = lazy(() => import('./pages/BusinessPaymentSettingsPage'));
const BusinessPaymentsPage = lazy(() => import('./pages/BusinessPaymentsPage'));
const BusinessRegisterPage = lazy(() => import('./pages/BusinessRegisterPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SavingsPlanPage = lazy(() => import('./pages/SavingsPlanPage'));
const StaffPortalPage = lazy(() => import('./pages/StaffPortalPage'));
const StayDetailPage = lazy(() => import('./pages/StayDetailPage'));
const StaysPage = lazy(() => import('./pages/StaysPage'));
const TourBookingPage = lazy(() => import('./pages/TourBookingPage'));
const TourDetailPage = lazy(() => import('./pages/TourDetailPage'));
const TravelBotWidget = lazy(() => import('./components/TravelBotWidget'));
const VisaPaymentPage = lazy(() => import('./pages/VisaPaymentPage'));

const HIDE_LAYOUT_PATHS = new Set([
  '/login',
  '/staff',
  '/admin/login',
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
  '/admin/finance',
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
  '/business/payment-settings',
  '/business/managers',
  '/business/payments',
  '/account/savings',
  '/VisaPaymentPage',
]);

const BUSINESS_ADMIN_PATHS = [
  '/business/dashboard',
  '/business/tours',
  '/business/accommodations',
  '/business/bookings',
  '/business/clients',
  '/business/reports',
];

function RouteFallback() {
  return <div className="route-fallback" aria-hidden="true" />;
}

function AppContent({ favorites, setFavorites }) {
  const location = useLocation();

  const hideLayout = HIDE_LAYOUT_PATHS.has(location.pathname);

  return (
    <>
      {/* HEADER */}
      {!hideLayout && <Header />}

      {/* ROUTES */}
      <div className={hideLayout ? undefined : 'public-layout-shell'}>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/staff" element={<StaffPortalPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/business" element={<BusinessLandingPage />} />
        <Route path="/travelpay-business" element={<BusinessLandingPage />} />
        <Route path="/business/register" element={<BusinessRegisterPage />} />
        <Route path="/business/login" element={<BusinessLoginPage />} />

        <Route
          path="/tours"
          element={
            <ProtectedRoute>
              <ActualToursPage
                favorites={favorites}
                setFavorites={setFavorites}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tours/:id"
          element={(
            <ProtectedRoute>
              <TourDetailPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/stays"
          element={(
            <ProtectedRoute>
              <StaysPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/stays/:id"
          element={(
            <ProtectedRoute>
              <StayDetailPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage
                favorites={favorites}
                setFavorites={setFavorites}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking"
          element={(
            <ProtectedRoute>
              <TourBookingPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/tour-booking"
          element={(
            <ProtectedRoute>
              <TourBookingPage />
            </ProtectedRoute>
          )}
        />

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

        {BUSINESS_ADMIN_PATHS.map((path) => (
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

        <Route
          path="/AgreePage"
          element={(
            <ProtectedRoute>
              <AgreementsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/VisaPaymentPage"
          element={(
            <ProtectedRoute>
              <VisaPaymentPage />
            </ProtectedRoute>
          )}
        />
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
          path="/account/savings"
          element={(
            <ProtectedRoute>
              <AccountSavingsPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/business/payment-settings"
          element={(
            <ProtectedRoute requireBusiness>
              <BusinessPaymentSettingsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/business/managers"
          element={(
            <ProtectedRoute requireBusiness>
              <BusinessManagersPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/business/payments"
          element={(
            <ProtectedRoute requireBusiness>
              <BusinessPaymentsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/finance"
          element={(
            <ProtectedRoute requireTravelPayAdmin>
              <AdminFinancePage />
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
        </Suspense>
      </div>

      {/* 🔥 AI CHAT WIDGET (ГЛОБАЛЬНО НА ВСЁМ САЙТЕ) */}
      {location.pathname === '/' && (
        <Suspense fallback={null}>
          <TravelBotWidget />
        </Suspense>
      )}
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
  const configTheme = useMemo(() => (theme === 'dark'
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
    : undefined), [theme]);

  return (
    <ConfigProvider
      theme={configTheme}
    >
      <AntApp>
        <Router>
          <ScrollToTop />
          <AppContent favorites={favorites} setFavorites={setFavorites} />
        </Router>
      </AntApp>
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
