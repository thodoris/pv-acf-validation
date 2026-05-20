/* Dev-only Tweaks panel — mounts when ?tweaks=1 is in the URL. Provides a
   jump-to-screen picker and a "review mode" badge. Strip from production
   automatically (mount is conditional on isReviewMode()).

   Phase 4i may extend this with affordance-mode and overlay-style toggles
   from the prototype; the jump picker is the minimum useful surface and
   ships now to help the user review the screens. */

import { useState } from 'react';
import type { JSX } from 'react';
import { useSessionStore } from '@/state/sessionStore';
import { jumpTo } from '@/routing/navigation';
import { SCREENS } from '@/routing/screens';
import { isReviewMode } from './reviewMode';

export function TweaksPanel(): JSX.Element | null {
  const [collapsed, setCollapsed] = useState(false);
  const currentScreenId = useSessionStore((s) => s.currentScreenId);

  if (!isReviewMode()) return null;

  return (
    <aside
      aria-label="Review mode tweaks"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 90,
        width: collapsed ? 'auto' : 320,
        maxWidth: 'calc(100vw - 32px)',
        background: 'var(--surface)',
        border: '0.5px solid var(--border-strong)',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(26,24,22,0.18)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
      }}
    >
      <header
        style={{
          padding: '10px 14px',
          borderBottom: collapsed ? 'none' : '0.5px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--coral-tint)',
          color: 'var(--coral-deep)',
          borderRadius: collapsed ? 12 : '12px 12px 0 0',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--coral)',
          }}
        />
        <strong
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Review mode
        </strong>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            color: 'var(--coral-deep)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            padding: 2,
          }}
          aria-label={collapsed ? 'Expand tweaks panel' : 'Collapse tweaks panel'}
        >
          {collapsed ? '▴' : '▾'}
        </button>
      </header>

      {!collapsed && (
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            Validation and the F1 phase gate are bypassed. Locked answers remain
            locked. Production never mounts this panel.
          </p>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-mute)',
              }}
            >
              Jump to screen
            </span>
            <select
              value={currentScreenId}
              onChange={(e) => jumpTo(e.target.value, { bypassGate: true })}
              style={{
                padding: '8px 10px',
                border: '0.5px solid var(--border-strong)',
                borderRadius: 6,
                background: 'var(--surface)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {SCREENS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.location}
                </option>
              ))}
            </select>
          </label>

          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-mute)',
              fontFamily: 'var(--font-mono)',
              borderTop: '0.5px solid var(--border-soft)',
              paddingTop: 8,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>
              Screen {SCREENS.findIndex((s) => s.id === currentScreenId) + 1} /{' '}
              {SCREENS.length}
            </span>
            <span>{currentScreenId}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
