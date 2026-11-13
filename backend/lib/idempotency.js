import crypto from 'node:crypto';
import IdempotencyRecord from '../models/IdempotencyRecord.js';
import { useDb } from './dataMode.js';

const records = new Map();
const TTL_MS = 24 * 60 * 60 * 1000;

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function stableSerialize(value) {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
    .join(',')}}`;
}

function memoryKey(context) {
  return `${context.userId}:${context.keyHash}`;
}

function evaluateExisting(record, context) {
  if (record.requestHash !== context.requestHash) return { kind: 'conflict', reason: 'payload' };
  if (record.actorRole !== context.actorRole) return { kind: 'conflict', reason: 'authorization' };
  if (record.state === 'pending') return { kind: 'pending' };
  return { kind: 'replay', status: record.status, body: record.body };
}

function pruneMemory() {
  const now = Date.now();
  for (const [key, record] of records.entries()) {
    if (record.expiresAt <= now) records.delete(key);
  }
}

export function createIdempotencyContext(req) {
  const key = req.get('Idempotency-Key');
  const userId = req.user?.userId;
  if (!key || !userId) return null;

  const path = String(req.originalUrl || req.url || '').split('?')[0];
  const scope = `${String(req.method || 'POST').toUpperCase()}:${path}`;
  return {
    userId: String(userId),
    actorRole: String(req.user?.role || ''),
    key: String(key),
    keyHash: hash(`${scope}\0${key}`),
    requestHash: hash(stableSerialize(req.body ?? null)),
    scope,
  };
}

/** Atomically reserve a key, or return a completed response for a valid replay. */
export async function claimIdempotent(context) {
  if (!context) return { kind: 'disabled' };
  const pending = {
    userId: context.userId,
    keyHash: context.keyHash,
    requestHash: context.requestHash,
    actorRole: context.actorRole,
    state: 'pending',
    status: null,
    body: null,
    expiresAt: new Date(Date.now() + TTL_MS),
  };

  if (!useDb()) {
    pruneMemory();
    const key = memoryKey(context);
    const existing = records.get(key);
    if (existing) return evaluateExisting(existing, context);
    records.set(key, { ...pending, expiresAt: pending.expiresAt.getTime() });
    return { kind: 'claimed' };
  }

  try {
    await IdempotencyRecord.create(pending);
    return { kind: 'claimed' };
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const existing = await IdempotencyRecord.findOne({
      userId: context.userId,
      keyHash: context.keyHash,
    }).lean();
    if (!existing) throw error;
    return evaluateExisting(existing, context);
  }
}

export async function completeIdempotent(context, status, body) {
  if (!context) return;
  if (!useDb()) {
    const key = memoryKey(context);
    const existing = records.get(key);
    if (!existing || existing.state !== 'pending') return;
    records.set(key, { ...existing, state: 'completed', status, body });
    return;
  }

  await IdempotencyRecord.updateOne(
    {
      userId: context.userId,
      keyHash: context.keyHash,
      requestHash: context.requestHash,
      actorRole: context.actorRole,
      state: 'pending',
    },
    { $set: { state: 'completed', status, body } }
  );
}

export async function releaseIdempotent(context) {
  if (!context) return;
  if (!useDb()) {
    const key = memoryKey(context);
    const existing = records.get(key);
    if (existing?.state === 'pending') records.delete(key);
    return;
  }

  await IdempotencyRecord.deleteOne({
    userId: context.userId,
    keyHash: context.keyHash,
    requestHash: context.requestHash,
    actorRole: context.actorRole,
    state: 'pending',
  });
}

export function clearIdempotencyMemory() {
  records.clear();
}
