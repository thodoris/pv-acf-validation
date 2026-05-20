/* SubmitScreen — cluster-by-cluster summary + consent recap + final confirm.
   On confirm: would post to /seal (stub for now per brief §8), then advances
   to thanks. The summary copy is hand-curated (matches the prototype); a
   data-derived summary keyed off answerStore is deferred. */

import { useState } from 'react';
import type { JSX } from 'react';
import { Icon } from '@/shell/Icon';
import { useAnswerStore } from '@/state/answerStore';
import { next } from '@/routing/navigation';

type StatusKind = 'ok' | 'neutral';

type SummaryRow = {
  kicker: string;
  title: string;
  sub: string;
  items: string;
  status: StatusKind;
  statusLabel: string;
};

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
  const answerCount = useAnswerStore((s) => Object.keys(s.answers).length);

  const onSubmit = () => {
    if (!confirmed) return;
    // Stub seal — real backend POST /seal is out of scope (brief §8).
    // The answers are already in localStorage; advancing to thanks reflects
    // a successful seal.
    if (import.meta.env.DEV) {
      console.info(`[submit] Sealing ${answerCount} answers (stub).`);
    }
    next();
  };

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
            disabled={!confirmed}
            onClick={onSubmit}
          >
            Submit my responses <Icon name="chevron-right" size={16} />
          </button>
          <span className="note-row">Once submitted, this form cannot be reopened.</span>
        </div>
      </div>
    </div>
  );
}
