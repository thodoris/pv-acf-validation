/* DiagramSlot — visual container for the three setup-screen diagrams.
   Renders either:
   - the real diagram component (passed via `diagram` prop) — clicking
     Replay bumps its `key`, forcing a fresh mount and animation restart, or
   - the prototype's diagram-ph placeholder fallback (when `diagram` is
     not provided yet, e.g. for diagrams still pending port). The
     placeholder is identical to what the prototype shows when its
     diagram script fails to load.

   The Replay-key pattern matches the prototype's `key={replayKey}`
   handoff to the underlying components — they re-run their entrance
   animation on every key change. */

import { useReducer } from 'react';
import type { JSX, ReactElement, ReactNode } from 'react';

export type DiagramSlotProps = {
  variant: 'three-levels' | 'framework-organisation' | 'instrument-reading';
  size?: 'full' | 'medium' | 'small';
  caption: string;
  componentName: string;
  /** The real diagram component to render. When provided, takes precedence
   *  over the placeholder. Will be re-mounted on Replay via key bump. */
  diagram?: ReactElement;
  /** Fallback content to render inside the diagram-ph placeholder when
   *  `diagram` is not provided. Typically a <ul> of proposition bullets. */
  placeholder?: ReactNode;
};

const HEIGHTS = { full: 380, medium: 280, small: 180 } as const;

export function DiagramSlot({
  variant,
  size = 'full',
  caption,
  componentName,
  diagram,
  placeholder,
}: DiagramSlotProps): JSX.Element {
  const [replayKey, bumpReplay] = useReducer((k: number) => k + 1, 0);
  const minHeight = HEIGHTS[size];
  const hasRealDiagram = Boolean(diagram);

  return (
    <figure className="framework-diagram" data-variant={variant} data-size={size}>
      <div
        className="framework-diagram__frame"
        style={{ minHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      >
        {hasRealDiagram ? (
          <div key={replayKey} style={{ width: '100%' }}>
            {diagram}
          </div>
        ) : (
          <div className="diagram-ph">
            <div className="diagram-ph__chip mono">
              <span className="diagram-ph__chip-dot" aria-hidden="true" />
              Diagram placeholder · awaiting <code>{componentName}</code>
            </div>
            <div className="diagram-ph__title">{componentName}-v1</div>
            {placeholder}
          </div>
        )}
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
