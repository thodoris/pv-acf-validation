/* Open-response textarea with required/optional badge + character counter +
   English/Greek footer hint. Carries-over the prototype's selectors verbatim. */

import type { JSX } from 'react';
import type { OpenField } from '@/content';

export type OpenResponseProps = {
  open: OpenField;
  value: string;
  onChange: (v: string) => void;
  id: string;
  maxLength?: number;
  minHeight?: number;
  disabled?: boolean;
};

export function OpenResponse({
  open,
  value,
  onChange,
  id,
  maxLength = 4000,
  minHeight = 180,
  disabled,
}: OpenResponseProps): JSX.Element {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {open.label}{' '}
        {open.required ? (
          <span className="field__req">required</span>
        ) : (
          <span className="field__opt">optional</span>
        )}
      </label>
      <textarea
        id={id}
        className="textarea"
        placeholder={open.prompt}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minHeight }}
        maxLength={maxLength}
        disabled={disabled}
      />
      <div className="textarea__footer">
        <span style={{ fontStyle: 'italic', color: 'var(--ink-mute)' }}>
          English or Greek
        </span>
        <span>
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}
