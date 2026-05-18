import crypto from 'crypto';
import mongoose from 'mongoose';
import Invite from '../models/Invite.js';
import env from '../config/env.js';
import { buildInviteDemo } from '../data/demoContentSeed.js';

const INVITE_EXPIRY_DAYS = 7;
const INVITE_EXPIRY_MS = INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

const memory = new Map();

function useDb() {
  return mongoose.connection.readyState === 1;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function getInviteFrontendBaseUrl() {
  return env.frontendUrl || 'http://localhost:5173';
}

function inviteExpiry(createdAt) {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  return new Date(created.getTime() + INVITE_EXPIRY_MS);
}

export function inviteStatus(data) {
  if (data.usedAt) return 'used';
  const created = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
  if (new Date() > inviteExpiry(created)) return 'expired';
  return 'active';
}

export function serializeInvite(token, data) {
  const createdAt =
    data.createdAt instanceof Date ? data.createdAt.toISOString() : String(data.createdAt);
  const expiry = inviteExpiry(data.createdAt);
  const usedAt = data.usedAt
    ? data.usedAt instanceof Date
      ? data.usedAt.toISOString()
      : String(data.usedAt)
    : null;
  return {
    token,
    email: data.email,
    role: data.role,
    createdAt,
    expiresAt: expiry.toISOString(),
    usedAt,
    status: inviteStatus({ ...data, createdAt: data.createdAt }),
    link: `${getInviteFrontendBaseUrl()}/register?invite=${token}`,
  };
}

async function findByToken(token) {
  if (useDb()) {
    const doc = await Invite.findOne({ token }).lean();
    if (!doc) return null;
    return {
      email: doc.email,
      role: doc.role,
      createdAt: doc.createdAt,
      usedAt: doc.usedAt,
      createdBy: doc.createdBy,
    };
  }
  return memory.get(token) || null;
}

export async function createInvite({ email, role, createdBy }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role.toLowerCase();
  const token = generateToken();
  const now = new Date();

  if (useDb()) {
    await Invite.create({
      token,
      email: normalizedEmail,
      role: normalizedRole,
      createdBy: createdBy || null,
    });
  } else {
    memory.set(token, {
      email: normalizedEmail,
      role: normalizedRole,
      createdAt: now.toISOString(),
      usedAt: null,
      createdBy: createdBy || null,
    });
  }

  return serializeInvite(token, {
    email: normalizedEmail,
    role: normalizedRole,
    createdAt: now,
    usedAt: null,
  });
}

export async function listInvites() {
  if (useDb()) {
    const docs = await Invite.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) =>
      serializeInvite(d.token, {
        email: d.email,
        role: d.role,
        createdAt: d.createdAt,
        usedAt: d.usedAt,
      })
    );
  }
  return [...memory.entries()]
    .map(([token, data]) => serializeInvite(token, data))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function revokeInvite(token) {
  if (useDb()) {
    const doc = await Invite.findOneAndDelete({ token });
    return Boolean(doc);
  }
  return memory.delete(token);
}

export async function validateInviteToken(token) {
  const data = await findByToken(token);
  if (!data) {
    return { valid: false, status: 404, message: 'Invite link is invalid or expired' };
  }
  const status = inviteStatus(data);
  if (status === 'expired') {
    await revokeInvite(token);
    return { valid: false, status: 410, message: 'Invite link has expired' };
  }
  if (status === 'used') {
    return { valid: false, status: 410, message: 'Invite link has already been used' };
  }
  return { valid: true, email: data.email, role: data.role };
}

export async function consumeInviteToken(token, { email }) {
  const data = await findByToken(token);
  if (!data) {
    return { ok: false, status: 404, message: 'Invalid invite token' };
  }
  const check = await validateInviteToken(token);
  if (!check.valid) {
    return { ok: false, status: check.status, message: check.message };
  }
  if (email.trim().toLowerCase() !== data.email) {
    return { ok: false, status: 400, message: 'Email must match the invited address' };
  }

  const usedAt = new Date();
  if (useDb()) {
    await Invite.updateOne({ token }, { usedAt });
  } else {
    const row = memory.get(token);
    if (row) row.usedAt = usedAt.toISOString();
  }

  return { ok: true, role: data.role };
}

export async function seedInvitesIfEmpty() {
  if (useDb()) {
    const count = await Invite.countDocuments();
    if (count > 0) return;
    for (const row of buildInviteDemo(getInviteFrontendBaseUrl())) {
      await Invite.create({
        token: row.token,
        email: row.email,
        role: row.role,
        createdAt: new Date(row.createdAt),
      });
    }
    return;
  }
  if (memory.size > 0) return;
  for (const row of buildInviteDemo(getInviteFrontendBaseUrl())) {
    memory.set(row.token, {
      email: row.email,
      role: row.role,
      createdAt: row.createdAt,
      usedAt: null,
    });
  }
}
