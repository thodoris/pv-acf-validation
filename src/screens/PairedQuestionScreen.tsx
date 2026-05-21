/* Paired-question screen — Q1.3 + Q1.4 share one screen as a single
   analytical unit. Both questions lock together on Continue. */

import { useState } from 'react';
import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { QuestionCard } from './fields/QuestionCard';
import { RatingControl } from './fields/RatingControl';
import type { RatingValue } from './fields/RatingControl';
import { isStandardRatingAnswered } from './fields/ratingUtils';
import { OpenResponse } from './fields/OpenResponse';
import { requirePairedQuestion, type QuestionId } from '@/content';
import { displayMetaForSub } from '@/content/displayMeta';
import { effectiveRequired, getVariant } from '@/content/variants';
import { useSessionStore } from '@/state/sessionStore';
import { useAnswerStore, type AnswerValue } from '@/state/answerStore';
import { next } from '@/routing/navigation';
import { isReviewMode } from '@/dev/reviewMode';

export type PairedQuestionScreenProps = {
  screenId: QuestionId;
};

type SubAnswerState = {
  rating: RatingValue;
  open: string;
};

export function PairedQuestionScreen({ screenId }: PairedQuestionScreenProps): JSX.Element {
  const data = requirePairedQuestion(screenId);
  const variantId = useSessionStore((s) => s.variant);
  const variant = getVariant(variantId);
  const lockAnswer = useAnswerStore((s) => s.lockAnswer);
  const lockedAnswer = useAnswerStore((s) => s.getAnswer(screenId));
  const isLocked = Boolean(lockedAnswer);

  const initial = hydrateFromLocked(data.questions.map((q) => q.slot), lockedAnswer?.value);
  const [answers, setAnswers] = useState<Record<string, SubAnswerState>>(initial);
  const [showErrors, setShowErrors] = useState(false);

  const setSub = (slot: string, patch: Partial<SubAnswerState>) =>
    setAnswers((a) => ({ ...a, [slot]: { ...a[slot]!, ...patch } }));

  // Validation: every sub-question's required fields must be answered.
  // Required-ness consults the active variant via the sub's slot
  // (e.g. "Q1.3") as the override key — see VariantConfig JSDoc.
  const missingSlots = data.questions.filter((q) => {
    const a = answers[q.slot]!;
    const ratingReq = q.rating
      ? effectiveRequired(q, q.slot, 'rating', variant)
      : false;
    const openReq = q.open ? effectiveRequired(q, q.slot, 'open', variant) : false;
    if (ratingReq && !isStandardRatingAnswered(q.rating!, a.rating)) return true;
    if (openReq && !a.open.trim()) return true;
    return false;
  });

  const onContinue = () => {
    if (isLocked) {
      next();
      return;
    }
    if (missingSlots.length > 0 && !isReviewMode()) {
      setShowErrors(true);
      return;
    }
    const subAnswers: Record<string, { rating?: string; open?: string }> = {};
    for (const q of data.questions) {
      const a = answers[q.slot]!;
      subAnswers[q.slot] = {
        rating: typeof a.rating === 'number' ? String(a.rating) : undefined,
        open: a.open || undefined,
      };
    }
    const value: AnswerValue = { type: 'paired', subAnswers };
    lockAnswer(screenId, value, screenId);
    next();
  };

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">{data.kicker}</div>
        <h1 className="h-chapter">{data.chapter}</h1>
        <p className="tagline tagline--mute">{data.tagline}</p>

        {data.questions.map((q) => {
          const a = answers[q.slot]!;
          const ratingReq = q.rating
            ? effectiveRequired(q, q.slot, 'rating', variant)
            : false;
          const openReq = q.open
            ? effectiveRequired(q, q.slot, 'open', variant)
            : false;
          const ratingMissing =
            showErrors && ratingReq && !isStandardRatingAnswered(q.rating!, a.rating);
          const openMissing = showErrors && openReq && !a.open.trim();
          const subDisplay = displayMetaForSub(screenId, q, variant);
          return (
            <QuestionCard
              key={q.slot}
              slot={q.slot}
              tag={subDisplay.tag}
              meta={subDisplay.meta}
              question={q.question}
              subtitle={q.subtitle}
            >
              {q.rating && (
                <div className="field">
                  <RatingControl
                    rating={q.rating}
                    value={a.rating}
                    onChange={(v) => setSub(q.slot, { rating: v })}
                    disabled={isLocked}
                  />
                  {ratingMissing && (
                    <div className="field__hint" style={{ color: 'var(--danger)' }}>
                      This rating is required.
                    </div>
                  )}
                </div>
              )}
              {q.open && (
                <>
                  <OpenResponse
                    open={q.open}
                    value={a.open}
                    onChange={(v) => setSub(q.slot, { open: v })}
                    id={`open-${q.slot}`}
                    minHeight={120}
                    disabled={isLocked}
                  />
                  {openMissing && (
                    <div className="field__hint" style={{ color: 'var(--danger)' }}>
                      This open response is required.
                    </div>
                  )}
                </>
              )}
            </QuestionCard>
          );
        })}

        {isLocked && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              padding: '10px 14px',
              background: 'var(--surface-deep)',
              border: '0.5px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--ink-soft)',
            }}
          >
            <strong>Locked.</strong> Both answers are recorded together as one
            analytical unit and cannot be changed.
          </p>
        )}

        <NavButtons onNext={onContinue} />
      </div>
    </div>
  );
}

function hydrateFromLocked(
  slots: string[],
  value: AnswerValue | undefined,
): Record<string, SubAnswerState> {
  const out: Record<string, SubAnswerState> = {};
  for (const slot of slots) {
    out[slot] = { rating: null, open: '' };
  }
  if (!value || value.type !== 'paired') return out;
  for (const [slot, sub] of Object.entries(value.subAnswers)) {
    const ratingNum = sub.rating !== undefined ? Number(sub.rating) : null;
    out[slot] = {
      rating: ratingNum !== null && !Number.isNaN(ratingNum) ? ratingNum : null,
      open: sub.open ?? '',
    };
  }
  return out;
}
