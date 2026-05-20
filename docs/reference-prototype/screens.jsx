// Welcome screen — invitation, how-it-works, consent.
// Cluster-based vocabulary; tightened to set expectations clearly.

function WelcomeScreen({ onStart }) {
  const [infoOverlay, setInfoOverlay] = React.useState(null);
  return (
    <div className="welcome-shell">
      <div className="main main--wide">
        <div className="main__inner">
          <div className="kicker kicker--mute">{CONTENT.thesis.chapter}</div>
          <h1 className="h-display">Expert review<br/>of the PV-ACF framework</h1>
          <p className="tagline">
            Thank you for agreeing to evaluate the <em>Public-Value AI Co-production Framework</em>, or PV-ACF.
            This is an expert-oriented review for a doctoral thesis on AI governance. You are asked to
            draw on your practice, scholarship, or governance experience to test how well the framework
            names the conditions that shape AI deployments in public institutions, and how useful its
            instruments would be if applied. The thesis approaches AI through a critical co-production
            lens: AI systems are treated as institutional and political arrangements, not neutral tools.
            Your responses will be read as reasoned expert judgements, not as satisfaction ratings or
            opinions to be averaged.
          </p>

          <h2 className="h-chapter">How it works</h2>
          <p className="how-intro">
            Unlike a satisfaction survey, this instrument is built around a <strong>claim spine</strong>:
            you move through four short clusters of questions, drawing first on your{" "}
            <strong>recognition of patterns</strong> from practice and then on your{" "}
            <strong>judgement of specific claims</strong> the framework makes.
          </p>
          <ol className="how-list">
            <li className="how-item">
              <div>
                <div className="how-item__title">A short profile of you</div>
                <div className="how-item__body">
                  Under a minute. Institution type and years of practice. Your name is optional —
                  you can respond anonymously.
                </div>
              </div>
            </li>
            <li className="how-item">
              <div>
                <div className="how-item__title">A wide pass through the subject and the framework — 2 short screens</div>
                <div className="how-item__body">
                  Just enough orientation that the first cluster of questions is answerable from
                  a shared starting point. Each cluster afterwards carries its own narrower setup.
                </div>
              </div>
            </li>
            <li className="how-item">
              <div>
                <div className="how-item__title">Four claim-clusters of questions</div>
                <div className="how-item__body">
                  <strong>Problem</strong> — judging the gap before being shown the solution.{" "}
                  <strong>Framework</strong> — assessing the framework's central design choices.{" "}
                  <strong>Instruments</strong> — evaluating four operational instruments, one of
                  them genuinely interactive. <strong>Close</strong> — your own agenda, in your
                  own words.
                </div>
              </div>
            </li>
            <li className="how-item">
              <div>
                <div className="how-item__title">Reference library — always one click away</div>
                <div className="how-item__body">
                  From any screen, open <strong>concept cards</strong> or the{" "}
                  <strong>whole-framework presentation</strong> as an overlay above the current
                  screen. Your position is preserved; nothing locks while you read.
                </div>
              </div>
            </li>
            <li className="how-item">
              <div>
                <div className="how-item__title">Interrupt and return whenever you need</div>
                <div className="how-item__body">
                  You can stop at any point and return via the same link. Answered screens lock
                  when you advance to the next.
                </div>
              </div>
            </li>
          </ol>

          <h2 className="h-chapter" style={{ marginTop: "var(--space-7)" }}>What is recorded — and what is not</h2>
          <div className="consent-grid">
            <div className="consent-grid__col consent-grid__col--yes">
              <div className="consent-grid__head">
                <span className="consent-grid__icon" aria-hidden="true">✓</span>
                <span>Recorded</span>
              </div>
              <ul>
                <li>Your final, locked answers to the evaluation questions.</li>
                <li>Your profile (institution type, years, name if given).</li>
                <li>Your interview-willingness response, if you say yes — stored <em>separately</em> from your validation answers.</li>
              </ul>
            </div>
            <div className="consent-grid__col consent-grid__col--no">
              <div className="consent-grid__head">
                <span className="consent-grid__icon" aria-hidden="true">—</span>
                <span>Not recorded</span>
              </div>
              <ul>
                <li>What you read or open in the reference library.</li>
                <li>Free runs of the Architecture Selection Tool in Explore mode.</li>
                <li>Time spent on any individual screen.</li>
              </ul>
            </div>
          </div>

          <p style={{ fontStyle: "italic", color: "var(--ink-soft)", fontSize: 13.5, marginTop: "var(--space-4)" }}>
            The platform is in English. You may answer open-text questions in <strong>English or Greek</strong> — use whichever language lets you answer most fully.
          </p>

          <ResearchContextBand onOpen={setInfoOverlay}/>

          <section className="welcome-consent">
            <label className="check">
              <input type="checkbox" defaultChecked/>
              <span className="check__box" aria-hidden="true"/>
              <span>I have read the participation terms and consent to my final answers being recorded for research purposes.</span>
            </label>
            <label className="check">
              <input type="checkbox"/>
              <span className="check__box" aria-hidden="true"/>
              <span>I agree that my name may be listed in the thesis' acknowledgement of expert reviewers (optional).</span>
            </label>

            <div className="welcome-consent__cta">
              <button className="btn btn--primary btn--lg" onClick={onStart}>
                Begin <Icon name="chevron-right" size={16}/>
              </button>
              <span className="note-row">Best on a laptop or desktop · about 45–50 minutes total</span>
            </div>
          </section>
        </div>
      </div>

      <aside className="welcome__meta-card welcome__meta-card--rail">
        <div className="kicker kicker--mute" style={{ marginBottom: "var(--space-3)" }}>At a glance</div>
        <div className="welcome__meta-row"><span>Duration</span><span>45–50 minutes</span></div>
        <div className="welcome__meta-row"><span>Sessions</span><span>1 (interruption allowed)</span></div>
        <div className="welcome__meta-row"><span>Clusters</span><span>4</span></div>
        <div className="welcome__meta-row"><span>Questions</span><span>24 + 1 optional</span></div>
        <div className="welcome__meta-row"><span>Device</span><span>Desktop / laptop</span></div>
        <div className="welcome__meta-row"><span>UI language</span><span>English</span></div>
        <div className="welcome__meta-row"><span>Reply language</span><span>English or Greek</span></div>

        <div style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-3)", borderTop: "0.5px solid var(--border-soft)" }}>
          <div className="kicker kicker--mute" style={{ marginBottom: "var(--space-2)" }}>Time, by cluster</div>
          <div className="welcome__time-bar" role="img" aria-label="Approximate time distribution across clusters">
            <span className="welcome__time-seg" style={{ flex: 3,  background: "var(--ink-mute)" }} title="Grounding · ~3 min"/>
            <span className="welcome__time-seg" style={{ flex: 10, background: "var(--coral)"    }} title="Problem · ~10 min"/>
            <span className="welcome__time-seg" style={{ flex: 15, background: "var(--cobalt)"   }} title="Framework · ~15 min"/>
            <span className="welcome__time-seg" style={{ flex: 15, background: "var(--sage)"     }} title="Instruments · ~15 min"/>
            <span className="welcome__time-seg" style={{ flex: 5,  background: "var(--saffron)"  }} title="Close · ~5 min"/>
          </div>
          <div className="welcome__time-legend">
            <span><i style={{ background: "var(--ink-mute)" }}/>Grounding</span>
            <span><i style={{ background: "var(--coral)" }}/>Problem</span>
            <span><i style={{ background: "var(--cobalt)" }}/>Framework</span>
            <span><i style={{ background: "var(--sage)" }}/>Instruments</span>
            <span><i style={{ background: "var(--saffron)" }}/>Close</span>
          </div>
        </div>
      </aside>

      <WelcomeInfoOverlay kind={infoOverlay} onClose={() => setInfoOverlay(null)}/>
    </div>
  );
}
window.WelcomeScreen = WelcomeScreen;

/* ============================================================
   Research-context band — sits below the main Welcome content.
   Three sub-sections (research, ethics & participation, contact).
   The first two carry affordances that open lightweight overlays;
   contact is fully visible.
   ============================================================ */
function ResearchContextBand({ onOpen }) {
  return (
    <section className="research-band" aria-label="Research context">
      <div className="research-band__col">
        <div className="kicker kicker--mute">Research context</div>
        <p className="research-band__body">
          <strong>[Author Name]</strong> · PhD candidate, [Department, University]<br/>
          Supervised by [Supervisor Name]
        </p>
        <p className="research-band__body">
          This expert review is part of a doctoral thesis on AI governance in
          public administration. It validates a framework called PV-ACF.
        </p>
        <button
          type="button"
          className="research-band__link"
          onClick={() => onOpen("research")}
        >
          → Read more about the research
        </button>
      </div>

      <div className="research-band__col">
        <div className="kicker kicker--mute">Ethics and participation</div>
        <p className="research-band__body">
          Approved by <strong>[Ethics Committee Name]</strong>, reference
          [approval number], [approval date].
        </p>
        <p className="research-band__body">
          Participation is voluntary. You may withdraw at any time without
          giving a reason. Responses are confidential; identifying information
          is optional and appears in the thesis only in anonymised form unless
          you have explicitly consented otherwise.
        </p>
        <div className="research-band__links">
          <button
            type="button"
            className="research-band__link"
            onClick={() => onOpen("ethics")}
          >
            → Read the full ethics statement
          </button>
          <button
            type="button"
            className="research-band__link"
            onClick={() => onOpen("data")}
          >
            → How your data is handled
          </button>
        </div>
      </div>

      <div className="research-band__col">
        <div className="kicker kicker--mute">Contact</div>
        <p className="research-band__body">
          Questions about the research:<br/>
          <span className="research-band__email">[author email]</span>
        </p>
        <p className="research-band__body">
          Concerns about ethics or your rights as a participant:<br/>
          <span className="research-band__email">[supervisor email or ethics committee contact]</span>
        </p>
      </div>
    </section>
  );
}
window.ResearchContextBand = ResearchContextBand;

/* ---------- Lightweight overlay for research-context affordances ---------- */
const WELCOME_OVERLAYS = {
  research: {
    title: "About the research",
    body: (
      <>
        <p>
          [Overlay copy to be drafted separately.] This overlay will carry the
          longer-form research-context narrative: the thesis's central
          question, the role of PV-ACF in it, why expert review is being
          conducted at this stage, and what the data collected here will be
          used for.
        </p>
        <p>
          Substantive content sits here so the Welcome screen above can keep
          immediately visible only what the ethics committee requires to be
          immediately visible.
        </p>
      </>
    ),
  },
  ethics: {
    title: "Full ethics statement",
    body: (
      <>
        <p>
          [Overlay copy to be drafted separately.] This overlay will carry the
          full ethics statement as approved: lawful basis under GDPR,
          retention period, anonymisation procedure, withdrawal mechanics, the
          process for raising a concern, and contact for the ethics committee.
        </p>
      </>
    ),
  },
  data: {
    title: "How your data is handled",
    body: (
      <>
        <p>
          [Overlay copy to be drafted separately.] This overlay will detail
          what is recorded, how it is stored, who has access, how it is
          anonymised before it appears in the thesis, and the practical steps
          to withdraw your responses within the 30-day window after
          submission.
        </p>
      </>
    ),
  },
};

function WelcomeInfoOverlay({ kind, onClose }) {
  if (!kind) return null;
  const c = WELCOME_OVERLAYS[kind];
  if (!c) return null;
  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-label={c.title}>
      <div className="welcome-overlay__backdrop" onClick={onClose}/>
      <div className="welcome-overlay__panel">
        <div className="welcome-overlay__head">
          <span className="kicker kicker--mute">Reference</span>
          <button
            type="button"
            className="welcome-overlay__close"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" size={14}/>
          </button>
        </div>
        <h2 className="welcome-overlay__title">{c.title}</h2>
        <div className="welcome-overlay__body">{c.body}</div>
      </div>
    </div>
  );
}
window.WelcomeInfoOverlay = WelcomeInfoOverlay;
