import bcrypt from 'bcryptjs';

/** Dev-only demo admin. The password is stored as a bcrypt hash, not plaintext. */
const DEMO_PASSWORD_HASH = '$2b$10$zbhqyJ2QfCcAA/1DjUo3w.W7Rb8HQnTXg2dINilohRkQUme1f/SX2';

export const DEMO_USER = {
  _id: 'mock-user-id-12345',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
  isActive: true,
  toJSON() {
    return {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
    };
  },
  async comparePassword(password) {
    return bcrypt.compare(String(password || ''), DEMO_PASSWORD_HASH);
  },
};

export function isDemoAuthEnabled() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production') {
    return process.env.ENABLE_DEMO_AUTH === 'true';
  }
  return process.env.ENABLE_DEMO_AUTH !== 'false';
}

export function isDemoUserId(userId) {
  return userId === DEMO_USER._id || userId === String(DEMO_USER._id);
}
