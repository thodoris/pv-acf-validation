/* Navigation logic for the linear spine.
   Walks effectiveScreens (variant-filtered), enforces F1 phase gate,
   exposes next() / prev() / jumpTo() for use by screen components. */

import { useSessionStore } from '@/state/sessionStore';
import { SCREENS, getScreen, isPhase1Screen, isPhase2Screen, type Screen, type ScreenId } from './screens';
import { effectiveScreens, getVariant } from '@/content/variants';

export type NavigationResult =
  | { ok: true; screen: Screen }
  | { ok: false; reason: 'unknown' | 'gated'; redirectTo: ScreenId };

/** All Phase 1 screen ids that must be completed before Phase 2 is reachable.
 *  In the current spine: profile + g1 + g2. */
function getPhase1Ids(): ScreenId[] {
  return SCREENS.filter(isPhase1Screen).map((s) => s.id);
}

/** F1 — is Phase 1 (profile + grounding) fully complete? */
export function isPhase1Complete(completed: Set<ScreenId>): boolean {
  return getPhase1Ids().every((id) => completed.has(id));
}

/** First not-yet-complete Phase 1 screen, or null if Phase 1 is complete. */
export function firstIncompletePhase1(completed: Set<ScreenId>): ScreenId | null {
  for (const id of getPhase1Ids()) {
    if (!completed.has(id)) return id;
  }
  return null;
}

/** Resolves a candidate screen id against the F1 gate. Returns a verdict the
 *  router can act on. Pure — no store mutation. */
export function resolveNavigation(
  candidate: ScreenId,
  completed: Set<ScreenId>,
): NavigationResult {
  const screen = getScreen(candidate);
  if (!screen) return { ok: false, reason: 'unknown', redirectTo: 'welcome' };

  // Welcome is always reachable. Phase 1 screens are always reachable. Phase 2
  // requires Phase 1 complete.
  if (isPhase2Screen(screen) && !isPhase1Complete(completed)) {
    const next = firstIncompletePhase1(completed);
    return { ok: false, reason: 'gated', redirectTo: next ?? 'welcome' };
  }

  return { ok: true, screen };
}

/** Returns the index of `id` within the variant-filtered effective spine.
 *  Returns -1 if the screen is hidden by the current variant. */
function effectiveIndex(id: ScreenId, completed: Set<ScreenId>): {
  index: number;
  spine: Screen[];
} {
  const variant = getVariant(useSessionStore.getState().variant);
  const spine = effectiveScreens(SCREENS, variant);
  // If the candidate is hidden by the variant, treat it as not in the spine —
  // resolveNavigation in the URL-sync layer will redirect to welcome.
  const index = spine.findIndex((s) => s.id === id);
  return { index, spine };
  void completed;
}

/** Move forward one screen along the variant-filtered spine. Marks current
 *  screen as complete. Honours F1 implicitly (Phase 1 ids come before Phase 2
 *  in SCREENS, so completing them in order satisfies the gate). */
export function next(): void {
  const { currentScreenId, completedScreens, markComplete, setScreen } =
    useSessionStore.getState();
  markComplete(currentScreenId);
  const { index, spine } = effectiveIndex(currentScreenId, completedScreens);
  if (index === -1 || index >= spine.length - 1) return;
  const nextScreen = spine[index + 1]!;
  setScreen(nextScreen.id);
}

/** Move back one screen. Does NOT un-mark completion (locked answers stay
 *  locked). */
export function prev(): void {
  const { currentScreenId, setScreen, completedScreens } = useSessionStore.getState();
  const { index, spine } = effectiveIndex(currentScreenId, completedScreens);
  if (index <= 0) return;
  const prevScreen = spine[index - 1]!;
  setScreen(prevScreen.id);
}

/** Jump to an arbitrary screen, subject to F1 gate. Returns the resolved
 *  result so callers can decide whether to redirect. Used by the URL sync
 *  layer and the dev-only Tweaks panel. */
export function jumpTo(candidate: ScreenId): NavigationResult {
  const { completedScreens, setScreen } = useSessionStore.getState();
  const result = resolveNavigation(candidate, completedScreens);
  if (result.ok) {
    setScreen(result.screen.id);
  } else {
    setScreen(result.redirectTo);
  }
  return result;
}
