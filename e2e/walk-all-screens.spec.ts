/* Walks every screen in the FULL spine via review mode's jump-to-screen
   picker. Asserts each screen renders without throwing and shows a
   recognisable marker (h1 or the question card stem).

   URL is pinned to ?v=full so this walk is insulated from the
   default-variant flip. SHORT spine coverage lives in walk-all-screens-
   short.spec.ts. */

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
  'interview',
  'submit',
  'thanks',
];

test.describe('walk all 31 screens via review mode (FULL variant)', () => {
  for (const id of SCREEN_IDS) {
    test(`renders ${id}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto(`/?tweaks=1&v=full&s=${id}`);
      await expect(page.locator('#root')).toBeVisible();

      // The App module is loaded by main.tsx via dynamic import (so the
      // failure path of the compat gate doesn't pull in Firebase). That
      // means the headings render shortly after `load`, not at it — use
      // the auto-retrying matcher rather than a snapshot isVisible().
      await expect(page.locator('h1, .q-card__text').first()).toBeVisible({
        timeout: 5_000,
      });

      expect(errors, `${id} threw a runtime error`).toEqual([]);
    });
  }
});
