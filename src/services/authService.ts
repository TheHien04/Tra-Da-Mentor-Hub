/**
 * Authentication Service
 * Handles all API calls for auth operations
 */

import apiClient from './api';
import { clearAuthTokens, purgeLegacyAuthStorage } from '../lib/secureStorage';

purgeLegacyAuthStorage();

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
    expiresIn?: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

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
  const response = await apiClient.get('/auth/profile', {
    skipAuthRedirect: true,
  } as never);
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

export default apiClient;
