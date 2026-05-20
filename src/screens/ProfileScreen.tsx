/* ProfileScreen — name (optional) · institution · years.
   Driven by CONTENT.profile.fields. Persists via setProfile + locks via
   answerStore (the profile is recorded but stored as a profile-typed answer,
   not a validation question). */

import { useState } from 'react';
import type { JSX } from 'react';
import { Icon } from '@/shell/Icon';
import { CONTENT } from '@/content';
import { useSessionStore } from '@/state/sessionStore';
import { useAnswerStore } from '@/state/answerStore';
import { next, prev } from '@/routing/navigation';

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
  const alreadyLocked = useAnswerStore((s) => s.isAnswered('profile'));

  const set = (k: string, v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  const missingFields = p.fields.filter((f) => f.required && !values[f.key]?.trim()).map(
    (f) => f.key,
  );

  const onContinue = () => {
    if (missingFields.length > 0) {
      setShowErrors(true);
      // Focus first missing field
      const firstMissing = missingFields[0];
      if (firstMissing) {
        const el = document.getElementById(`pf-${firstMissing}`);
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
    if (!alreadyLocked) {
      lockAnswer('profile', { type: 'profile', data: values }, 'profile');
    }
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
                    aria-invalid={isMissing || undefined}
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
                  <div className="field__hint" style={{ color: 'var(--danger)' }}>
                    This field is required.
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

        <NavButtons onPrev={prev} onNext={onContinue} />
      </div>
    </div>
  );
}

function NavButtons({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}): JSX.Element {
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
      <button type="button" className="btn btn--ghost" onClick={onPrev}>
        <Icon name="chevron-left" size={14} /> Back
      </button>
      <button type="button" className="btn btn--primary" onClick={onNext}>
        Continue <Icon name="chevron-right" size={14} />
      </button>
    </div>
  );
}
