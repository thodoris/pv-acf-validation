import { describe, expect, it } from 'vitest';
import { renderAnswerValue } from './renderAnswerValue';
import type { AnswerValue } from '@/state/answerStore';

describe('renderAnswerValue', () => {
  it('returns empty string for undefined', () => {
    expect(renderAnswerValue(undefined)).toBe('');
  });

  it('renders rating', () => {
    const v: AnswerValue = { type: 'rating', value: 'agree' };
    expect(renderAnswerValue(v)).toBe('agree');
  });

  it('renders open', () => {
    const v: AnswerValue = { type: 'open', value: 'my comment' };
    expect(renderAnswerValue(v)).toBe('my comment');
  });

  it('renders rating-and-open with both fields', () => {
    const v: AnswerValue = { type: 'rating-and-open', rating: 'disagree', open: 'because reasons' };
    expect(renderAnswerValue(v)).toBe('disagree | because reasons');
  });

  it('renders rating-and-open with rating only', () => {
    const v: AnswerValue = { type: 'rating-and-open', rating: 'neutral' };
    expect(renderAnswerValue(v)).toBe('neutral');
  });

  it('renders grid-and-composite with grid only', () => {
    const v: AnswerValue = {
      type: 'grid-and-composite',
      grid: { row1: 'high', row2: 'low' },
    };
    expect(renderAnswerValue(v)).toBe('row1=high; row2=low');
  });

  it('renders grid-and-composite with composite', () => {
    const v: AnswerValue = {
      type: 'grid-and-composite',
      grid: { row1: 'high' },
      composite: 'overall ok',
    };
    expect(renderAnswerValue(v)).toBe('row1=high || composite: overall ok');
  });

  it('renders paired', () => {
    const v: AnswerValue = {
      type: 'paired',
      subAnswers: {
        a: { rating: 'agree', open: 'why' },
        b: { rating: 'disagree' },
      },
    };
    expect(renderAnswerValue(v)).toBe('a: agree (why); b: disagree');
  });

  it('renders instrument with all parts', () => {
    const v: AnswerValue = {
      type: 'instrument',
      q1Rating: 'r1',
      q2Rating: 'r2',
      sharedOpen: 'shared text',
    };
    expect(renderAnswerValue(v)).toBe('Q1=r1; Q2=r2; shared: shared text');
  });

  it('renders instrument with only sharedOpen', () => {
    const v: AnswerValue = { type: 'instrument', sharedOpen: 'only this' };
    expect(renderAnswerValue(v)).toBe('shared: only this');
  });

  it('renders profile as JSON', () => {
    const v: AnswerValue = {
      type: 'profile',
      data: { institution: 'academic', years: '5-10' },
    };
    expect(renderAnswerValue(v)).toBe('{"institution":"academic","years":"5-10"}');
  });

  it('renders interview as JSON', () => {
    const v: AnswerValue = {
      type: 'interview',
      data: { willingness: 'yes', window: ['mon', 'tue'] },
    };
    expect(renderAnswerValue(v)).toBe('{"willingness":"yes","window":["mon","tue"]}');
  });
});
