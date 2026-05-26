import { beforeEach, describe, expect, it } from 'vitest';
import { progressFor, effectiveSpineForCurrentVariant } from './progress';
import { useSessionStore } from '@/state/sessionStore';
import { SCREENS } from './screens';
import { DEFAULT_EST_DURATION_MIN, FULL_VARIANT_EXTRA_MIN } from '@/lib/duration';

const SHORT_TOTAL = DEFAULT_EST_DURATION_MIN;                       // 35
const FULL_TOTAL = DEFAULT_EST_DURATION_MIN + FULL_VARIANT_EXTRA_MIN; // 45

beforeEach(() => {
  useSessionStore.getState().resetSession();
  localStorage.clear();
});

describe('progressFor — endpoints', () => {
  it('welcome lands on 0% with the full variant duration remaining (FULL)', () => {
    useSessionStore.getState().setVariant('full');
    const snap = progressFor('welcome');
    expect(snap.percent).toBe(0);
    expect(snap.minutesLeft).toBe(FULL_TOTAL);
  });

  it('welcome lands on 0% with the short variant duration remaining (SHORT)', () => {
    useSessionStore.getState().setVariant('short');
    const snap = progressFor('welcome');
    expect(snap.percent).toBe(0);
    expect(snap.minutesLeft).toBe(SHORT_TOTAL);
  });

  it('thanks is the terminal 100% / 0 marker under both variants', () => {
    for (const v of ['full', 'short'] as const) {
      useSessionStore.getState().setVariant(v);
      const snap = progressFor('thanks');
      expect(snap.percent, `${v} variant`).toBe(100);
      expect(snap.minutesLeft, `${v} variant`).toBe(0);
    }
  });

  it('unknown screen returns percent 0 / index -1', () => {
    const snap = progressFor('bogus');
    expect(snap.percent).toBe(0);
    expect(snap.index).toBe(-1);
  });
});

describe('progressFor — spine invariants', () => {
  for (const v of ['full', 'short'] as const) {
    it(`returns integer percent / minutes for every visible screen (${v})`, () => {
      useSessionStore.getState().setVariant(v);
      const spine = effectiveSpineForCurrentVariant();
      for (const s of spine) {
        const snap = progressFor(s.id);
        expect(Number.isInteger(snap.percent), `${v}/${s.id} percent`).toBe(true);
        expect(Number.isInteger(snap.minutesLeft), `${v}/${s.id} minutesLeft`).toBe(true);
      }
    });

    it(`percent is monotonically non-decreasing across the spine (${v})`, () => {
      useSessionStore.getState().setVariant(v);
      const spine = effectiveSpineForCurrentVariant();
      let prev = -1;
      for (const s of spine) {
        const snap = progressFor(s.id);
        expect(snap.percent, `${v}/${s.id}`).toBeGreaterThanOrEqual(prev);
        prev = snap.percent;
      }
    });

    it(`minutesLeft is monotonically non-increasing across the spine (${v})`, () => {
      useSessionStore.getState().setVariant(v);
      const spine = effectiveSpineForCurrentVariant();
      let prev = Infinity;
      for (const s of spine) {
        const snap = progressFor(s.id);
        expect(snap.minutesLeft, `${v}/${s.id}`).toBeLessThanOrEqual(prev);
        prev = snap.minutesLeft;
      }
    });
  }
});

describe('progressFor — variant scaling', () => {
  it('FULL shows more remaining minutes than SHORT on the same screen', () => {
    useSessionStore.getState().setVariant('full');
    const full = progressFor('c2-q3');
    useSessionStore.getState().setVariant('short');
    const short = progressFor('c2-q3');
    expect(full.minutesLeft).toBeGreaterThan(short.minutesLeft);
  });

  it('produces a sensible mid-spine percent (cluster 2 question)', () => {
    useSessionStore.getState().setVariant('full');
    const snap = progressFor('c2-q3');
    // c2-q3 sits roughly mid-spine; with PHASE_WEIGHTS landing problem (10) +
    // grounding (3) + profile (1) + pre (1) before framework starts, plus
    // some framework share, this lands between 40% and 70%.
    expect(snap.percent).toBeGreaterThan(40);
    expect(snap.percent).toBeLessThan(70);
  });
});

describe('effectiveSpineForCurrentVariant', () => {
  it('returns all SCREENS when variant is full', () => {
    useSessionStore.getState().setVariant('full');
    expect(effectiveSpineForCurrentVariant()).toHaveLength(SCREENS.length);
  });

  it('returns the SHORT-trimmed spine when variant is short (c1-q7 + interview hidden)', () => {
    useSessionStore.getState().setVariant('short');
    expect(effectiveSpineForCurrentVariant()).toHaveLength(SCREENS.length - 2);
  });
});
