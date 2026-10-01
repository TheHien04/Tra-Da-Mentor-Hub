/**
 * Tokens stay in httpOnly cookies. This module only clears copies older builds left in web storage.
 */

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';

export function readCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )tdm_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearAuthTokens(): void {
  try {
    sessionStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* private browsing */
  }
}

export function purgeLegacyAuthStorage(): void {
  clearAuthTokens();
}
