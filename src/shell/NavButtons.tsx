/* Shared Back / Continue nav at the bottom of a screen. Screens that need
   validation hook into onNext; default onPrev/onNext call navigation.prev/next. */

import type { JSX } from 'react';
import { Icon } from './Icon';
import { next as defaultNext, prev as defaultPrev } from '@/routing/navigation';

export type NavButtonsProps = {
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  /** When true, hide Back (e.g. first reachable screen after welcome). */
  hidePrev?: boolean;
  /** Disable Continue. Used sparingly — prefer validation-on-click so the
   *  user gets feedback rather than a silently disabled button. */
  disableNext?: boolean;
};

export function NavButtons({
  onPrev = defaultPrev,
  onNext = defaultNext,
  nextLabel = 'Continue',
  hidePrev,
  disableNext,
}: NavButtonsProps): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'var(--space-7)',
        paddingTop: 'var(--space-4)',
        borderTop: '0.5px solid var(--border-soft)',
      }}
    >
      {hidePrev ? (
        <span />
      ) : (
        <button type="button" className="btn btn--ghost" onClick={onPrev}>
          <Icon name="chevron-left" size={14} /> Back
        </button>
      )}
      <button
        type="button"
        className="btn btn--primary"
        onClick={onNext}
        disabled={disableNext}
      >
        {nextLabel} <Icon name="chevron-right" size={14} />
      </button>
    </div>
  );
}
