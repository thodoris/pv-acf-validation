/* SubmittedTerminalScreen — post-submit terminal state.

   Rendered by the App-level guard whenever `sessionStore.submittedAt !== null`.
   This screen short-circuits the screen router entirely: once submitted,
   manual URL navigation, browser-back, refresh — all land here. Answers
   are no longer visible.

   The terminal screen explains the next-reviewer scenario and offers a
   confirm-gated reset button that wipes both localStorage keys and
   reloads `/` for a fresh start. Resetting does NOT remove the document
   from Firestore — the submission already happened. */

import type { JSX } from 'react';
import { useSessionStore } from '@/state/sessionStore';

function formatStamp(ts: number | null): string {
  if (ts === null) return '—';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return new Date(ts).toISOString();
  }
}

function handleReset(): void {
  // Hard reload: wipe both persistence keys and navigate to `/`. The
  // fresh page load re-instantiates Zustand from empty storage; no
  // state-management gymnastics. The Firestore document is unaffected —
  // the researcher already has it.
  const ok = window.confirm(
    'Clear the questionnaire state on this device and start over? ' +
      'Your already-submitted responses are kept by the researcher.',
  );
  if (!ok) return;
  localStorage.removeItem('pvacf:answers');
  localStorage.removeItem('pvacf:session');
  window.location.href = '/';
}

export function SubmittedTerminalScreen(): JSX.Element {
  const submittedAt = useSessionStore((s) => s.submittedAt);
  const sealedDocId = useSessionStore((s) => s.sealedDocId);

  return (
    <div className="main main--wide">
      <div className="main__inner thanks">
        <div className="kicker">Complete</div>
        <h1 className="h-display">Thank you for your review.</h1>
        <p className="tagline">
          Your responses have been sealed and added to the validation record.
        </p>

        <p className="lede" style={{ maxWidth: 640 }}>
          Submitted on{' '}
          <span className="mono" style={{ color: 'var(--ink-strong)' }}>
            {formatStamp(submittedAt)}
          </span>
          .{' '}
          {sealedDocId && (
            <>
              Record id{' '}
              <span className="mono" style={{ color: 'var(--ink-soft)', fontSize: 13 }}>
                {sealedDocId}
              </span>
              .
            </>
          )}
        </p>

        <div className="thanks__cards">
          <div className="card">
            <div className="kicker kicker--mute">What happens next</div>
            <p style={{ margin: '8px 0 0', fontSize: 13.5 }}>
              If you said you were open to a follow-up interview, the author will
              reach out within two weeks. Interviews are typically 25 minutes and
              entirely voluntary.
            </p>
          </div>
          <div className="card">
            <div className="kicker kicker--mute">If you change your mind</div>
            <p style={{ margin: '8px 0 0', fontSize: 13.5 }}>
              You may withdraw your responses up to 30 days after submission by
              emailing the author. Withdrawal removes your record from the dataset;
              it does not retroactively remove already-published aggregate analysis.
            </p>
          </div>
          <div className="card">
            <div className="kicker kicker--mute">Contact</div>
            <p style={{ margin: '8px 0 0', fontSize: 13.5 }}>
              <span className="mono" style={{ color: 'var(--ink-soft)' }}>
                papadopoulos@aegean.gr
              </span>
              <br />
              Department of Public Administration · University of the Aegean
            </p>
          </div>
        </div>

        <section
          aria-label="Share this device with another reviewer"
          style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4) var(--space-5)',
            background: 'var(--surface-deep)',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: 640,
          }}
        >
          <div className="kicker kicker--mute" style={{ marginBottom: 'var(--space-2)' }}>
            Sharing this device with a different reviewer?
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '0 0 var(--space-3)' }}>
            If a different reviewer needs to use this device, they can either open
            the questionnaire in a separate browser (or incognito window), or press{' '}
            <strong>Start a new session</strong> below to clear the current
            questionnaire from this device. Clearing the local state does not affect
            the responses already submitted to the researcher.
          </p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleReset}
          >
            Start a new session
          </button>
        </section>

        <p className="thanks__closer italic" style={{ marginTop: 'var(--space-6)' }}>
          With appreciation — for your time, your expertise, and the rigour you
          brought to this review.
        </p>
      </div>
    </div>
  );
}
