const MESSAGES = {
  FORBIDDEN: 'You do not have access to this action',
  NOT_FOUND: 'Not found',
  VALIDATION: 'Validation failed',
  CONFLICT: 'This conflicts with an existing record',
  EMAIL_TAKEN: 'Email already exists',
  SLOT_TAKEN: 'This slot is already booked',
  SLOT_CONFLICT: 'This time overlaps another slot',
  SLOT_PAST: 'That time has already passed',
  GROUP_FULL: 'This group has reached its maximum capacity',
  GROUP_ASSIGNMENT_CONFLICT: 'This mentee is already assigned to another group',
  MENTORING_RELATIONSHIP_REQUIRED: 'A valid mentoring assignment or booked slot is required',
  IDEMPOTENCY_KEY_REUSED: 'This idempotency key was already used for a different request',
  IDEMPOTENCY_IN_PROGRESS: 'A request with this idempotency key is already in progress',
  UNAUTHORIZED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid credentials',
  ACCOUNT_INACTIVE: 'Your account is inactive',
  EMAIL_UNVERIFIED: 'Verify your email before signing in',
  DEMO_ACCOUNT: 'The demo account cannot be changed',
  FILE_TOO_LARGE: 'Image must be under 2MB',
  INTERNAL: 'The server could not complete that request',
};

export function fail(res, status, code, message) {
  return res.status(status).json({
    success: false,
    code,
    message: message || MESSAGES[code] || 'Request failed',
  });
}
