import axios from 'axios';
import { clearCurrentUser, persistAuthRedirectError, readAuthToken, readCurrentUser, readStoredRole } from './utils/currentUser';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:10000'
    : 'https://travelpay-backend.vercel.app');
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = readAuthToken();
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const shouldResetSession = (error) => {
  const status = error?.response?.status;
  const requestUrl = String(error?.config?.url || '');

  if (status !== 401 && status !== 403) {
    return false;
  }

  return [
    '/companies/',
    '/users/',
    '/api/admin/',
    '/api/topup/my-requests',
    '/wallet/',
    '/payment-requests',
    '/business/payment-settings',
    '/business/managers',
    '/admin/finance',
    '/tour-bookings',
    '/stay-bookings',
  ].some((prefix) => requestUrl.startsWith(prefix));
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentUser = readCurrentUser();
    const currentRole = String(readStoredRole() || currentUser?.role || '').toLowerCase();

    if (currentUser?.isLoggedIn && shouldResetSession(error)) {
      if (error?.response?.status === 403 && String(error?.config?.url || '').startsWith('/companies/')) {
        persistAuthRedirectError('У вас нет доступа к этой компании');
      }
      clearCurrentUser();

      const nextLoginPath = ['business', 'company_admin', 'company_manager'].includes(currentRole)
        ? '/business/login'
        : '/login';

      if (typeof window !== 'undefined' && window.location.pathname !== nextLoginPath) {
        window.location.replace(nextLoginPath);
      }
    }

    return Promise.reject(error);
  },
);

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export default api;
