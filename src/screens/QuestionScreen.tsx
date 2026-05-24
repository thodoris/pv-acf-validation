/* Single-question screen — Cluster 1, 2, 4 question screens (not paired,
   not instrument). Wires rating / open / composite fields with validation
   on Continue and overwrite-safe saving via answerStore. Answers are
   editable on every visit until the session is sealed at Submit (see
   ADR 0009). Once submitted, the App-level guard short-circuits to the
   terminal screen — this screen is never rendered post-submit. */

import { useState } from 'react';
import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { QuestionCard } from './fields/QuestionCard';
import { RatingControl } from './fields/RatingControl';
import type { RatingValue } from './fields/RatingControl';
import { isStandardRatingAnswered } from './fields/ratingUtils';
import { OpenResponse } from './fields/OpenResponse';
import { CompositeSelect } from './fields/CompositeSelect';
import { requireStandardQuestion, type QuestionId } from '@/content';
import { displayMetaForStandard } from '@/content/displayMeta';
import { effectiveRequired, getVariant } from '@/content/variants';
import { useSessionStore } from '@/state/sessionStore';
import { useAnswerStore, type AnswerValue } from '@/state/answerStore';
import { next } from '@/routing/navigation';
import { isReviewMode } from '@/dev/reviewMode';
import { TEXT_LIMITS, isOverLength } from '@/lib/textLimits';

export type QuestionScreenProps = {
  screenId: QuestionId;
};

export function QuestionScreen({ screenId }: QuestionScreenProps): JSX.Element {
  const q = requireStandardQuestion(screenId);
  const variantId = useSessionStore((s) => s.variant);
  const variant = getVariant(variantId);
  const display = displayMetaForStandard(q, screenId, variant);
  const lockAnswer = useAnswerStore((s) => s.lockAnswer);
  const lockedAnswer = useAnswerStore((s) => s.getAnswer(screenId));

  // Hydrate from any previous save so revisits show the last value (which
  // the reviewer can now edit, since the screen is never disabled).
  const initial = hydrateFromLocked(lockedAnswer?.value);
  const [rating, setRating] = useState<RatingValue>(initial.rating);
  const [openVal, setOpenVal] = useState<string>(initial.open);
  const [compositeVal, setCompositeVal] = useState<number | null>(initial.composite);
  const [showErrors, setShowErrors] = useState(false);

  // Required-ness consults the active variant so SHORT can relax fields
  // declaratively via `requiredOverrides`. `composite.required` is not
  // overridable by design — see VariantConfig JSDoc.
  const ratingRequired = q.rating
    ? effectiveRequired(q, screenId, 'rating', variant)
    : false;
  const openRequired = q.open ? effectiveRequired(q, screenId, 'open', variant) : false;
  const compositeRequired = q.composite?.required ?? false;

  const ratingAnswered = q.rating ? isStandardRatingAnswered(q.rating, rating) : true;
  const openAnswered = openVal.trim().length > 0;
  const compositeAnswered = typeof compositeVal === 'number';
  // Over-length is a HARD blocker — not bypassable by review mode — because
  // an over-length lock would be refused by the seal-time validator at
  // submit, leaving the reviewer stuck. The limit applies regardless of
  // whether the field is required or optional.
  const openOverLength = Boolean(q.open) && isOverLength(openVal, TEXT_LIMITS.OPEN_RESPONSE);

  const missing: string[] = [];
  if (ratingRequired && !ratingAnswered) missing.push('rating');
  if (openRequired && !openAnswered) missing.push('open');
  if (compositeRequired && !compositeAnswered) missing.push('composite');

  const onContinue = () => {
    if (openOverLength) {
      setShowErrors(true);
      return;
    }
    if (missing.length > 0 && !isReviewMode()) {
      setShowErrors(true);
      return;
    }
    lockAnswer(
      screenId,
      buildAnswerValue(q.composite ? 'composite' : pickShape(q.rating, q.open), {
        rating,
        open: openVal,
        composite: compositeVal,
      }),
      screenId,
    );
    next();
  };

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">{q.kicker}</div>
        <h1 className="h-chapter">{q.chapter}</h1>
        {q.tagline && <p className="tagline tagline--mute">{q.tagline}</p>}

        <QuestionCard
          tag={display.tag}
          meta={display.meta}
          question={q.question}
          subtitle={q.subtitle}
        >
          {q.rating && (
            <div className="field">
              <RatingControl
                rating={q.rating}
                value={rating}
                onChange={setRating}
              />
              {showErrors && ratingRequired && !ratingAnswered && (
                <div className="field__hint field__hint--error" style={{ color: 'var(--danger)' }}>
                  This rating is required.
                </div>
              )}
            </div>
          )}
          {q.composite && (
            <>
              <CompositeSelect
                composite={q.composite}
                value={compositeVal}
                onChange={setCompositeVal}
                id={`compsel-${screenId}`}
              />
              {showErrors && compositeRequired && !compositeAnswered && (
                <div className="field__hint field__hint--error" style={{ color: 'var(--danger)' }}>
                  Pick one option.
                </div>
              )}
            </>
          )}
          {q.open && (
            <>
              <OpenResponse
                open={q.open}
                value={openVal}
                onChange={setOpenVal}
                id={`open-${screenId}`}
                minHeight={q.type === 'open-only' ? 240 : 130}
                required={openRequired}
              />
              {showErrors && openRequired && !openAnswered && (
                <div className="field__hint field__hint--error" style={{ color: 'var(--danger)' }}>
                  This open response is required.
                </div>
              )}
              {showErrors && openOverLength && (
                <div className="field__hint field__hint--error" style={{ color: 'var(--danger)' }}>
                  Please keep this answer under {TEXT_LIMITS.OPEN_RESPONSE} characters.
                </div>
              )}
            </>
          )}
        </QuestionCard>

        <NavButtons onNext={onContinue} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AnswerValue builders + hydration helpers
// ---------------------------------------------------------------------------

type FieldShape = 'rating-only' | 'open-only' | 'rating-and-open' | 'composite';

function pickShape(
  rating: { kind: string } | undefined,
  open: { required: boolean } | undefined,
): Exclude<FieldShape, 'composite'> {
  if (rating && open) return 'rating-and-open';
  if (rating) return 'rating-only';
  return 'open-only';
}

function buildAnswerValue(
  shape: FieldShape,
  parts: { rating: RatingValue; open: string; composite: number | null },
): AnswerValue {
  if (shape === 'composite') {
    // Q2.4 — grid rating + composite single-select
    const grid = Array.isArray(parts.rating)
      ? Object.fromEntries(parts.rating.map((v, i) => [`row${i}`, String(v ?? '')]))
      : {};
    return {
      type: 'grid-and-composite',
      grid,
      composite: parts.composite !== null ? String(parts.composite) : undefined,
    };
  }
  if (shape === 'rating-only') {
    return { type: 'rating', value: String(parts.rating ?? '') };
  }
  if (shape === 'open-only') {
    return { type: 'open', value: parts.open };
  }
  // rating-and-open
  return {
    type: 'rating-and-open',
    rating: String(parts.rating ?? ''),
    open: parts.open || undefined,
  };
}

function hydrateFromLocked(value: AnswerValue | undefined): {
  rating: RatingValue;
  open: string;
  composite: number | null;
} {
  if (!value) return { rating: null, open: '', composite: null };
  switch (value.type) {
    case 'rating':
      return { rating: parseNumeric(value.value), open: '', composite: null };
    case 'open':
      return { rating: null, open: value.value, composite: null };
    case 'rating-and-open':
      return {
        rating: parseNumeric(value.rating),
        open: value.open ?? '',
        composite: null,
      };
    case 'grid-and-composite': {
      const indices = Object.keys(value.grid)
        .sort()
        .map((k) => parseNumeric(value.grid[k] ?? ''));
      return {
        rating: indices,
        open: '',
        composite: value.composite !== undefined ? parseNumeric(value.composite) : null,
      };
    }
    default:
      return { rating: null, open: '', composite: null };
  }
}

function parseNumeric(s: string): number | null {
  if (s === '') return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}
