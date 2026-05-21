import { describe, expect, it } from 'vitest';
import { CONTENT, requireQuestion, requireInstrument, isPairedQuestion } from './index';
import type { ClusterId } from './types';
import type {
  ClusterPosition,
  Register,
  StandardQuestion,
  PairedSubQuestion,
} from './types';

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
// F1 drift-guard — until F4 deletes the authored `meta` string, every
// question's authored display string must round-trip from its structured
// fields. This catches accidental divergence while both encodings coexist.
//
// Comparison is case-insensitive on the register segments because c2-q4's
// existing authored meta uses lowercase "recognition · judgment" while
// every other dual-register question uses Title-Case ("Judgment · Recognition").
// The renderer will Title-Case at display time in F2; F4 deletes the
// authored string altogether, so the inconsistency resolves itself.
// ---------------------------------------------------------------------------

const CLUSTER_DIGIT: Record<ClusterId, number> = {
  problem: 1,
  framework: 2,
  instruments: 3,
  close: 4,
};

function composeLegacyMeta(
  q: StandardQuestion,
  isCluster4Catchall: boolean,
): string {
  const digit = CLUSTER_DIGIT[q.cluster];
  const tag = `Question ${digit}.${q.clusterPosition.ordinal} of ${q.clusterPosition.totalInFull}`;
  const segments: string[] = q.registers.map(titleCase);
  if (isCluster4Catchall) {
    // c4-q1 / c4-q2 carry their required/optional descriptor in the
    // legacy meta — derived from open.required by the renderer in F4.
    segments.push(q.open?.required ? 'Required' : 'Optional');
  }
  return segments.length > 0 ? `${tag} · ${segments.join(' · ')}` : tag;
}

function composeLegacySubMeta(sub: PairedSubQuestion): string {
  // Sub-questions' meta is just the (single) register, Title-Cased.
  return sub.registers.map(titleCase).join(' · ');
}

function titleCase(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

function normaliseForCompare(s: string): string {
  return s.toLowerCase();
}

describe('F1 drift-guard — authored meta == composed(structured)', () => {
  it('every StandardQuestion meta matches its structured form', () => {
    for (const [id, q] of Object.entries(CONTENT.questions)) {
      if (isPairedQuestion(q)) continue;
      const isC4 = id === 'c4-q1' || id === 'c4-q2';
      const composed = composeLegacyMeta(q, isC4);
      expect(
        normaliseForCompare(q.meta),
        `${id} — authored meta drifts from structured fields`,
      ).toBe(normaliseForCompare(composed));
    }
  });

  it('every PairedSubQuestion meta matches its structured form', () => {
    for (const [id, q] of Object.entries(CONTENT.questions)) {
      if (!isPairedQuestion(q)) continue;
      for (const sub of q.questions) {
        const composed = composeLegacySubMeta(sub);
        expect(
          normaliseForCompare(sub.meta),
          `${id}/${sub.slot} — authored sub-meta drifts from structured fields`,
        ).toBe(normaliseForCompare(composed));
      }
    }
  });

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
