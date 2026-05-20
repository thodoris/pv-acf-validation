import { describe, expect, it } from 'vitest';
import { affordancesFor } from './affordances';

describe('affordancesFor', () => {
  it('returns customAffs verbatim for questions that declare them', () => {
    // c2-q1 has customAffs (source + explanation, no scope)
    const affs = affordancesFor('c2-q1');
    expect(affs).toHaveLength(2);
    expect(affs[0]!.kind).toBe('source');
    expect(affs[1]!.kind).toBe('explanation');
  });

  it('derives scope+source+rationale defaults for c1-q6', () => {
    // c1-q6 has sourceNote but noScope:false and not rationaleDependent
    const affs = affordancesFor('c1-q6');
    const kinds = affs.map((a) => a.kind);
    // No scope because c1-q6 has noScope: true
    expect(kinds).toContain('source');
    expect(kinds).not.toContain('scope');
  });

  it('derives scope-only for a simple rating + optional open with no extras', () => {
    // c1-q1 has scopeNote, no customAffs, no rationale, no sourceNote
    const affs = affordancesFor('c1-q1');
    expect(affs).toHaveLength(1);
    expect(affs[0]!.kind).toBe('scope');
  });

  it('returns the AST scope + maturity + operable card for c3-ast', () => {
    const affs = affordancesFor('c3-ast');
    const kinds = affs.map((a) => a.kind);
    expect(kinds).toEqual(['scope', 'maturity', 'operable']);
  });

  it('returns the CPD scope + maturity + explanation card for c3-cpd', () => {
    const affs = affordancesFor('c3-cpd');
    const kinds = affs.map((a) => a.kind);
    expect(kinds).toEqual(['scope', 'maturity', 'explanation']);
  });

  it('returns close-pair scope cards for c4-close (one per question with scopeNote)', () => {
    const affs = affordancesFor('c4-close');
    expect(affs.length).toBeGreaterThan(0);
    expect(affs.every((a) => a.kind === 'scope')).toBe(true);
  });

  it('returns the profile affordances for the profile screen', () => {
    const affs = affordancesFor('profile');
    expect(affs).toHaveLength(2);
    expect(affs[0]!.kind).toBe('scope');
    expect(affs[1]!.kind).toBe('explanation');
  });

  it('returns an empty array for screens with no affordances', () => {
    expect(affordancesFor('welcome')).toEqual([]);
    expect(affordancesFor('g1')).toEqual([]);
    expect(affordancesFor('c1-setup1')).toEqual([]);
    expect(affordancesFor('thanks')).toEqual([]);
  });

  it('returns paired-question affordances (per-sub-question scope cards)', () => {
    // c1-q3q4 has customAffs in its definition — one explanation card.
    const affs = affordancesFor('c1-q3q4');
    expect(affs.length).toBeGreaterThan(0);
  });
});
