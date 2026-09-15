import axios from 'axios';
import { getAuthToken, clearSession } from '../utils/session';

// Base_URL from process.env with fallback
const RAW_BASE_URL = (typeof process !== 'undefined' && process.env?.Base_URL)
  ? process.env.Base_URL
  : 'https://dev.matadortrust.com/v2';

// Ensure baseURL ends with a trailing slash so relative paths like 'surveys/...' preserve the '/v2' prefix
export const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '') + '/';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: inject Bearer token from session storage
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Prevent accidental caching of sensitive survey endpoints in browsers
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle auth expiration and sanitize error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401 || status === 403) {
        console.warn('Session expired or unauthorized request. Clearing session.');
        // Clear stored session tokens on auth failure
        clearSession();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
