/* Cluster 3 setup screens.
   c3-setup1 — "How to read an instrument here" — diagram-centric
   c3-setup2 — "What you will inspect" — four-instrument grid + preview */

import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { DiagramSlot } from './DiagramSlot';
import { InstrumentReadingDiagram } from './diagrams/InstrumentReadingDiagram';
import { SetupPreview } from './SetupPreview';
import { clusterPreview } from './clusterPreview';

const FOUR_INSTRUMENTS_BLOCKS = [
  {
    stage: 'STAGE 2 · DESIGN & PROCUREMENT',
    items: [
      {
        code: 'CIW',
        name: 'Contextual Integrity Worksheet',
        body: 'Makes the information flows an AI deployment introduces visible before and after, so each can be judged against its service context.',
      },
      {
        code: 'AST',
        name: 'Architecture Selection Tool',
        body: 'Selects an AI architecture against governance requirements, not technical capability alone.',
      },
    ],
  },
  {
    stage: 'STAGE 3 · OVERSIGHT & ACCOUNTABILITY',
    items: [
      {
        code: 'DMA',
        name: 'Discretion Migration Analysis',
        body: 'Maps where effective decision authority moves when an AI system is introduced, and what oversight that calls for.',
      },
      {
        code: 'CPD',
        name: 'Contestation Pathway Design',
        body: 'Specifies the six dimensions of a citizen-facing contestation pathway and what each requires of the institution.',
      },
    ],
  },
];

export function InstrumentsSetup1(): JSX.Element {
  return (
    <div className="main">
      <div className="main__inner main__inner--narrow">
        <div className="cluster-badge">
          <span className="cluster-badge__num">03</span>
          <span className="cluster-badge__name">Instruments</span>
          <span className="cluster-badge__step">Introductory setup · 1 of 2</span>
        </div>
        <h1 className="h-display fws__title">How to read an instrument here</h1>
        <p className="tagline tagline--mute fws__tagline">
          Specified form, institutional configuration, expert judgement.
        </p>

        <aside className="lede-panel">
          <p>
            Cluster 2 asked whether the framework's design holds. Cluster 3 moves down
            one level: four instruments are placed in front of you as working objects.
            Your task is not to decide whether an instrument fixes the governance
            problem by itself, but whether it helps practitioners surface and reason
            about the governance relations an AI deployment brings into play.
          </p>
        </aside>

        <DiagramSlot
          variant="instrument-reading"
          size="full"
          caption="Three tiers, top to bottom: framework specifies → institution configures → you judge."
          componentName="instrument-reading-diagram"
          diagram={<InstrumentReadingDiagram size="full" />}
        />

        <p className="ird-caption">
          <em>
            The framework specifies the instrument's form. The institution still has to
            make it deployable in context. Needing set-up work is a described property
            of an instrument, not a fault.
          </em>
        </p>

        <div className="fws__body">
          <p>
            On each instrument screen, a <strong>MATURITY card</strong> beside the
            questions names how complete the instrument is and how much institutional
            set-up work remains. The four are deliberately not uniform in their
            maturity. Read "missing or concerning" against the MATURITY card: a design
            gap is not the same thing as the local work needed to put an instrument
            into practice.
          </p>
        </div>

        <NavButtons />
      </div>
    </div>
  );
}

export function InstrumentsSetup2(): JSX.Element {
  const preview = clusterPreview('instruments');

  return (
    <div className="main">
      <div className="main__inner main__inner--narrow">
        <div className="cluster-badge">
          <span className="cluster-badge__num">03</span>
          <span className="cluster-badge__name">Instruments</span>
          <span className="cluster-badge__step">Introductory setup · 2 of 2</span>
        </div>
        <h1 className="h-display fws__title">What you will inspect</h1>
        <p className="tagline tagline--mute fws__tagline">
          Four operational objects, one repeated answer pattern.
        </p>

        <aside className="lede-panel">
          <p>
            On the previous screen, you saw how an operational instrument is read here —
            as a specified form the institution still has to configure, judged for its
            analytical work. This screen names what comes next: four instruments, each
            on its own screen, with the same evaluation pattern repeated each time.
          </p>
        </aside>

        <section className="instgrid">
          <h2 className="instgrid__heading">The four instruments</h2>

          {FOUR_INSTRUMENTS_BLOCKS.map((stage, si) => (
            <div className="instgrid__stage" key={si}>
              <div className="instgrid__stage-label mono">{stage.stage}</div>
              <ol className="instgrid__row">
                {stage.items.map((inst, i) => (
                  <li key={i} className="instgrid__block">
                    <div className="instgrid__head">
                      <span
                        className="instgrid__badge mono"
                        aria-label={`${inst.code} instrument code`}
                      >
                        {inst.code}
                      </span>
                      <h3 className="instgrid__name">{inst.name}</h3>
                    </div>
                    <p className="instgrid__body">{inst.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>

        <ul className="instnotes">
          <li className="instnotes__note">
            <em>
              The CIW appears first because it is the maturity-gradient reference
              point — not because the chronological sequence is strict. Both CIW and AST
              are Stage 2.
            </em>
          </li>
          <li className="instnotes__note">
            <em>
              The AST screen includes an optional <strong>Explore it</strong> overlay.
              You may run the tool against scenarios; exploration is not recorded, only
              your evaluation answers are.
            </em>
          </li>
          <li className="instnotes__note">
            <em>
              The <strong>Generative LLM Gate</strong> was judged at framework level in
              Cluster 2. It is a Stage 2 instrument and may appear as an AST handoff,
              but it is not examined operationally in this cluster.
            </em>
          </li>
        </ul>

        <aside className="lede-panel lede-panel--italic">
          <p>
            <em>
              Each instrument is presented on its own screen as a described object —
              what it is, what it does, how mature it is. The cluster asks whether each
              does distinctive analytical work and whether a practitioner could put it
              to work, not whether to argue the framework's case for it.
            </em>
          </p>
        </aside>

        <blockquote className="loadbear-callout">
          <p>
            <em>
              "Distinctive analytical work" means useful for surfacing the gap — not
              useful as a fix.
            </em>
          </p>
        </blockquote>

        {preview && (
          <SetupPreview
            preview={preview}
            standalone
            uppercaseKind
            headLabel="What you will be asked · 4 instrument screens"
          />
        )}

        <p className="closing-italic">
          <em>
            You learn the form once. The cognitive work is in judging four different
            instruments.
          </em>
        </p>

        <NavButtons nextLabel="Begin the instruments" />
      </div>
    </div>
  );
}
