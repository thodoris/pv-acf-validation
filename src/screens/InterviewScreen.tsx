/* InterviewScreen — post-spine, before submit. Optional follow-up interview
   opt-in with window preferences + alt email. Persists to sessionStore.interview. */

import { useState } from 'react';
import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { CONTENT } from '@/content';
import { useSessionStore } from '@/state/sessionStore';
import { useAnswerStore } from '@/state/answerStore';
import { next } from '@/routing/navigation';

type InterviewValues = {
  willingness?: string;
  window: string[];
  contact?: string;
};

export function InterviewScreen(): JSX.Element {
  const i = CONTENT.interview;
  const persisted = useSessionStore((s) => s.interview);
  const setInterview = useSessionStore((s) => s.setInterview);
  const lockAnswer = useAnswerStore((s) => s.lockAnswer);
  const alreadyLocked = useAnswerStore((s) => s.isAnswered('interview'));

  const [values, setValues] = useState<InterviewValues>(() => ({
    willingness: persisted?.willingness,
    window: persisted?.window ?? [],
    contact: persisted?.contact,
  }));

  const set = (k: keyof InterviewValues, v: string) =>
    setValues((s) => ({ ...s, [k]: v }));
  const toggle = (v: string) =>
    setValues((s) => ({
      ...s,
      window: s.window.includes(v) ? s.window.filter((x) => x !== v) : [...s.window, v],
    }));

  const onContinue = () => {
    setInterview({
      willingness: values.willingness,
      window: values.window,
      contact: values.contact,
    });
    if (!alreadyLocked) {
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
    }
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
          {i.fields.map((f) => (
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
                  type="text"
                  className="input"
                  placeholder={f.placeholder ?? ''}
                  value={values[f.key as keyof InterviewValues] as string | undefined ?? ''}
                  onChange={(e) => set(f.key as keyof InterviewValues, e.target.value)}
                />
              )}
              {f.helper && <div className="field__hint">{f.helper}</div>}
            </div>
          ))}
        </section>

        <NavButtons onNext={onContinue} />
      </div>
    </div>
  );
}
