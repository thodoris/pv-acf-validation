import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { TopBar, Rail, affordancesFor } from './shell';
import { ScreenRouter } from './routing/ScreenRouter';
import { useSessionStore } from './state/sessionStore';
import { useUrlSync } from './routing/urlSync';
import { progressFor } from './routing/progress';
import { requireScreen } from './routing/screens';
import { CONTENT, isPairedQuestion } from './content';
import { ReferenceOverlay } from './overlays/ReferenceOverlay';
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

      <ReferenceOverlay
        kind={overlayKind}
        onClose={() => setOverlayKind(null)}
        contextRelevant={contextRelevantFor(screenId)}
      />

      <TweaksPanel />
    </>
  );
}

/** "Concepts relevant to this screen ({contextRelevant}) are listed first" hint
 *  shown in the overlay. Derived from the active screen — questions surface
 *  their chapter, instruments surface their code, other screens omit the hint. */
function contextRelevantFor(screenId: string): string | null {
  const q = CONTENT.questions[screenId];
  if (q) {
    if (isPairedQuestion(q)) return q.chapter;
    return q.chapter;
  }
  const inst = CONTENT.instruments.find((i) => i.id === screenId);
  if (inst) return `Instrument · ${inst.code}`;
  return null;
}
