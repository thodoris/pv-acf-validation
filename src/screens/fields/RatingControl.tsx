/* Rating — pill row for standard ratings, table for grid ratings (Q2.4).
   Carries-over the prototype's selectors verbatim so styles-phase-a.css
   applies. */

import type { JSX, CSSProperties } from 'react';
import type { Rating } from '@/content';

export type StandardRatingValue = number | null;
export type GridRatingValue = Array<number | null>;
export type RatingValue = StandardRatingValue | GridRatingValue;

export type RatingControlProps = {
  rating: Rating;
  value: RatingValue;
  onChange: (v: RatingValue) => void;
  disabled?: boolean;
};

export function RatingControl({
  rating,
  value,
  onChange,
  disabled,
}: RatingControlProps): JSX.Element {
  if (rating.kind === 'grid') {
    const cols = rating.options.length;
    // Detect a trailing meta option ("Cannot judge") so it can render
    // narrower and visually divided from the ordinal scale to its left.
    const metaIndex =
      rating.options[cols - 1] === 'Cannot judge' ? cols - 1 : -1;
    const gridStyle = {
      '--rating-grid-cols':
        metaIndex === -1
          ? `1.8fr repeat(${cols}, 1fr)`
          : `1.8fr repeat(${cols - 1}, 1fr) 0.9fr`,
    } as CSSProperties;
    const cellValue = Array.isArray(value) ? value : Array(rating.rows.length).fill(null);
    return (
      <div className="rating-grid" style={gridStyle}>
        <div className="rating-grid__head" style={gridStyle}>
          <div />
          {rating.options.map((o, i) => (
            <div
              className={`rating-grid__col-label${i === metaIndex ? ' rating-grid__col-label--meta' : ''}`}
              key={i}
            >
              {o}
            </div>
          ))}
        </div>
        {rating.rows.map((row, ri) => (
          <div className="rating-grid__row" key={ri} style={gridStyle}>
            <div className="rating-grid__row-label">{row}</div>
            {rating.options.map((o, ci) => {
              const selected = cellValue[ri] === ci;
              const isMeta = ci === metaIndex;
              return (
                <button
                  key={ci}
                  type="button"
                  className={`rating-grid__cell${selected ? ' is-selected' : ''}${isMeta ? ' rating-grid__cell--meta' : ''}`}
                  onClick={() => {
                    if (disabled) return;
                    const next = [...cellValue];
                    next[ri] = ci;
                    onChange(next);
                  }}
                  aria-pressed={selected}
                  aria-label={`${row} — ${o}`}
                  disabled={disabled}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  const v = typeof value === 'number' ? value : null;
  return (
    <div className="rating-row">
      <div className="rating-row__pills">
        {rating.options.map((o, i) => (
          <button
            key={i}
            type="button"
            className={`rating-pill ${v === i ? 'is-selected' : ''}`}
            onClick={() => !disabled && onChange(i)}
            aria-pressed={v === i}
            disabled={disabled}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

