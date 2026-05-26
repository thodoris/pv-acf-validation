/* The 31-screen spine.
   Carried over from docs/reference-prototype/app.jsx (SCREENS array).
   Field shape matches the prototype; only the types are new.

   Note: the bundle brief claims a 34-screen spine; the prototype's actual count
   was 32 and the implementation now ships 31 (c4-setup was merged into
   c4-close, ADR 0011). The prototype wins on shape (per user brief §2);
   merge-driven divergences are logged in docs/SOURCE_OF_TRUTH.md.

   Per-screen progress (top-bar percent + minutes-left) is derived from
   `src/lib/duration.ts` at render time — no `percentAtStart` /
   `minutesAtStart` fields here (ADR 0012). */

import { CONTENT } from '@/content';
import type { StepId } from '@/content';

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
  },

  // ---------- Profile ----------
  {
    id: 'profile',
    stepId: 'profile',
    location: 'Profile · A few details about you',
    kind: 'profile',
  },

  // ---------- Grounding · 2 screens ----------
  {
    id: 'g1',
    stepId: 'grounding',
    location: `Grounding · 1 of 2 · ${CONTENT.grounding[0]!.title}`,
    kind: 'orient-1',
  },
  {
    id: 'g2',
    stepId: 'grounding',
    location: `Grounding · 2 of 2 · ${CONTENT.grounding[1]!.title}`,
    kind: 'orient-2',
  },

  // ---------- Cluster 1 · Problem ----------
  {
    id: 'c1-setup1',
    stepId: 'problem',
    location: 'Problem · Introductory setup · 1 of 2',
    kind: 'problem-setup-1',
    advanceLabel: 'Continue',
  },
  {
    id: 'c1-setup2',
    stepId: 'problem',
    location: 'Problem · Introductory setup · 2 of 2',
    kind: 'problem-setup-2',
    advanceLabel: 'Begin the problem',
  },
  ...(['c1-q1', 'c1-q2', 'c1-q3q4', 'c1-q5', 'c1-q6', 'c1-q7', 'c1-q8'] as const).map(
    (id): Screen => ({
      id,
      stepId: 'problem',
      location: locationFromQ(id),
      kind: id === 'c1-q3q4' ? 'paired' : 'question',
    }),
  ),

  // ---------- Cluster 2 · Framework (6 questions; prototype skipped c2-q5, we renumbered to a dense c2-q1…c2-q6 — see SOURCE_OF_TRUTH row 10) ----------
  {
    id: 'c2-setup1',
    stepId: 'framework',
    location: 'Framework · Introductory setup · 1 of 2',
    kind: 'framework-setup-1',
    advanceLabel: 'Continue',
  },
  {
    id: 'c2-setup2',
    stepId: 'framework',
    location: 'Framework · Introductory setup · 2 of 2',
    kind: 'framework-setup-2',
    advanceLabel: 'Begin the framework',
  },
  ...(['c2-q1', 'c2-q2', 'c2-q3', 'c2-q4', 'c2-q5', 'c2-q6'] as const).map(
    (id): Screen => ({
      id,
      stepId: 'framework',
      location: locationFromQ(id),
      kind: 'question',
    }),
  ),

  // ---------- Cluster 3 · Instruments ----------
  {
    id: 'c3-setup1',
    stepId: 'instruments',
    location: 'Instruments · Introductory setup · 1 of 2',
    kind: 'instruments-setup-1',
    advanceLabel: 'Continue',
  },
  {
    id: 'c3-setup2',
    stepId: 'instruments',
    location: 'Instruments · Introductory setup · 2 of 2',
    kind: 'instruments-setup-2',
    advanceLabel: 'Begin the instruments',
  },
  ...CONTENT.instruments.map(
    (inst): Screen => ({
      id: inst.id,
      stepId: 'instruments',
      location: `Instruments · ${inst.slot} of 4 · ${inst.code} ${inst.title}`,
      kind: 'instrument',
    }),
  ),

  // ---------- Cluster 4 · Close (single screen; c4-setup was merged in — ADR 0011) ----------
  {
    id: 'c4-close',
    stepId: 'close',
    location: 'Close · Q4.1 + Q4.2 · Catch-all',
    kind: 'close-pair',
  },

  // ---------- Post-spine ----------
  {
    id: 'interview',
    stepId: 'close',
    location: 'Optional follow-up · Interview willingness',
    kind: 'interview',
  },
  {
    id: 'submit',
    stepId: 'close',
    location: 'Submit · Review and confirm',
    kind: 'submit',
  },
  {
    id: 'thanks',
    stepId: null,
    location: 'Complete · Thank you',
    hasShell: false,
    kind: 'thanks',
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
