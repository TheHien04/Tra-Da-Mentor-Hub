import { test, expect } from '@playwright/test';

test.describe('Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email|địa chỉ email/i).fill('admin@example.com');
    await page.getByLabel(/^password|mật khẩu/i).fill('AdminPass123');
    await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 15_000 });
  });

  test('schedule page shows calendar connect', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.getByText(/Google Calendar|Kết nối Google Calendar/i).first()).toBeVisible();
  });

  test('analytics page loads KPI section', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('insights smart match section', async ({ page }) => {
    await page.goto('/insights');
    await expect(page.getByText(/Smart Match|Ghép cặp/i).first()).toBeVisible();
  });

  test('mentors list uses card layout', async ({ page }) => {
    await page.goto('/mentors');
    await expect(page.locator('.people-card').first()).toBeVisible({ timeout: 10_000 });
  });
});
