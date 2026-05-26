/* Cluster 1 setup screens.
   c1-setup1 — "When the deployment isn't the whole story" — diagram-centric
   c1-setup2 — "What this cluster will ask you to judge" — four-pattern grid + preview */

import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { DiagramSlot } from './DiagramSlot';
import { ThreeLevelsDiagram } from './diagrams/ThreeLevelsDiagram';
import { SetupPreview } from './SetupPreview';
import { clusterPreview } from './clusterPreview';
import { useSessionStore } from '@/state/sessionStore';

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
    title: 'Priority-setting influence',
    body: 'Whether the AI priorities your administration works within were set through open deliberation, or arrived already shaped by technology firms, consulting relationships, or competitiveness agendas.',
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
          Start from the AI system, then trace backwards to the institution and the
          strategy that made it possible.
        </p>

        <aside className="lede-panel">
          <p>
            Cluster 1 asks you to read AI deployments backwards. A problem visible at
            the system level may have been shaped earlier — by institutional routines
            that made the deployment operationally plausible, or by strategic priorities that determined
            what kinds of projects became thinkable in the first place.
          </p>
        </aside>

        <DiagramSlot
          variant="three-levels"
          size="full"
          caption="Trace-back direction: from visible deployment to institutional setting to strategic priorities."
          componentName="three-levels-diagram"
          diagram={<ThreeLevelsDiagram size="full" />}
        />

        <div className="fws__body">
          <p>
            Cluster 1 asks whether this kind of trace-back is recognisable from your
            own experience. The next screen names the specific patterns the cluster
            will probe.
          </p>
        </div>

        <NavButtons />
      </div>
    </div>
  );
}

export function ProblemSetup2(): JSX.Element {
  const variant = useSessionStore((s) => s.variant);
  const preview = clusterPreview('problem', variant);

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
          Four patterns to recognise — or challenge — from your direct experience.
        </p>

        <aside className="lede-panel">
          <p>
            On the previous screen, you saw the trace-back move this cluster uses: start from a visible deployment, then ask what institutional and strategic conditions may have shaped it.
          </p>  
          <p> 
            This screen names the patterns the cluster will ask you to look for. The questions are not asking whether PV-ACF is useful yet. They first ask whether the problem it responds to is recognisable in your own practice, scholarship, or governance experience.
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

        
          <p>
            <em>
             After these recognition questions, the cluster asks whether the levels are connected, whether a recognise-and-name framework would be useful, and whether generative AI changes the governance picture.
            </em>
          </p>
        

        {preview && <SetupPreview preview={preview} standalone uppercaseKind />}

        <NavButtons nextLabel="Begin the problem" />
      </div>
    </div>
  );
}
