import AuditEvent from '../models/AuditEvent.js';
import { useDb } from '../lib/dataMode.js';
import logger from '../config/logger.js';

const memory = [];
const MAX = 500;

export async function recordAudit(req, event) {
  const entry = {
    at: new Date(),
    actorId: req.user?.userId ? String(req.user.userId) : null,
    actorRole: req.user?.role || null,
    action: String(event.action || 'update'),
    entity: String(event.entity || 'record'),
    entityId: event.entityId ? String(event.entityId) : null,
    ip: req.ip || null,
  };
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

export async function listAudit(limit = 50) {
  const cap = Math.min(100, Math.max(1, Number(limit) || 50));
  if (useDb()) {
    const docs = await AuditEvent.find().sort({ at: -1 }).limit(cap).lean();
    return docs.map((doc) => ({ ...doc, _id: String(doc._id) }));
  }
  return memory.slice(0, cap);
}
