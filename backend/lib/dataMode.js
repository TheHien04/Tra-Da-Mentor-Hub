import mongoose from 'mongoose';

/** 'mongo' | 'memory' | null. Null means tests that connect on their own. */
let mode = null;

export function lockDataMode(next) {
  mode = next === 'mongo' ? 'mongo' : 'memory';
}

export function resetDataMode() {
  mode = null;
}

export function getDataMode() {
  return mode;
}

/**
 * One store for the life of the process.
 * A locked Mongo process never reads the in-memory seed when the database drops.
 */
export function useDb() {
  if (mode === 'memory') return false;
  if (mode === 'mongo') {
    if (mongoose.connection.readyState !== 1) {
      const error = new Error('Database is unavailable');
      error.code = 'DATABASE_UNAVAILABLE';
      error.statusCode = 503;
      throw error;
    }
    return true;
  }
  return mongoose.connection.readyState === 1;
}
