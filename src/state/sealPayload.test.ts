import { beforeEach, describe, expect, it } from 'vitest';
import { normalizeForVariantInvariance } from './sealPayload';
import type { AnswerValue, LockedAnswer } from './answerStore';
import type { QuestionId } from '@/content';
import type { VariantConfig } from '@/content/variants';
import { VARIANTS } from '@/content/variants';

/* sealPayload tests focus on the variant-invariance contract: every
   submission must carry the same field set, with hidden fields
   represented as `null` rather than omitted. The downstream analysis
   pipeline relies on this so it can consume SHORT and FULL rows under
   one schema without per-variant branching.

   The tests target `normalizeForVariantInvariance` directly with a
   fixture SHORT config — the production `short` variant is populated
   in a later commit, but the architecture is exercised here against
   the same shape it will use. */

const SUBMIT_TS = 1_700_000_000_000;

const SHORT_FIXTURE: VariantConfig = {
  id: 'short',
  label: 'short fixture for tests',
  hiddenScreens: ['interview'],
  hiddenFields: {
    'c3-ciw': ['q2'],
    'c3-ast': ['q2'],
    'c3-dma': ['q2'],
    'c3-cpd': ['q2'],
  },
  requiredOverrides: {
    'c3-ciw': { open: false },
    'c3-ast': { open: false },
    'c3-dma': { open: false },
    'c3-cpd': { open: false },
  },
};

function lock(value: AnswerValue, screenId: string): LockedAnswer {
  return {
    questionId: screenId as QuestionId,
    value,
    lockedAt: SUBMIT_TS - 1000,
    screenId: screenId as never,
  };
}

function fullAnswers(): Record<QuestionId, LockedAnswer> {
  const out: Record<string, LockedAnswer> = {};
  for (const screenId of ['c3-ciw', 'c3-ast', 'c3-dma', 'c3-cpd']) {
    out[screenId] = lock(
      { type: 'instrument', q1Rating: '1', q2Rating: '2', sharedOpen: 'thought' },
      screenId,
    );
  }
  out.interview = lock(
    {
      type: 'interview',
      data: { willingness: 'yes', window: ['mon'], contact: 'a@b.c' },
    },
    'interview',
  );
  return out as Record<QuestionId, LockedAnswer>;
}

function shortAnswers(): Record<QuestionId, LockedAnswer> {
  const out: Record<string, LockedAnswer> = {};
  // SHORT renderer omits q2Rating in the lock value and leaves sharedOpen blank
  // (the field is rendered but optional).
  for (const screenId of ['c3-ciw', 'c3-ast', 'c3-dma', 'c3-cpd']) {
    out[screenId] = lock(
      { type: 'instrument', q1Rating: '1', sharedOpen: '' },
      screenId,
    );
  }
  // No interview answer — the screen was hidden.
  return out as Record<QuestionId, LockedAnswer>;
}

describe('normalizeForVariantInvariance', () => {
  beforeEach(() => {
    // No globals to reset — the function is pure.
  });

  it('FULL variant passes raw answers through unchanged', () => {
    const raw = fullAnswers();
    const out = normalizeForVariantInvariance(raw, VARIANTS.full, SUBMIT_TS);
    // No structural changes: same keys, same values.
    expect(Object.keys(out).sort()).toEqual(Object.keys(raw).sort());
    for (const id of Object.keys(raw)) {
      expect(out[id as QuestionId]).toEqual(raw[id as QuestionId]);
    }
  });

  it('SHORT injects a null-filled c1-q7 stub when the screen is hidden', () => {
    const SHORT_HIDES_C1Q7: VariantConfig = {
      id: 'short',
      label: 'short fixture',
      hiddenScreens: ['c1-q7'],
    };
    const out = normalizeForVariantInvariance({}, SHORT_HIDES_C1Q7, SUBMIT_TS);
    const c1q7 = out['c1-q7' as QuestionId] as LockedAnswer | undefined;
    expect(c1q7).toBeDefined();
    expect(c1q7!.value.type).toBe('rating-and-open');
    if (c1q7!.value.type !== 'rating-and-open') throw new Error('typecheck');
    expect(c1q7!.value.rating).toBeNull();
    expect(c1q7!.value.open).toBe('');
    expect(c1q7!.lockedAt).toBe(SUBMIT_TS);
  });

  it('SHORT injects a null-filled interview stub when the screen is hidden', () => {
    const out = normalizeForVariantInvariance(shortAnswers(), SHORT_FIXTURE, SUBMIT_TS);
    const interview = out.interview as LockedAnswer;
    expect(interview).toBeDefined();
    expect(interview.value.type).toBe('interview');
    if (interview.value.type !== 'interview') throw new Error('typecheck');
    expect(interview.value.data).toEqual({
      willingness: null,
      window: null,
      contact: null,
    });
    expect(interview.lockedAt).toBe(SUBMIT_TS);
  });

  it('SHORT coerces hidden instrument q2Rating to null on existing answers', () => {
    const out = normalizeForVariantInvariance(shortAnswers(), SHORT_FIXTURE, SUBMIT_TS);
    for (const screenId of ['c3-ciw', 'c3-ast', 'c3-dma', 'c3-cpd'] as const) {
      const entry = out[screenId];
      if (entry!.value.type !== 'instrument') throw new Error('typecheck');
      expect(entry!.value.q2Rating).toBeNull();
      expect(entry!.value.q1Rating).toBe('1');
    }
  });

  it('SHORT coerces a stale q2Rating to null when the answerStore still has a FULL value', () => {
    // Simulates a reviewer who started under FULL, answered q2, then was
    // URL-switched to SHORT mid-session. The store keeps the value (cheap
    // flip back), the seal payload drops it.
    const raw = fullAnswers();
    const out = normalizeForVariantInvariance(raw, SHORT_FIXTURE, SUBMIT_TS);
    const ciw = out['c3-ciw' as QuestionId];
    if (ciw!.value.type !== 'instrument') throw new Error('typecheck');
    expect(ciw!.value.q2Rating).toBeNull();
    expect(ciw!.value.q1Rating).toBe('1'); // q1 unaffected — variant doesn't hide it
  });

  it('SHORT does not touch an existing interview answer (e.g., from a FULL→SHORT URL switch)', () => {
    // Cross-variant URL share edge case: the user got to the interview
    // screen under FULL and now is being sealed under SHORT. The existing
    // answer is preserved (no clobber); the schema invariance is still
    // satisfied because the interview entry already exists.
    const raw = fullAnswers();
    const out = normalizeForVariantInvariance(raw, SHORT_FIXTURE, SUBMIT_TS);
    const interview = out.interview as LockedAnswer;
    if (interview.value.type !== 'interview') throw new Error('typecheck');
    expect(interview.value.data.willingness).toBe('yes');
  });

  it('FULL and SHORT produce identical answer-key sets (schema invariance)', () => {
    const fullOut = normalizeForVariantInvariance(fullAnswers(), VARIANTS.full, SUBMIT_TS);
    const shortOut = normalizeForVariantInvariance(shortAnswers(), SHORT_FIXTURE, SUBMIT_TS);
    expect(Object.keys(fullOut).sort()).toEqual(Object.keys(shortOut).sort());
  });
});
