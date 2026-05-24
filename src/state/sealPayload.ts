/* Seal payload assembly + last-mile sanitisation.

   `getSealedPayload()` pulls the variant from sessionStore and the
   locked-answer map from answerStore, returning the canonical shape that
   gets written to Firestore.

   `findSealViolations(payload)` walks every locked answer and reports any
   field that violates a TEXT_LIMITS cap (length) or an email format check.
   Returns `[]` when the payload is clean. Pure inspection — no mutation.

   `sanitizeSealPayload(payload)` walks the same fields and produces a
   new payload with every over-length string trimmed to its limit, and
   any invalid email dropped (set to undefined). Returns the cleaned
   payload alongside the list of violations that were fixed. Used by
   SubmitScreen as the safety net just before the Firestore write — if
   anything slipped past the per-screen guards (a tampered store, a
   legacy answer from a previous limit), this clips it rather than
   refusing to submit, so the user never gets dead-ended on bad data.
   Note: the answerStore itself is NOT mutated — only the outbound copy.
   Per ADR 0009, the answerStore is editable until submit and `lockedAt`
   reflects the latest save; the sanitiser must not interfere with the
   reviewer's in-flight state. Server-side enforcement (the true
   guarantee against a DevTools attacker who bypasses every client
   check) lives in Firebase Console as a Firestore security rule.

   Note: the in-memory store / localStorage are NOT mutated by the
   sanitiser. Per ADR 0009, the answerStore is editable until submit and
   `lockedAt` reflects the latest save. Trimming happens only on the
   outbound copy. */

import { useAnswerStore, type AnswerValue, type LockedAnswer } from '@/state/answerStore';
import { useSessionStore } from '@/state/sessionStore';
import { getVariant, type VariantConfig, type VariantId } from '@/content/variants';
import type { QuestionId } from '@/content';
import type { ScreenId } from '@/routing/screens';
import { TEXT_LIMITS, isValidEmail, isOverLength } from '@/lib/textLimits';

export type SealPayload = {
  variant: VariantId;
  answerCount: number;
  answers: Record<QuestionId, LockedAnswer>;
  /** Opt-in to be named in the thesis' acknowledgement of expert reviewers.
   *  Present only when the respondent gave a name on the Profile screen
   *  (otherwise the question wasn't asked). When present, an explicit
   *  `true`/`false` records the decision — useful for the researcher
   *  distinguishing "opted out" from "wasn't asked". */
  acknowledgeListing?: boolean;
};

export function getSealedPayload(): SealPayload {
  const session = useSessionStore.getState();
  const rawAnswers = useAnswerStore.getState().answers;
  const variant = getVariant(session.variant);
  const submittedAt = session.submittedAt ?? Date.now();
  const answers = normalizeForVariantInvariance(rawAnswers, variant, submittedAt);
  const hasName = (session.profile?.name?.trim().length ?? 0) > 0;
  return {
    variant: session.variant,
    answerCount: Object.keys(answers).length,
    answers,
    // Only include the acknowledgement preference when there was a name
    // to acknowledge — absence of the field == "not asked".
    ...(hasName ? { acknowledgeListing: session.acknowledgeListing } : {}),
  };
}

/* ============================================================
   Variant-invariant schema normaliser
   ============================================================

   The exported data must have the same field set regardless of which
   variant the reviewer took. SHORT submissions therefore carry stub
   entries for the screens / fields that SHORT hides, with `null` or
   empty-string values; FULL submissions are unchanged.

   This is the source-of-truth for the analytical schema contract. The
   admin xlsx export reads through `flattenAnswerValue`, which emits the
   same canonical column set per AnswerValue type, so the Firestore
   document and the xlsx row are guaranteed to agree.

   Concretely, this function applies two rules:

   1. For every screen id in `variant.hiddenScreens` that has a known
      answer-bearing shape (currently only `interview`), inject a stub
      LockedAnswer with the canonical AnswerValue and `null` field values.

   2. For every (screenId, fieldName) entry in `variant.hiddenFields`,
      coerce the field on the existing instrument answer to `null` (for
      ratings) — even if the in-memory answerStore still has a value
      from a prior FULL session that was URL-switched mid-flight.

   Note: this normaliser is read-only over the answer store. The store
   keeps whatever it had so a flip back to FULL doesn't lose answers.
   Only the outbound seal payload is normalised. */

const HIDDEN_SCREEN_PLACEHOLDERS: Partial<Record<ScreenId, () => AnswerValue>> = {
  interview: () => ({
    type: 'interview',
    data: { willingness: null, window: null, contact: null },
  }),
};

export function normalizeForVariantInvariance(
  rawAnswers: Record<QuestionId, LockedAnswer>,
  variant: VariantConfig,
  submittedAt: number,
): Record<QuestionId, LockedAnswer> {
  const out: Record<string, LockedAnswer> = { ...rawAnswers };

  // 1. Inject stub answers for hidden answer-bearing screens.
  for (const screenId of variant.hiddenScreens ?? []) {
    if (out[screenId]) continue; // user reached this screen under a prior variant — leave their data
    const makeStub = HIDDEN_SCREEN_PLACEHOLDERS[screenId];
    if (!makeStub) continue;
    out[screenId] = {
      questionId: screenId as QuestionId,
      value: makeStub(),
      lockedAt: submittedAt,
      screenId,
    };
  }

  // 2. Coerce hidden instrument fields to null on existing answers.
  for (const [screenId, fields] of Object.entries(variant.hiddenFields ?? {})) {
    const existing = out[screenId];
    if (!existing || existing.value.type !== 'instrument') continue;
    if (!fields || fields.length === 0) continue;
    const value = { ...existing.value };
    let touched = false;
    for (const f of fields) {
      if (f === 'q1' && value.q1Rating != null) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn(
            `[sealPayload] Variant "${variant.id}" hides q1 on "${screenId}" but answerStore has a value; coercing to null.`,
          );
        }
        value.q1Rating = null;
        touched = true;
      }
      if (f === 'q2' && value.q2Rating != null) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn(
            `[sealPayload] Variant "${variant.id}" hides q2 on "${screenId}" but answerStore has a value; coercing to null.`,
          );
        }
        value.q2Rating = null;
        touched = true;
      } else if (f === 'q2' && value.q2Rating === undefined) {
        // Persist explicit null so the schema column is present in Firestore.
        value.q2Rating = null;
        touched = true;
      } else if (f === 'q1' && value.q1Rating === undefined) {
        value.q1Rating = null;
        touched = true;
      }
      // sharedOpen is never hide-able (assertVariantInvariants rejects it),
      // so no branch for it here.
    }
    if (touched) out[screenId] = { ...existing, value };
  }

  return out as Record<QuestionId, LockedAnswer>;
}

export type SealViolation = {
  questionId: string;
  field: string;
  reason: 'over-length' | 'invalid-email';
  /** Actual length, present on over-length violations. */
  length?: number;
  /** Limit that was exceeded, present on over-length violations. */
  limit?: number;
};

/** Returns every text-limit / email-format violation in the payload.
 *  Empty array means the payload is safe to submit. */
export function findSealViolations(payload: SealPayload): SealViolation[] {
  const out: SealViolation[] = [];
  const tooLong = (questionId: string, field: string, s: string | undefined, limit: number) => {
    if (isOverLength(s, limit)) {
      out.push({ questionId, field, reason: 'over-length', length: s!.length, limit });
    }
  };

  for (const [questionId, locked] of Object.entries(payload.answers)) {
    const v = locked.value;
    switch (v.type) {
      case 'open':
        tooLong(questionId, 'value', v.value, TEXT_LIMITS.OPEN_RESPONSE);
        break;
      case 'rating-and-open':
        tooLong(questionId, 'open', v.open, TEXT_LIMITS.OPEN_RESPONSE);
        break;
      case 'paired':
        for (const [slot, sub] of Object.entries(v.subAnswers)) {
          tooLong(questionId, `paired.${slot}.open`, sub.open, TEXT_LIMITS.OPEN_RESPONSE);
        }
        break;
      case 'instrument':
        tooLong(questionId, 'sharedOpen', v.sharedOpen, TEXT_LIMITS.OPEN_RESPONSE);
        break;
      case 'profile':
        // Both free-text and select-option values land in the same `data`
        // map; the same cap applies to either (option labels are all well
        // under 100 chars). String-only — skip any non-string defensively.
        for (const [k, val] of Object.entries(v.data)) {
          if (typeof val === 'string') {
            tooLong(questionId, `profile.${k}`, val, TEXT_LIMITS.PROFILE_TEXT);
          }
        }
        break;
      case 'interview': {
        const contact = typeof v.data.contact === 'string' ? v.data.contact : undefined;
        if (contact && contact.trim().length > 0) {
          tooLong(questionId, 'interview.contact', contact, TEXT_LIMITS.INTERVIEW_EMAIL);
          if (!isValidEmail(contact)) {
            out.push({ questionId, field: 'interview.contact', reason: 'invalid-email' });
          }
        }
        break;
      }
      // 'rating' and 'grid-and-composite' carry no free-text fields.
    }
  }
  return out;
}

/** Walks the payload and trims any over-length string to its limit. For
 *  `interview.contact`, also drops the field if the (possibly trimmed)
 *  value is not a valid email — a shortened malformed address is still
 *  malformed, and the field is optional, so dropping it preserves the
 *  rest of the submission cleanly.
 *
 *  Returns `{ payload, fixed }` where `fixed` lists every change made.
 *  When `fixed` is empty the returned payload is referentially equal
 *  to the input (no deep clone). */
export function sanitizeSealPayload(payload: SealPayload): {
  payload: SealPayload;
  fixed: SealViolation[];
} {
  const fixed: SealViolation[] = [];

  const trimTo = (
    s: string,
    limit: number,
    questionId: string,
    field: string,
  ): string => {
    if (s.length > limit) {
      fixed.push({ questionId, field, reason: 'over-length', length: s.length, limit });
      return s.slice(0, limit);
    }
    return s;
  };

  const newAnswers: Record<string, LockedAnswer> = {};
  let anyChanged = false;

  for (const [questionId, locked] of Object.entries(payload.answers)) {
    const before = locked.value;
    const after = sanitizeAnswerValue(before, questionId, trimTo, fixed);
    if (after === before) {
      newAnswers[questionId] = locked;
    } else {
      newAnswers[questionId] = { ...locked, value: after };
      anyChanged = true;
    }
  }

  if (!anyChanged) {
    return { payload, fixed };
  }
  return {
    payload: { ...payload, answers: newAnswers as Record<QuestionId, LockedAnswer> },
    fixed,
  };
}

function sanitizeAnswerValue(
  v: AnswerValue,
  questionId: string,
  trimTo: (s: string, limit: number, qid: string, field: string) => string,
  fixed: SealViolation[],
): AnswerValue {
  switch (v.type) {
    case 'open': {
      const trimmed = trimTo(v.value, TEXT_LIMITS.OPEN_RESPONSE, questionId, 'value');
      return trimmed === v.value ? v : { ...v, value: trimmed };
    }
    case 'rating-and-open': {
      if (v.open === undefined) return v;
      const trimmed = trimTo(v.open, TEXT_LIMITS.OPEN_RESPONSE, questionId, 'open');
      return trimmed === v.open ? v : { ...v, open: trimmed };
    }
    case 'paired': {
      let changed = false;
      const newSubs: typeof v.subAnswers = {};
      for (const [slot, sub] of Object.entries(v.subAnswers)) {
        if (sub.open === undefined) {
          newSubs[slot] = sub;
          continue;
        }
        const trimmed = trimTo(
          sub.open,
          TEXT_LIMITS.OPEN_RESPONSE,
          questionId,
          `paired.${slot}.open`,
        );
        if (trimmed === sub.open) {
          newSubs[slot] = sub;
        } else {
          newSubs[slot] = { ...sub, open: trimmed };
          changed = true;
        }
      }
      return changed ? { ...v, subAnswers: newSubs } : v;
    }
    case 'instrument': {
      const trimmed = trimTo(
        v.sharedOpen,
        TEXT_LIMITS.OPEN_RESPONSE,
        questionId,
        'sharedOpen',
      );
      return trimmed === v.sharedOpen ? v : { ...v, sharedOpen: trimmed };
    }
    case 'profile': {
      let changed = false;
      const newData: Record<string, string> = {};
      for (const [k, val] of Object.entries(v.data)) {
        // The AnswerValue type says profile.data is Record<string, string>,
        // but we filter defensively in case a tampered store wrote a non-
        // string. Non-string values pass through unchanged.
        if (typeof val !== 'string') {
          newData[k] = val as string;
          continue;
        }
        const trimmed = trimTo(val, TEXT_LIMITS.PROFILE_TEXT, questionId, `profile.${k}`);
        if (trimmed !== val) changed = true;
        newData[k] = trimmed;
      }
      return changed ? { ...v, data: newData } : v;
    }
    case 'interview': {
      const contactRaw =
        typeof v.data.contact === 'string' ? v.data.contact : undefined;
      if (!contactRaw || contactRaw.trim().length === 0) return v;

      const trimmed = trimTo(
        contactRaw,
        TEXT_LIMITS.INTERVIEW_EMAIL,
        questionId,
        'interview.contact',
      );
      // After trimming, if the address is no longer (or never was) a
      // valid email, drop it. Dropping = explicitly undefined; the
      // serializer omits the field on the outbound document.
      if (!isValidEmail(trimmed)) {
        fixed.push({ questionId, field: 'interview.contact', reason: 'invalid-email' });
        return { ...v, data: { ...v.data, contact: undefined } };
      }
      if (trimmed === contactRaw) return v;
      return { ...v, data: { ...v.data, contact: trimmed } };
    }
    case 'rating':
    case 'grid-and-composite':
      return v; // no text fields
  }
}
