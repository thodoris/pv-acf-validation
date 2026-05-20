import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { TopBar, Rail, affordancesFor } from './shell';
import { ScreenRouter } from './routing/ScreenRouter';
import { useSessionStore } from './state/sessionStore';
import { useUrlSync } from './routing/urlSync';
import { progressFor } from './routing/progress';
import { requireScreen } from './routing/screens';
import { CONTENT } from './content';
import { TweaksPanel } from './dev/TweaksPanel';

type OverlayKind = 'cards' | 'framework' | null;

export default function App(): JSX.Element {
  useUrlSync();
  const screenId = useSessionStore((s) => s.currentScreenId);
  const screen = requireScreen(screenId);
  const [overlayKind, setOverlayKind] = useState<OverlayKind>(null);

  const snap = progressFor(screenId);
  const affordances = affordancesFor(screenId);
  const railOn = (screen.hasShell !== false) && affordances.length > 0;
  const showShell = screen.hasShell !== false;

  // Keyboard shortcuts: C / F open the two reference overlays; Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.matches('input, textarea')) return;
      if (e.key === 'Escape') {
        setOverlayKind(null);
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'c') {
        setOverlayKind((current) => (current === 'cards' ? null : 'cards'));
      } else if (k === 'f') {
        setOverlayKind((current) => (current === 'framework' ? null : 'framework'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const shellClass = !showShell || !railOn ? 'shell shell--no-rail' : 'shell';

  return (
    <>
      {showShell && (
        <TopBar
          steps={CONTENT.steps}
          currentStepId={screen.stepId}
          percent={snap.percent}
          timeLeft={snap.minutesLeft}
          location={screen.location}
          onOpenRef={setOverlayKind}
          refOpen={overlayKind}
        />
      )}

      <div className={shellClass}>
        <div style={{ position: 'relative' }}>
          <ScreenRouter />
        </div>
        {railOn && <Rail affordances={affordances} />}
      </div>

      {/* TODO Phase 4h — ReferenceOverlay mounts here. Until then, a placeholder. */}
      {overlayKind && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setOverlayKind(null)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(26,24,22,0.42)',
              border: 0,
              cursor: 'pointer',
            }}
          />
          <aside
            style={{
              position: 'relative',
              width: 560,
              height: '100%',
              background: 'var(--surface)',
              padding: 32,
            }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.08em' }}>
              Reference overlay · placeholder
            </p>
            <h2 style={{ marginTop: 12 }}>{overlayKind === 'cards' ? 'Concept cards' : 'Whole framework'}</h2>
            <p style={{ marginTop: 16, color: 'var(--ink-soft)' }}>
              This consultation is not captured as response data. Real overlay arrives in Phase 4h.
            </p>
            <button type="button" onClick={() => setOverlayKind(null)} style={{ marginTop: 24 }}>
              Close (Esc)
            </button>
          </aside>
        </div>
      )}

      <TweaksPanel />
    </>
  );
}
