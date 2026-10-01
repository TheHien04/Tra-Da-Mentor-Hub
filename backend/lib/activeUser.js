import mongoose from 'mongoose';
import User from '../models/User.js';
import { isDemoUserId } from '../config/demoAuth.js';

const cache = new Map();
const TTL_MS = 15_000;

/** False when the account is missing or deactivated. Demo auth skips the lookup. */
export async function isAccountActive(userId) {
  const id = String(userId || '');
  if (!id) return false;
  if (isDemoUserId(id)) return true;

  const hit = cache.get(id);
  if (hit && hit.exp > Date.now()) return hit.ok;

  if (mongoose.connection.readyState !== 1) return true;

  const user = await User.findById(id).select('isActive').lean();
  const ok = Boolean(user?.isActive);
  cache.set(id, { ok, exp: Date.now() + TTL_MS });
  return ok;
}

export function forgetAccountActive(userId) {
  if (userId) cache.delete(String(userId));
}
