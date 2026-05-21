/* Alternate affordance renderers used by the Tweaks panel's
   "Affordance mode" toggle. Rail is the default (per brief §3); these are
   Tweaks-only comparisons.

   Port of InlineExpanders + FloatingToolsContainer + AffordanceInline from
   docs/reference-prototype/app.jsx. Same selectors, same DOM shape. */

import { useState } from 'react';
import type { JSX } from 'react';
import { Icon, type IconName } from './Icon';
import type { AffordanceDecl, AffordanceKind } from '@/content';

const ICON_FOR_KIND: Record<AffordanceKind, IconName> = {
  scope: 'info',
  source: 'book',
  explanation: 'wand',
  video: 'play',
  maturity: 'info',
  operable: 'explore',
  example: 'lightbulb',
};

const SHORT_FOR_KIND: Record<AffordanceKind, string> = {
  scope: 'Scope',
  source: 'Source',
  explanation: 'Explanation',
  video: 'Video',
  maturity: 'Maturity',
  operable: 'Operable',
  example: 'Example',
};

function AffordanceInline({ a }: { a: AffordanceDecl }): JSX.Element {
  return (
    <>
      <div className="aff__head">
        <span className="aff__kind">{SHORT_FOR_KIND[a.kind]}</span>
      </div>
      {a.title && <h3 className="aff__title">{a.title}</h3>}
      <div className="aff__body">
        {a.body && <div dangerouslySetInnerHTML={{ __html: a.body }} />}
        {a.items && (
          <ul>
            {a.items.map((it, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
            ))}
          </ul>
        )}
        {a.chips && (
          <div className="aff__chips">
            {a.chips.map((c, i) => (
              <span className="chip" key={i}>
                {c.num && <span className="chip__num">{c.num}</span>}
                {c.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export type InlineExpandersProps = {
  affordances: AffordanceDecl[];
};

export function InlineExpanders({ affordances }: InlineExpandersProps): JSX.Element | null {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (affordances.length === 0) return null;
  return (
    <div
      style={{
        position: 'sticky',
        top: 'var(--topbar-h)',
        background: 'var(--page)',
        borderBottom: '0.5px solid var(--border)',
        padding: 'var(--space-3) var(--space-7)',
        zIndex: 10,
        display: 'flex',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
      }}
    >
      <span
        className="kicker kicker--mute"
        style={{ marginBottom: 0, alignSelf: 'center' }}
      >
        For this screen →
      </span>
      {affordances.map((a, i) => {
        const open = openIdx === i;
        return (
          <details
            key={i}
            open={open}
            onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open) setOpenIdx(i);
              else if (open) setOpenIdx(null);
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                listStyle: 'none',
                padding: '6px 14px',
                background: open ? 'var(--coral-tint)' : 'var(--surface)',
                border: '0.5px solid var(--border)',
                color: open ? 'var(--coral-deep)' : 'var(--ink)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 12.5,
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name={ICON_FOR_KIND[a.kind]} size={13} /> {SHORT_FOR_KIND[a.kind]}
            </summary>
            {open && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 'var(--space-7)',
                  right: 'var(--space-7)',
                  background: 'var(--surface)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4) var(--space-5)',
                  boxShadow: 'var(--elev-sticky)',
                  marginTop: 8,
                  zIndex: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(null)}
                  aria-label="Close affordance"
                  style={{
                    float: 'right',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--ink-soft)',
                  }}
                >
                  <Icon name="close" size={14} />
                </button>
                <AffordanceInline a={a} />
              </div>
            )}
          </details>
        );
      })}
    </div>
  );
}

export type FloatingToolsProps = {
  affordances: AffordanceDecl[];
};

export function FloatingTools({ affordances }: FloatingToolsProps): JSX.Element | null {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (affordances.length === 0) return null;
  const opened = openIdx !== null ? affordances[openIdx] : null;
  return (
    <>
      <div className="tools-fab">
        {affordances.map((a, i) => (
          <button
            key={i}
            type="button"
            className="tools-fab__btn"
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <span className="tools-fab__icon">
              <Icon name={ICON_FOR_KIND[a.kind]} />
            </span>
            {SHORT_FOR_KIND[a.kind]}
          </button>
        ))}
      </div>
      {opened && (
        <div
          style={{
            position: 'fixed',
            right: 22,
            bottom: 22 + affordances.length * 44 + 8,
            width: 380,
            maxHeight: '60vh',
            overflowY: 'auto',
            background: 'var(--surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            boxShadow: 'var(--elev-modal)',
            zIndex: 30,
          }}
        >
          <button
            type="button"
            onClick={() => setOpenIdx(null)}
            aria-label="Close affordance"
            style={{
              float: 'right',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--ink-soft)',
            }}
          >
            <Icon name="close" size={14} />
          </button>
          <AffordanceInline a={opened} />
        </div>
      )}
    </>
  );
}
