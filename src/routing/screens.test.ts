import { describe, expect, it } from 'vitest';
import { SCREENS, getScreen, requireScreen, ALWAYS_ON_SCREENS } from './screens';

describe('SCREENS spine', () => {
  it('has the expected linear spine matching the prototype', () => {
    const ids = SCREENS.map((s) => s.id);
    expect(ids).toEqual([
      'welcome',
      'profile',
      'g1',
      'g2',
      'c1-setup1',
      'c1-setup2',
      'c1-q1',
      'c1-q2',
      'c1-q3q4',
      'c1-q5',
      'c1-q6',
      'c1-q7',
      'c1-q8',
      'c2-setup1',
      'c2-setup2',
      'c2-q1',
      'c2-q2',
      'c2-q3',
      'c2-q4',
      'c2-q5',
      'c2-q6',
      'c3-setup1',
      'c3-setup2',
      'c3-ciw',
      'c3-ast',
      'c3-dma',
      'c3-cpd',
      'c4-close',
      'interview',
      'submit',
      'thanks',
    ]);
  });

  it('has 31 screens (c4-setup merged into c4-close — ADR 0011)', () => {
    expect(SCREENS).toHaveLength(31);
  });

  // Per-screen progress / minutes-left are derived from src/lib/duration.ts
  // since ADR 0012; the monotonicity contract is exercised in progress.test.ts
  // by walking the variant-effective spine through progressFor().

  it('getScreen / requireScreen', () => {
    expect(getScreen('welcome')).toBeDefined();
    expect(getScreen('not-a-screen')).toBeUndefined();
    expect(requireScreen('c3-ast').stepId).toBe('instruments');
    expect(() => requireScreen('not-a-screen')).toThrow(/Unknown screen/);
  });

  it('ALWAYS_ON_SCREENS contains welcome, profile, submit, thanks', () => {
    expect(ALWAYS_ON_SCREENS.has('welcome')).toBe(true);
    expect(ALWAYS_ON_SCREENS.has('profile')).toBe(true);
    expect(ALWAYS_ON_SCREENS.has('submit')).toBe(true);
    expect(ALWAYS_ON_SCREENS.has('thanks')).toBe(true);
    expect(ALWAYS_ON_SCREENS.has('g1')).toBe(false);
  });
});
