import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { assertProductionSecrets, isWeakSecret } from '../lib/secretValidation.js';
import { createOAuthState, verifyOAuthState } from '../lib/oauthState.js';
import { registerSchema } from '../schemas/auth.schema.js';
import { hashRefreshToken } from '../models/User.js';
import { broadcastSchema } from '../schemas/admin.schema.js';

describe('Security utilities', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('detects weak secrets', () => {
    expect(isWeakSecret(null)).toBe(true);
    expect(isWeakSecret('short')).toBe(true);
    expect(isWeakSecret('CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_AT_LEAST_64_CHARS_LONG')).toBe(true);
    const strong = 'a'.repeat(64);
    expect(isWeakSecret(strong)).toBe(false);
  });

  it('accepts distinct strong production secrets and ignores non-production', () => {
    expect(() => assertProductionSecrets({ isProduction: false })).not.toThrow();
    process.env.JWT_SECRET = `A1${'x'.repeat(62)}`;
    process.env.JWT_REFRESH_SECRET = `B2${'y'.repeat(62)}`;
    process.env.ENABLE_DEMO_AUTH = 'false';
    expect(() => assertProductionSecrets({ isProduction: true })).not.toThrow();
  });

  it.each([
    ['weak JWT secret', { JWT_SECRET: 'short', JWT_REFRESH_SECRET: `B2${'y'.repeat(62)}`, ENABLE_DEMO_AUTH: 'false' }],
    ['reused secrets', { JWT_SECRET: `A1${'x'.repeat(62)}`, JWT_REFRESH_SECRET: `A1${'x'.repeat(62)}`, ENABLE_DEMO_AUTH: 'false' }],
    ['demo auth', { JWT_SECRET: `A1${'x'.repeat(62)}`, JWT_REFRESH_SECRET: `B2${'y'.repeat(62)}`, ENABLE_DEMO_AUTH: 'true' }],
  ])('fails closed for %s', (_label, values) => {
    Object.assign(process.env, values);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`exit:${code}`);
    });
    expect(() => assertProductionSecrets({ isProduction: true })).toThrow('exit:1');
  });

  it('OAuth state is single-use', () => {
    const state = createOAuthState();
    expect(verifyOAuthState(state)).toBe(true);
    expect(verifyOAuthState(state)).toBe(false);
  });

  it('does not persist refresh tokens in plaintext', () => {
    const token = 'refresh-token-value';
    const digest = hashRefreshToken(token);
    expect(digest).not.toBe(token);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(hashRefreshToken(token)).toBe(digest);
  });

  it('requires an invite before granting a privileged registration role', () => {
    const base = {
      email: 'new@example.com',
      password: 'StrongPass123',
      confirmPassword: 'StrongPass123',
      name: 'New Member',
    };
    expect(registerSchema.safeParse({ ...base, role: 'mentee' }).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, role: 'mentor' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, role: 'admin' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, role: 'mentor', inviteToken: 'invite-token' }).success).toBe(true);
  });

  it('bounds administrative broadcast input', () => {
    expect(broadcastSchema.safeParse({ audience: 'mentors', message: 'Hello', channel: 'email' }).success).toBe(true);
    expect(broadcastSchema.safeParse({ audience: 'everyone', message: 'Hello' }).success).toBe(false);
    expect(broadcastSchema.safeParse({ message: 'x'.repeat(5001) }).success).toBe(false);
  });

});
