/* The 34-screen spine.
   Carried over from docs/reference-prototype/app.jsx (SCREENS array).
   Field shape matches the prototype; only the types are new.

   Note: the bundle brief claims a 34-screen spine; the prototype's actual count
   is 32. The prototype wins (per user brief §2). Documented in
   docs/SOURCE_OF_TRUTH.md. */

import { CONTENT } from '@/content';
import type { ClusterId, StepId } from '@/content';

export type ScreenId = string;

/* Kind drives ScreenRouter dispatch. One kind per template component. */
export type ScreenKind =
  | 'welcome'
  | 'profile'
  | 'orient-1'
  | 'orient-2'
  | 'problem-setup-1'
  | 'problem-setup-2'
  | 'framework-setup-1'
  | 'framework-setup-2'
  | 'instruments-setup-1'
  | 'instruments-setup-2'
  | 'cluster-setup'
  | 'question'
  | 'paired'
  | 'close-pair'
  | 'instrument'
  | 'interview'
  | 'submit'
  | 'thanks';

export type Screen = {
  id: ScreenId;
  stepId: StepId | null;
  location: string;
  kind: ScreenKind;
  hasShell?: boolean;
  advanceLabel?: string;
  clusterId?: ClusterId;
  /** Percent shown on the top bar at the start of this screen. Hand-tuned by
   *  the prototype to reflect uneven effort per screen. Carried verbatim. */
  percentAtStart: number;
  /** Time-left in minutes shown on the top bar at the start of this screen.
   *  Hand-tuned by the prototype; carried verbatim. */
  minutesAtStart: number;
};

const locationFromQ = (id: string) => {
  const q = CONTENT.questions[id];
  if (!q) return id;
  return `${q.kicker} · ${q.chapter}`;
};

export const SCREENS: Screen[] = [
  // ---------- Pre-instrument ----------
  {
    id: 'welcome',
    stepId: null,
    location: 'Welcome',
    hasShell: false,
    kind: 'welcome',
    percentAtStart: 0,
    minutesAtStart: 50,
  },

  // ---------- Profile ----------
  {
    id: 'profile',
    stepId: 'profile',
    location: 'Profile · A few details about you',
    kind: 'profile',
    percentAtStart: 2,
    minutesAtStart: 49,
  },

  // ---------- Grounding · 2 screens ----------
  {
    id: 'g1',
    stepId: 'grounding',
    location: `Grounding · 1 of 2 · ${CONTENT.grounding[0]!.title}`,
    kind: 'orient-1',
    percentAtStart: 6,
    minutesAtStart: 48,
  },
  {
    id: 'g2',
    stepId: 'grounding',
    location: `Grounding · 2 of 2 · ${CONTENT.grounding[1]!.title}`,
    kind: 'orient-2',
    percentAtStart: 14,
    minutesAtStart: 46,
  },

  // ---------- Cluster 1 · Problem ----------
  {
    id: 'c1-setup1',
    stepId: 'problem',
    location: 'Problem · Introductory setup · 1 of 2',
    kind: 'problem-setup-1',
    advanceLabel: 'Continue',
    percentAtStart: 21,
    minutesAtStart: 42,
  },
  {
    id: 'c1-setup2',
    stepId: 'problem',
    location: 'Problem · Introductory setup · 2 of 2',
    kind: 'problem-setup-2',
    advanceLabel: 'Begin the problem',
    percentAtStart: 23,
    minutesAtStart: 42,
  },
  ...(['c1-q1', 'c1-q2', 'c1-q3q4', 'c1-q5', 'c1-q6', 'c1-q7', 'c1-q8'] as const).map(
    (id, i): Screen => ({
      id,
      stepId: 'problem',
      location: locationFromQ(id),
      kind: id === 'c1-q3q4' ? 'paired' : 'question',
      percentAtStart: [25, 28, 32, 36, 40, 43, 47][i]!,
      minutesAtStart: [41, 39, 37, 34, 32, 31, 28][i]!,
    }),
  ),

  // ---------- Cluster 2 · Framework (6 questions; prototype skipped c2-q5, we renumbered to a dense c2-q1…c2-q6 — see SOURCE_OF_TRUTH row 10) ----------
  {
    id: 'c2-setup1',
    stepId: 'framework',
    location: 'Framework · Introductory setup · 1 of 2',
    kind: 'framework-setup-1',
    advanceLabel: 'Continue',
    percentAtStart: 49,
    minutesAtStart: 27,
  },
  {
    id: 'c2-setup2',
    stepId: 'framework',
    location: 'Framework · Introductory setup · 2 of 2',
    kind: 'framework-setup-2',
    advanceLabel: 'Begin the framework',
    percentAtStart: 51,
    minutesAtStart: 27,
  },
  ...(['c2-q1', 'c2-q2', 'c2-q3', 'c2-q4', 'c2-q5', 'c2-q6'] as const).map(
    (id, i): Screen => ({
      id,
      stepId: 'framework',
      location: locationFromQ(id),
      kind: 'question',
      percentAtStart: [53, 57, 61, 65, 72, 76][i]!,
      minutesAtStart: [26, 23, 21, 19, 14, 12][i]!,
    }),
  ),

  // ---------- Cluster 3 · Instruments ----------
  {
    id: 'c3-setup1',
    stepId: 'instruments',
    location: 'Instruments · Introductory setup · 1 of 2',
    kind: 'instruments-setup-1',
    advanceLabel: 'Continue',
    percentAtStart: 78,
    minutesAtStart: 10,
  },
  {
    id: 'c3-setup2',
    stepId: 'instruments',
    location: 'Instruments · Introductory setup · 2 of 2',
    kind: 'instruments-setup-2',
    advanceLabel: 'Begin the instruments',
    percentAtStart: 80,
    minutesAtStart: 10,
  },
  ...CONTENT.instruments.map(
    (inst, i): Screen => ({
      id: inst.id,
      stepId: 'instruments',
      location: `Instruments · ${inst.slot} of 4 · ${inst.code} ${inst.title}`,
      kind: 'instrument',
      percentAtStart: [82, 86, 90, 93][i]!,
      minutesAtStart: [9, 7, 4, 2][i]!,
    }),
  ),

  // ---------- Cluster 4 · Close ----------
  {
    id: 'c4-setup',
    stepId: 'close',
    location: 'Close · One last invitation',
    kind: 'cluster-setup',
    clusterId: 'close',
    percentAtStart: 95,
    minutesAtStart: 2,
  },
  {
    id: 'c4-close',
    stepId: 'close',
    location: 'Close · Q4.1 + Q4.2 · Catch-all',
    kind: 'close-pair',
    percentAtStart: 98,
    minutesAtStart: 1,
  },

  // ---------- Post-spine ----------
  {
    id: 'interview',
    stepId: 'close',
    location: 'Optional follow-up · Interview willingness',
    kind: 'interview',
    percentAtStart: 99,
    minutesAtStart: 1,
  },
  {
    id: 'submit',
    stepId: 'close',
    location: 'Submit · Review and confirm',
    kind: 'submit',
    percentAtStart: 99,
    minutesAtStart: 1,
  },
  {
    id: 'thanks',
    stepId: null,
    location: 'Complete · Thank you',
    hasShell: false,
    kind: 'thanks',
    percentAtStart: 100,
    minutesAtStart: 0,
  },
];

export const SCREEN_INDEX_BY_ID: Map<ScreenId, number> = new Map(
  SCREENS.map((s, i) => [s.id, i]),
);

export function getScreen(id: ScreenId): Screen | undefined {
  const idx = SCREEN_INDEX_BY_ID.get(id);
  return idx === undefined ? undefined : SCREENS[idx];
}

export function requireScreen(id: ScreenId): Screen {
  const s = getScreen(id);
  if (!s) throw new Error(`Unknown screen id: ${id}`);
  return s;
}

/** Screens that any variant must always include. SHORT cannot hide these. */
export const ALWAYS_ON_SCREENS: ReadonlySet<ScreenId> = new Set([
  'welcome',
  'profile',
  'submit',
  'thanks',
]);

/** Screens that lock answers when advanced past (used by F1 phase gate). */
export function isPhase2Screen(s: Screen): boolean {
  return s.stepId === 'problem' || s.stepId === 'framework' || s.stepId === 'instruments' || s.stepId === 'close';
}

/** Screens belonging to Phase 1 (profile + grounding). F1 requires these
 *  completed before any Phase 2 screen is reachable. */
export function isPhase1Screen(s: Screen): boolean {
  return s.stepId === 'profile' || s.stepId === 'grounding';
}
