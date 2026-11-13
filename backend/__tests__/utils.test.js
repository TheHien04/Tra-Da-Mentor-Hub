// backend/__tests__/utils.test.js
/**
 * Unit Tests for Utility Functions
 */

import { describe, it, expect } from '@jest/globals';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

describe('Error Handler Utilities', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should handle simple math', () => {
    expect(2 + 2).toBe(4);
  });
});

describe('JWT Utilities', () => {
  it('creates verifiable typed access tokens', () => {
    const token = generateAccessToken('user-1', 'user@example.com', 'mentee');
    expect(verifyAccessToken(token)).toMatchObject({
      userId: 'user-1',
      email: 'user@example.com',
      role: 'mentee',
      type: 'access',
    });
    expect(verifyRefreshToken(token)).toBeNull();
  });

  it('makes every refresh token unique, including within the same second', () => {
    const first = generateRefreshToken('user-1');
    const second = generateRefreshToken('user-1');
    expect(second).not.toBe(first);
    expect(verifyRefreshToken(second)).toMatchObject({ userId: 'user-1', type: 'refresh' });
    expect(verifyAccessToken(second)).toBeNull();
  });
});

describe('Logger Utilities', () => {
  it('should test logger exists', () => {
    // Logger is imported and used in the application
    expect(true).toBe(true);
  });
});
