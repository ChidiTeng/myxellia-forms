import axios from 'axios';
import { getAuthToken, clearSession } from '../utils/session';

// NEXT_PUBLIC_BASE_URL from Vite env / process.env with fallback
const RAW_NEXT_PUBLIC_BASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_URL) ||
  'https://dev.matadortrust.com/v2';

// Ensure baseURL ends with a trailing slash so relative paths like 'surveys/...' preserve the '/v2' prefix
export const NEXT_PUBLIC_BASE_URL = RAW_NEXT_PUBLIC_BASE_URL.replace(/\/+$/, '') + '/';

export const apiClient = axios.create({
  baseURL: NEXT_PUBLIC_BASE_URL,
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
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle auth expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      // Only clear credentials on 401 (expired/invalid JWT).
      // 403 is an authorization issue — the JWT is still structurally valid,
      // the user simply lacks permission for this specific resource.
      if (status === 401) {
        console.warn('JWT expired or invalid. Clearing session — user must re-authenticate via a new magic link.');
        clearSession();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
