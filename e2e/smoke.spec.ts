import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('health endpoint', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.storage).toMatch(/mongodb|memory/);
    expect(body.features).toBeTruthy();
  });

  test('privacy page i18n title', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.locator('h1')).toContainText(/Privacy|bảo mật/i);
  });

  test('/dashboard redirects to home', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/(\?.*)?$/);
  });

  test('demo login reaches dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email|địa chỉ email/i).fill('admin@example.com');
    await page.getByLabel(/^password|mật khẩu/i).fill('AdminPass123');
    await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
