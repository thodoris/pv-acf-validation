/* Cluster 2 setup screens.
   c2-setup1 — "How the framework is organised" — diagram-centric
   c2-setup2 — "What the framework pays attention to" — four-gap content + preview */

import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { DiagramSlot } from './DiagramSlot';
import { SetupPreview } from './SetupPreview';
import { clusterPreview } from './clusterPreview';

const FOUR_GAPS_BLOCKS = [
  {
    title: 'Deliberation about purpose',
    body: 'Was the question of whether AI should be used here opened to real deliberation — or did the framing arrive already shaped by procurement pressures, vendor offerings, or peer example?',
  },
  {
    title: 'Participation in design',
    body: 'Did the people the deployment will reach, the staff who will operate it, and independent voices able to challenge its framing have a place in the decisions that shaped it?',
  },
  {
    title: 'Accountability in operation',
    body: 'Are responsibility, oversight, and contestation designed to remain meaningful once the system is running, or do they thin once the procurement moment has passed?',
  },
  {
    title: 'Constraint on vendor power',
    body: 'Can the institution constrain vendor influence — not only at procurement, but in the advisory and infrastructural ties that persist beyond it?',
  },
];

export function FrameworkSetup1(): JSX.Element {
  return (
    <div className="main">
      <div className="main__inner main__inner--narrow">
        <div className="cluster-badge">
          <span className="cluster-badge__num">02</span>
          <span className="cluster-badge__name">Framework</span>
          <span className="cluster-badge__step">Introductory setup · 1 of 2</span>
        </div>
        <h1 className="h-display fws__title">How the framework is organised</h1>
        <p className="tagline tagline--mute fws__tagline">
          A two-layer structure for governing AI deployments across their lifecycle.
        </p>

        <aside className="lede-panel">
          <p>
            Cluster 1 established the problem; Cluster 2 puts the framework — the
            proposed response — in front of you as the object you are about to
            stress-test.
          </p>
          <p>
            Two setup screens before the questions begin. This one shows the framework's
            structural shape — its two layers, its operational lifecycle, and one
            architecture-specific checkpoint. The next shows what the framework is
            built to make visible.
          </p>
        </aside>

        <DiagramSlot
          variant="framework-organisation"
          size="full"
          caption="Framework organisation: two layers, recursive lifecycle, conditional Gate."
          componentName="framework-organisation-diagram"
          placeholder={
            <ul className="diagram-ph__propos">
              <li>
                <strong>1.</strong> Two layers — diagnostic layer feeds operational lifecycle
              </li>
              <li>
                <strong>2.</strong> Five named stages — problem framing · design &amp;
                procurement · oversight · public-value evaluation · continuation/discontinuation
              </li>
              <li>
                <strong>3.</strong> Lifecycle re-runs (recursion · default-discontinuation)
              </li>
              <li>
                <strong>4.</strong> Reference-back markers at Stages 1 / 2 / 3 / 5
                (deliberately not 4)
              </li>
              <li>
                <strong>5.</strong> Generative LLM Gate as a conditional checkpoint at
                Stage 2
              </li>
            </ul>
          }
        />

        <div className="fws__body">
          <p>
            The <strong>diagnostic layer</strong> identifies structural conditions
            already shaping a deployment before operational decisions begin. The{' '}
            <strong>operational lifecycle</strong> then governs the deployment across
            its stages.
          </p>
          <p>
            The lifecycle is <em>recurring</em>: the framework's position is that a
            deployment continues only if it remains justifiable at each turn. Within
            each cycle, several stages revisit the diagnostic conditions when operational
            decisions are being taken.
          </p>
          <p>
            When the architecture is generative AI, a dedicated checkpoint applies at
            design and procurement — the <strong>Generative LLM Gate</strong>.
          </p>
        </div>

        <NavButtons />
      </div>
    </div>
  );
}

export function FrameworkSetup2(): JSX.Element {
  const preview = clusterPreview('framework');

  return (
    <div className="main">
      <div className="main__inner main__inner--narrow">
        <div className="cluster-badge">
          <span className="cluster-badge__num">02</span>
          <span className="cluster-badge__name">Framework</span>
          <span className="cluster-badge__step">Introductory setup · 2 of 2</span>
        </div>
        <h1 className="h-display fws__title">What the framework pays attention to</h1>
        <p className="tagline tagline--mute fws__tagline">
          The governance conditions that are often weak, absent, or difficult to sustain
          in AI deployments.
        </p>

        <aside className="lede-panel">
          <p>
            On the previous screen, you saw how the framework is organised — its two
            layers, its lifecycle, and the procurement checkpoint that fires when
            generative AI is the architecture. This screen shows what the framework is
            built to make visible: four governance conditions that are structurally
            missing or weakened at the point a specific AI deployment is decided on and
            run.
          </p>
          <p>
            Cluster 2 will then ask you whether the four are the right set, and how
            often you have seen each in deployments you know directly.
          </p>
        </aside>

        <section className="fourgap">
          <h2 className="fourgap__heading">The four structural governance gaps</h2>
          <ol className="fourgap__grid">
            {FOUR_GAPS_BLOCKS.map((b, i) => (
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
              Each question in this cluster puts one of the framework's deliberate
              choices or claims to you. The reasoning behind each arrives on the
              question screen where you judge it — not here.
            </em>
          </p>
        </aside>

        {preview && <SetupPreview preview={preview} standalone uppercaseKind />}

        <NavButtons nextLabel="Begin the framework" />
      </div>
    </div>
  );
}
