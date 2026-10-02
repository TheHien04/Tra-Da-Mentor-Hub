import AuditEvent from '../models/AuditEvent.js';
import { useDb } from '../lib/dataMode.js';
import env from '../config/env.js';
import logger from '../config/logger.js';

const memory = [];
const MAX = 500;

async function persistAudit(entry) {
  try {
    if (useDb()) {
      const doc = await AuditEvent.create(entry);
      return { ...entry, _id: String(doc._id) };
    }
    const row = { ...entry, _id: `aud_${Date.now()}_${memory.length}` };
    memory.unshift(row);
    if (memory.length > MAX) memory.pop();
    return row;
  } catch (error) {
    logger.warn(`Audit log skipped: ${error.message}`);
    return null;
  }
}

export async function recordAudit(req, event) {
  const entry = {
    at: new Date(),
    actorId: req.user?.userId ? String(req.user.userId) : null,
    actorRole: req.user?.role || null,
    action: String(event.action || 'update'),
    entity: String(event.entity || 'record'),
    entityId: event.entityId ? String(event.entityId) : null,
    summary: event.summary ? String(event.summary).slice(0, 180) : null,
    ip: req.ip || null,
  };
  return persistAudit(entry);
}

/** Program history for the demo, built from records that already exist. */
export async function seedAuditIfEmpty() {
  if (env.isProduction) return;
  if (useDb()) {
    const count = await AuditEvent.countDocuments();
    if (count > 0) return;
  } else if (memory.length > 0) return;

  const { listInvites } = await import('./inviteStore.js');
  const { listSessionLogs } = await import('./sessionLogStore.js');
  const { listTestimonials } = await import('./testimonialStore.js');
  const [invites, logs, testimonials] = await Promise.all([
    listInvites(),
    listSessionLogs(),
    listTestimonials(),
  ]);

  const events = [
    ...invites.map((invite) => ({
      at: invite.createdAt || new Date(),
      actorRole: 'admin',
      action: 'invites.post',
      entity: 'invites',
      entityId: invite.email,
      summary: invite.email,
    })),
    ...logs.map((log) => ({
      at: log.sessionDate || new Date(),
      actorRole: 'mentor',
      action: 'session-logs.post',
      entity: 'session-logs',
      entityId: log._id,
      summary: log.topic,
    })),
    ...testimonials.map((item) => ({
      at: item.date || new Date(),
      actorRole: 'admin',
      action: 'testimonials.post',
      entity: 'testimonials',
      entityId: item._id,
      summary: `${item.menteeName} · ${item.mentorName}`,
    })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  for (const event of events) {
    await persistAudit({
      at: new Date(event.at),
      actorId: null,
      actorRole: event.actorRole,
      action: event.action,
      entity: event.entity,
      entityId: event.entityId,
      summary: event.summary,
      ip: null,
    });
  }
}

export async function listAudit(limit = 50) {
  const cap = Math.min(100, Math.max(1, Number(limit) || 50));
  if (useDb()) {
    const docs = await AuditEvent.find().sort({ at: -1 }).limit(cap).lean();
    return docs.map((doc) => ({ ...doc, _id: String(doc._id) }));
  }
  return memory.slice(0, cap);
}
