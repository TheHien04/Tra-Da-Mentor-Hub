/**
 * Client-side token storage — access in sessionStorage (tab-scoped),
 * refresh in localStorage (survives refresh). Reduces XSS persistence window for access tokens.
 */

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';

export function getAccessToken(): string | null {
  try {
    return sessionStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  try {
    sessionStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    // Migrate legacy copies
    localStorage.removeItem(ACCESS_KEY);
  } catch {
    /* private browsing */
  }
}

export function clearAuthTokens(): void {
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

/** One-time migration from older builds that stored access token in localStorage */
export function migrateLegacyTokenStorage(): void {
  try {
    const legacyAccess = localStorage.getItem(ACCESS_KEY);
    if (legacyAccess && !sessionStorage.getItem(ACCESS_KEY)) {
      sessionStorage.setItem(ACCESS_KEY, legacyAccess);
      localStorage.removeItem(ACCESS_KEY);
    }
  } catch {
    /* ignore */
  }
}
