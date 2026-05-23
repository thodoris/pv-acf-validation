/* SubmitScreen — cluster-by-cluster summary + consent recap + final confirm.
   On confirm: writes the sealed payload to Firestore, then advances to thanks.
   On write failure: shows an inline error with a Retry button; answers stay
   in localStorage so a retry replays cleanly. The summary copy is hand-curated
   (matches the prototype); a data-derived summary keyed off answerStore is
   deferred. */

import { useState } from 'react';
import type { JSX } from 'react';
import { Icon } from '@/shell/Icon';
import { useAnswerStore } from '@/state/answerStore';
import { useSessionStore } from '@/state/sessionStore';
import { next } from '@/routing/navigation';
import { getSealedPayload, sanitizeSealPayload } from '@/state/sealPayload';
import { sealToFirestore } from '@/lib/sealSubmission';

type StatusKind = 'ok' | 'neutral';

type SummaryRow = {
  kicker: string;
  title: string;
  sub: string;
  items: string;
  status: StatusKind;
  statusLabel: string;
};

type SubmitState = 'idle' | 'submitting' | 'error';

const SUMMARY_ROWS: SummaryRow[] = [
  {
    kicker: 'Profile',
    title: 'Respondent profile',
    sub: 'Institution type · years in practice · name (optional)',
    items: '2 / 2 required',
    status: 'ok',
    statusLabel: 'Captured',
  },
  {
    kicker: 'Cluster 1',
    title: 'The problem',
    sub: 'Solution-first framing · institutional reshaping · strategy-level priorities · cross-layer nesting · coverage of existing checks · warrant · generative-LLM shift',
    items: '8 / 8',
    status: 'ok',
    statusLabel: 'Complete',
  },
  {
    kicker: 'Cluster 2',
    title: 'The framework',
    sub: 'Two-stage architecture · recursive cycle · four governance gaps (judgment + recognition) · structural coherence · returning to the conditions · Generative-LLM Gate',
    items: '7 / 7',
    status: 'ok',
    statusLabel: 'Complete',
  },
  {
    kicker: 'Cluster 3',
    title: 'The instruments',
    sub: 'CIW · AST (flagship) · DMA · CPD — two questions per instrument',
    items: '8 / 8',
    status: 'ok',
    statusLabel: 'Complete',
  },
  {
    kicker: 'Cluster 4',
    title: 'The close',
    sub: 'Catch-all (required) · meta-feedback (optional)',
    items: '1 / 1 required',
    status: 'ok',
    statusLabel: 'Complete',
  },
  {
    kicker: 'Optional',
    title: 'Follow-up interview willingness',
    sub: 'Not part of the validation record. Voluntary capture.',
    items: '—',
    status: 'neutral',
    statusLabel: 'Optional',
  },
];

export function SubmitScreen(): JSX.Element {
  const [confirmed, setConfirmed] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const answerCount = useAnswerStore((s) => Object.keys(s.answers).length);
  // Acknowledgement-listing block: only rendered when the respondent gave
  // a name on the Profile screen. The opt-in itself lives in sessionStore
  // and is auto-reset to `false` whenever the name is cleared.
  const profileName = useSessionStore((s) => s.profile?.name?.trim() ?? '');
  const acknowledgeListing = useSessionStore((s) => s.acknowledgeListing);
  const setAcknowledgeListing = useSessionStore((s) => s.setAcknowledgeListing);
  const showAckBlock = profileName.length > 0;

  const onSubmit = async () => {
    if (!confirmed || submitState === 'submitting') return;
    setSubmitState('submitting');
    setErrorMsg(null);
    try {
      const raw = getSealedPayload();

      // Last client-side safety net: per-screen guards should already have
      // refused to lock anything over the limit. If a tampered store or
      // legacy locked answer slipped through, clip the over-length values
      // (and drop a malformed email) rather than dead-end the user — they
      // cannot edit locked answers from here. Server-side enforcement
      // (Firestore rules in Console) is the actual guarantee — see
      // docs/decisions/0008-text-length-enforcement.md for the full
      // picture.
      const { payload, fixed } = sanitizeSealPayload(raw);
      if (fixed.length > 0 && import.meta.env.DEV) {
        console.warn(
          '[submit] Sanitised over-limit values before seal — sent payload differs from store:',
          fixed,
        );
      }

      const docId = await sealToFirestore(payload);
      if (import.meta.env.DEV) {
        console.info('[submit] Sealed.', { docId, payload, fixed });
      }
      // Stamp the session as submitted BEFORE navigating. The App-level
      // guard reads this flag and short-circuits every subsequent screen
      // request to the terminal screen — so by the time `next()` runs,
      // any attempt to revisit a question screen will already be intercepted.
      useSessionStore.getState().markSubmitted(docId);
      next();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (import.meta.env.DEV) {
        console.error('[submit] Firestore write failed.', err);
      }
      setErrorMsg(msg);
      setSubmitState('error');
    }
  };

  const isSubmitting = submitState === 'submitting';
  const isError = submitState === 'error';

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">Submit</div>
        <h1 className="h-display">Review and submit your responses</h1>
        <p className="tagline">Your final answers will be locked once you submit.</p>

        <p className="lede">
          Below is a summary of what you have answered, organised by cluster. You can
          use <strong>Back</strong> to return to any screen before submitting — locked
          answers remain reviewable. After submission, your responses are sealed and
          the form closes.
        </p>

        <section className="summary">
          <div className="summary__row summary__row--head">
            <span>Cluster</span>
            <span>Items</span>
            <span>Status</span>
          </div>

          {SUMMARY_ROWS.map((r, i) => (
            <div className="summary__row" key={i}>
              <div>
                <div className="summary__kicker mono">{r.kicker}</div>
                <div className="summary__title">{r.title}</div>
                <div className="summary__sub">{r.sub}</div>
              </div>
              <span className="mono">{r.items}</span>
              <span className={`summary__pill summary__pill--${r.status}`}>
                {r.statusLabel}
              </span>
            </div>
          ))}

          <div className="summary__totals">
            <span>Total · {answerCount} answers recorded</span>
            <span>Time on instrument · session-tracked</span>
          </div>
        </section>

        <div className="consent-recap">
          <div className="kicker kicker--mute">Consent recap</div>
          <p>
            Only your locked answers above are recorded. Free navigation in the
            reference library and free re-runs of the Architecture Selection Tool are
            not captured. The optional follow-up-interview information is stored
            separately and is not analysed alongside your responses. You consented to
            this recording at the start of the session.
          </p>
        </div>

        {showAckBlock && (
          <section className="ack-listing">
            <div className="kicker kicker--mute">Acknowledgement listing</div>
            <p className="ack-listing__note">
              Optional. Applies only if you gave your name on the profile screen.
            </p>
            <label className="check">
              <input
                type="checkbox"
                checked={acknowledgeListing}
                onChange={(e) => setAcknowledgeListing(e.target.checked)}
                disabled={isSubmitting}
              />
              <span className="check__box" aria-hidden="true" />
              <span>
                I agree that the name I gave on the profile screen may be listed in
                the thesis' acknowledgement of expert reviewers.
              </span>
            </label>
          </section>
        )}

        <div className="consent-recap consent-recap--final">
          <label className="check">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={isSubmitting}
            />
            <span className="check__box" aria-hidden="true" />
            <span>
              I confirm that my answers are final. I understand they will be sealed
              upon submission.
            </span>
          </label>
        </div>

        <div className="submit-actions">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            disabled={!confirmed || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? 'Sealing…' : isError ? 'Retry submission' : 'Submit my responses'}
            {!isSubmitting && <Icon name="chevron-right" size={16} />}
          </button>
          <span className="note-row">
            {isError
              ? 'Submission failed. Your answers are still saved locally — retry below.'
              : 'Once submitted, this form cannot be reopened.'}
          </span>
          {isError && errorMsg && (
            <div className="note-row" role="alert" style={{ color: 'var(--danger, #b00020)' }}>
              <strong>Error:</strong> {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

