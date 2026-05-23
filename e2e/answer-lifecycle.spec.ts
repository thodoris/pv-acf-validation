/* Answer lifecycle — answers are editable across visits up to submission;
   after submission the App-level guard short-circuits every screen request
   to the terminal screen and offers a reset path. See ADR 0009. */

import { test, expect } from '@playwright/test';

test.describe('answer lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('first save locks in a value; Back lets the reviewer edit and re-save', async ({ page }) => {
    // Jump directly to c1-q1 in review mode (skips F1 + skips required-field
    // validation; over-length is still a hard blocker and answers still save).
    await page.goto('/?tweaks=1&s=c1-q1');
    await expect(page.locator('.q-card__text')).toBeVisible();

    // First pass: pick the third rating, type into the open response.
    const pills = page.locator('.rating-pill');
    await pills.nth(2).click();
    const textarea = page.locator('textarea').first();
    await textarea.fill('first answer');

    // Continue — saves the answer and advances.
    await page.locator('button:has-text("Continue")').first().click();
    await page.waitForURL(/[?&]s=c1-q2/);

    // Go back. Fields must be editable — no Locked banner, pills are NOT
    // disabled, the textarea is NOT disabled.
    await page.locator('button:has-text("Back")').first().click();
    await page.waitForURL(/[?&]s=c1-q1/);

    await expect(page.getByText('Locked.', { exact: true })).toHaveCount(0);
    await expect(pills.first()).toBeEnabled();
    await expect(textarea).toBeEnabled();

    // Pre-filled state: the previously-chosen pill is still selected, the
    // textarea still carries the prior value.
    await expect(pills.nth(2)).toHaveClass(/is-selected/);
    await expect(textarea).toHaveValue('first answer');

    // Edit: change the rating, replace the open response.
    await pills.nth(4).click();
    await textarea.fill('revised answer');

    // Continue again — overwrites the previous save.
    await page.locator('button:has-text("Continue")').first().click();
    await page.waitForURL(/[?&]s=c1-q2/);

    // Verify the localStorage value reflects the LATEST write.
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('pvacf:answers');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        state: { answers: Record<string, { value: unknown }> };
      };
      return parsed.state.answers['c1-q1']?.value ?? null;
    });
    expect(stored).toMatchObject({
      type: 'rating-and-open',
      open: 'revised answer',
    });
  });

  test('second lockAnswer overwrites in-store; lockedAt advances', async ({ page }) => {
    await page.goto('/?tweaks=1&s=c1-q1');
    await page.locator('.rating-pill').first().click();
    await page.locator('button:has-text("Continue")').first().click();
    await page.waitForURL(/[?&]s=c1-q2/);

    const first = await page.evaluate(() => {
      const raw = localStorage.getItem('pvacf:answers');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        state: { answers: Record<string, { lockedAt: number; value: unknown }> };
      };
      return parsed.state.answers['c1-q1'] ?? null;
    });
    expect(first).not.toBeNull();

    // Small wait so the second lockedAt is strictly greater.
    await page.waitForTimeout(20);

    // Go back, change the rating, Continue again.
    await page.locator('button:has-text("Back")').first().click();
    await page.waitForURL(/[?&]s=c1-q1/);
    await page.locator('.rating-pill').nth(3).click();
    await page.locator('button:has-text("Continue")').first().click();
    await page.waitForURL(/[?&]s=c1-q2/);

    const second = await page.evaluate(() => {
      const raw = localStorage.getItem('pvacf:answers');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        state: { answers: Record<string, { lockedAt: number; value: unknown }> };
      };
      return parsed.state.answers['c1-q1'] ?? null;
    });
    expect(second).not.toBeNull();
    expect(second!.lockedAt).toBeGreaterThan(first!.lockedAt);
    expect(second!.value).not.toEqual(first!.value);
  });
});

test.describe('post-submit terminal state', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('navigating to a question screen after submit short-circuits to the terminal', async ({ page }) => {
    // Simulate a submitted state directly: write the persisted shape
    // localStorage would carry after a successful seal. This avoids
    // depending on a live Firestore round-trip in the e2e suite.
    await page.goto('/');
    await page.evaluate(() => {
      const session = {
        state: {
          currentScreenId: 'thanks',
          completedScreensList: [],
          profile: null,
          consent: { acknowledged: true, acknowledgedAt: Date.now(), version: '1.0' },
          variant: 'full',
          sessionStartedAt: Date.now() - 60_000,
          interview: null,
          acknowledgeListing: false,
          submittedAt: Date.now(),
          sealedDocId: 'TEST_DOC_ID',
        },
        version: 1,
      };
      localStorage.setItem('pvacf:session', JSON.stringify(session));
    });

    // Even with explicit ?s=c1-q1, the App guard returns the terminal.
    await page.goto('/?s=c1-q1');
    await expect(page.getByText('Thank you for your review.')).toBeVisible();
    await expect(page.getByText('Start a new session')).toBeVisible();
    // No question card should be on the page.
    await expect(page.locator('.q-card__text')).toHaveCount(0);
  });
});

test.describe('SHORT-variant recovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('bare `/` after a SHORT session preserves the persisted variant', async ({ page }) => {
    // First visit pins the SHORT variant via URL.
    await page.goto('/?v=short&tweaks=1&s=c1-q1');
    await expect(page.locator('.q-card__text')).toBeVisible();
    // sanity: store records SHORT.
    const variantAfterFirstVisit = await page.evaluate(() => {
      const raw = localStorage.getItem('pvacf:session');
      if (!raw) return null;
      return (JSON.parse(raw) as { state: { variant: string } }).state.variant;
    });
    expect(variantAfterFirstVisit).toBe('short');

    // Return at bare `/` (no v= param). Persisted variant should win and
    // the URL should be rewritten to carry `v=short` again.
    await page.goto('/');
    await page.waitForURL(/[?&]v=short/);
    const variantAfterReturn = await page.evaluate(() => {
      const raw = localStorage.getItem('pvacf:session');
      if (!raw) return null;
      return (JSON.parse(raw) as { state: { variant: string } }).state.variant;
    });
    expect(variantAfterReturn).toBe('short');
  });

  test('explicit `/?v=full` overrides a persisted SHORT variant', async ({ page }) => {
    // Persist SHORT first.
    await page.goto('/?v=short&tweaks=1');
    await page.evaluate(() => {
      // sanity-check persisted state present
      return localStorage.getItem('pvacf:session');
    });

    // Explicit ?v=full must override.
    await page.goto('/?v=full');
    const variant = await page.evaluate(() => {
      const raw = localStorage.getItem('pvacf:session');
      if (!raw) return null;
      return (JSON.parse(raw) as { state: { variant: string } }).state.variant;
    });
    expect(variant).toBe('full');
  });
});
