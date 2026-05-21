/* F5 firewall — the AST Explore overlay does not contaminate any store.
   Opening, running, closing the AST leaves answerStore and sessionStore
   unchanged. The <ast-explore> element is removed from the DOM on close. */

import { test, expect } from '@playwright/test';

test.describe('F5 firewall — AST is exploration-only', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('opening + closing the AST overlay leaves stores untouched', async ({ page }) => {
    await page.goto('/?tweaks=1&s=c3-ast');
    await expect(page.locator('h1')).toContainText('Architecture Selection Tool');

    const snapshotBefore = await page.evaluate(() => ({
      session: localStorage.getItem('pvacf:session'),
      answers: localStorage.getItem('pvacf:answers'),
    }));

    // Click "Explore it" — opens the overlay.
    await page.locator('button:has-text("Explore it")').click();
    await expect(page.locator('ast-explore')).toBeAttached();

    // Close via Escape (the AST web component handles Escape internally,
    // dispatching ast:close which the React wrapper handles).
    await page.keyboard.press('Escape');

    // Element removed from DOM.
    await expect(page.locator('ast-explore')).toHaveCount(0);

    // Stores unchanged.
    const snapshotAfter = await page.evaluate(() => ({
      session: localStorage.getItem('pvacf:session'),
      answers: localStorage.getItem('pvacf:answers'),
    }));
    expect(snapshotAfter).toEqual(snapshotBefore);
  });

  test('re-opening the AST creates a fresh instance', async ({ page }) => {
    await page.goto('/?tweaks=1&s=c3-ast');

    await page.locator('button:has-text("Explore it")').click();
    await expect(page.locator('ast-explore')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('ast-explore')).toHaveCount(0);

    await page.locator('button:has-text("Explore it")').click();
    await expect(page.locator('ast-explore')).toHaveCount(1);
  });
});
