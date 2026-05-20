/* Progress + time-left displayed in the TopBar.
   The prototype carries hand-tuned percent and minutes values per screen
   (see SCREENS in routing/screens.ts). We honour those values directly when
   the active variant is FULL.

   For non-FULL variants (e.g. SHORT — not yet populated), we proportionally
   rescale: percent = (index in effective spine) / (effective length - 1) * 100,
   and minutes = the screen's seeded minutesAtStart unweighted. Re-tuning
   short-variant numbers is a content task for whoever populates SHORT. */

import { useSessionStore } from '@/state/sessionStore';
import { SCREENS, type Screen, type ScreenId } from './screens';
import { effectiveScreens, getVariant } from '@/content/variants';

export type ProgressSnapshot = {
  percent: number;
  minutesLeft: number;
  /** Index in the variant-filtered effective spine. */
  index: number;
  /** Length of the variant-filtered effective spine. */
  total: number;
};

export function progressFor(screenId: ScreenId): ProgressSnapshot {
  const variant = getVariant(useSessionStore.getState().variant);
  const spine = effectiveScreens(SCREENS, variant);
  const idx = spine.findIndex((s) => s.id === screenId);
  if (idx === -1) {
    return { percent: 0, minutesLeft: 0, index: -1, total: spine.length };
  }
  const screen = spine[idx]!;

  if (variant.id === 'full') {
    return {
      percent: screen.percentAtStart,
      minutesLeft: screen.minutesAtStart,
      index: idx,
      total: spine.length,
    };
  }

  // Variant other than full — rescale linearly.
  const percent = spine.length <= 1 ? 0 : Math.round((idx / (spine.length - 1)) * 100);
  return {
    percent,
    minutesLeft: screen.minutesAtStart,
    index: idx,
    total: spine.length,
  };
}

export function effectiveSpineForCurrentVariant(): Screen[] {
  const variant = getVariant(useSessionStore.getState().variant);
  return effectiveScreens(SCREENS, variant);
}
