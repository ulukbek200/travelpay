import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'https://travelpay-backend.vercel.app';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export default api;
