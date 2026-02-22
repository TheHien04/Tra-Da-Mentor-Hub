// src/types/api.ts
/**
 * API communication types
 */

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Error response
export interface ApiError {
  statusCode: number;
  type: ErrorType;
  message: string;
  details?: Record<string, any>;
}

export type ErrorType =
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "SERVER_ERROR"
  | "UNKNOWN";

// Validation error details
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationErrorResponse extends ApiError {
  type: "VALIDATION_ERROR";
  details: {
    errors: ValidationError[];
  };
}

// Query parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}
