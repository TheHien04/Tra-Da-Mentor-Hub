import type { APIRequestContext } from '@playwright/test';

export const API_BASE = 'http://localhost:5000/api';

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
  return body.data.accessToken as string;
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
