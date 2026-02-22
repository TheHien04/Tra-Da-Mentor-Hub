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
} from '../services/authService';
import type { LoginRequest, RegisterRequest } from '../services/authService';

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
      console.log('🚀 AuthContext: Calling login API...');
      const response = await loginApi(credentials);
      console.log('✅ AuthContext: Login API response:', response);

      const { user, accessToken, refreshToken } = response.data;

      // Store tokens and user data
      storeAuthTokens(accessToken, refreshToken);
      storeUserData(user);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, accessToken, refreshToken },
      });
      console.log('✅ AuthContext: Login successful, user stored');
    } catch (error: any) {
      console.error('❌ AuthContext: Login error:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Register handler
  const register = useCallback(async (userData: RegisterRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await registerApi(userData);

      const { user, accessToken, refreshToken } = response.data;

      // Store tokens and user data
      storeAuthTokens(accessToken, refreshToken);
      storeUserData(user);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user, accessToken, refreshToken },
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
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

  // Restore session from localStorage on app load
  const restoreSession = useCallback(async () => {
    const accessToken = getStoredAccessToken();
    const userData = getStoredUserData();

    if (accessToken && userData) {
      try {
        // Optionally verify token is still valid by fetching profile
        // const profile = await getProfile();
        // This would require the token to still be valid

        dispatch({
          type: 'RESTORE_SESSION',
          payload: {
            user: userData,
            accessToken,
          },
        });
      } catch (error) {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
