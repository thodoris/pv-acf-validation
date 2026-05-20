/* Composite single-select sitting below a primary control (e.g. below the
   rating grid in Q2.4: "of these four, which mattered most?"). Numbered
   options stacked vertically, coral fill on selection. */

import type { JSX } from 'react';
import { Icon } from '@/shell/Icon';
import type { CompositeSelect as CompositeSelectShape } from '@/content';

export type CompositeSelectProps = {
  composite: CompositeSelectShape;
  value: number | null;
  onChange: (v: number) => void;
  id: string;
  disabled?: boolean;
};

export function CompositeSelect({
  composite,
  value,
  onChange,
  id,
  disabled,
}: CompositeSelectProps): JSX.Element {
  const substemId = `${id}-substem`;
  return (
    <div className="compsel" role="group" aria-labelledby={substemId}>
      <div className="compsel__head">
        <span className="compsel__chip">
          {composite.chip || 'Pick one'}
          {composite.required && (
            <span className="field__req" style={{ marginLeft: 8 }}>
              required
            </span>
          )}
        </span>
      </div>
      <p className="compsel__sub-stem" id={substemId}>
        {composite.subStem}
      </p>
      <div className="compsel__opts" role="radiogroup" aria-labelledby={substemId}>
        {composite.options.map((opt, i) => {
          const num = String(i + 1).padStart(2, '0');
          const selected = value === i;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`compsel__opt ${selected ? 'is-selected' : ''}`}
              onClick={() => !disabled && onChange(i)}
              disabled={disabled}
            >
              <span className="compsel__num" aria-hidden="true">
                {num}
              </span>
              <span className="compsel__label">{opt}</span>
              <span className="compsel__check" aria-hidden="true">
                <Icon name="check" size={16} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
