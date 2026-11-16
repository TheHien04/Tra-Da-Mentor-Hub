import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test('capture selected README product screens', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await loginAsAdmin(page);

  const pages = [
    { path: '/', file: 'dashboard' },
    { path: '/mentors', file: 'mentors' },
    { path: '/applications', file: 'applications' },
    { path: '/schedule', file: 'schedule' },
    { path: '/analytics', file: 'analytics' },
    { path: '/insights', file: 'matching-insights' },
  ];

  for (const item of pages) {
    await page.goto(item.path);
    await expect(page.locator('h1').first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `docs/screenshots/product/${item.file}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();
  await page.screenshot({
    path: 'docs/screenshots/mobile/dashboard.png',
    fullPage: true,
    animations: 'disabled',
  });
});
