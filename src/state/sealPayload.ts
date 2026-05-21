/* Seal payload assembly.

   Pulls the variant from sessionStore and the locked-answer map from
   answerStore, returning the canonical shape that gets written to Firestore.
   Replaces the inline assembly that previously lived in SubmitScreen. */

import { useAnswerStore, type LockedAnswer } from '@/state/answerStore';
import { useSessionStore } from '@/state/sessionStore';
import type { VariantId } from '@/content/variants';
import type { QuestionId } from '@/content';

export type SealPayload = {
  variant: VariantId;
  answerCount: number;
  answers: Record<QuestionId, LockedAnswer>;
};

export function getSealedPayload(): SealPayload {
  const variant = useSessionStore.getState().variant;
  const answers = useAnswerStore.getState().answers;
  return {
    variant,
    answerCount: Object.keys(answers).length,
    answers,
  };
}
