import crypto from 'crypto';

const ACCESS_COOKIE = 'tdm_access';
const REFRESH_COOKIE = 'tdm_refresh';
const CSRF_COOKIE = 'tdm_csrf';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function secureCookie() {
  return process.env.NODE_ENV === 'production';
}

export function readCookie(req, name) {
  const raw = req.headers?.cookie;
  if (!raw || !name) return null;
  for (const part of raw.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) !== name) continue;
    try {
      return decodeURIComponent(trimmed.slice(eq + 1));
    } catch {
      return trimmed.slice(eq + 1);
    }
  }
  return null;
}

export function readAccessCookie(req) {
  return readCookie(req, ACCESS_COOKIE);
}

export function readRefreshCookie(req) {
  return readCookie(req, REFRESH_COOKIE);
}

export function readCsrfCookie(req) {
  return readCookie(req, CSRF_COOKIE);
}

export function setSessionCookies(res, { accessToken, refreshToken, accessMaxAgeMs }) {
  const base = {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookie(),
  };
  if (accessToken) {
    res.cookie(ACCESS_COOKIE, accessToken, {
      ...base,
      path: '/',
      maxAge: accessMaxAgeMs || 15 * 60 * 1000,
    });
  }
  if (refreshToken) {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...base,
      path: '/api/auth',
      maxAge: REFRESH_MAX_AGE_MS,
    });
  }
  res.cookie(CSRF_COOKIE, crypto.randomBytes(32).toString('hex'), {
    httpOnly: false,
    sameSite: 'lax',
    secure: secureCookie(),
    path: '/',
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

export function clearSessionCookies(res) {
  const base = {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookie(),
  };
  res.clearCookie(ACCESS_COOKIE, { ...base, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...base, path: '/api/auth' });
  res.clearCookie(CSRF_COOKIE, { ...base, httpOnly: false, path: '/' });
}
