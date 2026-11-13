import { test, expect } from '@playwright/test';
import { API_BASE, apiLogin, loginAsAdmin } from './helpers';

test.describe('Post-login UX hardening', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('uses one page heading and keeps programs discoverable', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('link', { name: /programs|dịch vụ/i }).first()).toBeVisible();

    const adminSummary = page.locator('summary').filter({ hasText: /administration|quản trị/i });
    await adminSummary.click();
    await expect(page.getByRole('link', { name: /audit|nhật ký kiểm tra/i })).toBeVisible();
  });

  test('labels simulated integrations without claiming a live connection', async ({ page }) => {
    await page.goto('/admin/notifications');
    await expect(page.getByText(/demo simulation|mô phỏng demo/i).first()).toBeVisible();

    await page.goto('/schedule');
    await expect(page.getByText(/demo simulation|mô phỏng demo/i).first()).toBeVisible();
    await expect(page.getByText(/calendar connected|đã kết nối lịch/i)).toHaveCount(0);
  });

  test('does not suggest already-assigned or ineligible mentees as new matches', async ({ page, request }) => {
    await page.goto('/insights');
    await expect(page.getByRole('heading', { level: 1, name: /match suggestions|gợi ý ghép cặp/i })).toBeVisible();

    const accessToken = await apiLogin(request);
    const suffix = Date.now();
    const eligibleResponse = await request.post(`${API_BASE}/mentees`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: `Eligible Match ${suffix}`,
        email: `eligible-match-${suffix}@example.com`,
        track: 'tech',
        interests: ['React'],
      },
    });
    expect(eligibleResponse.ok()).toBeTruthy();
    const eligible = await eligibleResponse.json();
    for (const applicationStatus of ['invited_for_interview', 'interviewed', 'accepted']) {
      const transition = await request.patch(`${API_BASE}/mentees/${eligible._id}/application-status`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { applicationStatus },
      });
      expect(transition.ok()).toBeTruthy();
    }
    const pendingResponse = await request.post(`${API_BASE}/mentees`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: `Pending Match ${suffix}`,
        email: `pending-match-${suffix}@example.com`,
        track: 'tech',
        interests: ['React'],
      },
    });
    expect(pendingResponse.ok()).toBeTruthy();
    const pending = await pendingResponse.json();

    const result = await page.evaluate(async ({ eligibleId, pendingId }) => {
      const [menteeResponse, matchResponse] = await Promise.all([
        fetch('/api/mentees?limit=100'),
        fetch('/api/matching/suggestions?limit=50'),
      ]);
      const menteeBody = await menteeResponse.json();
      const matchBody = await matchResponse.json();
      const mentees = Array.isArray(menteeBody)
        ? menteeBody
        : Array.isArray(menteeBody.data)
          ? menteeBody.data
          : menteeBody.data?.data || [];
      const matches = Array.isArray(matchBody.data) ? matchBody.data : [];
      const assignedIds = new Set(
        mentees.filter((mentee: { mentorId?: string }) => mentee.mentorId).map((mentee: { _id: string }) => mentee._id)
      );
      const eligibleMatches = await fetch(`/api/matching/suggestions?menteeId=${eligibleId}`).then((res) => res.json());
      const pendingMatches = await fetch(`/api/matching/suggestions?menteeId=${pendingId}`).then((res) => res.json());
      return {
        count: matches.length,
        assignedSuggestions: matches.filter((match: { menteeId: string }) => assignedIds.has(match.menteeId)).length,
        eligibleId,
        eligibleCount: Array.isArray(eligibleMatches.data) ? eligibleMatches.data.length : 0,
        eligibleWrongRows: Array.isArray(eligibleMatches.data)
          ? eligibleMatches.data.filter((match: { menteeId: string }) => match.menteeId !== eligibleId).length
          : -1,
        pendingCount: Array.isArray(pendingMatches.data) ? pendingMatches.data.length : -1,
      };
    }, { eligibleId: eligible._id, pendingId: pending._id });

    expect(result.count).toBeGreaterThan(0);
    expect(result.assignedSuggestions).toBe(0);
    expect(result.eligibleId).toBeTruthy();
    expect(result.eligibleCount).toBeGreaterThan(0);
    expect(result.eligibleWrongRows).toBe(0);
    expect(result.pendingCount).toBe(0);
  });

  test('enforces the application interview workflow end to end', async ({ page, request }) => {
    const accessToken = await apiLogin(request);
    const applicantName = `Workflow Applicant ${Date.now()}`;
    const created = await request.post(`${API_BASE}/mentees`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: applicantName,
        email: `workflow-${Date.now()}@example.com`,
        track: 'tech',
        school: 'Workflow School',
        interests: ['Product'],
      },
    });
    expect(created.ok()).toBeTruthy();

    await page.goto('/applications');
    const card = page.locator('article').filter({ hasText: applicantName });
    await expect(card).toBeVisible();
    await expect(card.getByRole('button', { name: /accept|chấp nhận/i })).toHaveCount(0);

    await card.getByRole('button', { name: /invite|mời/i }).click();
    await expect(card.getByText(/invited|đã mời/i).first()).toBeVisible();
    await card.getByRole('button', { name: /mark interviewed|xác nhận đã phỏng vấn/i }).click();
    await expect(card.getByText(/interviewed|đã phỏng vấn/i).first()).toBeVisible();
    await card.getByRole('button', { name: /accept|chấp nhận/i }).click();
    await expect(card.getByText(/accepted|đã nhận|chấp nhận/i).first()).toBeVisible();
  });

  test('shows governed application metrics in analytics', async ({ page }) => {
    await page.goto('/analytics');
    await expect(
      page.getByRole('heading', { name: /application pipeline|phễu tuyển mentee/i })
    ).toBeVisible();
    await expect(page.getByText(/accepted after decision|được nhận sau quyết định/i)).toBeVisible();
  });

  test('dashboard remains readable and touch-friendly on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect
      .poll(() =>
        page.locator('.btn, .mobile-nav-item, .mobile-nav-close').evaluateAll((elements) =>
          elements.filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.height < 44;
          }).length
        )
      )
      .toBe(0);

    const metrics = await page.evaluate(() => {
      const targets = [...document.querySelectorAll<HTMLElement>('.btn, .mobile-nav-item, .mobile-nav-close')]
        .map((element) => ({
          rect: element.getBoundingClientRect(),
          label: element.getAttribute('aria-label') || element.textContent?.trim() || element.className,
        }))
        .filter(({ rect }) => rect.width > 0 && rect.height > 0);
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        undersized: targets.filter(({ rect }) => rect.height < 44).map(({ label, rect }) => ({ label, height: rect.height })),
        consentHeight: document.querySelector<HTMLElement>('.cookie-consent-banner')?.getBoundingClientRect().height || 0,
      };
    });

    expect(metrics.overflow).toBeLessThanOrEqual(1);
    expect(metrics.undersized).toEqual([]);
    expect(metrics.consentHeight).toBeLessThan(240);
  });

  test('dark theme is accessible by name and persists across reloads', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /dark|chế độ tối/i }).first();
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.getByRole('button', { name: /light|chế độ sáng/i }).first()).toBeVisible();
  });

  test('reduces non-essential animation when requested by the user', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const motion = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('*')]
        .map((element) => {
          const style = getComputedStyle(element);
          return {
            animationName: style.animationName,
            animationDuration: parseFloat(style.animationDuration),
            transitionDuration: parseFloat(style.transitionDuration),
          };
        })
        .filter(
          ({ animationName, animationDuration, transitionDuration }) =>
            (animationName !== 'none' && animationDuration > 0.02) || transitionDuration > 0.02
        )
    );

    expect(motion).toEqual([]);
  });

  test('keeps keyboard focus visible within the viewport', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return null;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        tagName: element.tagName,
        visible: rect.width > 0 && rect.height > 0,
        inViewport: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth,
        hasFocusIndicator:
          style.outlineStyle !== 'none' ||
          style.outlineWidth !== '0px' ||
          style.boxShadow !== 'none',
      };
    });

    expect(focused).toEqual(
      expect.objectContaining({
        visible: true,
        inViewport: true,
        hasFocusIndicator: true,
      })
    );
  });
});
