/**
 * Access token stays in sessionStorage for the tab.
 * The refresh token is an httpOnly cookie. A memory copy exists only for the current tab
 * so a reload can still refresh if the cookie was not stored yet.
 */

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';

let sessionRefresh: string | null = null;

export function getAccessToken(): string | null {
  try {
    return sessionStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  return sessionRefresh;
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  try {
    if (!accessToken) return;
    sessionStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) sessionRefresh = refreshToken;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* private browsing */
  }
}

export function clearAuthTokens(): void {
  sessionRefresh = null;
  try {
    sessionStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export function getStoredUserRaw(): string | null {
  try {
    return localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

/** One-time migration: drop refresh tokens that older builds left in localStorage. */
export function migrateLegacyTokenStorage(): void {
  try {
    const legacyRefresh = localStorage.getItem(REFRESH_KEY);
    if (legacyRefresh && !sessionRefresh) sessionRefresh = legacyRefresh;
    localStorage.removeItem(REFRESH_KEY);
    const legacyAccess = localStorage.getItem(ACCESS_KEY);
    if (legacyAccess && !sessionStorage.getItem(ACCESS_KEY)) {
      sessionStorage.setItem(ACCESS_KEY, legacyAccess);
    }
    localStorage.removeItem(ACCESS_KEY);
  } catch {
    /* ignore */
  }
}
