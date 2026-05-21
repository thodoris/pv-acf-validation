/* Cluster 1 setup screens.
   c1-setup1 — "When the deployment isn't the whole story" — diagram-centric
   c1-setup2 — "What this cluster will ask you to judge" — four-pattern grid + preview */

import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { DiagramSlot } from './DiagramSlot';
import { ThreeLevelsDiagram } from './diagrams/ThreeLevelsDiagram';
import { SetupPreview } from './SetupPreview';
import { clusterPreview } from './clusterPreview';

const FOUR_PATTERNS_BLOCKS = [
  {
    title: 'Solution-first adoption',
    body: 'Whether AI systems are adopted to address clearly defined public problems — or whether they arrive first, with the case for using them built afterwards.',
  },
  {
    title: 'Institutional reshaping',
    body: 'Whether organisations reshape themselves around AI systems once running — in how decisions get made, whose expertise counts, what priorities apply — or whether the institution stays much as it was.',
  },
  {
    title: 'Upstream influence',
    body: 'Whether the AI priorities your administration works within were set through an open process — or whether they arrived already shaped by technology firms and consulting relationships.',
  },
  {
    title: 'Existing governance checks',
    body: 'Whether existing governance checks — audits, impact assessments, procurement rules, data-protection reviews — reach the broader organisational and policy conditions, or whether they remain focused on the system itself.',
  },
];

export function ProblemSetup1(): JSX.Element {
  return (
    <div className="main">
      <div className="main__inner main__inner--narrow">
        <div className="cluster-badge">
          <span className="cluster-badge__num">01</span>
          <span className="cluster-badge__name">Problem</span>
          <span className="cluster-badge__step">Introductory setup · 1 of 2</span>
        </div>
        <h1 className="h-display fws__title">When the deployment isn't the whole story</h1>
        <p className="tagline tagline--mute fws__tagline">
          Three levels the cluster's questions span.
        </p>

        <aside className="lede-panel">
          <p>
            Before the framework arrives, Cluster 1 puts the problem to you. This screen
            shows where the cluster's questions look: not only at the AI system itself,
            but also at the institutional and strategic conditions surrounding it. The
            next screen names the four patterns you will be asked to recognise.
          </p>
        </aside>

        <DiagramSlot
          variant="three-levels"
          size="full"
          caption="Three levels Cluster 1's questions span: strategy, institution, deployment."
          componentName="three-levels-diagram"
          diagram={<ThreeLevelsDiagram size="full" />}
        />

        <div className="fws__body">
          <p>
            Practitioners sometimes find that a problem visible in an AI deployment
            traces back to earlier decisions about procurement, about how the
            institution was organised, or about strategic priorities decided before the
            deployment was on the table. Cluster 1 asks how often you have seen this —
            and what you make of it.
          </p>
        </div>

        <NavButtons />
      </div>
    </div>
  );
}

export function ProblemSetup2(): JSX.Element {
  const preview = clusterPreview('problem');

  return (
    <div className="main">
      <div className="main__inner main__inner--narrow">
        <div className="cluster-badge">
          <span className="cluster-badge__num">01</span>
          <span className="cluster-badge__name">Problem</span>
          <span className="cluster-badge__step">Introductory setup · 2 of 2</span>
        </div>
        <h1 className="h-display fws__title">What this cluster will ask you to judge</h1>
        <p className="tagline tagline--mute fws__tagline">
          Four patterns to recognise — or not — from your direct experience.
        </p>

        <aside className="lede-panel">
          <p>
            On the previous screen, you saw a picture of how AI governance problems can
            connect across levels — strategy, institution, deployment. This screen
            names what the cluster will ask you to look for: four patterns practitioners
            may or may not recognise from their own work.
          </p>
        </aside>

        <section className="fourgap">
          <h2 className="fourgap__heading">The four patterns</h2>
          <ol className="fourgap__grid">
            {FOUR_PATTERNS_BLOCKS.map((b, i) => (
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

        <aside className="lede-panel lede-panel--italic">
          <p>
            <em>
              This cluster does not ask you to evaluate the framework. It asks how
              often you have seen these patterns in your own work — and what you make
              of them.
            </em>
          </p>
        </aside>

        {preview && <SetupPreview preview={preview} standalone uppercaseKind />}

        <NavButtons nextLabel="Begin the problem" />
      </div>
    </div>
  );
}
