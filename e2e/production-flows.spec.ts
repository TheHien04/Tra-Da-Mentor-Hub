import { test, expect } from '@playwright/test';
import { apiLogin, createInvite } from './helpers';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email|địa chỉ email/i).fill('admin@example.com');
  await page.getByLabel(/^password|mật khẩu/i).fill('AdminPass123');
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 15_000 });
}

test.describe('Production flows', () => {
  test('register via invite link', async ({ page, request }) => {
    const token = await apiLogin(request);
    const email = `e2e-invite-${Date.now()}@example.com`;
    const invite = await createInvite(request, token, email, 'mentee');

    await page.goto(`/register?invite=${invite.token}`);
    await expect(page.getByText(/invite|mời/i).first()).toBeVisible({ timeout: 12_000 });

    await page.locator('#name').fill('E2E Mentee');
    await expect(page.locator('#email')).toHaveValue(email);
    await page.locator('#password').fill('E2ePass123!');
    await page.locator('#confirmPassword').fill('E2ePass123!');
    await page.getByRole('button', { name: /create account|tạo tài khoản/i }).click();

    await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 20_000 });
  });

  test('admin books an open slot', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/slots');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const bookBtn = page.getByRole('button', { name: /^book|đặt lịch/i }).first();
    const hasOpen = await bookBtn.isVisible().catch(() => false);
    if (!hasOpen) {
      await page.getByRole('button', { name: /add free slot|thêm slot trống/i }).click();
      await page.locator('form select').first().selectOption({ index: 1 });
      await page.getByRole('button', { name: /^add slot$|^thêm slot$/i }).click();
      await expect(page.getByText(/added|đã thêm/i).first()).toBeVisible({ timeout: 10_000 });
    }

    await page.getByRole('button', { name: /^book|đặt lịch/i }).first().click();
    await expect(page.getByText(/booked|đã đặt/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('admin creates a session log', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/session-logs');
    await page.getByRole('button', { name: /new log|nhật ký mới/i }).click();

    const selects = page.locator('form select');
    await selects.nth(0).selectOption({ index: 1 });
    await selects.nth(1).selectOption({ index: 1 });
    await page.locator('input[type="date"]').fill(new Date().toISOString().split('T')[0]);
    await page.getByPlaceholder(/topic|chủ đề/i).fill(`E2E session ${Date.now()}`);
    await page.getByRole('button', { name: /save log|lưu nhật ký/i }).click();

    await expect(page.getByText(/session log saved|đã lưu nhật ký/i).first()).toBeVisible({
      timeout: 12_000,
    });
  });

  test('admin sends a broadcast notification', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/notifications');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const msg = `E2E broadcast ${Date.now()}`;
    await page.getByPlaceholder(/message|nội dung/i).fill(msg);
    await page.getByRole('button', { name: /send notification|gửi thông báo/i }).click();

    await expect(
      page.getByText(/queued successfully|đã gửi thông báo thành công/i).first()
    ).toBeVisible({ timeout: 12_000 });
    await expect(page.getByRole('table').getByText(msg)).toBeVisible({ timeout: 10_000 });
  });
});
