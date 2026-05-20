import { beforeEach, describe, expect, it } from 'vitest';
import { progressFor, effectiveSpineForCurrentVariant } from './progress';
import { useSessionStore } from '@/state/sessionStore';
import { SCREENS } from './screens';

describe('progressFor (FULL variant)', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
    localStorage.clear();
  });

  it('returns the seeded percent/minutes for FULL', () => {
    const snap = progressFor('welcome');
    expect(snap.percent).toBe(0);
    expect(snap.minutesLeft).toBe(50);
  });

  it('returns 100% / 0 minutes for thanks', () => {
    const snap = progressFor('thanks');
    expect(snap.percent).toBe(100);
    expect(snap.minutesLeft).toBe(0);
  });

  it('returns the right percent for a Cluster 2 question', () => {
    const snap = progressFor('c2-q4');
    expect(snap.percent).toBe(65);
  });

  it('unknown screen returns percent 0', () => {
    const snap = progressFor('bogus');
    expect(snap.percent).toBe(0);
    expect(snap.index).toBe(-1);
  });
});

describe('effectiveSpineForCurrentVariant', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
    localStorage.clear();
  });

  it('returns all SCREENS when variant is full', () => {
    expect(effectiveSpineForCurrentVariant()).toHaveLength(SCREENS.length);
  });
});
