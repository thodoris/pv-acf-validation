import { describe, expect, it } from 'vitest';
import { CONTENT, requireQuestion, requireInstrument, isPairedQuestion } from './index';

describe('CONTENT shape', () => {
  it('has the six top-bar steps in order', () => {
    expect(CONTENT.steps).toHaveLength(6);
    expect(CONTENT.steps.map((s) => s.id)).toEqual([
      'profile',
      'grounding',
      'problem',
      'framework',
      'instruments',
      'close',
    ]);
  });

  it('has 2 grounding screens (per prototype, not the brief)', () => {
    expect(CONTENT.grounding).toHaveLength(2);
    expect(CONTENT.grounding.map((g) => g.id)).toEqual(['g1', 'g2']);
  });

  it('has 4 clusters with setup data', () => {
    const ids = Object.keys(CONTENT.clusters);
    expect(ids).toEqual(['problem', 'framework', 'instruments', 'close']);
    for (const k of ids) {
      const c = CONTENT.clusters[k as keyof typeof CONTENT.clusters];
      expect(c.setup.sections.length).toBeGreaterThan(0);
    }
  });

  it('has the expected Cluster 1 questions (c1-q1..c1-q8 with c1-q3q4 paired)', () => {
    const ids = ['c1-q1', 'c1-q2', 'c1-q3q4', 'c1-q5', 'c1-q6', 'c1-q7', 'c1-q8'];
    for (const id of ids) {
      expect(requireQuestion(id), `${id} missing`).toBeDefined();
    }
    expect(isPairedQuestion(requireQuestion('c1-q3q4'))).toBe(true);
  });

  it('has 6 Cluster 2 questions (c2-q5 is skipped per prototype)', () => {
    const c2 = Object.keys(CONTENT.questions).filter((k) => k.startsWith('c2-q'));
    expect(c2.sort()).toEqual(['c2-q1', 'c2-q2', 'c2-q3', 'c2-q4', 'c2-q6', 'c2-q7']);
  });

  it('has 4 instruments in lifecycle order: CIW, AST, DMA, CPD', () => {
    expect(CONTENT.instruments).toHaveLength(4);
    expect(CONTENT.instruments.map((i) => i.code)).toEqual(['CIW', 'AST', 'DMA', 'CPD']);
    expect(requireInstrument('c3-ast').operable).toBe(true);
  });

  it('has c4-q1 (required) and c4-q2 (optional, open-only)', () => {
    const q1 = requireQuestion('c4-q1');
    const q2 = requireQuestion('c4-q2');
    if (isPairedQuestion(q1) || isPairedQuestion(q2)) throw new Error('unexpected paired');
    expect(q1.open?.required).toBe(true);
    expect(q2.open?.required).toBe(false);
  });

  it('has concept cards for the reference overlay', () => {
    expect(CONTENT.concepts.length).toBeGreaterThan(0);
    expect(CONTENT.concepts.some((c) => c.featured)).toBe(true);
  });
});
