/* Answer store. Editable working store; immutability begins at Firestore seal.
   Persisted to localStorage (key: pvacf:answers).

   `lockAnswer(questionId, value)` saves or OVERWRITES the answer for a
   question. The reviewer can revise any answer at any time before they
   submit. `lockedAt` records the *latest* save (not the first), so the
   admin export reads "when was this answer last touched" — the most
   useful timestamp for downstream analysis.

   Final immutability lives at the seal boundary:
   - Client: `sessionStore.submittedAt` flips on successful `sealToFirestore`.
     An App-level guard then redirects every screen request to the
     terminal screen, so the answer-store is no longer reachable from the
     UI. (See ADR 0009.)
   - Server: Firestore rules at `responses/{docId}` enforce
     `update/delete: if false` — sealed documents cannot be mutated.

   The AST widget's explore state lives entirely inside its shadow DOM and
   never touches this store (F5 firewall — independent of the lock contract). */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuestionId } from '@/content';
import type { ScreenId } from '@/routing/screens';

/* AnswerValue — the discriminated union saved per locked answer.
 *
 * Some fields permit `null` in addition to `undefined`. The distinction
 * matters at seal time (see sealPayload.ts):
 * - `undefined` = "renderer never asked about this" → omitted from outbound
 *   payload by ignoreUndefinedProperties.
 * - `null` = "renderer asked but the variant hides / leaves blank this
 *   field; persist explicitly so the exported schema is variant-invariant."
 *
 * Hidden-field cases that use null today: instrument `q2Rating` under
 * SHORT, interview `data.{willingness,window,contact}` when the interview
 * screen is hidden, and `rating-and-open.rating` for c1-q7 when SHORT
 * hides that screen. See ADR 0010 / CLAUDE.md "schema invariance" rule.
 */
export type AnswerValue =
  | { type: 'rating'; value: string }
  | { type: 'open'; value: string }
  | { type: 'rating-and-open'; rating: string | null; open?: string }
  | { type: 'grid-and-composite'; grid: Record<string, string>; composite?: string }
  | { type: 'paired'; subAnswers: Record<string, { rating?: string; open?: string }> }
  | { type: 'instrument'; q1Rating?: string | null; q2Rating?: string | null; sharedOpen: string }
  | { type: 'profile'; data: Record<string, string> }
  | { type: 'interview'; data: Record<string, string | string[] | null | undefined> };

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
        // Overwrite-safe: a second call for the same `id` replaces the
        // previous value, updates `lockedAt` to "now", and refreshes the
        // recorded `screenId` / `locale`. The reviewer can revise any
        // answer until they submit. Final immutability is enforced at
        // the seal boundary (sessionStore.submittedAt + Firestore rules).
        //
        // We OMIT `locale` from the stored object when it's undefined
        // rather than writing it as `locale: undefined`. localStorage's
        // JSON round-trip would drop it anyway, so this keeps the
        // in-memory shape consistent with the rehydrated shape — and
        // avoids putting `undefined` into Firestore (which would reject
        // it without `ignoreUndefinedProperties: true`).
        const locked: LockedAnswer = {
          questionId: id,
          value,
          lockedAt: Date.now(),
          screenId,
          ...(locale !== undefined ? { locale } : {}),
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
