/* Reference layer — side drawer holding concept cards or the whole-framework
   presentation. Summonable from any screen via TopBar triggers (Concepts or
   Whole framework). Modal but non-blocking: preserves underlying screen
   state (F3). Escape / × / click-outside close.

   Carries the firewall tagline at the bottom — activity here is not
   captured as response data (P6). */

import { useEffect } from 'react';
import type { JSX } from 'react';
import { Icon } from '@/shell/Icon';
import { CONTENT } from '@/content';

export type ReferenceOverlayKind = 'cards' | 'framework';

export type ReferenceOverlayProps = {
  kind: ReferenceOverlayKind | null;
  onClose: () => void;
  /** Hint shown above the concept list — e.g. "Problem · M1 · Q1.1". */
  contextRelevant?: string | null;
};

export function ReferenceOverlay({
  kind,
  onClose,
  contextRelevant,
}: ReferenceOverlayProps): JSX.Element | null {
  // Trap Escape inside the overlay so it doesn't bubble to the App-level
  // keydown listener and toggle the overlay back open.
  useEffect(() => {
    if (!kind) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [kind, onClose]);

  if (!kind) return null;

  const title =
    kind === 'cards'
      ? 'Concepts relevant to this screen'
      : 'PV-ACF — whole-framework presentation';
  const kindLabel =
    kind === 'cards'
      ? 'Reference · Concepts & terminology'
      : 'Reference · The whole framework';

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="overlay__backdrop"
        aria-label="Close overlay"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
        }}
      />
      <div className="overlay__panel" style={{ position: 'relative' }}>
        <header className="overlay__head">
          <div>
            <div className="overlay__kind">{kindLabel}</div>
            <div className="overlay__title">{title}</div>
          </div>
          <button
            type="button"
            className="overlay__close"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="overlay__body">
          {kind === 'cards' ? (
            <ConceptCards contextRelevant={contextRelevant} />
          ) : (
            <FrameworkPresentation />
          )}
        </div>

        <div className="overlay__hint">
          <span>
            <em>Activity here is not captured as response data.</em>
          </span>
          <span className="mono">Esc to close</span>
        </div>
      </div>
    </div>
  );
}

function ConceptCards({
  contextRelevant,
}: {
  contextRelevant?: string | null;
}): JSX.Element {
  return (
    <>
      {contextRelevant && (
        <div className="relevance-banner">
          <Icon name="info" size={14} />
          <span>
            Concepts most relevant to the current screen ({contextRelevant}) are listed
            first.
          </span>
        </div>
      )}
      <div className="concept-list">
        {CONTENT.concepts.map((c, i) => (
          <article
            className={`concept ${c.featured ? 'concept--featured' : ''}`}
            key={i}
          >
            <div className="concept__head">
              <h3 className="concept__title">{c.title}</h3>
              <span className="concept__greek">{c.gr}</span>
            </div>
            <div
              className="concept__body"
              dangerouslySetInnerHTML={{ __html: c.body }}
            />
            {c.rels.length > 0 && (
              <div className="concept__rel">
                {c.rels.map((r, j) => (
                  <span className="concept__rel-chip" key={j}>
                    {r}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function FrameworkPresentation(): JSX.Element {
  return (
    <div className="framework">
      <p style={{ color: 'var(--ink-soft)', fontSize: 14.5 }}>
        The <em>Public-Value AI Co-production Framework</em> articulates its
        architecture across two layers: a preparatory diagnostic layer that screens for{' '}
        <strong>four governance gaps</strong>, and a five-stage recursive lifecycle
        that returns to that layer on every pass.
      </p>

      <div className="framework__diagram" aria-label="Schematic of the framework">
        <div
          className="mono"
          style={{
            padding: 'var(--space-4)',
            color: 'var(--ink-mute)',
            fontSize: 12,
          }}
        >
          framework-organisation-diagram · placeholder
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-4)',
        }}
      >
        <div className="card">
          <div className="kicker">Stage 2 instruments</div>
          <p style={{ fontSize: 13.5, margin: 0 }}>
            <strong>Contextual Integrity Worksheet</strong> &nbsp;·&nbsp;{' '}
            <strong>Architecture Selection Tool</strong>
          </p>
        </div>
        <div className="card">
          <div className="kicker">Stage 3 instruments</div>
          <p style={{ fontSize: 13.5, margin: 0 }}>
            <strong>Discretion Migration Analysis</strong> &nbsp;·&nbsp;{' '}
            <strong>Contestation Pathway Design</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
