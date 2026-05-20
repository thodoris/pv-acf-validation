/* Placeholder for the three setup-screen diagrams. The real diagram
   components (ThreeLevelsDiagram, FrameworkOrganisationDiagram,
   InstrumentReadingDiagram) live in docs/reference-prototype/diagrams/
   and depend on animations.jsx; porting them is a separate phase.

   Until then this renders the same diagram-ph fallback the prototype shows
   when the diagram component is not yet loaded — visually consistent. */

import { useReducer } from 'react';
import type { JSX, ReactNode } from 'react';

export type DiagramSlotProps = {
  variant: 'three-levels' | 'framework-organisation' | 'instrument-reading';
  size?: 'full' | 'medium' | 'small';
  caption: string;
  placeholder: ReactNode;
  componentName: string;
};

const HEIGHTS = { full: 380, medium: 280, small: 180 } as const;

export function DiagramSlot({
  variant,
  size = 'full',
  caption,
  placeholder,
  componentName,
}: DiagramSlotProps): JSX.Element {
  const [, bumpReplay] = useReducer((k: number) => k + 1, 0);
  const minHeight = HEIGHTS[size];

  return (
    <figure className="framework-diagram" data-variant={variant} data-size={size}>
      <div className="framework-diagram__frame" style={{ minHeight }}>
        <div className="diagram-ph">
          <div className="diagram-ph__chip mono">
            <span className="diagram-ph__chip-dot" aria-hidden="true" />
            Diagram placeholder · awaiting <code>{componentName}</code>
          </div>
          <div className="diagram-ph__title">{componentName}-v1</div>
          {placeholder}
        </div>
      </div>
      <div className="framework-diagram__caption-row">
        <span className="framework-diagram__caption">{caption}</span>
        <button
          type="button"
          className="framework-diagram__replay"
          onClick={() => bumpReplay()}
          aria-label="Replay animation"
        >
          <span aria-hidden="true" className="framework-diagram__replay-icon">
            ↻
          </span>
          <span>Replay</span>
        </button>
      </div>
    </figure>
  );
}
