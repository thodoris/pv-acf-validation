// Submit confirmation + Thank-you screens. Cluster-based vocabulary.

function SubmitScreen({ onSubmit }) {
  const [confirmed, setConfirmed] = React.useState(false);

  // Summary row data driven from the spine structure
  const rows = [
    {
      kicker: "Profile",
      title: "Respondent profile",
      sub: "Institution type · years in practice · name (optional)",
      items: "2 / 2 required",
      status: "ok",
      statusLabel: "Captured",
    },
    {
      kicker: "Cluster 1",
      title: "The problem",
      sub: "Solution-first framing · institutional reshaping · strategy-level priorities · cross-layer nesting · coverage of existing checks · warrant · generative-LLM shift",
      items: "8 / 8",
      status: "ok",
      statusLabel: "Complete",
    },
    {
      kicker: "Cluster 2",
      title: "The framework",
      sub: "Two-stage architecture · recursive cycle · four governance gaps (judgment + recognition) · structural coherence · returning to the conditions · Generative-LLM Gate",
      items: "7 / 7",
      status: "ok",
      statusLabel: "Complete",
    },
    {
      kicker: "Cluster 3",
      title: "The instruments",
      sub: "CIW · AST (flagship) · DMA · CPD — two questions per instrument",
      items: "8 / 8",
      status: "ok",
      statusLabel: "Complete",
    },
    {
      kicker: "Cluster 4",
      title: "The close",
      sub: "Catch-all (required) · meta-feedback (optional)",
      items: "1 / 1 required",
      status: "ok",
      statusLabel: "Complete",
    },
    {
      kicker: "Optional",
      title: "Follow-up interview willingness",
      sub: "Not part of the validation record. Voluntary capture.",
      items: "—",
      status: "neutral",
      statusLabel: "Optional",
    },
  ];

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">Submit</div>
        <h1 className="h-display">Review and submit your responses</h1>
        <p className="tagline">Your final answers will be locked once you submit.</p>

        <p className="lede">
          Below is a summary of what you have answered, organised by cluster. You can use{" "}
          <strong>Back</strong> to return to any screen before submitting — locked answers remain
          reviewable. After submission, your responses are sealed and the form closes.
        </p>

        <section className="summary">
          <div className="summary__row summary__row--head">
            <span>Cluster</span><span>Items</span><span>Status</span>
          </div>

          {rows.map((r, i) => (
            <div className="summary__row" key={i}>
              <div>
                <div className="summary__kicker mono">{r.kicker}</div>
                <div className="summary__title">{r.title}</div>
                <div className="summary__sub">{r.sub}</div>
              </div>
              <span className="mono">{r.items}</span>
              <span className={`summary__pill summary__pill--${r.status}`}>{r.statusLabel}</span>
            </div>
          ))}

          <div className="summary__totals">
            <span>Total · 24 of 24 required items answered</span>
            <span>Time on instrument · 1 h 18 min</span>
          </div>
        </section>

        <div className="consent-recap">
          <div className="kicker kicker--mute">Consent recap</div>
          <p>
            Only your locked answers above are recorded. Free navigation in the reference library and
            free re-runs of the Architecture Selection Tool are not captured. The optional
            follow-up-interview information is stored separately and is not analysed alongside your
            responses. You consented to this recording at the start of the session.
          </p>
          <label className="check">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}/>
            <span className="check__box" aria-hidden="true"/>
            <span>I confirm that my answers are final. I understand they will be sealed upon submission.</span>
          </label>
        </div>

        <div className="submit-actions">
          <button
            className="btn btn--primary btn--lg"
            disabled={!confirmed}
            onClick={onSubmit}
          >
            Submit my responses <Icon name="chevron-right" size={16}/>
          </button>
          <span className="note-row">Once submitted, this form cannot be reopened.</span>
        </div>
      </div>
    </div>
  );
}
window.SubmitScreen = SubmitScreen;

function ThanksScreen() {
  return (
    <div className="main main--wide">
      <div className="main__inner thanks">
        <div className="kicker">Complete</div>
        <h1 className="h-display">Thank you for your review.</h1>
        <p className="tagline">Your judgement strengthens the framework's validation.</p>

        <p className="lede" style={{ maxWidth: 640 }}>
          Your responses have been sealed and added to the validation record. The thesis' Chapter 9
          analyses each cluster of expert input separately — your contributions to the problem
          cluster, to the framework's design claims, to the operational evaluation of the four
          instruments, and to the closing catch-all will all be visible in aggregate, never
          identified, in the published version.
        </p>

        <div className="thanks__cards">
          <div className="card">
            <div className="kicker kicker--mute">What happens next</div>
            <p style={{ margin: "8px 0 0", fontSize: 13.5 }}>
              If you said you were open to a follow-up interview, the author will reach out within
              two weeks. Interviews are typically 25 minutes and entirely voluntary.
            </p>
          </div>
          <div className="card">
            <div className="kicker kicker--mute">If you change your mind</div>
            <p style={{ margin: "8px 0 0", fontSize: 13.5 }}>
              You may withdraw your responses up to 30 days after submission by emailing the author.
              Withdrawal removes your record from the dataset; it does not retroactively remove
              already-published aggregate analysis.
            </p>
          </div>
          <div className="card">
            <div className="kicker kicker--mute">Contact</div>
            <p style={{ margin: "8px 0 0", fontSize: 13.5 }}>
              <span className="mono" style={{ color: "var(--ink-soft)" }}>papadopoulos@aegean.gr</span><br/>
              Department of Public Administration · University of the Aegean
            </p>
          </div>
        </div>

        <p className="thanks__closer italic">
          With appreciation — for your time, your expertise, and the rigour you brought to this review.
        </p>
      </div>
    </div>
  );
}
window.ThanksScreen = ThanksScreen;
