/**
 * Protect all /api routes except an explicit public allowlist.
 */

import { authenticate } from './auth.js';

const PUBLIC_ROUTES = [
  { method: 'GET', pattern: /^\/api\/health$/ },
  { method: 'GET', pattern: /^\/api\/docs(\/.*)?$/ },
  { method: 'POST', pattern: /^\/api\/payments\/webhook$/ },
  { method: 'POST', pattern: /^\/api\/auth\/login$/ },
  { method: 'POST', pattern: /^\/api\/auth\/register$/ },
  { method: 'POST', pattern: /^\/api\/auth\/refresh$/ },
  { method: 'POST', pattern: /^\/api\/auth\/forgot-password$/ },
  { method: 'POST', pattern: /^\/api\/auth\/resend-verification$/ },
  { method: 'GET', pattern: /^\/api\/auth\/verify-email\/[^/]+$/ },
  { method: 'POST', pattern: /^\/api\/auth\/reset-password\/[^/]+$/ },
  { method: 'GET', pattern: /^\/api\/auth\/google$/ },
  { method: 'GET', pattern: /^\/api\/auth\/google\/callback$/ },
  { method: 'GET', pattern: /^\/api\/invites\/validate\/[^/]+$/ },
];

function isPublicApiRoute(req) {
  const path = req.path || req.url.split('?')[0];
  return PUBLIC_ROUTES.some(
    ({ method, pattern }) => req.method === method && pattern.test(path)
  );
}

export function requireApiAuth(req, res, next) {
  if (!req.path.startsWith('/api')) {
    return next();
  }
  if (isPublicApiRoute(req)) {
    return next();
  }
  return authenticate(req, res, next);
}
