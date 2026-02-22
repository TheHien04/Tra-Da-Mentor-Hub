/**
 * Authentication Service
 * Handles all API calls for auth operations
 */

import axios from 'axios';
import env from '../config/env';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'user' | 'mentor' | 'mentee';
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

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${env.apiUrl}/auth/refresh`,
          { refreshToken }
        );

        const { data } = response;
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Login API call
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    console.log('🔐 Login attempt:', { email: credentials.email, apiUrl: env.apiUrl });
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    console.log('✅ Login success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      if (error.response?.data) {
        throw error.response.data;
      }
    }
    throw error;
  }
}

/**
 * Register API call
 */
export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

/**
 * Get current user profile
 */
export async function getProfile() {
  try {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

/**
 * Logout API call
 */
export async function logout(): Promise<any> {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    // Even if logout fails on server, we still clear local tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
}

/**
 * Clear all auth data from localStorage
 */
export function clearAuthData() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Get stored access token
 */
export function getStoredAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Get stored refresh token
 */
export function getStoredRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

/**
 * Store auth tokens
 */
export function storeAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Store user data
 */
export function storeUserData(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Get stored user data
 */
export function getStoredUserData() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

export default apiClient;
