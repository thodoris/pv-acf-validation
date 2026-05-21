/* F1 phase gate — Phase 2 screens are not reachable without Phase 1 (profile
   + grounding) completed. Direct URL access redirects to the first incomplete
   Phase 1 screen. */

import { test, expect } from '@playwright/test';

test.describe('F1 phase gate (without review mode)', () => {
  test.beforeEach(async ({ page }) => {
    // Wipe persisted state so each test starts from a fresh session.
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('?s=c1-setup1 redirects to profile when nothing is complete', async ({ page }) => {
    await page.goto('/?s=c1-setup1');
    // After redirect the URL should carry s=profile (or s=welcome if profile
    // also depends on welcome being completed — but welcome is not in the
    // F1 gate, so the redirect lands on profile).
    await page.waitForURL(/[?&]s=(profile|welcome)/);
    const url = new URL(page.url());
    expect(['profile', 'welcome']).toContain(url.searchParams.get('s'));
  });

  test('?s=c3-ast redirects to first incomplete Phase 1 screen', async ({ page }) => {
    await page.goto('/?s=c3-ast');
    await page.waitForURL(/[?&]s=(profile|g1|g2|welcome)/);
    const url = new URL(page.url());
    expect(['profile', 'g1', 'g2', 'welcome']).toContain(url.searchParams.get('s'));
  });

  test('review mode ?tweaks=1 bypasses the gate', async ({ page }) => {
    await page.goto('/?tweaks=1&s=c3-ast');
    await expect(page.locator('h1')).toContainText('Architecture Selection Tool');
  });
});
