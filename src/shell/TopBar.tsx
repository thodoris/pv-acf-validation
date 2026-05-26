/* TopBar — fixed at top, 64 px tall. Carries location, the 6-step indicator,
   % complete, time-left, and the two reference triggers (Concepts + Whole
   framework). Selectors match the prototype's styles.css verbatim. */

import { Fragment } from 'react';
import type { JSX } from 'react';
import { Icon } from './Icon';
import type { Step, StepId } from '@/content';

type OverlayKind = 'cards' | 'framework' | null;

export type TopBarProps = {
  steps: Step[];
  currentStepId: StepId | null;
  percent: number;
  timeLeft: number;
  location: string;
  onOpenRef: (kind: OverlayKind) => void;
  refOpen: OverlayKind;
  /** Whether the Concept-cards trigger should render at all. False on
   *  screens whose concept-cards mapping is empty (see §4.2 of the
   *  concept-cards spec). The Whole-framework trigger is always shown. */
  showConceptsTrigger: boolean;
};

export function TopBar({
  steps,
  currentStepId,
  percent,
  timeLeft,
  location,
  onOpenRef,
  refOpen,
  showConceptsTrigger,
}: TopBarProps): JSX.Element {
  const currentIdx = steps.findIndex((x) => x.id === currentStepId);
  const [head, ...tail] = location.split(' · ');
  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            C9
          </span>
          <span>PV-ACF · Expert Review</span>
        </div>
        <span className="brand__line" aria-hidden="true" />
        <span className="location" title={location}>
          <strong>{head}</strong>
          {tail.length > 0 && <> · {tail.join(' · ')}</>}
        </span>
      </div>

      <div className="topbar__center">
        <div className="progress-cluster" role="navigation" aria-label="Progress">
          <div className="steps">
            {steps.map((s, i) => {
              const state =
                i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending';
              return (
                <Fragment key={s.id}>
                  <div className={`step step--${state}`} title={s.label}>
                    <span className="step__dot" aria-hidden="true" />
                    <span className="step__label">{s.short}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <span className="step__divider" aria-hidden="true" />
                  )}
                </Fragment>
              );
            })}
          </div>
          <div className="percent-time" aria-label="Completion and remaining time">
            <div className="percent-time__row">
              <div className="percent-time__bar">
                <div className="percent-time__fill" style={{ width: `${percent}%` }} />
              </div>
              <span>{percent}%</span>
            </div>
            <div className="percent-time__row percent-time__row--time">
              <Icon name="clock" size={12} />
              <span>~{timeLeft}′</span>
            </div>
          </div>
        </div>
      </div>

      <div className="topbar__right">
        {showConceptsTrigger && (
          <button
            type="button"
            className="ref-trigger"
            onClick={() => onOpenRef('cards')}
            aria-pressed={refOpen === 'cards'}
          >
            <span className="ref-trigger__icon">
              <Icon name="cards" />
            </span>
            Concept cards
            <span className="ref-trigger__kbd">C</span>
          </button>
        )}
        <button
          type="button"
          className="ref-trigger"
          onClick={() => onOpenRef('framework')}
          aria-pressed={refOpen === 'framework'}
        >
          <span className="ref-trigger__icon">
            <Icon name="framework" />
          </span>
          Whole framework
          <span className="ref-trigger__kbd">F</span>
        </button>
      </div>
    </header>
  );
}
