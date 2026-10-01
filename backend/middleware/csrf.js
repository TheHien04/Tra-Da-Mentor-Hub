import crypto from 'crypto';
import { readCsrfCookie } from '../lib/sessionCookie.js';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

const EXEMPT = [
  /^\/api\/auth\/login$/,
  /^\/api\/auth\/register$/,
  /^\/api\/auth\/forgot-password$/,
  /^\/api\/auth\/resend-verification$/,
  /^\/api\/auth\/reset-password\//,
  /^\/api\/payments\/webhook$/,
];

function sameToken(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

/**
 * Cookie-authenticated mutations must echo the readable CSRF cookie.
 * A Bearer token is not sent automatically by the browser, so those clients skip this check.
 * Refresh that already presents the refresh token in the body is a credential, not a cookie CSRF.
 */
export function requireCsrf(req, res, next) {
  const method = req.method.toUpperCase();
  if (SAFE.has(method)) return next();

  const path = (req.originalUrl || req.url || '').split('?')[0];
  if (EXEMPT.some((pattern) => pattern.test(path))) return next();

  const header = req.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) return next();

  if (path === '/api/auth/refresh' && req.body?.refreshToken) return next();

  const cookie = readCsrfCookie(req);
  const sent = req.get('x-csrf-token');
  if (!cookie || !sent || !sameToken(cookie, sent)) {
    return res.status(403).json({
      success: false,
      code: 'CSRF',
      message: 'Missing CSRF token',
    });
  }
  next();
}
