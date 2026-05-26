/* Walks every screen in the SHORT spine via review mode's jump-to-screen
   picker. The SHORT spine excludes 'interview' but is otherwise identical
   to FULL — the per-field SHORT changes (c3 q2 hidden, shared open optional)
   are exercised by unit tests, not by this top-level walk.

   URL is pinned to ?v=short so the walk is variant-stable. */

import { test, expect } from '@playwright/test';

const SCREEN_IDS = [
  'welcome',
  'profile',
  'g1',
  'g2',
  'c1-setup1',
  'c1-setup2',
  'c1-q1',
  'c1-q2',
  'c1-q3q4',
  'c1-q5',
  'c1-q6',
  'c1-q7',
  'c1-q8',
  'c2-setup1',
  'c2-setup2',
  'c2-q1',
  'c2-q2',
  'c2-q3',
  'c2-q4',
  'c2-q5',
  'c2-q6',
  'c3-setup1',
  'c3-setup2',
  'c3-ciw',
  'c3-ast',
  'c3-dma',
  'c3-cpd',
  'c4-close',
  // 'interview' hidden under SHORT — see variants.ts.
  'submit',
  'thanks',
];

test.describe('walk all 30 screens via review mode (SHORT variant)', () => {
  for (const id of SCREEN_IDS) {
    test(`renders ${id}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto(`/?tweaks=1&v=short&s=${id}`);
      await expect(page.locator('#root')).toBeVisible();

      // App is dynamically imported (compat-gate architecture). Use the
      // auto-retrying matcher so the test waits for the chunk to render.
      await expect(page.locator('h1, .q-card__text').first()).toBeVisible({
        timeout: 5_000,
      });

      expect(errors, `${id} threw a runtime error`).toEqual([]);
    });
  }
});
