/**
 * Authentication Service
 * Handles all API calls for auth operations
 */

import axios from 'axios';
import env from '../config/env';
import type { AuthUser } from '../types/auth';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUserRaw,
  migrateLegacyTokenStorage,
  setAuthTokens,
  setStoredUser,
} from '../lib/secureStorage';

migrateLegacyTokenStorage();

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'user' | 'mentor' | 'mentee' | 'admin';
  inviteToken?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      email: string;
      name: string;
      role: 'user' | 'mentor' | 'mentee';
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${env.apiUrl}/auth/refresh`, { refreshToken });
        const { data } = response;
        setAuthTokens(data.data.accessToken, data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', userData);
  return response.data;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response.data.data;
}

export async function getProfile(): Promise<unknown> {
  const response = await apiClient.get('/auth/profile');
  return response.data;
}

export async function logout(): Promise<unknown> {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } finally {
    clearAuthData();
  }
}

export function clearAuthData() {
  clearAuthTokens();
}

export function getStoredAccessToken(): string | null {
  return getAccessToken();
}

export function getStoredRefreshToken(): string | null {
  return getRefreshToken();
}

export function storeAuthTokens(accessToken: string, refreshToken: string) {
  setAuthTokens(accessToken, refreshToken);
}

export function storeUserData(user: AuthUser) {
  setStoredUser(user);
}

export function getStoredUserData() {
  const userData = getStoredUserRaw();
  return userData ? JSON.parse(userData) : null;
}

export default apiClient;
