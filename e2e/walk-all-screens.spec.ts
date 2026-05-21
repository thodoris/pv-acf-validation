/* Walks every screen in the spine via review mode's jump-to-screen picker.
   Asserts each screen renders without throwing and shows a recognisable
   marker (h1 or the question card stem). */

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
  'c4-setup',
  'c4-close',
  'interview',
  'submit',
  'thanks',
];

test.describe('walk all 32 screens via review mode', () => {
  for (const id of SCREEN_IDS) {
    test(`renders ${id}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto(`/?tweaks=1&s=${id}`);
      await expect(page.locator('#root')).toBeVisible();

      // Every screen has at least one heading or the q-card text node.
      const hasHeading = await page.locator('h1, .q-card__text').first().isVisible();
      expect(hasHeading, `${id} should render an h1 or q-card`).toBe(true);

      expect(errors, `${id} threw a runtime error`).toEqual([]);
    });
  }
});
