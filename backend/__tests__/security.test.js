import { describe, it, expect } from '@jest/globals';
import { isWeakSecret } from '../lib/secretValidation.js';
import { createOAuthState, verifyOAuthState } from '../lib/oauthState.js';

describe('Security utilities', () => {
  it('detects weak secrets', () => {
    expect(isWeakSecret('short')).toBe(true);
    expect(isWeakSecret('CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_AT_LEAST_64_CHARS_LONG')).toBe(true);
    const strong = 'a'.repeat(64);
    expect(isWeakSecret(strong)).toBe(false);
  });

  it('OAuth state is single-use', () => {
    const state = createOAuthState();
    expect(verifyOAuthState(state)).toBe(true);
    expect(verifyOAuthState(state)).toBe(false);
  });

});
