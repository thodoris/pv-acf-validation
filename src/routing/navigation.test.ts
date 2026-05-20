import { beforeEach, describe, expect, it } from 'vitest';
import {
  isPhase1Complete,
  firstIncompletePhase1,
  resolveNavigation,
  next,
  prev,
  jumpTo,
} from './navigation';
import { useSessionStore } from '@/state/sessionStore';
import type { ScreenId } from './screens';

describe('F1 phase gate', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
    localStorage.clear();
  });

  it('isPhase1Complete is false initially', () => {
    expect(isPhase1Complete(new Set())).toBe(false);
  });

  it('isPhase1Complete becomes true after profile + g1 + g2 done', () => {
    const completed = new Set<ScreenId>(['profile', 'g1', 'g2']);
    expect(isPhase1Complete(completed)).toBe(true);
  });

  it('firstIncompletePhase1 returns next-needed screen', () => {
    expect(firstIncompletePhase1(new Set())).toBe('profile');
    expect(firstIncompletePhase1(new Set(['profile']))).toBe('g1');
    expect(firstIncompletePhase1(new Set(['profile', 'g1']))).toBe('g2');
    expect(firstIncompletePhase1(new Set(['profile', 'g1', 'g2']))).toBe(null);
  });

  describe('resolveNavigation', () => {
    it('unknown screen → welcome', () => {
      const r = resolveNavigation('bogus', new Set());
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.redirectTo).toBe('welcome');
    });

    it('welcome is always reachable', () => {
      const r = resolveNavigation('welcome', new Set());
      expect(r.ok).toBe(true);
    });

    it('phase 1 screens always reachable', () => {
      expect(resolveNavigation('profile', new Set()).ok).toBe(true);
      expect(resolveNavigation('g1', new Set()).ok).toBe(true);
      expect(resolveNavigation('g2', new Set()).ok).toBe(true);
    });

    it('phase 2 screen blocked without phase 1 done; redirects to first incomplete phase 1', () => {
      const r = resolveNavigation('c1-setup1', new Set());
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.reason).toBe('gated');
        expect(r.redirectTo).toBe('profile');
      }
    });

    it('phase 2 screen reachable after phase 1 done', () => {
      const completed = new Set<ScreenId>(['profile', 'g1', 'g2']);
      const r = resolveNavigation('c1-setup1', completed);
      expect(r.ok).toBe(true);
    });

    it('phase 2 screen still blocked if only some phase 1 done', () => {
      const completed = new Set<ScreenId>(['profile']);
      const r = resolveNavigation('c2-q1', completed);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.redirectTo).toBe('g1');
    });
  });
});

describe('next() / prev() / jumpTo() through the spine', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
    localStorage.clear();
  });

  it('next() advances along the spine and marks current complete', () => {
    expect(useSessionStore.getState().currentScreenId).toBe('welcome');
    next();
    expect(useSessionStore.getState().currentScreenId).toBe('profile');
    expect(useSessionStore.getState().completedScreens.has('welcome')).toBe(true);
  });

  it('prev() steps back', () => {
    next(); // welcome → profile
    next(); // profile → g1
    prev(); // g1 → profile
    expect(useSessionStore.getState().currentScreenId).toBe('profile');
  });

  it('next() does not advance past the last screen', () => {
    useSessionStore.getState().setScreen('thanks');
    next();
    expect(useSessionStore.getState().currentScreenId).toBe('thanks');
  });

  it('jumpTo() respects the F1 gate', () => {
    const result = jumpTo('c2-q1');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(useSessionStore.getState().currentScreenId).toBe(result.redirectTo);
    }
  });

  it('jumpTo() succeeds for an open Phase 1 destination', () => {
    const result = jumpTo('g1');
    expect(result.ok).toBe(true);
    expect(useSessionStore.getState().currentScreenId).toBe('g1');
  });
});
