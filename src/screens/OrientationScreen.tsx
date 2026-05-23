/* Platform-wide grounding — G1 + G2.
   Two screens, no questions, no captured response. Faithful port of
   docs/reference-prototype/screens-orientation.jsx. Inline body content
   stays inside this module (prototype keeps it in the component too;
   CONTENT.grounding only carries titles + taglines). */

import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { CONTENT } from '@/content';

const G1_REGISTERS: ReadonlyArray<{
  title: string;
  items: ReadonlyArray<{ label: string; body: string }>;
}> = [
  {
    title: 'TECHNICAL AND COMPLIANCE CHECKS',
    items: [
      {
        label: 'What they ask:',
        body: 'Does the system work as specified? Is it documented, tested, auditable, and compliant?',
      },
      {
        label: 'Typical instruments:',
        body: 'Audits, fairness metrics, model cards, performance checks, conformity assessments, risk-based regulatory regimes.',
      },
      {
        label: 'What they can miss:',
        body: 'The institutional setting in which the system operates: who depends on it, who can question it, and how it changes everyday administrative work.',
      },
    ],
  },
  {
    title: 'RIGHTS AND PROTECTION MECHANISMS',
    items: [
      {
        label: 'What they ask:',
        body: 'Are affected people protected once the system is in use?',
      },
      {
        label: 'Typical instruments:',
        body: 'Due process, data protection, explanation rights, human oversight, appeal routes, contestation procedures.',
      },
      {
        label: 'What they can miss:',
        body: 'The earlier design, procurement, architecture, and data choices that may already have narrowed what protection can realistically achieve.',
      },
    ],
  },
  {
    title: 'PARTICIPATION AND STAKEHOLDER ENGAGEMENT',
    items: [
      {
        label: 'What they ask:',
        body: 'Are affected publics involved in shaping AI deployments, not only in receiving them?',
      },
      {
        label: 'Typical instruments:',
        body: 'Public consultation, stakeholder workshops, staff engagement, user research, co-design sessions, civil-society input, expert review, design-justice-informed methods.',
      },
      {
        label: 'What they can miss:',
        body: 'Participation may begin after the main framing has already been set ot it may ask to comment on an AI project that is already assumed to be necessary.',
      },
    ],
  },
];

const G2_CONCEPTS = [
  'co-production',
  'sociotechnical imaginaries',
  'solutionism',
  'critical-deliberative',
  'public value',
  'contextual integrity',
  'vendor dependency',
  'discretion migration',
  'contestation',
];

export function OrientG1(): JSX.Element {
  const g = CONTENT.grounding[0]!;
  return (
    <div className="main">
      <div className="main__inner main__inner--narrow">
        <div className="cluster-badge cluster-badge--prologue">
          <span className="cluster-badge__mark">Prologue</span>
          <span className="cluster-badge__step">Grounding · 1 of 2 · platform-wide</span>
        </div>
        <h1 className="h-display fws__title">{g.title}</h1>
        <p className="tagline tagline--mute fws__tagline">{g.tagline}</p>

        <aside className="lede-panel">
          <p>
            Public administrations across Europe are deploying AI systems to support,
            route, prioritise, or partly automate decisions about eligibility, service
            access, inspection, and enforcement. Their performance matters. But
            governance is not only about whether the system works.
          </p>
          <p>
            A system may be accurate on its own terms and still leave important
            governance questions unanswered: how the public problem was defined, who
            shaped the decision to use AI, what dependencies the institution accepted,
            how staff judgement is affected, and whether affected people can
            meaningfully challenge outcomes.
          </p>
        </aside>

        <div className="fws__body">
          <p>
            Many governance processes already address parts of this problem. The
            question for this review is whether they reach far enough.
          </p>
        </div>

        <section className="fourgap fourgap--triple">
          <h2 className="fourgap__heading">Three familiar governance registers</h2>
          <ol className="fourgap__grid fourgap__grid--triple">
            {G1_REGISTERS.map((b, i) => (
              <li key={i} className="fourgap__block">
                <span className="fourgap__num mono" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="fourgap__title">{b.title}</h3>
                <div className="fourgap__body">
                  {b.items.map((item, j) => (
                    <p key={j}>
                      <strong>{item.label}</strong>
                      <br />
                      {item.body}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="lede-panel lede-panel--closer lede-panel--grounding">
          <p>
            The three registers share a common edge. They can improve how an AI system
            is assessed, protected against, or opened to wider input. But the
            conditions that shape what arrives as an AI project in the first place —
            the imaginaries driving adoption, the commercial and infrastructural
            dependencies, the institutional routines, and the procurement cycles
            already underway — are often reached late, partially, or not at all.
          </p>
          <p>The next screen introduces the framework this review evaluates.</p>
        </aside>

        <NavButtons />
      </div>
    </div>
  );
}

export function OrientG2(): JSX.Element {
  const g = CONTENT.grounding[1]!;
  return (
    <div className="main">
      <div className="main__inner main__inner--narrow">
        <div className="cluster-badge cluster-badge--prologue">
          <span className="cluster-badge__mark">Prologue</span>
          <span className="cluster-badge__step">Grounding · 2 of 2 · platform-wide</span>
        </div>
        <h1 className="h-display fws__title">{g.title}</h1>
        <p className="tagline tagline--mute fws__tagline">{g.tagline}</p>

        <aside className="lede-panel">
          <p>
            This review evaluates the Public-Value AI Co-production Framework —
            PV-ACF. The framework is built for AI governance in public administration,
            where technical performance is only one part of the question.
          </p>
        </aside>

        <div className="fws__body">
          <p>
            <strong>PV-ACF is not a compliance checklist.</strong> It does not ask
            only whether a system satisfies a rule, passes a test, or documents a
            risk. It is designed to help practitioners make visible the conditions
            under which AI deployments are framed, authorised, procured, operated,
            and reviewed.
          </p>
          <p>
            <strong>PV-ACF is a critical-deliberative framework.</strong> It is
            critical because it treats AI systems as institutional and political
            arrangements, not as neutral tools. It is deliberative because it treats
            public reasoning, contestation, and institutional accountability as part
            of legitimate governance, not as obstacles to implementation.
          </p>
        </div>

        <section className="concept-strip">
          <div className="concept-strip__head">
            <span className="kicker kicker--mute">Concept cards available throughout</span>
          </div>
          <ul className="concept-strip__list">
            {G2_CONCEPTS.map((term, i) => (
              <li key={i} className="concept-strip__chip">
                {term}
              </li>
            ))}
          </ul>
          <p className="concept-strip__note">
            These terms are available as short concept cards from any screen. You do
            not need to memorise them before answering.
          </p>
        </section>

        <section className="role-block">
          <div className="kicker kicker--mute">Your role in this review</div>
          <p>
            The platform does not ask you to accept the framework in advance. Your
            role across the four clusters is that of an expert reviewer drawing on
            your own practice, scholarship, or governance experience. Agreement is
            not assumed. Disagreement, uncertainty, and named limits are part of the
            validation.
          </p>
        </section>

        <p className="grounding-closer">
          The next screens begin with an orientation for the first claim-cluster.
          The cluster asks you to draw on patterns from your own practice, before
          you are asked to assess the framework as a response to them.
        </p>

        <NavButtons />
      </div>
    </div>
  );
}
