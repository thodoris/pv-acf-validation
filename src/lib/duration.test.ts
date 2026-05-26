import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EST_DURATION_MIN,
  FULL_VARIANT_EXTRA_MIN,
  WELCOME_SPAN_OFFSET_MIN,
  PHASE_WEIGHTS,
  TIMEBAR_PHASES,
  cumulativeWeights,
  durationRangeFor,
  effectiveQuestionCount,
  formatDurationRange,
  formatQuestionCount,
  phaseFor,
  phaseMinutesFor,
  totalDurationFor,
} from './duration';
import { SCREENS } from '@/routing/screens';
import { effectiveScreens, getVariant } from '@/content/variants';

describe('duration constants', () => {
  it('SHORT total is the default constant; FULL adds the extra', () => {
    expect(totalDurationFor('short')).toBe(DEFAULT_EST_DURATION_MIN);
    expect(totalDurationFor('full')).toBe(
      DEFAULT_EST_DURATION_MIN + FULL_VARIANT_EXTRA_MIN,
    );
  });

  it('welcome range is [total, total + span]', () => {
    expect(durationRangeFor('short')).toEqual({
      low: DEFAULT_EST_DURATION_MIN,
      high: DEFAULT_EST_DURATION_MIN + WELCOME_SPAN_OFFSET_MIN,
    });
    expect(durationRangeFor('full')).toEqual({
      low: DEFAULT_EST_DURATION_MIN + FULL_VARIANT_EXTRA_MIN,
      high: DEFAULT_EST_DURATION_MIN + FULL_VARIANT_EXTRA_MIN + WELCOME_SPAN_OFFSET_MIN,
    });
  });

  it('formats welcome range with an en-dash', () => {
    // En-dash, not hyphen — matches the existing copy.
    expect(formatDurationRange('short')).toBe('35–40 minutes');
    expect(formatDurationRange('full')).toBe('45–50 minutes');
  });

  it('PHASE_WEIGHTS covers every PhaseId returned by phaseFor', () => {
    const phasesSeen = new Set(SCREENS.map(phaseFor));
    for (const p of phasesSeen) {
      expect(PHASE_WEIGHTS[p], `${p} weight missing`).toBeGreaterThan(0);
    }
  });

  it('TIMEBAR_PHASES references only valid PhaseIds', () => {
    for (const entry of TIMEBAR_PHASES) {
      expect(PHASE_WEIGHTS[entry.phase], `${entry.phase} weight missing`).toBeGreaterThan(0);
    }
  });
});

describe('phaseMinutesFor', () => {
  it('returns integer minutes', () => {
    for (const p of Object.keys(PHASE_WEIGHTS) as Array<keyof typeof PHASE_WEIGHTS>) {
      expect(Number.isInteger(phaseMinutesFor(p, 'short'))).toBe(true);
      expect(Number.isInteger(phaseMinutesFor(p, 'full'))).toBe(true);
    }
  });

  it('sums (approximately) to the variant total', () => {
    const shortSum = Object.keys(PHASE_WEIGHTS)
      .map((p) => phaseMinutesFor(p as keyof typeof PHASE_WEIGHTS, 'short'))
      .reduce((a, b) => a + b, 0);
    const fullSum = Object.keys(PHASE_WEIGHTS)
      .map((p) => phaseMinutesFor(p as keyof typeof PHASE_WEIGHTS, 'full'))
      .reduce((a, b) => a + b, 0);
    // Per-phase rounding can drift by ±1 minute total; both variants land
    // within that band.
    expect(Math.abs(shortSum - totalDurationFor('short'))).toBeLessThanOrEqual(2);
    expect(Math.abs(fullSum - totalDurationFor('full'))).toBeLessThanOrEqual(2);
  });
});

describe('phaseFor mapping', () => {
  it('routes the spine screens to the expected phases', () => {
    const byId = (id: string) => SCREENS.find((s) => s.id === id)!;
    expect(phaseFor(byId('welcome'))).toBe('pre');
    expect(phaseFor(byId('profile'))).toBe('profile');
    expect(phaseFor(byId('g1'))).toBe('grounding');
    expect(phaseFor(byId('g2'))).toBe('grounding');
    expect(phaseFor(byId('c1-setup1'))).toBe('problem');
    expect(phaseFor(byId('c1-q5'))).toBe('problem');
    expect(phaseFor(byId('c2-setup1'))).toBe('framework');
    expect(phaseFor(byId('c2-q4'))).toBe('framework');
    expect(phaseFor(byId('c3-setup1'))).toBe('instruments');
    expect(phaseFor(byId('c3-ast'))).toBe('instruments');
    expect(phaseFor(byId('c4-close'))).toBe('close');
    expect(phaseFor(byId('interview'))).toBe('post');
    expect(phaseFor(byId('submit'))).toBe('post');
    expect(phaseFor(byId('thanks'))).toBe('post');
  });
});

describe('cumulativeWeights', () => {
  it('first screen starts at 0 weight (no work completed yet)', () => {
    const spine = effectiveScreens(SCREENS, getVariant('full'));
    const cum = cumulativeWeights(spine);
    expect(cum[0]).toBe(0);
  });

  it('is monotonically non-decreasing', () => {
    const spine = effectiveScreens(SCREENS, getVariant('full'));
    const cum = cumulativeWeights(spine);
    for (let i = 1; i < cum.length; i++) {
      expect(cum[i]!, `at idx ${i}`).toBeGreaterThanOrEqual(cum[i - 1]!);
    }
  });

  it('last screen reflects all but its own weight (start-of-screen semantics)', () => {
    const spine = effectiveScreens(SCREENS, getVariant('full'));
    const cum = cumulativeWeights(spine);
    const totalWeight = Object.values(PHASE_WEIGHTS).reduce((a, b) => a + b, 0);
    const lastIdx = cum.length - 1;
    const lastPhase = phaseFor(spine[lastIdx]!);
    const screensInLastPhase = spine.filter((s) => phaseFor(s) === lastPhase).length;
    const lastScreenWeight = PHASE_WEIGHTS[lastPhase] / screensInLastPhase;
    // Cumulative at the last index = total - its own share.
    expect(cum[lastIdx]).toBeCloseTo(totalWeight - lastScreenWeight, 6);
  });
});

describe('effectiveQuestionCount', () => {
  it('SHORT hides c1-q7 and one rating per instrument (q2)', () => {
    // c1: 7 (8 less c1-q7; paired Q1.3+Q1.4 counted as 2) + c2: 6 + c3: 4×1 + c4-q1 = 18 required
    //                                                                          + 1 optional = c4-q2
    const tally = effectiveQuestionCount('short');
    expect(tally.required).toBe(18);
    expect(tally.optional).toBe(1);
  });

  it('FULL surfaces q2 on every instrument', () => {
    // c1: 8 + c2: 6 + c3: 4×2 + c4-q1 = 23 required + 1 optional
    const tally = effectiveQuestionCount('full');
    expect(tally.required).toBe(23);
    expect(tally.optional).toBe(1);
  });

  it('formats short as the bare total and full with optional surfaced', () => {
    expect(formatQuestionCount('short')).toBe('19');
    expect(formatQuestionCount('full')).toBe('23 + 1 optional');
  });
});
