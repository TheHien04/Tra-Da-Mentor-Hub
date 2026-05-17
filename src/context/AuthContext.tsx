/**
 * Auth Context
 * Global authentication state management
 */

import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import type { AuthUser } from '../types/auth';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  storeAuthTokens,
  storeUserData,
  clearAuthData,
  getStoredAccessToken,
  getStoredUserData,
  getProfile,
} from '../services/authService';
import type { LoginRequest, RegisterRequest } from '../services/authService';
import { normalizeAuthUser } from '../lib/authUser';

// ============ TYPES ============

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; accessToken: string; refreshToken: string } }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: AuthUser; accessToken: string; refreshToken: string } }
  | { type: 'RESTORE_SESSION'; payload: { user: AuthUser; accessToken: string } }
  | { type: 'UPDATE_USER'; payload: AuthUser };

export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  restoreSession: () => Promise<void>;
  completeOAuthLogin: (payload: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
}

// ============ CONTEXT ============

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============ CUSTOM HOOK ============

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============ REDUCER ============

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGOUT_SUCCESS':
      return {
        ...initialState,
      };

    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

// ============ PROVIDER ============

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login handler
  const login = useCallback(async (credentials: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await loginApi(credentials);

      const { user: rawUser, accessToken, refreshToken } = response.data;
      const user = normalizeAuthUser(rawUser as Record<string, unknown>);

      storeAuthTokens(accessToken, refreshToken);
      storeUserData(user);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, accessToken, refreshToken },
      });
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      const errorMessage = err.message || err.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Register handler
  const register = useCallback(async (userData: RegisterRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await registerApi(userData);

      const { user: rawUser, accessToken, refreshToken } = response.data;
      const user = normalizeAuthUser(rawUser as Record<string, unknown>);

      storeAuthTokens(accessToken, refreshToken);
      storeUserData(user);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user, accessToken, refreshToken },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await logoutApi();
    } catch (error) {
      // Even if API call fails, still logout locally
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear all auth data
      clearAuthData();
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const completeOAuthLogin = useCallback(
    (payload: { user: AuthUser; accessToken: string; refreshToken: string }) => {
      storeAuthTokens(payload.accessToken, payload.refreshToken);
      storeUserData(payload.user);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: payload.user,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        },
      });
    },
    []
  );

  const restoreSession = useCallback(async () => {
    const accessToken = getStoredAccessToken();
    const userData = getStoredUserData();

    if (accessToken && userData) {
      try {
        let user = normalizeAuthUser(userData as Record<string, unknown>);
        try {
          const profileRes = await getProfile();
          const profile =
            (profileRes as { data?: { data?: Record<string, unknown> } })?.data?.data ??
            (profileRes as { data?: Record<string, unknown> })?.data ??
            profileRes;
          if (profile && typeof profile === 'object') {
            user = normalizeAuthUser({ ...user, ...profile } as Record<string, unknown>);
            storeUserData(user);
          }
        } catch {
          // use stored user if profile fetch fails
        }

        dispatch({
          type: 'RESTORE_SESSION',
          payload: {
            user,
            accessToken,
          },
        });
      } catch {
        // Token might be expired, clear auth data
        clearAuthData();
        dispatch({ type: 'LOGOUT_SUCCESS' });
      }
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    restoreSession,
    completeOAuthLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
