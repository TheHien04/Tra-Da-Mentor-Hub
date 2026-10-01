const MESSAGES = {
  FORBIDDEN: 'You do not have access to this action',
  NOT_FOUND: 'Not found',
  VALIDATION: 'Validation failed',
  CONFLICT: 'This conflicts with an existing record',
  EMAIL_TAKEN: 'Email already exists',
  SLOT_TAKEN: 'This slot is already booked',
  SLOT_CONFLICT: 'This time overlaps another slot',
  UNAUTHORIZED: 'Authentication required',
};

export function fail(res, status, code, message) {
  return res.status(status).json({
    success: false,
    code,
    message: message || MESSAGES[code] || 'Request failed',
  });
}
