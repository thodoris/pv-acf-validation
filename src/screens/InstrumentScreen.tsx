/* InstrumentScreen — Cluster 3, one of four instruments (CIW / AST / DMA /
   CPD). Top panel (at-a-glance + how-it-works + maturity), structured
   representation, two rating questions, shared required open. AST screen
   adds the Explore overlay button. */

import { useState } from 'react';
import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { Icon } from '@/shell/Icon';
import { QuestionCard } from './fields/QuestionCard';
import { RatingControl } from './fields/RatingControl';
import type { RatingValue } from './fields/RatingControl';
import { isStandardRatingAnswered } from './fields/ratingUtils';
import { OpenResponse } from './fields/OpenResponse';
import { ExploreOverlay } from './instruments/ExploreOverlay';
import { InstrumentRepresentation } from './instruments/InstrumentRepresentation';
import { requireInstrument, type InstrumentId } from '@/content';
import { useAnswerStore, type AnswerValue } from '@/state/answerStore';
import { useSessionStore } from '@/state/sessionStore';
import { effectiveFieldHidden, getVariant } from '@/content/variants';
import { next } from '@/routing/navigation';
import { isReviewMode } from '@/dev/reviewMode';
import { TEXT_LIMITS, isOverLength } from '@/lib/textLimits';

export type InstrumentScreenProps = {
  screenId: InstrumentId;
};

export function InstrumentScreen({ screenId }: InstrumentScreenProps): JSX.Element {
  const inst = requireInstrument(screenId);
  const lockAnswer = useAnswerStore((s) => s.lockAnswer);
  const lockedAnswer = useAnswerStore((s) => s.getAnswer(screenId));

  // Variant gates. Q2 is hide-able under SHORT (hiddenFields); the shared
  // open can be relaxed from required to optional (requiredOverrides). Q1
  // is always required and always shown — `assertVariantInvariants` rejects
  // any variant that tries otherwise.
  const variantId = useSessionStore((s) => s.variant);
  const variant = getVariant(variantId);
  const q2Hidden = effectiveFieldHidden(screenId, 'q2', variant);
  const openRequired =
    variant.requiredOverrides?.[screenId]?.open ?? inst.sharedOpen.required;

  const initial = hydrateFromLocked(lockedAnswer?.value);
  const [q1Rating, setQ1Rating] = useState<RatingValue>(initial.q1);
  const [q2Rating, setQ2Rating] = useState<RatingValue>(initial.q2);
  const [sharedOpenVal, setSharedOpenVal] = useState<string>(initial.sharedOpen);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const q1Answered = isStandardRatingAnswered(inst.q1.rating, q1Rating);
  const q2Answered = isStandardRatingAnswered(inst.q2.rating, q2Rating);
  const openAnswered = sharedOpenVal.trim().length > 0;
  // Over-length is a HARD blocker — not bypassable by review mode (the
  // seal-time validator would refuse an over-length lock at submit).
  const openOverLength = isOverLength(sharedOpenVal, TEXT_LIMITS.OPEN_RESPONSE);

  const onContinue = () => {
    if (openOverLength) {
      setShowErrors(true);
      return;
    }
    const q2Missing = !q2Hidden && !q2Answered;
    const openMissing = openRequired && !openAnswered;
    const missing = !q1Answered || q2Missing || openMissing;
    if (missing && !isReviewMode()) {
      setShowErrors(true);
      return;
    }
    // When q2 is hidden under SHORT, write q2Rating as undefined regardless
    // of what's in local state (it would only be set if the user previously
    // answered under FULL and then was URL-switched to SHORT). The seal-
    // payload normaliser will coerce this to null for the persisted record
    // so the exported schema stays variant-invariant.
    const value: AnswerValue = {
      type: 'instrument',
      q1Rating: typeof q1Rating === 'number' ? String(q1Rating) : undefined,
      q2Rating:
        !q2Hidden && typeof q2Rating === 'number' ? String(q2Rating) : undefined,
      sharedOpen: sharedOpenVal,
    };
    lockAnswer(screenId, value, screenId);
    next();
  };

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">
          Instruments · {inst.slot} of {inst.total} &nbsp;·&nbsp; {inst.stage}
        </div>
        <h1 className="h-chapter">
          {inst.title}{' '}
          <span
            className="mono"
            style={{ color: 'var(--ink-mute)', fontSize: 14, marginLeft: 8 }}
          >
            {inst.code}
          </span>
        </h1>
        <p className="tagline tagline--mute">{inst.tagline}</p>

        {inst.glance.length > 0 && (
          <section className="inst-glance" aria-label="The instrument at a glance">
            <header className="inst-glance__head">
              <div className="inst-glance__kicker">The instrument at a glance</div>
            </header>
            <dl className="inst-glance__grid">
              {inst.glance.map((row, i) => (
                <div className="inst-glance__row" key={i}>
                  <dt className="inst-glance__label">{row.label}</dt>
                  <dd className="inst-glance__body">{row.body}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="inst-panel">
          <header className="inst-panel__head">
            <div>
              <div className="inst-panel__kicker">
                {inst.glance.length > 0 ? 'How the instrument works' : 'Instrument as an object'}
              </div>
              {inst.glance.length === 0 && (
                <div className="inst-panel__claim">
                  <strong>Claimed contribution.</strong> {inst.claimed}
                </div>
              )}
            </div>
            {inst.operable && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setExploreOpen(true)}
              >
                <Icon name="explore" size={14} /> Explore it
              </button>
            )}
          </header>

          <div className="inst-panel__body">
            <InstrumentRepresentation inst={inst} />
          </div>

          {inst.glance.length === 0 && (
            <div className="maturity" role="note" aria-label="Maturity statement">
              <div className="maturity__icon">P7</div>
              <div>
                <div className="maturity__level">{inst.maturity.level}</div>
                <div
                  className="maturity__body"
                  dangerouslySetInnerHTML={{ __html: inst.maturity.body }}
                />
              </div>
            </div>
          )}
        </section>

        <div className="firewall">
          <span className="firewall__line" />
          <span className="firewall__label">
            <Icon name="lock" size={12} /> &nbsp; Evaluation questions
          </span>
          <span className="firewall__line" />
        </div>

        <QuestionCard
          slot="q1"
          tag="Q.1 · Quality"
          question={inst.q1.question}
          subtitle={inst.q1.subtitle}
        >
          <div className="field">
            <RatingControl
              rating={inst.q1.rating}
              value={q1Rating}
              onChange={setQ1Rating}
              />
            {showErrors && !q1Answered && (
              <div className="field__hint field__hint--error" style={{ color: 'var(--danger)' }}>
                This rating is required.
              </div>
            )}
          </div>
        </QuestionCard>

        {!q2Hidden && (
          <QuestionCard
            slot="q2"
            tag="Q.2 · Applicability"
            question={inst.q2.question}
            subtitle={inst.q2.subtitle}
          >
            <div className="field">
              <RatingControl
                rating={inst.q2.rating}
                value={q2Rating}
                onChange={setQ2Rating}
              />
              {showErrors && !q2Answered && (
                <div className="field__hint field__hint--error" style={{ color: 'var(--danger)' }}>
                  This rating is required.
                </div>
              )}
            </div>
          </QuestionCard>
        )}

        <section className="shared-open" aria-labelledby={`shared-open-${inst.id}`}>
          <header className="shared-open__head">
            <span className="shared-open__chip">
              {q2Hidden ? 'Q.1 · Open' : 'Q.1 + Q.2 · Shared open'}
            </span>
            <span className="shared-open__hint">
              {q2Hidden
                ? openRequired
                  ? 'A short open response below the rating.'
                  : 'Optional — say more if you would like.'
                : 'One synthesis response covers both ratings above.'}
            </span>
          </header>
          <OpenResponse
            open={inst.sharedOpen}
            value={sharedOpenVal}
            onChange={setSharedOpenVal}
            id={`shared-open-${inst.id}`}
            minHeight={200}
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
        </section>

        <NavButtons onNext={onContinue} />
      </div>

      {exploreOpen && <ExploreOverlay onClose={() => setExploreOpen(false)} />}
    </div>
  );
}

function hydrateFromLocked(value: AnswerValue | undefined): {
  q1: RatingValue;
  q2: RatingValue;
  sharedOpen: string;
} {
  if (!value || value.type !== 'instrument') {
    return { q1: null, q2: null, sharedOpen: '' };
  }
  // q1Rating / q2Rating may be null when the seal-payload normaliser has
  // written an explicit-null for a variant-hidden field; the in-memory
  // store could replay that on a subsequent session. Treat null and
  // undefined identically — both mean "no value to hydrate".
  const parse = (s: string | null | undefined): RatingValue => {
    if (s === undefined || s === null || s === '') return null;
    const n = Number(s);
    return Number.isNaN(n) ? null : n;
  };
  return {
    q1: parse(value.q1Rating),
    q2: parse(value.q2Rating),
    sharedOpen: value.sharedOpen,
  };
}
