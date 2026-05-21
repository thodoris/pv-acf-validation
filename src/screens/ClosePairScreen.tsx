/* ClosePairScreen — Q4.1 (required) + Q4.2 (optional) on one screen.
   Both lock together as a "paired" AnswerValue when Continue is pressed. */

import { useState } from 'react';
import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { QuestionCard } from './fields/QuestionCard';
import { OpenResponse } from './fields/OpenResponse';
import { requireStandardQuestion } from '@/content';
import { displayMetaForStandard } from '@/content/displayMeta';
import { effectiveRequired, getVariant } from '@/content/variants';
import { useSessionStore } from '@/state/sessionStore';
import { useAnswerStore, type AnswerValue } from '@/state/answerStore';
import { next } from '@/routing/navigation';
import { isReviewMode } from '@/dev/reviewMode';

export function ClosePairScreen(): JSX.Element {
  const q1 = requireStandardQuestion('c4-q1');
  const q2 = requireStandardQuestion('c4-q2');

  const variantId = useSessionStore((s) => s.variant);
  const variant = getVariant(variantId);
  const display1 = displayMetaForStandard(q1, 'c4-q1', variant);
  const display2 = displayMetaForStandard(q2, 'c4-q2', variant);

  const lockAnswer = useAnswerStore((s) => s.lockAnswer);
  const lockedAnswer = useAnswerStore((s) => s.getAnswer('c4-close'));
  const isLocked = Boolean(lockedAnswer);

  const initial = hydrateFromLocked(lockedAnswer?.value);
  const [open1, setOpen1] = useState(initial.q1);
  const [open2, setOpen2] = useState(initial.q2);
  const [showErrors, setShowErrors] = useState(false);

  // Q4.1 is required by default but a SHORT variant may relax it via
  // requiredOverrides['c4-q1'] — same path as displayMeta uses for the
  // Required / Optional badge.
  const q1Required = effectiveRequired(q1, 'c4-q1', 'open', variant);
  const q1Answered = open1.trim().length > 0;

  const onContinue = () => {
    if (isLocked) {
      next();
      return;
    }
    if (q1Required && !q1Answered && !isReviewMode()) {
      setShowErrors(true);
      return;
    }
    const value: AnswerValue = {
      type: 'paired',
      subAnswers: {
        'c4-q1': { open: open1 },
        'c4-q2': open2 ? { open: open2 } : {},
      },
    };
    lockAnswer('c4-close', value, 'c4-close');
    next();
  };

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">Close · Cluster 4 of 4</div>
        <h1 className="h-chapter">Final two questions</h1>
        <p className="tagline tagline--mute">
          One required catch-all on the framework, one optional flag on the exercise
          itself.
        </p>

        <QuestionCard
          slot="q41"
          tag={display1.tag}
          meta={display1.meta}
          question={q1.question}
          subtitle={q1.subtitle}
        >
          {q1.open && (
            <>
              <OpenResponse
                open={q1.open}
                value={open1}
                onChange={setOpen1}
                id="open-c4-q1"
                minHeight={220}
                disabled={isLocked}
              />
              {showErrors && q1Required && !q1Answered && (
                <div className="field__hint" style={{ color: 'var(--danger)' }}>
                  This open response is required.
                </div>
              )}
            </>
          )}
        </QuestionCard>

        <div className="q-card--optional-wrap">
          <QuestionCard
            slot="q42"
            tag={display2.tag}
            meta={display2.meta}
            question={q2.question}
            subtitle={q2.subtitle}
          >
            {q2.open && (
              <OpenResponse
                open={q2.open}
                value={open2}
                onChange={setOpen2}
                id="open-c4-q2"
                minHeight={160}
                disabled={isLocked}
              />
            )}
          </QuestionCard>
        </div>

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
            <strong>Locked.</strong> Both responses are recorded.
          </p>
        )}

        <NavButtons onNext={onContinue} />
      </div>
    </div>
  );
}

function hydrateFromLocked(value: AnswerValue | undefined): { q1: string; q2: string } {
  if (!value || value.type !== 'paired') return { q1: '', q2: '' };
  return {
    q1: value.subAnswers['c4-q1']?.open ?? '',
    q2: value.subAnswers['c4-q2']?.open ?? '',
  };
}
