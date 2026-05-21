/* Dev-only Tweaks panel — mounts when ?tweaks=1 is in the URL. Provides:
   - jump-to-screen picker (any of the 32 screens, F1 gate bypassed)
   - master shell tweaks: rail side, affordance mode
   - reference overlay style toggle
   - "open overlay" test buttons (concept cards / whole framework)

   Strip from production automatically (mount is conditional on isReviewMode).
   See ADR 0005 (Playwright workers:1) and the brief §3 for which alternates
   are Tweaks-only — production defaults stay as-is. */

import { useState } from 'react';
import type { JSX, ChangeEvent } from 'react';
import { useSessionStore } from '@/state/sessionStore';
import { jumpTo } from '@/routing/navigation';
import { SCREENS } from '@/routing/screens';
import {
  useTweaksStore,
  type AffordanceMode,
  type OverlayStyle,
  type ShellSide,
} from './tweaksStore';
import { isReviewMode } from './reviewMode';

export type TweaksPanelProps = {
  /** Open one of the reference overlays for testing. Wired from App. */
  onOpenOverlay?: (kind: 'cards' | 'framework') => void;
};

export function TweaksPanel({ onOpenOverlay }: TweaksPanelProps = {}): JSX.Element | null {
  const [collapsed, setCollapsed] = useState(false);
  const currentScreenId = useSessionStore((s) => s.currentScreenId);
  const t = useTweaksStore();

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
        maxHeight: 'calc(100vh - 32px)',
        background: 'var(--surface)',
        border: '0.5px solid var(--border-strong)',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(26,24,22,0.18)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        display: 'flex',
        flexDirection: 'column',
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
          flex: '0 0 auto',
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
        <strong style={kickerStyle}>Review mode · Tweaks</strong>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          style={iconButtonStyle}
          aria-label={collapsed ? 'Expand tweaks panel' : 'Collapse tweaks panel'}
        >
          {collapsed ? '▴' : '▾'}
        </button>
      </header>

      {!collapsed && (
        <div
          style={{
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflowY: 'auto',
          }}
        >
          <p style={{ margin: 0, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            Validation + F1 phase gate bypassed. Locked answers stay locked.
            Production never mounts this panel.
          </p>

          <Section label="Navigation">
            <Select<string>
              label="Jump to screen"
              value={currentScreenId}
              options={SCREENS.map((s) => ({ value: s.id, label: `${s.id} · ${s.location}` }))}
              onChange={(v) => jumpTo(v, { bypassGate: true })}
            />
          </Section>

          <Section label="Master shell">
            <Select<ShellSide>
              label="Rail side"
              value={t.shellSide}
              options={[
                { value: 'right', label: 'Right (default)' },
                { value: 'left', label: 'Left' },
              ]}
              onChange={t.setShellSide}
            />
            <Select<AffordanceMode>
              label="Affordance mode"
              value={t.affordanceMode}
              options={[
                { value: 'rail', label: 'Rail (default)' },
                { value: 'inline-expanders', label: 'Inline expanders' },
                { value: 'floating-tools', label: 'Floating tools' },
              ]}
              onChange={t.setAffordanceMode}
            />
          </Section>

          <Section label="Reference overlay">
            <Select<OverlayStyle>
              label="Overlay style"
              value={t.overlayStyle}
              options={[
                { value: 'drawer', label: 'Drawer (default)' },
                { value: 'fullscreen', label: 'Fullscreen' },
                { value: 'floating', label: 'Floating' },
              ]}
              onChange={t.setOverlayStyle}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <PanelButton onClick={() => onOpenOverlay?.('cards')}>
                Open concepts (C)
              </PanelButton>
              <PanelButton onClick={() => onOpenOverlay?.('framework')} secondary>
                Whole framework (F)
              </PanelButton>
            </div>
          </Section>

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

// ---------------------------------------------------------------------------
// Local primitives (inline; no shared Tweak-control framework yet)
// ---------------------------------------------------------------------------

function Section({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={kickerStyle}>{label}</span>
      {children}
    </div>
  );
}

type SelectOption<T> = { value: T; label: string };

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<SelectOption<T>>;
  onChange: (v: T) => void;
}): JSX.Element {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ ...kickerStyle, color: 'var(--ink-mute)' }}>{label}</span>
      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as T)}
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
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PanelButton({
  onClick,
  children,
  secondary,
}: {
  onClick: () => void;
  children: React.ReactNode;
  secondary?: boolean;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: '6px 10px',
        border: '0.5px solid var(--border-strong)',
        borderRadius: 6,
        background: secondary ? 'var(--surface)' : 'var(--coral-tint)',
        color: secondary ? 'var(--ink)' : 'var(--coral-deep)',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

const kickerStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const iconButtonStyle = {
  marginLeft: 'auto',
  background: 'transparent',
  border: 0,
  cursor: 'pointer',
  color: 'var(--coral-deep)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  padding: 2,
};
