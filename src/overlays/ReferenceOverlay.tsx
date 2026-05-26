/* Reference layer — side drawer holding concept cards or the whole-framework
   presentation. Summonable from any screen via TopBar triggers (Concepts or
   Whole framework). Modal but non-blocking: preserves underlying screen
   state (F3). Escape / × / click-outside close.

   Carries the firewall tagline at the bottom — activity here is not
   captured as response data (P6). */

import { Fragment, useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Icon } from '@/shell/Icon';
import { FrameworkOrganisationDiagram } from '@/screens/setup/diagrams/FrameworkOrganisationDiagram';
import {
  allCardsByTier,
  conceptCardsFor,
} from '@/content/conceptCards';
import { sanitizeCardBody } from '@/lib/sanitizeCardBody';
import type { ConceptCard } from '@/content/types';
import type { ScreenId } from '@/routing/screens';

export type ReferenceOverlayKind = 'cards' | 'framework';
export type ReferenceOverlayVariant = 'drawer' | 'fullscreen' | 'floating';

export type ReferenceOverlayProps = {
  kind: ReferenceOverlayKind | null;
  onClose: () => void;
  /** Current screen id. Used by the concept-cards renderer to look up
   *  the per-screen mapping. */
  screenId: ScreenId;
  /** Visual variant. Drawer is the production default; fullscreen and
   *  floating are Tweaks-only alternates (brief §3). */
  variant?: ReferenceOverlayVariant;
};

export function ReferenceOverlay({
  kind,
  onClose,
  screenId,
  variant = 'drawer',
}: ReferenceOverlayProps): JSX.Element | null {
  // Curated (screen-mapped) vs full-pool view. State is local to the
  // overlay: it resets when the overlay closes/re-opens, including across
  // screen transitions (parent auto-closes the drawer on navigation).
  const [mode, setMode] = useState<'curated' | 'all'>('curated');

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

  // Reset the curated/all toggle whenever the overlay closes (kind === null)
  // so re-opening always starts curated.
  useEffect(() => {
    if (!kind) setMode('curated');
  }, [kind]);

  if (!kind) return null;

  const isCards = kind === 'cards';
  const title = isCards
    ? mode === 'curated'
      ? 'Concepts relevant to this screen'
      : 'All concepts'
    : 'PV-ACF — whole-framework presentation';
  const kindLabel = isCards
    ? 'Reference · Concepts & terminology'
    : 'Reference · The whole framework';

  const overlayClass =
    variant === 'fullscreen'
      ? 'overlay overlay--fullscreen'
      : variant === 'floating'
        ? 'overlay overlay--floating'
        : 'overlay';

  return (
    <div className={overlayClass} role="dialog" aria-modal="true" aria-label={title}>
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
          <div className="overlay__head-actions">
            {isCards && (
              <button
                type="button"
                className="overlay__toggle"
                onClick={() => setMode((m) => (m === 'curated' ? 'all' : 'curated'))}
                aria-pressed={mode === 'all'}
              >
                <Icon name={mode === 'curated' ? 'list' : 'chevron-left'} size={14} />
                <span>
                  {mode === 'curated' ? 'See all concepts' : 'Back to screen concepts'}
                </span>
              </button>
            )}
            <button
              type="button"
              className="overlay__close"
              onClick={onClose}
              aria-label="Close"
            >
              <Icon name="close" />
            </button>
          </div>
        </header>

        <div className="overlay__body">
          {isCards ? (
            <ConceptCards screenId={screenId} mode={mode} />
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
  screenId,
  mode,
}: {
  screenId: ScreenId;
  mode: 'curated' | 'all';
}): JSX.Element {
  const cards: ConceptCard[] = mode === 'curated' ? conceptCardsFor(screenId) : allCardsByTier();
  // Divider goes after card index 2 (the 3rd card), only in curated mode
  // and only when 5+ cards are mapped to the screen (spec §4.4).
  const showDivider = mode === 'curated' && cards.length >= 5;
  return (
    <div className="concept-list">
      {cards.map((c, i) => (
        <Fragment key={c.key}>
          <article className="concept">
            <div className="concept__head">
              <h3 className="concept__title">{c.title}</h3>
              <span className="concept__subtitle">{c.subtitle}</span>
            </div>
            <div
              className="concept__body"
              dangerouslySetInnerHTML={{ __html: sanitizeCardBody(c.body) }}
            />
            <div className="concept__tags">
              {c.tags.map((t, j) => (
                <span className="concept__tag-chip" key={j}>
                  {t}
                </span>
              ))}
            </div>
          </article>
          {showDivider && i === 2 && (
            <hr
              className="concept-divider"
              role="presentation"
              aria-hidden="true"
            />
          )}
        </Fragment>
      ))}
    </div>
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
        <FrameworkOrganisationDiagram
          variant="linear"
          size="medium"
          autoplay
          showGate
          showRefBacks
        />
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
