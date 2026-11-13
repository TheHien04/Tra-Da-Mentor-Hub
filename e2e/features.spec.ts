import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Features', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
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
