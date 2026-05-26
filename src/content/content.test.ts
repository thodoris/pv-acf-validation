import { describe, expect, it } from 'vitest';
import { CONTENT, requireQuestion, requireInstrument, isPairedQuestion } from './index';
import type { ClusterId, ClusterPosition, Register } from './types';

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

  it('has 4 clusters; problem/framework/instruments carry setup-screen data (close does not — ADR 0011)', () => {
    const ids = Object.keys(CONTENT.clusters);
    expect(ids).toEqual(['problem', 'framework', 'instruments', 'close']);
    for (const k of ['problem', 'framework', 'instruments'] as const) {
      expect(CONTENT.clusters[k].setup.sections.length).toBeGreaterThan(0);
    }
    expect(CONTENT.clusters.close.setup.sections).toEqual([]);
  });

  it('has the expected Cluster 1 questions (c1-q1..c1-q8 with c1-q3q4 paired)', () => {
    const ids = ['c1-q1', 'c1-q2', 'c1-q3q4', 'c1-q5', 'c1-q6', 'c1-q7', 'c1-q8'];
    for (const id of ids) {
      expect(requireQuestion(id), `${id} missing`).toBeDefined();
    }
    expect(isPairedQuestion(requireQuestion('c1-q3q4'))).toBe(true);
  });

  it('has 6 Cluster 2 questions (renumbered c2-q1…c2-q6; prototype skipped c2-q5)', () => {
    const c2 = Object.keys(CONTENT.questions).filter((k) => k.startsWith('c2-q'));
    expect(c2.sort()).toEqual(['c2-q1', 'c2-q2', 'c2-q3', 'c2-q4', 'c2-q5', 'c2-q6']);
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

// ---------------------------------------------------------------------------
// Structured-field integrity — invariants on `clusterPosition` and `registers`
// that must hold regardless of variant. The F1 drift-guard tests (which
// compared authored meta strings to structured fields) were removed in F4
// once the authored `meta` field was deleted; only the structural invariants
// below remain.
// ---------------------------------------------------------------------------

describe('Question structured fields — invariants', () => {
  it('clusterPosition.ordinal is unique within each cluster', () => {
    const seen: Record<string, Set<number>> = {};
    for (const [id, q] of Object.entries(CONTENT.questions)) {
      if (isPairedQuestion(q)) {
        for (const sub of q.questions) {
          const key = q.cluster;
          (seen[key] ??= new Set()).has(sub.clusterPosition.ordinal) &&
            expect.fail(`${id}/${sub.slot} duplicate ordinal in ${key}`);
          seen[key]!.add(sub.clusterPosition.ordinal);
        }
      } else {
        const key = q.cluster;
        (seen[key] ??= new Set()).has(q.clusterPosition.ordinal) &&
          expect.fail(`${id} duplicate ordinal in ${key}`);
        seen[key]!.add(q.clusterPosition.ordinal);
      }
    }
  });

  it('clusterPosition.totalInFull is consistent within each cluster', () => {
    const totals: Record<string, number> = {};
    const visit = (cluster: ClusterId, pos: ClusterPosition, who: string) => {
      if (totals[cluster] !== undefined && totals[cluster] !== pos.totalInFull) {
        expect.fail(
          `${who} reports totalInFull=${pos.totalInFull} but ${cluster} expects ${totals[cluster]}`,
        );
      }
      totals[cluster] = pos.totalInFull;
    };
    for (const [id, q] of Object.entries(CONTENT.questions)) {
      if (isPairedQuestion(q)) {
        for (const sub of q.questions) visit(q.cluster, sub.clusterPosition, `${id}/${sub.slot}`);
      } else {
        visit(q.cluster, q.clusterPosition, id);
      }
    }
  });

  it('registers only contain known values', () => {
    const ALLOWED: Register[] = ['judgment', 'recognition'];
    for (const [id, q] of Object.entries(CONTENT.questions)) {
      const list = isPairedQuestion(q)
        ? q.questions.flatMap((s) => s.registers.map((r) => [`${id}/${s.slot}`, r] as const))
        : q.registers.map((r) => [id, r] as const);
      for (const [who, r] of list) {
        expect(ALLOWED, `${who} carries unknown register: ${r}`).toContain(r);
      }
    }
  });
});
