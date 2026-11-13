import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const API_BASE = process.env.E2E_API_BASE || 'http://localhost:5002/api';

export async function loginAsAdmin(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('tdm-onboarding-admin-v1', 'done');
    localStorage.setItem('tdm-pwa-install-dismissed', '1');
    localStorage.setItem('cookieConsent', 'accepted');
  });
  // Commit is the deterministic navigation boundary; locators below wait for React.
  await page.goto('/login', { waitUntil: 'commit', timeout: 15_000 });
  const email = page.getByLabel(/email|địa chỉ email/i);
  // On a cold Vite/browser context the route chunk can arrive just after the
  // navigation commit. Give React a bounded readiness window and perform one
  // reload recovery instead of making every test race the initial render.
  try {
    await expect(email).toBeVisible({ timeout: 10_000 });
  } catch {
    await page.reload({ waitUntil: 'commit', timeout: 15_000 });
    await expect(email).toBeVisible({ timeout: 20_000 });
  }
  await email.fill('admin@example.com');
  await page.getByLabel(/^password|mật khẩu/i).fill('AdminPass123');
  await page.getByRole('button', { name: /login|sign in|đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 15_000 });
}

export async function apiLogin(
  request: APIRequestContext,
  email = 'admin@example.com',
  password = 'AdminPass123'
) {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });
  if (!res.ok()) {
    throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  if (body.data?.accessToken) return body.data.accessToken as string;
  const raw = res.headers()['set-cookie'] || '';
  const joined = Array.isArray(raw) ? raw.join(';') : raw;
  const match = joined.match(/tdm_access=([^;]+)/);
  if (!match) throw new Error('Login did not return a session cookie');
  return decodeURIComponent(match[1]);
}

export async function createInvite(
  request: APIRequestContext,
  accessToken: string,
  email: string,
  role: 'mentor' | 'mentee' | 'admin' = 'mentee'
) {
  const res = await request.post(`${API_BASE}/invites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { email, role },
  });
  if (!res.ok()) {
    throw new Error(`Create invite failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return { token: body.token as string, email: body.email as string, role: body.role as string };
}
