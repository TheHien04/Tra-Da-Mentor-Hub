import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User, { hashRefreshToken } from '../models/User.js';
import { useDb } from '../lib/dataMode.js';

const memory = new Map();

class MemoryUser {
  constructor(data) {
    this._id = data._id || `usr_${crypto.randomUUID()}`;
    this.email = String(data.email || '').trim().toLowerCase();
    this.name = data.name;
    this.role = data.role || 'mentee';
    this.avatar = data.avatar || null;
    this.isActive = data.isActive !== false;
    this.emailVerified = Boolean(data.emailVerified);
    this.emailVerificationToken = data.emailVerificationToken || null;
    this.emailVerificationExpires = data.emailVerificationExpires || null;
    this.resetPasswordToken = data.resetPasswordToken || null;
    this.resetPasswordExpires = data.resetPasswordExpires || null;
    this.googleId = data.googleId || null;
    this.googleCalendarTokens = data.googleCalendarTokens || null;
    this.subscription = data.subscription || { plan: 'free', status: 'active' };
    this.lastLogin = data.lastLogin || null;
    this.refreshTokens = data.refreshTokens || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.passwordHash = data.passwordHash || null;
    this.pendingPassword = data.password || null;
  }

  get password() {
    return this.passwordHash;
  }

  set password(value) {
    this.pendingPassword = value;
  }

  async save() {
    if (this.pendingPassword) {
      this.passwordHash = await bcrypt.hash(this.pendingPassword, 10);
      this.pendingPassword = null;
    }
    this.updatedAt = new Date();
    memory.set(String(this._id), this);
    return this;
  }

  async comparePassword(candidate) {
    return Boolean(this.passwordHash) && bcrypt.compare(candidate, this.passwordHash);
  }

  async updateLastLogin() {
    this.lastLogin = new Date();
    await this.save();
  }

  async addRefreshToken(token) {
    this.refreshTokens.push({ tokenHash: hashRefreshToken(token), createdAt: new Date() });
    this.refreshTokens = this.refreshTokens.slice(-5);
    await this.save();
  }

  async removeRefreshToken(token) {
    const tokenHash = hashRefreshToken(token);
    this.refreshTokens = this.refreshTokens.filter((row) => row.tokenHash !== tokenHash);
    await this.save();
  }

  generateEmailVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = token;
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return token;
  }

  generatePasswordResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = token;
    this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    return token;
  }

  toJSON() {
    return {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
      avatar: this.avatar,
      isActive: this.isActive,
      emailVerified: this.emailVerified,
      subscription: this.subscription,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export async function createUser(data) {
  if (useDb()) return User.create(data);
  const existing = await findUserByEmail(data.email);
  if (existing) {
    const error = new Error('Email already registered');
    error.code = 11000;
    throw error;
  }
  const user = new MemoryUser(data);
  await user.save();
  return user;
}

export async function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (useDb()) return User.findOne({ email: normalized });
  return [...memory.values()].find((user) => user.email === normalized) || null;
}

export async function findUserByEmailWithPassword(email) {
  if (useDb()) return User.findByEmailWithPassword(email);
  return findUserByEmail(email);
}

export async function findUserById(id) {
  if (useDb()) return User.findById(id);
  return memory.get(String(id)) || null;
}

export async function findUserByTimedToken(field, token) {
  const expiresField = field === 'emailVerificationToken'
    ? 'emailVerificationExpires'
    : 'resetPasswordExpires';
  if (useDb()) {
    return User.findOne({ [field]: token, [expiresField]: { $gt: Date.now() } });
  }
  return [...memory.values()].find(
    (user) => user[field] === token && new Date(user[expiresField]).getTime() > Date.now()
  ) || null;
}

export async function rotateUserRefreshToken(userId, currentToken, nextToken) {
  if (useDb()) {
    return User.findOneAndUpdate(
      { _id: userId, 'refreshTokens.tokenHash': hashRefreshToken(currentToken) },
      {
        $set: {
          'refreshTokens.$.tokenHash': hashRefreshToken(nextToken),
          'refreshTokens.$.createdAt': new Date(),
        },
      },
      { new: true }
    );
  }
  const user = await findUserById(userId);
  if (!user) return null;
  const currentHash = hashRefreshToken(currentToken);
  const row = user.refreshTokens.find((item) => item.tokenHash === currentHash);
  if (!row) return null;
  row.tokenHash = hashRefreshToken(nextToken);
  row.createdAt = new Date();
  await user.save();
  return user;
}

export async function deleteUserById(id) {
  if (useDb()) return User.deleteOne({ _id: id });
  return { deletedCount: memory.delete(String(id)) ? 1 : 0 };
}

export function clearMemoryUsersForTests() {
  if (process.env.NODE_ENV !== 'test') return;
  memory.clear();
}

