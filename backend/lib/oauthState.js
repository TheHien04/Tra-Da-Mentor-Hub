import crypto from 'crypto';

const TTL_MS = 10 * 60 * 1000;
const pending = new Map();

function prune() {
  const now = Date.now();
  for (const [state, expiresAt] of pending.entries()) {
    if (expiresAt <= now) pending.delete(state);
  }
}

export function createOAuthState() {
  prune();
  const state = crypto.randomBytes(32).toString('hex');
  pending.set(state, Date.now() + TTL_MS);
  return state;
}

export function verifyOAuthState(state) {
  if (!state || typeof state !== 'string') return false;
  prune();
  const expiresAt = pending.get(state);
  if (!expiresAt) return false;
  pending.delete(state);
  return Date.now() < expiresAt;
}
