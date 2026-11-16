import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test('capture selected README product screens', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.addInitScript(() => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('tdm-onboarding-admin-v1', 'done');
    localStorage.setItem('tdm-pwa-install-dismissed', '1');
  });

  await page.goto('/login');
  await expect(page.locator('h1').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: 'docs/screenshots/auth-login.png',
    fullPage: true,
    animations: 'disabled',
  });

  await page.goto('/programs');
  await expect(page.locator('h1').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: 'docs/screenshots/public-programs.png',
    fullPage: true,
    animations: 'disabled',
  });

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
    if (item.file === 'dashboard') {
      await page.locator('details.dashboard-details').evaluate((details: HTMLDetailsElement) => {
        details.open = true;
      });
    }
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
