// src/types/index.ts
/**
 * Central type definitions
 * Import from here: import { Mentor, Mentee } from '@/types'
 */

// Models
export type {
  Track,
  MentorshipType,
  Duration,
  BaseEntity,
  User,
  Mentor,
  Mentee,
  Group,
  MeetingSchedule,
  Activity,
  ActivityType,
  DashboardStats,
  TrendingSkill,
} from "./models";

// Auth
export type {
  JWTPayload,
  UserRole,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthUser,
  AuthContextType,
} from "./auth";

// API
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  ErrorType,
  ValidationError,
  ValidationErrorResponse,
  QueryParams,
} from "./api";
