import { recordAudit } from '../services/auditStore.js';

const WRITE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const AUTH_NOISE = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/resend-verification',
  '/api/auth/send-verification',
];

export function shouldSkipAudit(path) {
  if (AUTH_NOISE.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return true;
  if (path.startsWith('/api/auth/verify-email/')) return true;
  if (path.startsWith('/api/auth/reset-password/')) return true;
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
    if (shouldSkipAudit(path)) return;
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
