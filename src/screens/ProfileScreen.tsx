/* ProfileScreen — name (optional) · institution · years.
   Driven by CONTENT.profile.fields. Persists via setProfile + locks via
   answerStore (the profile is recorded but stored as a profile-typed answer,
   not a validation question). */

import { useState } from 'react';
import type { JSX } from 'react';
import { Icon } from '@/shell/Icon';
import { NavButtons } from '@/shell/NavButtons';
import { CONTENT } from '@/content';
import { useSessionStore } from '@/state/sessionStore';
import { useAnswerStore } from '@/state/answerStore';
import { next } from '@/routing/navigation';
import { isReviewMode } from '@/dev/reviewMode';
import { TEXT_LIMITS } from '@/lib/textLimits';

type ProfileValues = Record<string, string>;

export function ProfileScreen(): JSX.Element {
  const p = CONTENT.profile;
  const persisted = useSessionStore((s) => s.profile) ?? {};
  const [values, setValues] = useState<ProfileValues>(() => ({
    name: persisted.name ?? '',
    institutionName: persisted.institutionName ?? '',
    institution: persisted.institution ?? '',
    years: persisted.years ?? '',
  }));
  const [showErrors, setShowErrors] = useState(false);
  const setProfile = useSessionStore((s) => s.setProfile);
  const lockAnswer = useAnswerStore((s) => s.lockAnswer);

  const set = (k: string, v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  const missingFields = p.fields.filter((f) => f.required && !values[f.key]?.trim()).map(
    (f) => f.key,
  );
  // Over-length is defensive — the input's HTML maxLength attribute already
  // caps typing + paste at the limit. We still re-check here so an unusual
  // path (programmatic value, dev-tool tampering) can't write a too-long
  // value into the locked answer.
  const overLengthFields = p.fields
    .filter((f) => f.kind === 'text' && (values[f.key]?.length ?? 0) > TEXT_LIMITS.PROFILE_TEXT)
    .map((f) => f.key);

  const onContinue = () => {
    const hasBlockers = missingFields.length > 0 || overLengthFields.length > 0;
    if (hasBlockers && !isReviewMode()) {
      setShowErrors(true);
      // Focus first blocker (missing wins over over-length when both present).
      const firstBlocker = missingFields[0] ?? overLengthFields[0];
      if (firstBlocker) {
        const el = document.getElementById(`pf-${firstBlocker}`);
        el?.focus();
      }
      return;
    }
    setProfile({
      name: values.name || undefined,
      institutionName: values.institutionName || undefined,
      institution: values.institution || undefined,
      years: values.years || undefined,
    });
    // Overwrite-safe save — revisits replace the previous value cleanly.
    lockAnswer('profile', { type: 'profile', data: values }, 'profile');
    next();
  };

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">Profile · A few details</div>
        <h1 className="h-chapter">{p.title}</h1>
        <p className="tagline tagline--mute">{p.tagline}</p>

        <section className="profile-form">
          {p.fields.map((f) => {
            const value = values[f.key] ?? '';
            const isMissing = showErrors && f.required && !value.trim();
            const isOverLength =
              showErrors && f.kind === 'text' && value.length > TEXT_LIMITS.PROFILE_TEXT;
            return (
              <div className="field" key={f.key}>
                <label className="field__label" htmlFor={`pf-${f.key}`}>
                  {f.label}{' '}
                  {f.required ? (
                    <span className="field__req">required</span>
                  ) : (
                    <span className="field__opt">optional</span>
                  )}
                </label>
                {f.kind === 'text' && (
                  <input
                    id={`pf-${f.key}`}
                    className="input"
                    type="text"
                    placeholder={f.placeholder ?? ''}
                    value={value}
                    onChange={(e) => set(f.key, e.target.value)}
                    maxLength={TEXT_LIMITS.PROFILE_TEXT}
                    aria-invalid={isMissing || isOverLength || undefined}
                  />
                )}
                {f.kind === 'select' && f.options && (
                  <div
                    className="radio-group"
                    id={`pf-${f.key}`}
                    role="radiogroup"
                    aria-label={f.label}
                  >
                    {f.options.map((o, i) => (
                      <label key={i} className="radio">
                        <input
                          type="radio"
                          name={f.key}
                          checked={value === o}
                          onChange={() => set(f.key, o)}
                        />
                        <span className="radio__dot" aria-hidden="true" />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                )}
                {f.helper && <div className="field__hint">{f.helper}</div>}
                {isMissing && (
                  <div className="field__hint field__hint--error" style={{ color: 'var(--danger)' }}>
                    This field is required.
                  </div>
                )}
                {isOverLength && (
                  <div className="field__hint field__hint--error" style={{ color: 'var(--danger)' }}>
                    Please keep this under {TEXT_LIMITS.PROFILE_TEXT} characters.
                  </div>
                )}
              </div>
            );
          })}

          <div className="profile-note">
            <Icon name="info" size={14} />
            <span>{p.languageNote}</span>
          </div>
        </section>

        <NavButtons onNext={onContinue} />
      </div>
    </div>
  );
}
