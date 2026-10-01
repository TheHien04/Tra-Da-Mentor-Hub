import { recordAudit } from '../services/auditStore.js';

const WRITE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function shouldSkip(path) {
  if (path.startsWith('/api/auth')) return true;
  if (path.endsWith('/notifications/read-all')) return true;
  if (/\/notifications\/[^/]+\/read$/.test(path)) return true;
  return false;
}

/** Record a successful write. Auth noise and "mark notification read" stay out of the log. */
export function auditMutations(req, res, next) {
  res.on('finish', () => {
    const method = req.method.toUpperCase();
    if (!WRITE.has(method) || res.statusCode >= 400) return;
    const path = (req.originalUrl || req.url || '').split('?')[0];
    if (shouldSkip(path)) return;
    const parts = path.split('/').filter(Boolean);
    const entity = parts[1] || 'api';
    const entityId = parts[2] || null;
    void recordAudit(req, {
      action: `${entity}.${method.toLowerCase()}`,
      entity,
      entityId,
    });
  });
  next();
}
