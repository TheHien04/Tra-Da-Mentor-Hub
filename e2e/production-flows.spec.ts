import { test, expect } from '@playwright/test';
import { API_BASE, apiLogin, createInvite, loginAsAdmin } from './helpers';

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

  test('admin books an open slot', async ({ page, request }) => {
    const accessToken = await apiLogin(request);
    const suffix = Date.now();
    const mentorName = `E2E Booking Mentor ${suffix}`;
    const mentorResponse = await request.post(`${API_BASE}/mentors`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: mentorName,
        email: `e2e-booking-mentor-${suffix}@example.com`,
        track: 'tech',
        expertise: ['Quality'],
        maxMentees: 2,
      },
    });
    expect(mentorResponse.ok()).toBeTruthy();
    const mentor = await mentorResponse.json();

    const menteeResponse = await request.post(`${API_BASE}/mentees`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: `E2E Booking Mentee ${suffix}`,
        email: `e2e-booking-mentee-${suffix}@example.com`,
        track: 'tech',
      },
    });
    expect(menteeResponse.ok()).toBeTruthy();
    const mentee = await menteeResponse.json();

    const future = new Date();
    future.setUTCDate(future.getUTCDate() + 30);
    const slotResponse = await request.post(`${API_BASE}/slots`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        mentorId: mentor._id,
        date: future.toISOString().slice(0, 10),
        time: '13:30',
        duration: 60,
      },
    });
    expect(slotResponse.ok()).toBeTruthy();

    await loginAsAdmin(page);
    await page.goto('/slots');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page
      .getByRole('combobox', { name: /filter by mentor|lọc theo mentor/i })
      .selectOption(mentor._id);
    await page
      .getByRole('combobox', { name: /book for mentee|đặt cho mentee/i })
      .selectOption(mentee._id);
    const slotCard = page.locator('article').filter({ hasText: mentorName });
    const bookBtn = slotCard.getByRole('button', { name: /^book|đặt lịch/i });
    await expect(bookBtn).toBeVisible({ timeout: 10_000 });
    await bookBtn.click();
    await expect(page.getByText(/booked|đã đặt/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('admin creates a session log for a valid mentoring relationship', async ({ page, request }) => {
    const accessToken = await apiLogin(request);
    const suffix = Date.now();
    const mentorResponse = await request.post(`${API_BASE}/mentors`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: `E2E Log Mentor ${suffix}`,
        email: `e2e-log-mentor-${suffix}@example.com`,
        track: 'tech',
        expertise: ['Quality'],
        maxMentees: 2,
      },
    });
    expect(mentorResponse.ok()).toBeTruthy();
    const mentor = await mentorResponse.json();
    const menteeResponse = await request.post(`${API_BASE}/mentees`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: `E2E Log Mentee ${suffix}`,
        email: `e2e-log-mentee-${suffix}@example.com`,
        track: 'tech',
        mentorId: mentor._id,
      },
    });
    expect(menteeResponse.ok()).toBeTruthy();
    const mentee = await menteeResponse.json();

    await loginAsAdmin(page);
    await page.goto('/session-logs');
    await page.getByRole('button', { name: /new.*log|nhật ký mới/i }).click();

    await page.getByRole('combobox', { name: /^mentor\*?$/i }).selectOption(mentor._id);
    await page.getByRole('combobox', { name: /^mentee\*?$/i }).selectOption(mentee._id);
    await page.getByLabel(/^(date|ngày)\*?$/i).fill(new Date().toISOString().split('T')[0]);
    await page.getByLabel(/^(topic|chủ đề)\*?$/i).fill(`E2E session ${Date.now()}`);
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
    await page.getByLabel(/message|nội dung/i).fill(msg);
    await page.getByRole('button', { name: /send notification|gửi thông báo/i }).click();

    await expect(
      page.getByText(/queued successfully|đã gửi thông báo thành công/i).first()
    ).toBeVisible({ timeout: 12_000 });
    await expect(page.getByRole('table').getByText(msg)).toBeVisible({ timeout: 10_000 });
  });
});
