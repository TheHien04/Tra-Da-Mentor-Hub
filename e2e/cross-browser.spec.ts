import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Cross-browser contract', () => {
  test('public entry points remain usable', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'commit' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/programs', { waitUntil: 'commit' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/privacy-policy', { waitUntil: 'commit' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('an authenticated admin can reach the core workspace', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('navigation')).toBeVisible();
    await page.goto('/slots');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/applications');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
