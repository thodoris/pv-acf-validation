/* Open-response textarea with required/optional badge + character counter +
   English/Greek footer hint. Carries-over the prototype's selectors verbatim. */

import type { JSX } from 'react';
import type { OpenField } from '@/content';
import { TEXT_LIMITS } from '@/lib/textLimits';

export type OpenResponseProps = {
  open: OpenField;
  value: string;
  onChange: (v: string) => void;
  id: string;
  maxLength?: number;
  minHeight?: number;
  disabled?: boolean;
  /** Override for the required/optional badge. Defaults to `open.required`
   *  when omitted. Callers that consult variant overrides (via
   *  `effectiveRequired`) should pass the computed value so the badge
   *  matches the actual validation behaviour. */
  required?: boolean;
};

export function OpenResponse({
  open,
  value,
  onChange,
  id,
  maxLength = TEXT_LIMITS.OPEN_RESPONSE,
  minHeight = 180,
  disabled,
  required,
}: OpenResponseProps): JSX.Element {
  const isRequired = required ?? open.required;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {open.label}{' '}
        {isRequired ? (
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
