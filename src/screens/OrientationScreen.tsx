/* Platform-wide grounding — G1 + G2.
   Two screens, no questions, no captured response. Faithful port of
   docs/reference-prototype/screens-orientation.jsx. Inline body content
   stays inside this module (prototype keeps it in the component too;
   CONTENT.grounding only carries titles + taglines). */

import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { CONTENT } from '@/content';

const G1_REGISTERS = [
  {
    title: 'TECHNOCRATIC COMPLIANCE',
    body: 'Audits, fairness metrics, model cards, performance checks. These address what can be measured about the system itself. They are necessary, but they can miss the institutional setting in which the system operates.',
  },
  {
    title: 'RIGHTS-BASED PROTECTION',
    body: 'Due process, data protection, explanation, and routes for contestation. These protect affected individuals once a system is in use. They are necessary, but often reactive, arriving after design, procurement, and data choices have already narrowed what can be changed.',
  },
  {
    title: 'PARTICIPATORY AND STAKEHOLDER-ENGAGEMENT APPROACHES',
    body: 'Consultation with affected publics, front-line workers, and external voices able to challenge the framing. These approaches widen who can speak. They are necessary, but they do not always reach the earlier priorities, vendor dependencies, or institutional routines that shape what kind of AI project becomes possible.',
  },
];

const G2_CONCEPTS = [
  'critical-deliberative',
  'co-production',
  'sociotechnical imaginaries',
  'public value',
  'contextual integrity',
  'vendor dependency',
  'contestation',
  'discretion',
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
            Public administrations across Europe are increasingly using AI systems to
            support, route, prioritise, or partly automate decisions about entitlements,
            eligibility, service access, inspection, and contestation. The question is
            no longer whether such systems perform well, but how they become governable
            in public institutions.
          </p>
        </aside>

        <div className="fws__body">
          <p>
            Existing critiques of AI in public administration often gather around three
            concerns: opacity, the displacement of discretion from officials into system
            behaviour, and the weakening of contestation when the reasoning behind an
            outcome becomes difficult to follow. These concerns matter. But they do not
            exhaust the governance problem.
          </p>
        </div>

        <section className="fourgap fourgap--triple">
          <ol className="fourgap__grid fourgap__grid--triple">
            {G1_REGISTERS.map((b, i) => (
              <li key={i} className="fourgap__block">
                <span className="fourgap__num mono" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="fourgap__title">{b.title}</h3>
                <p className="fourgap__body">{b.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <aside className="lede-panel lede-panel--closer lede-panel--grounding">
          <p>
            This review starts from the possibility that AI governance problems are not
            only located inside the deployed system. They may also sit in the
            imaginaries that drive adoption, the commercial and infrastructural
            dependencies that constrain public choices, and the institutional changes
            that follow once systems become routine.
          </p>
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
            This platform reviews the Public-Value AI Co-production Framework, or
            PV-ACF. The framework is designed for AI governance in public administration,
            where technical performance is only one part of the question. It asks how
            deployments are framed, who gets to shape them, how responsibility remains
            visible, and whether public-value commitments survive once systems become
            infrastructure.
          </p>
        </aside>

        <div className="fws__body">
          <p>
            PV-ACF is not presented as a neutral technical tool. It is a{' '}
            <em>critical-deliberative</em> framework: <strong>critical</strong> because
            it asks what assumptions, dependencies, and power relations are built into
            AI deployments; <strong>deliberative</strong> because it treats public
            reasoning, contestation, and institutional accountability as part of
            legitimate governance rather than as obstacles to efficiency.
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
            These terms are available as short concept cards during the review. You do
            not need to memorise them before answering.
          </p>
        </section>

        <p className="grounding-closer">
          The next screens begin the review with the first claim-cluster.
        </p>

        <NavButtons />
      </div>
    </div>
  );
}
