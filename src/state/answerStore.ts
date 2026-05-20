/* Answer store. Append-only after lock — F4 by construction.
   Persisted to localStorage (key: pvacf:answers).

   Once `lockAnswer(questionId, value)` succeeds, subsequent calls for the same
   id are silent no-ops (with a dev-only console warning). There is no
   unlockAnswer / editAnswer. Locked answers are reviewable on Back, never
   editable.

   The AST widget's explore state lives entirely inside its shadow DOM and
   never touches this store (F5 firewall). */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuestionId } from '@/content';
import type { ScreenId } from '@/routing/screens';

export type AnswerValue =
  | { type: 'rating'; value: string }
  | { type: 'open'; value: string }
  | { type: 'rating-and-open'; rating: string; open?: string }
  | { type: 'grid-and-composite'; grid: Record<string, string>; composite?: string }
  | { type: 'paired'; subAnswers: Record<string, { rating?: string; open?: string }> }
  | { type: 'instrument'; q1Rating?: string; q2Rating?: string; sharedOpen: string }
  | { type: 'profile'; data: Record<string, string> }
  | { type: 'interview'; data: Record<string, string | string[] | undefined> };

export type LockedAnswer = {
  questionId: QuestionId;
  value: AnswerValue;
  lockedAt: number;
  screenId: ScreenId;
  /** "en" / "el" — autodetected from the locale of the open response, where applicable. */
  locale?: string;
};

type AnswerState = {
  answers: Record<QuestionId, LockedAnswer>;

  lockAnswer: (id: QuestionId, value: AnswerValue, screenId: ScreenId, locale?: string) => void;
  getAnswer: (id: QuestionId) => LockedAnswer | undefined;
  isAnswered: (id: QuestionId) => boolean;
  /** Test/dev only — wipes the store. Not exposed to UI. */
  __resetAnswers: () => void;
};

export const useAnswerStore = create<AnswerState>()(
  persist(
    (set, get) => ({
      answers: {},

      lockAnswer: (id, value, screenId, locale) => {
        const existing = get().answers[id];
        if (existing) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn(
              `[answerStore] Second lockAnswer for "${id}" — ignored. ` +
                `Answers are append-only after lock (F4).`,
            );
          }
          return;
        }
        const locked: LockedAnswer = {
          questionId: id,
          value,
          lockedAt: Date.now(),
          screenId,
          locale,
        };
        set((s) => ({ answers: { ...s.answers, [id]: locked } }));
      },

      getAnswer: (id) => get().answers[id],
      isAnswered: (id) => Boolean(get().answers[id]),
      __resetAnswers: () => set({ answers: {} }),
    }),
    {
      name: 'pvacf:answers',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
