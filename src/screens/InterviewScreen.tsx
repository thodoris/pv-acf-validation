/* InterviewScreen — post-spine, before submit. Optional follow-up interview
   opt-in with window preferences + alt email. Persists to sessionStore.interview. */

import { useState } from 'react';
import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { CONTENT } from '@/content';
import { useSessionStore } from '@/state/sessionStore';
import { useAnswerStore } from '@/state/answerStore';
import { next } from '@/routing/navigation';
import { TEXT_LIMITS, isValidEmail } from '@/lib/textLimits';

type InterviewValues = {
  willingness?: string;
  window: string[];
  contact?: string;
};

// The two willingness answers that grant contact permission. Everything
// else — including `undefined` (no answer given) and "No, thank you" — is
// treated as non-contactable. The four-state distinction (Yes / Maybe /
// No / null) is preserved at the data layer; this helper only collapses
// it for UI gating.
const WILLINGNESS_YES = 'Yes — please contact me';
const WILLINGNESS_MAYBE = 'Maybe — depending on the topic';
function isContactableWillingness(v: string | undefined): boolean {
  return v === WILLINGNESS_YES || v === WILLINGNESS_MAYBE;
}

export function InterviewScreen(): JSX.Element {
  const i = CONTENT.interview;
  const persisted = useSessionStore((s) => s.interview);
  const setInterview = useSessionStore((s) => s.setInterview);
  const lockAnswer = useAnswerStore((s) => s.lockAnswer);

  const [values, setValues] = useState<InterviewValues>(() => ({
    willingness: persisted?.willingness,
    window: persisted?.window ?? [],
    contact: persisted?.contact,
  }));
  const [showErrors, setShowErrors] = useState(false);

  const isContactable = isContactableWillingness(values.willingness);

  // Generic setter for radio / text inputs. When the user switches the
  // willingness to a non-contactable choice (No / null via re-click is not
  // possible — radios don't deselect), we also discard any stale
  // schedule + email the user had filled in earlier under a Yes/Maybe
  // answer. Stored data should not survive a contradictory choice.
  const set = (k: keyof InterviewValues, v: string) =>
    setValues((s) => {
      if (k === 'willingness' && !isContactableWillingness(v)) {
        return { ...s, willingness: v, window: [], contact: undefined };
      }
      return { ...s, [k]: v };
    });
  const toggle = (v: string) =>
    setValues((s) => ({
      ...s,
      window: s.window.includes(v) ? s.window.filter((x) => x !== v) : [...s.window, v],
    }));

  // Email is optional; if non-empty it must be a well-formed address.
  // Length is also re-checked defensively (the HTML maxLength attribute
  // already caps typing + paste at the limit).
  const contactRaw = values.contact ?? '';
  const isEmailInvalid =
    contactRaw.trim().length > 0 && !isValidEmail(contactRaw);
  const isEmailOverLength = contactRaw.length > TEXT_LIMITS.INTERVIEW_EMAIL;

  const onContinue = () => {
    if (isEmailInvalid || isEmailOverLength) {
      setShowErrors(true);
      const el = document.getElementById('iv-contact');
      el?.focus();
      return;
    }
    setInterview({
      willingness: values.willingness,
      window: values.window,
      contact: values.contact,
    });
    // Overwrite-safe save — revisits replace the previous value cleanly.
    lockAnswer(
      'interview',
      {
        type: 'interview',
        data: {
          willingness: values.willingness,
          window: values.window,
          contact: values.contact,
        },
      },
      'interview',
    );
    next();
  };

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">Close · Optional follow-up</div>
        <h1 className="h-chapter">{i.title}</h1>
        <p className="tagline tagline--mute">{i.tagline}</p>
        <p className="lede" style={{ maxWidth: 680 }}>
          {i.intro}
        </p>

        <section className="profile-form">
          {i.fields.map((f) => {
            // Schedule (`window`) and email (`contact`) are only visible
            // when the respondent has indicated willingness to be
            // contacted (Yes or Maybe). For "No, thank you" or no
            // selection, both fields are hidden — and switching to one of
            // those choices also clears any prior values via the willing-
            // ness setter above, so a hidden field can never silently
            // survive into the locked answer.
            const isContactGated = f.key === 'window' || f.key === 'contact';
            if (isContactGated && !isContactable) return null;

            return (
            <div className="field" key={f.key}>
              <label className="field__label">
                {f.label}{' '}
                {f.required ? (
                  <span className="field__req">required</span>
                ) : (
                  <span className="field__opt">optional</span>
                )}
              </label>
              {f.kind === 'radio' && f.options && (
                <div className="radio-group" role="radiogroup" aria-label={f.label}>
                  {f.options.map((o, j) => (
                    <label key={j} className="radio">
                      <input
                        type="radio"
                        name={f.key}
                        checked={values[f.key as keyof InterviewValues] === o}
                        onChange={() => set(f.key as keyof InterviewValues, o)}
                      />
                      <span className="radio__dot" aria-hidden="true" />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              )}
              {f.kind === 'checkbox-list' && f.options && (
                <div className="check-group">
                  {f.options.map((o, j) => (
                    <label key={j} className="check">
                      <input
                        type="checkbox"
                        checked={values.window.includes(o)}
                        onChange={() => toggle(o)}
                      />
                      <span className="check__box" aria-hidden="true" />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              )}
              {f.kind === 'text' && (
                <input
                  id={f.key === 'contact' ? 'iv-contact' : undefined}
                  type={f.key === 'contact' ? 'email' : 'text'}
                  inputMode={f.key === 'contact' ? 'email' : undefined}
                  autoComplete={f.key === 'contact' ? 'email' : undefined}
                  className="input"
                  placeholder={f.placeholder ?? ''}
                  value={values[f.key as keyof InterviewValues] as string | undefined ?? ''}
                  onChange={(e) => set(f.key as keyof InterviewValues, e.target.value)}
                  maxLength={
                    f.key === 'contact' ? TEXT_LIMITS.INTERVIEW_EMAIL : undefined
                  }
                  aria-invalid={
                    f.key === 'contact' && showErrors && (isEmailInvalid || isEmailOverLength)
                      ? true
                      : undefined
                  }
                />
              )}
              {f.helper && <div className="field__hint">{f.helper}</div>}
              {f.key === 'contact' && showErrors && isEmailInvalid && (
                <div className="field__hint field__hint--error" style={{ color: 'var(--danger)' }}>
                  Please enter a valid email address (e.g. name@institution.example), or leave blank.
                </div>
              )}
              {f.key === 'contact' && showErrors && isEmailOverLength && (
                <div className="field__hint field__hint--error" style={{ color: 'var(--danger)' }}>
                  Please keep this under {TEXT_LIMITS.INTERVIEW_EMAIL} characters.
                </div>
              )}
            </div>
            );
          })}
        </section>

        <NavButtons onNext={onContinue} />
      </div>
    </div>
  );
}
