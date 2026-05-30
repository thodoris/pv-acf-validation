/* Welcome — invitation, how-it-works, consent grid, research-context band,
   at-a-glance meta card. Owns its own layout (welcome-shell) because
   hasShell:false on this screen — TopBar and Rail are suppressed by App. */

import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { Icon } from '@/shell/Icon';
import { ProtectedEmail } from '@/shell/ProtectedEmail';
import { CONTENT } from '@/content';
import { useSessionStore, CONSENT_VERSION } from '@/state/sessionStore';
import { next } from '@/routing/navigation';
import type { VariantId } from '@/content/variants';
import {
  formatDurationRange,
  formatQuestionCount,
  phaseMinutesFor,
  PHASE_WEIGHTS,
  TIMEBAR_PHASES,
} from '@/lib/duration';
import { RESEARCHER, SUPERVISOR } from '@/lib/contacts';

type InfoOverlayKind = 'research' | 'ethics' | 'data' | null;

export function WelcomeScreen(): JSX.Element {
  const [infoOverlay, setInfoOverlay] = useState<InfoOverlayKind>(null);
  // GDPR Art. 7 / Recital 32: consent cannot be inferred from a pre-ticked
  // box. The consent checkbox starts unchecked and the Begin button is
  // disabled until the reviewer actively ticks it.
  const [consentTicked, setConsentTicked] = useState(false);
  const acknowledgeConsent = useSessionStore((s) => s.acknowledgeConsent);
  const variant = useSessionStore((s) => s.variant);
  const durationCopy = formatDurationRange(variant);

  const onBegin = () => {
    if (!consentTicked) return;
    acknowledgeConsent(CONSENT_VERSION);
    next();
  };

  return (
    <div className="welcome-shell">
      <div className="main main--wide">
        <div className="main__inner">
          {/* Site-logo treatment in the welcome hero context — same `.brand`
              vocabulary as the TopBar (C9 mark + display-font text token),
              upsized via `.brand--welcome` since this is the hero entry
              point and no TopBar is rendered here (hasShell: false). */}
          <div className="brand brand--welcome">
            <span className="brand__mark" aria-hidden="true">C9</span>
            <span>{CONTENT.thesis.chapter}</span>
          </div>
          <p className="welcome__authorship">
            A doctoral thesis by Theodoros Papadopoulos at the University of the Aegean.
          </p>
          <h1 className="h-display">
            Expert review
            <br />
            of the PV-ACF framework
          </h1>
          {/* Lede de-italicised + rewritten (Delta 1). Uses `.lede` rather than
              `.tagline` so the paragraph is roman/black-body, not coral italic. */}
          <p className="lede">
            Thank you for agreeing to evaluate the{' '}
            <em>Public-Value AI Co-production Framework</em>, or PV-ACF. This is an{' '}
            <strong>expert-oriented review</strong> for a doctoral thesis on AI
            governance. You are asked to draw on your{' '}
            <strong>practice, scholarship, or governance experience</strong> to test
            how well the framework names the conditions that shape AI deployments in
            public institutions, and how useful its instruments would be if applied.
            Your responses will be read as{' '}
            <strong>reasoned expert judgements</strong>, not as satisfaction ratings
            or opinions to be averaged.
          </p>

          <h2 className="h-chapter">How it works</h2>
          <p className="how-intro">
            Unlike a satisfaction survey, this instrument is built around a{' '}
            <strong>claim spine</strong>: you move through four short clusters of
            questions, drawing first on your{' '}
            <strong>recognition of patterns</strong> from practice and then on your{' '}
            <strong>judgement of specific claims</strong> the framework makes.
          </p>
          <ol className="how-list">
            <HowItem title="A short profile of you">
              Under a minute. Institution type and years of practice. Your name is
              optional — you can respond anonymously.
            </HowItem>
            <HowItem title="A wide pass through the subject and the framework — 2 short screens">
              Just enough orientation that the first cluster of questions is answerable
              from a shared starting point. Each cluster afterwards carries its own
              narrower setup.
            </HowItem>
            <HowItem title="Four claim-clusters of questions">
              <strong>Problem</strong> — judging the gap before being shown the
              solution. <strong>Framework</strong> — assessing the framework's central
              design choices. <strong>Instruments</strong> — evaluating four operational
              instruments, one of them genuinely interactive. <strong>Close</strong> —
              your own agenda, in your own words.
            </HowItem>
            <HowItem title="Reference library — always one click away">
              From any screen, open <strong>concept cards</strong> or the{' '}
              <strong>framework reference layer</strong> as an overlay above the
              current screen. Your position is preserved; nothing locks while you read.
            </HowItem>
            <HowItem title="Pause and return whenever you need">
              You can stop at any point and continue later on the same browser —
              your in-progress answers stay on this device until you submit, when
              they are sealed. Switching devices, clearing site data, or returning
              after 24 hours starts a fresh session.
            </HowItem>
          </ol>

          <h2 className="h-chapter" style={{ marginTop: 'var(--space-7)' }}>
            What is recorded — and what is not
          </h2>
          <div className="consent-grid">
            <div className="consent-grid__col consent-grid__col--yes">
              <div className="consent-grid__head">
                <span className="consent-grid__icon" aria-hidden="true">
                  ✓
                </span>
                <span>Recorded</span>
              </div>
              <ul>
                <li>Your final, locked answers to the evaluation questions.</li>
                <li>Your profile (institution type, years, name if given).</li>
                <li className="hide-in-short">
                  Your interview-willingness response, if you say yes — stored{' '}
                  <em>separately</em> from your validation answers.
                </li>
              </ul>
            </div>
            <div className="consent-grid__col consent-grid__col--no">
              <div className="consent-grid__head">
                <span className="consent-grid__icon" aria-hidden="true">
                  —
                </span>
                <span>Not recorded</span>
              </div>
              <ul>
                <li>What you read or open in the reference library.</li>
                <li>Free runs of the Architecture Selection Tool in Explore mode.</li>
                <li>Time spent on any individual screen.</li>
              </ul>
            </div>
          </div>

          {/* Delta 5: standalone language note paragraph removed.
              Delta 7: layout reorder — withdrawal note (Delta 8) sits above the
              consent action, which itself moved above the institutional band
              (now rendered as a footer below). */}

          <p className="welcome__withdraw">
            Participation is voluntary. You may withdraw at any time without giving
            a reason.
          </p>

          <section className="welcome-consent">
            <label className="check">
              <input
                type="checkbox"
                checked={consentTicked}
                onChange={(e) => setConsentTicked(e.target.checked)}
              />
              <span className="check__box" aria-hidden="true" />
              <span>
                I have read the participation terms and consent to my final answers
                being recorded for research purposes.
              </span>
            </label>

            <div className="welcome-consent__cta">
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={onBegin}
                disabled={!consentTicked}
                aria-disabled={!consentTicked}
              >
                Begin <Icon name="chevron-right" size={16} />
              </button>
              <span className="note-row">
                {consentTicked ? (
                  <>Best on a laptop or desktop · about {durationCopy} total</>
                ) : (
                  'Tick the consent box above to continue.'
                )}
              </span>
            </div>
          </section>

          <hr className="welcome__footer-divider" />
          <ResearchContextBand onOpen={setInfoOverlay} />
        </div>
      </div>

      <WelcomeMetaCard durationCopy={durationCopy} />
      <WelcomeInfoOverlay
        kind={infoOverlay}
        variant={variant}
        onClose={() => setInfoOverlay(null)}
      />
    </div>
  );
}

function HowItem({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <li className="how-item">
      <div>
        <div className="how-item__title">{title}</div>
        <div className="how-item__body">{children}</div>
      </div>
    </li>
  );
}

function WelcomeMetaCard({ durationCopy }: { durationCopy: string }): JSX.Element {
  const variant = useSessionStore((s) => s.variant);
  const questionsCopy = formatQuestionCount(variant);
  return (
    <aside className="welcome__meta-card welcome__meta-card--rail">
      <div className="kicker kicker--mute" style={{ marginBottom: 'var(--space-3)' }}>
        At a glance
      </div>
      <div className="welcome__meta-row">
        <span>Duration</span>
        <span>{durationCopy}</span>
      </div>
      <div className="welcome__meta-row">
        <span>Sessions</span>
        <span>1</span>
      </div>
      <div className="welcome__meta-row">
        <span>Clusters</span>
        <span>4</span>
      </div>
      <div className="welcome__meta-row">
        <span>Questions</span>
        <span>{questionsCopy}</span>
      </div>
      <div className="welcome__meta-row">
        <span>Device</span>
        <span>Desktop / laptop</span>
      </div>
      <div className="welcome__meta-row">
        <span>UI language</span>
        <span>English</span>
      </div>
      <div className="welcome__meta-row">
        <span>Reply language</span>
        <span>English or Greek</span>
      </div>

      <div
        style={{
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-3)',
          borderTop: '0.5px solid var(--border-soft)',
        }}
      >
        <div className="kicker kicker--mute" style={{ marginBottom: 'var(--space-2)' }}>
          Time, by cluster
        </div>
        <div
          className="welcome__time-bar"
          role="img"
          aria-label="Approximate time distribution across clusters"
        >
          {TIMEBAR_PHASES.map((entry) => (
            <span
              key={entry.phase}
              className="welcome__time-seg"
              style={{ flex: PHASE_WEIGHTS[entry.phase], background: entry.varToken }}
              title={`${entry.label} · ~${phaseMinutesFor(entry.phase, variant)} min`}
            />
          ))}
        </div>
        <div className="welcome__time-legend">
          {TIMEBAR_PHASES.map((entry) => (
            <span key={entry.phase}>
              <i style={{ background: entry.varToken }} />
              {entry.label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ResearchContextBand({
  onOpen,
}: {
  onOpen: (k: InfoOverlayKind) => void;
}): JSX.Element {
  return (
    <section className="research-band" aria-label="Research context">
      <div className="research-band__col">
        <div className="kicker kicker--mute">Research context</div>
        <p className="research-band__body">
          <strong>Theodoros Papadopoulos</strong> · PhD candidate, University of the Aegean
          <br />
         
          Supervised by Professor Ioannis Charalampidis
        </p>
        <p className="research-band__body">
          This expert review is part of a doctoral thesis on AI governance in public
          administration. It validates a framework called PV-ACF.
        </p>
        <button
          type="button"
          className="research-band__link"
          onClick={() => onOpen('research')}
        >
          → Read more about the research
        </button>
      </div>

      <div className="research-band__col">
        <div className="kicker kicker--mute">Ethics and participation</div>
        <p className="research-band__body">
          Responses are confidential; identifying information is optional and
          appears in the thesis only in anonymised form unless you have explicitly
          consented otherwise.
        </p>
        <div className="research-band__links">
          <button
            type="button"
            className="research-band__link"
            onClick={() => onOpen('ethics')}
          >
            → Read the full ethics statement
          </button>
          <button
            type="button"
            className="research-band__link"
            onClick={() => onOpen('data')}
          >
            → How your data is handled
          </button>
        </div>
      </div>

      <div className="research-band__col">
        <div className="kicker kicker--mute">Contact</div>
        <p className="research-band__body">
          Questions about the research:
          <br />
          
        </p>
        <p className="research-band__body">
          <ProtectedEmail contact={RESEARCHER} className="research-band__email" />
          <br />
          <ProtectedEmail contact={SUPERVISOR} className="research-band__email" />
        </p>
      </div>
    </section>
  );
}

type OverlayEntry = {
  title: string;
  /** Body may be a static ReactNode or a render function that receives the
   *  active variant (so e.g. the ethics overlay can read the variant-aware
   *  duration range from src/lib/duration.ts). */
  body: ReactNode | ((variant: VariantId) => ReactNode);
};

const WELCOME_OVERLAYS: Record<Exclude<InfoOverlayKind, null>, OverlayEntry> = {
  research: {
    title: 'About the research',
    body: (
      <>
        <p>
          This expert review is part of a doctoral thesis titled{' '}
          <em>Governing with AI, Governing AI: Developing the Public Value AI
          Co-production Framework</em>.
        </p>
        <p>
          The thesis examines how artificial intelligence is being governed in public
          administration, and how public administrations are increasingly governing{' '}
          <em>with</em> AI systems in their own services and decision processes.
        </p>

        <h3>What the thesis studies</h3>
        <p>The research focuses on three connected levels of AI governance:</p>
        <ul>
          <li>
            <strong>Policy and strategy</strong> — how national and European AI
            strategies define what AI is for, what futures it promises, and which
            public problems it is expected to solve.
          </li>
          <li>
            <strong>Regulation</strong> — how frameworks such as the EU AI Act
            translate these assumptions into regulatory categories, obligations, and
            governance mechanisms.
          </li>
          <li>
            <strong>Deployment</strong> — how AI systems enter public organisations,
            reshape administrative work, and affect accountability, discretion,
            contestation, and public value.
          </li>
        </ul>

        <h3>The central concern</h3>
        <p>
          The thesis starts from a critical co-production perspective. AI systems are
          not treated as neutral tools that simply enter public institutions from the
          outside. They are understood as sociotechnical arrangements: shaped by public
          institutions, policy priorities, vendors, infrastructures, and legal
          frameworks, while also reshaping administrative routines, decision authority,
          and citizen-state relations.
        </p>
        <p>
          The central concern is that AI governance can become too narrow when it
          focuses only on technical performance, compliance, or risk documentation.
          These are important, but they may miss earlier and deeper questions: how the
          problem was framed, why AI became the expected solution, who shaped the
          deployment, what dependencies were accepted, and whether affected people can
          meaningfully challenge the system.
        </p>

        <h3>The framework being reviewed</h3>
        <p>
          The Public-Value AI Co-production Framework, or PV-ACF, is the practical
          artefact developed by the thesis. It is designed as a critical-deliberative
          framework for public administration.
        </p>
        <p>
          PV-ACF does not aim to replace legal compliance, data protection, procurement
          review, or technical audit. Instead, it asks what these mechanisms often
          leave under-examined: the institutional, political, and infrastructural
          conditions under which AI deployments become possible and routine.
        </p>

        <h3>Why this review matters</h3>
        <p>
          This expert review supports the validation of PV-ACF. You are asked to assess
          whether the framework names real governance problems, whether its design
          choices are coherent, and whether selected instruments would be useful for
          practitioners, researchers, regulators, or other governance actors.
        </p>
        <p>
          Your responses will be treated as expert judgements. Agreement is not
          assumed. Disagreement, uncertainty, examples, and limits are all valuable for
          the research.
        </p>

        <h3>Where this review fits in the thesis</h3>
        <p>
          This expert review forms part of the thesis's validation strategy, which
          combines retrospective application of the framework to a documented
          public-administration AI case with this prospective expert validation. Your
          responses contribute alongside the case material as reasoned expert
          judgements that test the framework's claims, design choices, and operational
          instruments.
        </p>

        <h3>Research outputs</h3>
        <p>Findings from the thesis and from this expert review may inform:</p>
        <ul>
          <li>the doctoral thesis and its defence materials;</li>
          <li>peer-reviewed academic publications;</li>
          <li>conference presentations and academic working papers;</li>
          <li>
            subsequent refinement of the PV-ACF framework's instruments and design
            choices.
          </li>
        </ul>

        <h3>Researcher and supervision</h3>
        <ul>
          <li>
            <strong>Researcher:</strong> Theodoros Papadopoulos, University of the
            Aegean.
          </li>
          <li>
            <strong>Supervisor:</strong> Professor Ioannis Charalampidis, University of
            the Aegean.
          </li>
        </ul>

        <p>
          For procedural details on participation, data handling, and your rights as a
          participant, see the Ethics and Data overlays from the Welcome screen.
        </p>

        <h3>Want to discuss the research before participating?</h3>
        <p>
          If you would like to discuss the research, the framework's intellectual
          foundations, or the case material it draws on before completing the review,
          you are welcome to contact the researcher directly at{' '}
          <ProtectedEmail contact={RESEARCHER} />.
        </p>
      </>
    ),
  },
  ethics: {
    title: 'Ethics statement',
    body: (variant: VariantId) => (
      <>
        <p>
          This expert review forms part of a doctoral thesis on AI governance in public
          administration. The purpose of the review is to evaluate the Public-Value AI
          Co-production Framework (PV-ACF) through reasoned expert judgement.
        </p>

        <h3>Researcher and supervision</h3>
        <ul>
          <li>
            <strong>Researcher:</strong> Theodoros Papadopoulos, University of the
            Aegean.
          </li>
          <li>
            <strong>Supervisor:</strong> Professor Ioannis Charalampidis, University of
            the Aegean.
          </li>
        </ul>

        <h3>What participation involves</h3>
        <ul>
          <li>An online expert review of the PV-ACF framework.</li>
          <li>
            Questions about your experience, your judgement of selected framework
            claims, and your assessment of selected instruments.
          </li>
          <li>
            Most questions use rating scales. Some invite optional open-text responses.
          </li>
          <li>You may answer open-text questions in English or Greek.</li>
          <li>
            Expected completion time: approximately {formatDurationRange(variant)}.
          </li>
        </ul>

        <h3>Voluntary participation</h3>
        <ul>
          <li>Participation is voluntary.</li>
          <li>You may stop at any point before final submission.</li>
          <li>You do not have to answer optional open-text questions.</li>
          <li>
            You may withdraw without giving a reason. Withdrawal after submission is
            possible until the analysis cut-off (see the data-handling overlay).
          </li>
        </ul>

        <h3>What your responses are used for</h3>
        <ul>
          <li>
            Your responses will be used as expert-review evidence in Chapter 9 of the
            doctoral thesis.
          </li>
          <li>
            Responses will be analysed as reasoned expert judgements, not as
            satisfaction scores.
          </li>
          <li>
            The analysis may report patterns, disagreements, examples, and named
            limitations raised by reviewers.
          </li>
          <li>
            Direct quotations may be used only in anonymised form, unless you have
            explicitly agreed to public acknowledgement via the acknowledgement-listing
            option on the Submit screen.
          </li>
        </ul>

        <h3>Confidentiality and anonymity</h3>
        <ul>
          <li>Your name is optional. You may complete the review anonymously.</li>
          <li>
            If you provide your name or institution, these details will be kept
            separate from the analytical reporting where possible.
          </li>
          <li>
            Identifying details will not appear in the thesis unless you have
            explicitly consented to public acknowledgement.
          </li>
        </ul>

        <h3>Possible risks and benefits</h3>
        <ul>
          <li>
            The review involves low risk. It asks for professional or scholarly
            judgement, not sensitive personal information.
          </li>
          <li>
            You should avoid including confidential institutional information in
            open-text responses.
          </li>
          <li>There is no direct personal benefit from participation.</li>
          <li>
            Your contribution supports the validation and refinement of a doctoral
            framework for democratic AI governance in public administration.
          </li>
        </ul>

        <h3>Research contact</h3>
        <ul>
          <li>
            <strong>Researcher email:</strong>{' '}
            <ProtectedEmail contact={RESEARCHER} />
          </li>
          <li>
            <strong>Supervisor / ethics contact:</strong>{' '}
            <ProtectedEmail contact={SUPERVISOR} />
          </li>
        </ul>
      </>
    ),
  },
  data: {
    title: 'How your data is handled',
    body: (
      <>
        <p>
          This review collects only the information needed to support the doctoral
          validation of PV-ACF.
        </p>

        <h3>Data recorded</h3>
        <p>The platform records:</p>
        <ul>
          <li>Your final locked answers to the review questions.</li>
          <li>
            Your profile information: institution type, years of experience, optional
            name, optional institution.
          </li>
          <li>
            Your interview-willingness response, if you choose to provide one.
          </li>
          <li>
            Your acknowledgement-listing preference, if you choose to set one.
          </li>
        </ul>

        <h3>Data not recorded</h3>
        <p>The platform does not record:</p>
        <ul>
          <li>Which concept cards you open.</li>
          <li>What you read in the reference library.</li>
          <li>Free runs of the Architecture Selection Tool in Explore mode.</li>
          <li>Time spent on individual screens.</li>
          <li>Technical submission metadata such as timestamps.</li>
          <li>IP address, browser or device metadata, cookies, or server logs.</li>
        </ul>

        <h3>Separation of identifying information</h3>
        <ul>
          <li>
            Optional identifying information is treated separately from the analytical
            content of your answers where possible.
          </li>
          <li>
            Interview-willingness responses are stored separately from validation
            answers.
          </li>
          <li>
            Public acknowledgement in the thesis is optional and separate from
            participation.
          </li>
        </ul>

        <h3>Storage and access</h3>
        <ul>
          <li>
            Data is stored on Google Firebase Cloud, in the <em>europe-west3</em>{' '}
            region (Frankfurt, Germany), under the EU data-protection framework.
          </li>
          <li>Access is limited to the researcher.</li>
          <li>
            Data is protected by password protection, encryption, and access controls.
          </li>
        </ul>

        <h3>Retention and deletion</h3>
        <ul>
          <li>Data is retained for 30 days after submission, then deleted.</li>
          <li>
            Withdrawal after submission is possible until 20 June 2026. After
            anonymised or aggregated analysis has begun, withdrawal may no longer be
            possible.
          </li>
        </ul>

        <h3>Legal and research basis</h3>
        <ul>
          <li>The data are processed for doctoral research and framework validation.</li>
          <li>
            The lawful basis for processing under GDPR is your explicit consent, given
            on the Welcome screen.
          </li>
          <li>
            Special-category personal data are not requested. Please avoid including
            sensitive personal data or confidential institutional information in
            open-text responses.
          </li>
        </ul>

        <h3>Data controller</h3>
        <ul>
          <li>
            <strong>Data controller:</strong> Theodoros Papadopoulos, University of the
            Aegean (researcher acting as data controller for this study).
          </li>
          <li>
            For data-protection inquiries:{' '}
            <ProtectedEmail contact={RESEARCHER} />.
          </li>
        </ul>

        <h3>Reporting</h3>
        <ul>
          <li>
            Findings may be reported in the thesis, defence materials, and related
            academic outputs.
          </li>
          <li>
            Reporting will use aggregated patterns, anonymised examples, or paraphrased
            responses.
          </li>
          <li>
            Any direct quotation will be anonymised unless explicit consent for
            attribution has been given.
          </li>
        </ul>

        <h3>Your data rights</h3>
        <p>
          Under GDPR, you have the following rights regarding your personal data:
        </p>
        <ul>
          <li>
            <strong>Access</strong> — to know what personal data we hold about you.
          </li>
          <li>
            <strong>Rectification</strong> — to correct inaccurate or incomplete data.
          </li>
          <li>
            <strong>Erasure</strong> — to have your data deleted, subject to
            research-integrity limits.
          </li>
          <li>
            <strong>Restriction</strong> — to limit how your data is processed.
          </li>
          <li>
            <strong>Portability</strong> — to receive your data in a structured,
            commonly-used format.
          </li>
          <li>
            <strong>Objection</strong> — to object to certain uses of your data.
          </li>
          <li>
            <strong>Withdrawal of consent</strong> — at any time before submission, and
            where feasible after submission.
          </li>
        </ul>
        <p>
          To exercise these rights, contact:{' '}
          <ProtectedEmail contact={RESEARCHER} />.
        </p>

        <h3>Right to complain to a supervisory authority</h3>
        <p>
          If you believe your personal data has been mishandled, you may complain to
          your national data-protection authority.
        </p>
        <ul>
          <li>
            <em>For respondents in Greece:</em> the Hellenic Data Protection Authority
            (Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα),{' '}
            <a href="https://www.dpa.gr" target="_blank" rel="noopener noreferrer">
              www.dpa.gr
            </a>
            .
          </li>
          <li>
            <em>For respondents elsewhere in the EU:</em> your national data-protection
            authority.
          </li>
        </ul>
      </>
    ),
  },
};

function WelcomeInfoOverlay({
  kind,
  variant,
  onClose,
}: {
  kind: InfoOverlayKind;
  variant: VariantId;
  onClose: () => void;
}): JSX.Element | null {
  // ESC-to-close: standard aria-modal affordance, alongside the X in the
  // title bar, the bottom Close button, and backdrop click. Listener is
  // attached only while an overlay is open.
  useEffect(() => {
    if (!kind) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [kind, onClose]);

  if (!kind) return null;
  const c = WELCOME_OVERLAYS[kind];
  const body = typeof c.body === 'function' ? c.body(variant) : c.body;
  return (
    <div
      className="welcome-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
    >
      <button
        type="button"
        className="welcome-overlay__backdrop"
        aria-label="Close overlay"
        onClick={onClose}
      />
      <div className="welcome-overlay__panel">
        <div className="welcome-overlay__head">
          <span className="kicker kicker--mute">Reference</span>
          <button
            type="button"
            className="welcome-overlay__close"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
        <h2 className="welcome-overlay__title">{c.title}</h2>
        <div className="welcome-overlay__body">{body}</div>
        <div className="welcome-overlay__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
