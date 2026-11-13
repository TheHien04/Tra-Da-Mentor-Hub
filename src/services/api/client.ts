import axios from 'axios';
import env from '../../config/env';
import { clearAuthTokens, readCsrfToken } from '../../lib/secureStorage';
import { handleError } from '../../utils/errorHandler';

const api = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const method = (config.method || 'get').toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const csrf = readCsrfToken();
      if (csrf) config.headers['X-CSRF-Token'] = csrf;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  const csrf = readCsrfToken();
  const response = await axios.post(
    `${env.apiUrl}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: csrf ? { 'X-CSRF-Token': csrf } : {},
    }
  );
  if (!response.data?.success) throw new Error('Refresh failed');
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const url = String(original?.url || '');
    const isCredentialCall = /\/auth\/(login|refresh|register)/.test(url);
    if (error.response?.status === 401 && original && !original._retry && !isCredentialCall) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshSession().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        return api(original);
      } catch (refreshError) {
        clearAuthTokens();
        const skipRedirect = Boolean((original as { skipAuthRedirect?: boolean }).skipAuthRedirect);
        if (!skipRedirect && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login');
        }
        return Promise.reject(refreshError);
      }
    }
    handleError(error, false);
    return Promise.reject(error);
  }
);

export default api;
