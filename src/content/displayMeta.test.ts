import { describe, expect, it } from 'vitest';
import {
  displayMetaForStandard,
  displayMetaForSub,
  displayMetaForWrapper,
  visibleClusterCount,
} from './displayMeta';
import { requireStandardQuestion, requirePairedQuestion } from './index';
import { VARIANTS, type VariantConfig } from './variants';

const FULL = VARIANTS.full;

/** Fixture: a hypothetical SHORT that hides c2-q3 + c2-q4. Used only by
 *  these tests; not registered in VARIANTS.short. */
const SHORT_HIDES_C2_Q3_Q4: VariantConfig = {
  id: 'short',
  label: 'Test fixture',
  hiddenScreens: ['c2-q3', 'c2-q4'],
};

/** Fixture: SHORT that hides the c1-q3q4 pair (atomic — both subs disappear). */
const SHORT_HIDES_PAIR: VariantConfig = {
  id: 'short',
  label: 'Test fixture',
  hiddenScreens: ['c1-q3q4'],
};

/** Fixture: SHORT that relaxes c4-q1.open to optional. */
const SHORT_RELAXES_C4Q1: VariantConfig = {
  id: 'short',
  label: 'Test fixture',
  requiredOverrides: { 'c4-q1': { open: false } },
};

describe('displayMeta — FULL (parity with authored meta strings)', () => {
  it('c1-q1 → Question 1.1 of 8 · Recognition', () => {
    const q = requireStandardQuestion('c1-q1');
    expect(displayMetaForStandard(q, 'c1-q1', FULL)).toEqual({
      tag: 'Question 1.1 of 8',
      meta: 'Recognition',
    });
  });

  it('c1-q8 → Question 1.8 of 8 · Judgment · Recognition', () => {
    const q = requireStandardQuestion('c1-q8');
    expect(displayMetaForStandard(q, 'c1-q8', FULL)).toEqual({
      tag: 'Question 1.8 of 8',
      meta: 'Judgment · Recognition',
    });
  });

  it('c2-q5 → Question 2.5 of 6 · Judgment', () => {
    const q = requireStandardQuestion('c2-q5');
    expect(displayMetaForStandard(q, 'c2-q5', FULL)).toEqual({
      tag: 'Question 2.5 of 6',
      meta: 'Judgment',
    });
  });

  it('c2-q4 → Question 2.4 of 6 · Recognition · Judgment (Title-Cased; fixes pre-existing lowercase in authored data)', () => {
    const q = requireStandardQuestion('c2-q4');
    expect(displayMetaForStandard(q, 'c2-q4', FULL)).toEqual({
      tag: 'Question 2.4 of 6',
      meta: 'Recognition · Judgment',
    });
  });

  it('c4-q1 → Question 4.1 of 2 · Required (derived from open.required=true)', () => {
    const q = requireStandardQuestion('c4-q1');
    expect(displayMetaForStandard(q, 'c4-q1', FULL)).toEqual({
      tag: 'Question 4.1 of 2',
      meta: 'Required',
    });
  });

  it('c4-q2 → Question 4.2 of 2 · Optional (derived from open.required=false)', () => {
    const q = requireStandardQuestion('c4-q2');
    expect(displayMetaForStandard(q, 'c4-q2', FULL)).toEqual({
      tag: 'Question 4.2 of 2',
      meta: 'Optional',
    });
  });
});

describe('displayMeta — paired wrapper + subs (FULL)', () => {
  it('Q1.3 (sub) → Question 1.3 of 8 · Judgment', () => {
    const wrapper = requirePairedQuestion('c1-q3q4');
    const q13 = wrapper.questions[0]!;
    expect(displayMetaForSub('c1-q3q4', q13, FULL)).toEqual({
      tag: 'Question 1.3 of 8',
      meta: 'Judgment',
    });
  });

  it('Q1.4 (sub) → Question 1.4 of 8 · Recognition', () => {
    const wrapper = requirePairedQuestion('c1-q3q4');
    const q14 = wrapper.questions[1]!;
    expect(displayMetaForSub('c1-q3q4', q14, FULL)).toEqual({
      tag: 'Question 1.4 of 8',
      meta: 'Recognition',
    });
  });

  it('wrapper → Questions 1.3 + 1.4 of 8', () => {
    const wrapper = requirePairedQuestion('c1-q3q4');
    expect(displayMetaForWrapper('c1-q3q4', wrapper, FULL)).toEqual({
      tag: 'Questions 1.3 + 1.4 of 8',
      meta: '',
    });
  });
});

describe('displayMeta — SHORT (hides c2-q3 + c2-q4)', () => {
  it('cluster 2 visible count drops to 4', () => {
    expect(visibleClusterCount('framework', SHORT_HIDES_C2_Q3_Q4)).toBe(4);
  });

  it('c2-q1 → Question 2.1 of 4 (visible position 1 of 4)', () => {
    const q = requireStandardQuestion('c2-q1');
    expect(displayMetaForStandard(q, 'c2-q1', SHORT_HIDES_C2_Q3_Q4)).toEqual({
      tag: 'Question 2.1 of 4',
      meta: 'Judgment',
    });
  });

  it('c2-q5 → Question 2.3 of 4 (visible position 3 of 4, after c2-q1, c2-q2)', () => {
    const q = requireStandardQuestion('c2-q5');
    expect(displayMetaForStandard(q, 'c2-q5', SHORT_HIDES_C2_Q3_Q4)).toEqual({
      tag: 'Question 2.3 of 4',
      meta: 'Judgment',
    });
  });

  it('c2-q6 → Question 2.4 of 4 (the last visible)', () => {
    const q = requireStandardQuestion('c2-q6');
    expect(displayMetaForStandard(q, 'c2-q6', SHORT_HIDES_C2_Q3_Q4)).toEqual({
      tag: 'Question 2.4 of 4',
      meta: 'Judgment',
    });
  });

  it('cluster 1 unchanged (still 8 questions, c1-q1 still 1.1 of 8)', () => {
    const q = requireStandardQuestion('c1-q1');
    expect(displayMetaForStandard(q, 'c1-q1', SHORT_HIDES_C2_Q3_Q4)).toEqual({
      tag: 'Question 1.1 of 8',
      meta: 'Recognition',
    });
  });
});

describe('displayMeta — SHORT (hides the c1-q3q4 pair atomically)', () => {
  it('cluster 1 visible count drops to 6 (both pair subs removed together)', () => {
    expect(visibleClusterCount('problem', SHORT_HIDES_PAIR)).toBe(6);
  });

  it('c1-q5 → Question 1.3 of 6 (now visible position 3 instead of 5)', () => {
    const q = requireStandardQuestion('c1-q5');
    expect(displayMetaForStandard(q, 'c1-q5', SHORT_HIDES_PAIR)).toEqual({
      tag: 'Question 1.3 of 6',
      meta: 'Judgment',
    });
  });

  it('c1-q8 → Question 1.6 of 6 (the last visible)', () => {
    const q = requireStandardQuestion('c1-q8');
    expect(displayMetaForStandard(q, 'c1-q8', SHORT_HIDES_PAIR)).toEqual({
      tag: 'Question 1.6 of 6',
      meta: 'Judgment · Recognition',
    });
  });
});

describe('displayMeta — SHORT (relaxes c4-q1.open to optional)', () => {
  it('c4-q1 meta flips from Required to Optional', () => {
    const q = requireStandardQuestion('c4-q1');
    expect(displayMetaForStandard(q, 'c4-q1', SHORT_RELAXES_C4Q1)).toEqual({
      tag: 'Question 4.1 of 2',
      meta: 'Optional',
    });
  });

  it('c4-q2 meta unchanged (still Optional, was authored as such)', () => {
    const q = requireStandardQuestion('c4-q2');
    expect(displayMetaForStandard(q, 'c4-q2', SHORT_RELAXES_C4Q1)).toEqual({
      tag: 'Question 4.2 of 2',
      meta: 'Optional',
    });
  });
});
