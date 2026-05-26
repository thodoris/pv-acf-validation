/* Progress + time-left displayed in the TopBar.

   The per-screen numbers are computed from one source of truth (see
   `src/lib/duration.ts`):
   - `DEFAULT_EST_DURATION_MIN` sets the SHORT total; FULL adds a flat extra.
   - `PHASE_WEIGHTS` distributes that total across phases. Within a phase,
     the share is split evenly across the screens visible in that phase
     under the active variant.

   For each visible screen i, `cumulativeWeights[i]` is the sum of weights
   *before* screen i (start-of-screen semantics — the welcome lands on 0%).
   The displayed percent and minutes-left round to integers; cumulative
   weight only grows, so monotonicity holds by construction. */

import { useSessionStore } from '@/state/sessionStore';
import { SCREENS, type Screen, type ScreenId } from './screens';
import { effectiveScreens, getVariant } from '@/content/variants';
import {
  cumulativeWeights,
  phaseFor,
  PHASE_WEIGHTS,
  totalDurationFor,
} from '@/lib/duration';

export type ProgressSnapshot = {
  percent: number;
  minutesLeft: number;
  /** Index in the variant-filtered effective spine. */
  index: number;
  /** Length of the variant-filtered effective spine. */
  total: number;
};

export function progressFor(screenId: ScreenId): ProgressSnapshot {
  const variantId = useSessionStore.getState().variant;
  const variant = getVariant(variantId);
  const spine = effectiveScreens(SCREENS, variant);
  const idx = spine.findIndex((s) => s.id === screenId);
  if (idx === -1) {
    return { percent: 0, minutesLeft: 0, index: -1, total: spine.length };
  }

  // `thanks` is the post-completion confirmation — the questionnaire is
  // already sealed by the time the user lands here. Show the terminal
  // 100% / 0 explicitly rather than the start-of-screen 99% the formula
  // would otherwise produce (the last screen's own share is still ahead).
  if (screenId === 'thanks') {
    return { percent: 100, minutesLeft: 0, index: idx, total: spine.length };
  }

  const totalDuration = totalDurationFor(variantId);
  const totalWeight = totalWeightFor(spine);
  if (totalWeight === 0) {
    return { percent: 0, minutesLeft: totalDuration, index: idx, total: spine.length };
  }

  const cum = cumulativeWeights(spine);
  const share = cum[idx]! / totalWeight;
  const percent = Math.round(100 * share);
  const minutesLeft = Math.round(totalDuration * (1 - share));
  return { percent, minutesLeft, index: idx, total: spine.length };
}

/** Sum of every present phase's weight, in the variant-effective spine.
 *  Equals `sum(PHASE_WEIGHTS[p])` for every phase that has at least one
 *  visible screen — and every phase always has at least one (welcome,
 *  profile, c4-close, submit/thanks are always-on). */
function totalWeightFor(spine: ReadonlyArray<Screen>): number {
  const phasesPresent = new Set(spine.map(phaseFor));
  let sum = 0;
  for (const p of phasesPresent) sum += PHASE_WEIGHTS[p];
  return sum;
}

export function effectiveSpineForCurrentVariant(): Screen[] {
  const variant = getVariant(useSessionStore.getState().variant);
  return effectiveScreens(SCREENS, variant);
}
