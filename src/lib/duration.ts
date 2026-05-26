/* Single source of truth for the questionnaire's estimated duration and the
   per-screen progress + time-left math.

   The numbers a reviewer sees in three places — the welcome screen's "X–Y
   minutes" string, the top-bar percent + minutes-left, and the welcome
   meta-card's per-cluster time bar — all derive from the constants here.

   Design rules (see ADR 0012):
   - `DEFAULT_EST_DURATION_MIN` is the SHORT-variant total in whole minutes.
   - FULL adds `FULL_VARIANT_EXTRA_MIN` flat — no per-screen attribution.
   - Welcome's "X–Y" span is `[total, total + WELCOME_SPAN_OFFSET_MIN]`.
   - `PHASE_WEIGHTS` is the only place per-phase effort lives. Per-screen
     percent + minutes-left are computed by walking the variant-effective
     spine, dividing each phase's weight evenly across the visible screens
     in that phase, and reading off cumulative weight share.
   - All user-facing numbers round to integer at the display boundary. */

import { CONTENT } from '@/content';
import { isPairedQuestion } from '@/content/types';
import { effectiveScreens, getVariant, type VariantId } from '@/content/variants';
import { SCREENS, type Screen } from '@/routing/screens';

export const DEFAULT_EST_DURATION_MIN = 30;
// FULL is held at 45 minutes (welcome span 45–50) by bumping the extra
// from 10 to 15 when SHORT was retuned from 35 to 30. Keeps FULL's
// estimate stable across the SHORT recalibration.
export const FULL_VARIANT_EXTRA_MIN = 15;
export const WELCOME_SPAN_OFFSET_MIN = 5;

export type PhaseId =
  | 'pre'
  | 'profile'
  | 'grounding'
  | 'problem'
  | 'framework'
  | 'instruments'
  | 'close'
  | 'post';

/** Integer effort weights per phase. The total duration is distributed
 *  across phases by these shares; FULL and SHORT use the same shape and
 *  only scale the absolute minutes.
 *
 *  `close = 3` reflects that the close phase is a single screen (c4-close)
 *  after ADR 0011 merged c4-setup into it. The original `close = 5`
 *  budgeted two screens; without rebalancing, c4-close ate ~10% of the
 *  progress bar on its own — visibly disproportionate to a screen with
 *  one required catch-all and one optional flag. See ADR 0013. */
export const PHASE_WEIGHTS: Record<PhaseId, number> = {
  pre: 1,
  profile: 1,
  grounding: 3,
  problem: 10,
  framework: 15,
  instruments: 15,
  close: 3,
  post: 1,
};

/** The five phases surfaced on the welcome meta-card's time bar, in render
 *  order. Profile / pre / post sit below the meaningful work and are not
 *  charted. */
export const TIMEBAR_PHASES: ReadonlyArray<{
  phase: PhaseId;
  label: string;
  varToken: string;
}> = [
  { phase: 'grounding', label: 'Grounding', varToken: 'var(--ink-mute)' },
  { phase: 'problem', label: 'Problem', varToken: 'var(--coral)' },
  { phase: 'framework', label: 'Framework', varToken: 'var(--cobalt)' },
  { phase: 'instruments', label: 'Instruments', varToken: 'var(--sage)' },
  { phase: 'close', label: 'Close', varToken: 'var(--saffron)' },
];

// ---------------------------------------------------------------------------
// Variant-aware totals
// ---------------------------------------------------------------------------

export function totalDurationFor(variant: VariantId): number {
  return variant === 'full'
    ? DEFAULT_EST_DURATION_MIN + FULL_VARIANT_EXTRA_MIN
    : DEFAULT_EST_DURATION_MIN;
}

export function durationRangeFor(variant: VariantId): { low: number; high: number } {
  const low = totalDurationFor(variant);
  return { low, high: low + WELCOME_SPAN_OFFSET_MIN };
}

export function formatDurationRange(variant: VariantId): string {
  const { low, high } = durationRangeFor(variant);
  return `${low}–${high} minutes`;
}

/** Absolute minutes attributed to one phase under the active variant.
 *  Used by the welcome time-bar tooltips. */
export function phaseMinutesFor(phase: PhaseId, variant: VariantId): number {
  const total = totalDurationFor(variant);
  return Math.round((PHASE_WEIGHTS[phase] / sumWeights()) * total);
}

function sumWeights(): number {
  return Object.values(PHASE_WEIGHTS).reduce((a, b) => a + b, 0);
}

// ---------------------------------------------------------------------------
// Per-screen progress math
// ---------------------------------------------------------------------------

/** Map a Screen to its phase. The `close` stepId covers c4-close, interview,
 *  submit, and thanks; only c4-close carries the cluster's effort weight,
 *  so the post-close tail screens fall into `'post'`. */
export function phaseFor(screen: Screen): PhaseId {
  if (screen.id === 'welcome') return 'pre';
  if (screen.id === 'c4-close') return 'close';
  if (screen.stepId === 'profile') return 'profile';
  if (screen.stepId === 'grounding') return 'grounding';
  if (screen.stepId === 'problem') return 'problem';
  if (screen.stepId === 'framework') return 'framework';
  if (screen.stepId === 'instruments') return 'instruments';
  return 'post';
}

/** Cumulative weight at the START of each screen in the spine, in the same
 *  order as the input array. Weight per screen is `phaseWeight / visibleScreensInPhase`,
 *  so a phase keeps its full share regardless of how many of its screens are
 *  hidden under the active variant. */
export function cumulativeWeights(spine: ReadonlyArray<Screen>): number[] {
  const phaseScreenCounts = new Map<PhaseId, number>();
  for (const s of spine) {
    const p = phaseFor(s);
    phaseScreenCounts.set(p, (phaseScreenCounts.get(p) ?? 0) + 1);
  }
  const cum: number[] = [];
  let running = 0;
  for (const s of spine) {
    cum.push(running);
    const p = phaseFor(s);
    const screensInPhase = phaseScreenCounts.get(p) ?? 1;
    running += PHASE_WEIGHTS[p] / screensInPhase;
  }
  return cum;
}

// ---------------------------------------------------------------------------
// Question counting (welcome meta card)
// ---------------------------------------------------------------------------

export type QuestionTally = { required: number; optional: number };

/** Counts evaluation questions visible under the variant. Paired wrappers
 *  contribute one per sub-question; instrument screens contribute Q1
 *  (always) plus Q2 (only if visible under the variant); c4-q1 counts as
 *  required, c4-q2 as the single optional in the spine. */
export function effectiveQuestionCount(variant: VariantId): QuestionTally {
  const v = getVariant(variant);
  const visible = effectiveScreens(SCREENS, v);
  let required = 0;
  let optional = 0;
  for (const screen of visible) {
    if (screen.id === 'c4-close') {
      required += 1;
      optional += 1;
      continue;
    }
    if (screen.kind === 'instrument') {
      const q2Hidden = (v.hiddenFields?.[screen.id] ?? []).includes('q2');
      required += q2Hidden ? 1 : 2;
      continue;
    }
    const q = CONTENT.questions[screen.id];
    if (!q) continue;
    if (isPairedQuestion(q)) {
      required += q.questions.length;
    } else {
      required += 1;
    }
  }
  return { required, optional };
}

/** Welcome-meta-card display: under SHORT just the integer total, under FULL
 *  split into "X + Y optional" so the optional Q4.2 stays surfaced. Mirrors
 *  the previous hand-coded copy ("20" vs. "24 + 1 optional") in shape. */
export function formatQuestionCount(variant: VariantId): string {
  const { required, optional } = effectiveQuestionCount(variant);
  if (variant === 'full') {
    return optional > 0 ? `${required} + ${optional} optional` : `${required}`;
  }
  return `${required + optional}`;
}
