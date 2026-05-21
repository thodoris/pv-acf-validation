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
import { next } from '@/routing/navigation';
import { getSealedPayload } from '@/state/sealPayload';
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

  const onSubmit = async () => {
    if (!confirmed || submitState === 'submitting') return;
    setSubmitState('submitting');
    setErrorMsg(null);
    try {
      const payload = getSealedPayload();
      const docId = await sealToFirestore(payload);
      if (import.meta.env.DEV) {
        console.info('[submit] Sealed.', { docId, payload });
      }
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
