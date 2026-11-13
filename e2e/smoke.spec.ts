import { test, expect } from '@playwright/test';
import { API_BASE, loginAsAdmin } from './helpers';

test.describe('Smoke', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'commit' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('health endpoint', async ({ request }) => {
    const res = await request.get(`${API_BASE}/ready`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.storage).toMatch(/mongodb|memory/);
    expect(body.features).toBeTruthy();
  });

  test('privacy page i18n title', async ({ page }) => {
    await page.goto('/privacy-policy', { waitUntil: 'commit' });
    await expect(page.locator('h1')).toContainText(/Privacy|bảo mật/i);
  });

  test('official programs page shows the published catalogue', async ({ page }) => {
    await page.goto('/programs', { waitUntil: 'commit' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/1[.,]299[.,]000/)).toBeVisible();
    await expect(page.getByText(/899[.,]000/)).toBeVisible();
    await expect(page.getByRole('link', { name: /apply as a mentee|đăng ký làm mentee/i }).first())
      .toHaveAttribute('href', 'https://forms.gle/WNNDMoiHvf7oMGPq7');
  });

  test('legacy pricing URL redirects to programs', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/programs$/);
  });

  test('/dashboard redirects to an authenticated entry point', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/(login)?(\?.*)?$/);
  });

  test('demo login reaches dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
