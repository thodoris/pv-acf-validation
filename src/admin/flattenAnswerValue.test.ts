import { describe, expect, it } from 'vitest';
import { flattenAnswerValue } from './flattenAnswerValue';
import type { AnswerValue } from '@/state/answerStore';

describe('flattenAnswerValue', () => {
  it('rating → single column under the qid', () => {
    const v: AnswerValue = { type: 'rating', value: 'agree' };
    expect(flattenAnswerValue('c1-q1', v)).toEqual({ 'c1-q1': 'agree' });
  });

  it('open → single column under the qid', () => {
    const v: AnswerValue = { type: 'open', value: 'some text' };
    expect(flattenAnswerValue('c4-q1', v)).toEqual({ 'c4-q1': 'some text' });
  });

  it('rating-and-open → .rating + .open', () => {
    const v: AnswerValue = { type: 'rating-and-open', rating: 'r', open: 'o' };
    expect(flattenAnswerValue('c1-q5', v)).toEqual({
      'c1-q5.rating': 'r',
      'c1-q5.open': 'o',
    });
  });

  it('rating-and-open omits .open when undefined', () => {
    const v: AnswerValue = { type: 'rating-and-open', rating: 'r' };
    expect(flattenAnswerValue('c1-q5', v)).toEqual({ 'c1-q5.rating': 'r' });
  });

  it('grid-and-composite → one col per grid row + .composite', () => {
    const v: AnswerValue = {
      type: 'grid-and-composite',
      grid: { judgment: 'gap-1', recognition: 'gap-2' },
      composite: 'overall',
    };
    expect(flattenAnswerValue('c2-q4', v)).toEqual({
      'c2-q4.judgment': 'gap-1',
      'c2-q4.recognition': 'gap-2',
      'c2-q4.composite': 'overall',
    });
  });

  it('grid-and-composite without composite', () => {
    const v: AnswerValue = {
      type: 'grid-and-composite',
      grid: { row1: 'high' },
    };
    expect(flattenAnswerValue('q', v)).toEqual({ 'q.row1': 'high' });
  });

  it('paired → .sub.rating + .sub.open per sub-question', () => {
    const v: AnswerValue = {
      type: 'paired',
      subAnswers: {
        q41: { rating: 'agree', open: 'why' },
        q42: { rating: 'disagree' },
      },
    };
    expect(flattenAnswerValue('c4-close', v)).toEqual({
      'c4-close.q41.rating': 'agree',
      'c4-close.q41.open': 'why',
      'c4-close.q42.rating': 'disagree',
    });
  });

  it('instrument → .q1 + .q2 + .open', () => {
    const v: AnswerValue = {
      type: 'instrument',
      q1Rating: 'r1',
      q2Rating: 'r2',
      sharedOpen: 'shared',
    };
    expect(flattenAnswerValue('c3-ast', v)).toEqual({
      'c3-ast.q1': 'r1',
      'c3-ast.q2': 'r2',
      'c3-ast.open': 'shared',
    });
  });

  it('instrument emits the full canonical column set with "" for missing values (schema invariance)', () => {
    // SHORT submission shape: q2 hidden, open optional left blank.
    const short: AnswerValue = { type: 'instrument', q1Rating: 'r1', q2Rating: null, sharedOpen: '' };
    expect(flattenAnswerValue('c3-ast', short)).toEqual({
      'c3-ast.q1': 'r1',
      'c3-ast.q2': '',
      'c3-ast.open': '',
    });
  });

  it('instrument with only sharedOpen still emits q1 and q2 columns as ""', () => {
    const v: AnswerValue = { type: 'instrument', sharedOpen: 'only this' };
    expect(flattenAnswerValue('c3-ast', v)).toEqual({
      'c3-ast.q1': '',
      'c3-ast.q2': '',
      'c3-ast.open': 'only this',
    });
  });

  it('profile → one col per data field', () => {
    const v: AnswerValue = {
      type: 'profile',
      data: { institution: 'academic', years: '5-10' },
    };
    expect(flattenAnswerValue('profile', v)).toEqual({
      'profile.institution': 'academic',
      'profile.years': '5-10',
    });
  });

  it('interview → canonical willingness/window/contact columns; arrays join with "; "', () => {
    const v: AnswerValue = {
      type: 'interview',
      data: { willingness: 'yes', window: ['mon', 'tue'], contact: 'a@b.c' },
    };
    expect(flattenAnswerValue('interview', v)).toEqual({
      'interview.willingness': 'yes',
      'interview.window': 'mon; tue',
      'interview.contact': 'a@b.c',
    });
  });

  it('interview emits the canonical column set with "" for missing values (schema invariance)', () => {
    // SHORT submission shape: interview screen hidden, seal-payload stub
    // wrote nulls.
    const stub: AnswerValue = {
      type: 'interview',
      data: { willingness: null, window: null, contact: null },
    };
    expect(flattenAnswerValue('interview', stub)).toEqual({
      'interview.willingness': '',
      'interview.window': '',
      'interview.contact': '',
    });
  });

  it('interview with partial data fills the rest with ""', () => {
    const v: AnswerValue = {
      type: 'interview',
      data: { willingness: 'yes', window: undefined },
    };
    expect(flattenAnswerValue('interview', v)).toEqual({
      'interview.willingness': 'yes',
      'interview.window': '',
      'interview.contact': '',
    });
  });

  it('SHORT and FULL submissions produce identical instrument + interview column sets', () => {
    const fullInstrument: AnswerValue = {
      type: 'instrument',
      q1Rating: '1',
      q2Rating: '2',
      sharedOpen: 'thought',
    };
    const shortInstrument: AnswerValue = {
      type: 'instrument',
      q1Rating: '1',
      q2Rating: null,
      sharedOpen: '',
    };
    expect(Object.keys(flattenAnswerValue('c3-ast', fullInstrument)).sort()).toEqual(
      Object.keys(flattenAnswerValue('c3-ast', shortInstrument)).sort(),
    );

    const fullInterview: AnswerValue = {
      type: 'interview',
      data: { willingness: 'yes', window: ['mon'], contact: 'x@y.z' },
    };
    const shortInterview: AnswerValue = {
      type: 'interview',
      data: { willingness: null, window: null, contact: null },
    };
    expect(Object.keys(flattenAnswerValue('interview', fullInterview)).sort()).toEqual(
      Object.keys(flattenAnswerValue('interview', shortInterview)).sort(),
    );
  });
});
