// src/types/auth.ts
/**
 * Authentication and authorization types
 */

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export type UserRole = "admin" | "mentor" | "mentee" | "user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: UserRole;
  inviteToken?: string;
}

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  /** Linked mentor profile id (from /auth/profile) */
  mentorId?: string;
  /** Linked mentee profile id (from /auth/profile) */
  menteeId?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Methods
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
