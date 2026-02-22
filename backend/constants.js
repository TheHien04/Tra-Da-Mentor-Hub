// backend/constants.js
/**
 * Application constants
 */

export const TRACKS = [
  "tech",
  "design",
  "business",
  "sales",
  "marketing",
  "hr",
  "education",
  "startup",
  "social",
  "economics",
];

export const USER_ROLES = ["user", "mentor", "mentee", "admin"];

export const MENTORSHIP_TYPES = ["GROUP", "ONE_ON_ONE"];

export const DURATION_TYPES = ["SHORT_TERM", "LONG_TERM", "MEDIUM_TERM"];

export const MEETING_FREQUENCIES = ["Weekly", "Bi-weekly", "Monthly"];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_TYPES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
};
