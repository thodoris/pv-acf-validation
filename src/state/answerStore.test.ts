import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnswerStore } from './answerStore';

describe('answerStore (F4 append-only)', () => {
  beforeEach(() => {
    useAnswerStore.getState().__resetAnswers();
    localStorage.clear();
  });

  it('locks an answer once', () => {
    const { lockAnswer, getAnswer, isAnswered } = useAnswerStore.getState();
    expect(isAnswered('c1-q1')).toBe(false);
    lockAnswer('c1-q1', { type: 'rating', value: 'Seen it occasionally' }, 'c1-q1');
    expect(isAnswered('c1-q1')).toBe(true);
    const a = getAnswer('c1-q1');
    expect(a?.value).toEqual({ type: 'rating', value: 'Seen it occasionally' });
    expect(a?.lockedAt).toBeGreaterThan(0);
  });

  it('second lockAnswer is a no-op (with warning)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { lockAnswer, getAnswer } = useAnswerStore.getState();
    lockAnswer('c1-q1', { type: 'rating', value: 'first' }, 'c1-q1');
    const firstLockedAt = getAnswer('c1-q1')?.lockedAt;
    lockAnswer('c1-q1', { type: 'rating', value: 'second' }, 'c1-q1');
    const after = getAnswer('c1-q1');
    expect(after?.value).toEqual({ type: 'rating', value: 'first' });
    expect(after?.lockedAt).toBe(firstLockedAt);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('preserves disjoint answers across multiple questions', () => {
    const { lockAnswer, getAnswer } = useAnswerStore.getState();
    lockAnswer('c1-q1', { type: 'rating', value: 'A' }, 'c1-q1');
    lockAnswer('c1-q2', { type: 'rating', value: 'B' }, 'c1-q2');
    expect((getAnswer('c1-q1')?.value as { value: string }).value).toBe('A');
    expect((getAnswer('c1-q2')?.value as { value: string }).value).toBe('B');
  });
});
