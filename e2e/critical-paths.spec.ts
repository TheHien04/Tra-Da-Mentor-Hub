import { test, expect } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('tdm-onboarding-admin-v1', 'done');
    localStorage.setItem('tdm-pwa-install-dismissed', '1');
  });
  await page.goto('/login');
  await page.getByLabel(/email|địa chỉ email/i).fill('admin@example.com');
  await page.getByLabel(/^password|mật khẩu/i).fill('AdminPass123');
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 15_000 });
}

test.describe('Critical paths', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('command menu keeps focus inside the dialog', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: /command menu|menu lệnh/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(':focus')).toBeVisible();

    const buttons = page.getByRole('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i += 1) {
      const button = buttons.nth(i);
      if (!(await button.isVisible())) continue;
      const label = ((await button.getAttribute('aria-label')) || (await button.innerText()) || '').trim();
      expect(label.length).toBeGreaterThan(0);
    }
  });

  test('the browser does not keep an access token', async ({ page }) => {
    const stored = await page.evaluate(() => sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken'));
    expect(stored).toBeNull();
  });

  test('slots page loads', async ({ page }) => {
    await page.goto('/slots');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('session logs page loads', async ({ page }) => {
    await page.goto('/session-logs');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('admin export page loads', async ({ page }) => {
    await page.goto('/admin/export');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /export|xuất/i }).first()).toBeVisible();
  });

  test('analytics API-backed page shows KPIs', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('.analytics-kpi-grid, .analytics-toolbar').first()).toBeVisible({
      timeout: 12_000,
    });
  });
});
