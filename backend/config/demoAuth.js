export const DEMO_USER = {
  _id: 'mock-user-id-12345',
  email: 'admin@example.com',
  password: 'AdminPass123',
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
    return password === this.password;
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
