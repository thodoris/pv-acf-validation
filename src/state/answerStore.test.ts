import { beforeEach, describe, expect, it } from 'vitest';
import { useAnswerStore } from './answerStore';

describe('answerStore (editable until submit)', () => {
  beforeEach(() => {
    useAnswerStore.getState().__resetAnswers();
    localStorage.clear();
  });

  it('locks an answer on first write', () => {
    const { lockAnswer, getAnswer, isAnswered } = useAnswerStore.getState();
    expect(isAnswered('c1-q1')).toBe(false);
    lockAnswer('c1-q1', { type: 'rating', value: 'Seen it occasionally' }, 'c1-q1');
    expect(isAnswered('c1-q1')).toBe(true);
    const a = getAnswer('c1-q1');
    expect(a?.value).toEqual({ type: 'rating', value: 'Seen it occasionally' });
    expect(a?.lockedAt).toBeGreaterThan(0);
  });

  it('second lockAnswer overwrites the previous value and advances lockedAt', async () => {
    const { lockAnswer, getAnswer } = useAnswerStore.getState();
    lockAnswer('c1-q1', { type: 'rating', value: 'first' }, 'c1-q1');
    const firstLockedAt = getAnswer('c1-q1')?.lockedAt ?? 0;

    // Small sleep so Date.now() advances at least one ms between writes.
    await new Promise((r) => setTimeout(r, 2));

    lockAnswer('c1-q1', { type: 'rating', value: 'second' }, 'c1-q1');
    const after = getAnswer('c1-q1');
    expect(after?.value).toEqual({ type: 'rating', value: 'second' });
    expect(after?.lockedAt).toBeGreaterThan(firstLockedAt);
  });

  it('overwrite preserves screenId + locale from the latest write', () => {
    const { lockAnswer, getAnswer } = useAnswerStore.getState();
    lockAnswer('c1-q1', { type: 'rating', value: 'first' }, 'c1-q1', 'en');
    lockAnswer('c1-q1', { type: 'rating', value: 'second' }, 'c1-q1', 'el');
    expect(getAnswer('c1-q1')?.locale).toBe('el');
  });

  it('preserves disjoint answers across multiple questions', () => {
    const { lockAnswer, getAnswer } = useAnswerStore.getState();
    lockAnswer('c1-q1', { type: 'rating', value: 'A' }, 'c1-q1');
    lockAnswer('c1-q2', { type: 'rating', value: 'B' }, 'c1-q2');
    expect((getAnswer('c1-q1')?.value as { value: string }).value).toBe('A');
    expect((getAnswer('c1-q2')?.value as { value: string }).value).toBe('B');
  });
});
