import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { TopBar, Rail, affordancesFor } from './shell';
import { InlineExpanders, FloatingTools } from './shell/AffordanceVariants';
import { ScreenRouter } from './routing/ScreenRouter';
import { useSessionStore } from './state/sessionStore';
import { useUrlSync } from './routing/urlSync';
import { progressFor } from './routing/progress';
import { requireScreen } from './routing/screens';
import { CONTENT, isPairedQuestion } from './content';
import { ReferenceOverlay } from './overlays/ReferenceOverlay';
import { TweaksPanel } from './dev/TweaksPanel';
import { useTweaksStore } from './dev/tweaksStore';
import { isAdminRoute } from './admin/adminMode';
import { AdminPanel } from './admin/AdminPanel';
import { SubmittedTerminalScreen } from './screens/SubmittedTerminalScreen';
import { isSessionExpired } from './lib/sessionTtl';

type OverlayKind = 'cards' | 'framework' | null;

/** TTL check — synchronous, runs once per App render. If the persisted
 *  session has aged past SESSION_TTL_MS without a submission, wipe both
 *  localStorage keys and reload `/` for a clean start. The reload aborts
 *  further execution in this render, so callers downstream are safe. */
function checkSessionTtl(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  const { sessionStartedAt, submittedAt } = useSessionStore.getState();
  if (isSessionExpired(sessionStartedAt, submittedAt)) {
    localStorage.removeItem('pvacf:answers');
    localStorage.removeItem('pvacf:session');
    window.location.href = '/';
  }
}

export default function App(): JSX.Element {
  // (1) TTL — fire before any subscriptions or routing. Either no-ops or
  // navigates; the navigation aborts further execution.
  checkSessionTtl();

  // (2) Subscribe to submittedAt so post-submit transitions trigger an
  // immediate App re-render (markSubmitted in SubmitScreen flips this).
  // Hook called every render, ahead of any conditional return → no
  // Rules-of-Hooks ordering hazard.
  const submittedAt = useSessionStore((s) => s.submittedAt);

  // (2b) Mirror the active variant into <html data-variant="…"> so the
  // .hide-in-short / .hide-in-full CSS classes evaluate against the live
  // store value. index.html ships with `data-variant="short"` so first
  // paint matches the default; this effect handles subsequent changes
  // (URL ?v=full, Tweaks panel switcher).
  const variant = useSessionStore((s) => s.variant);
  useEffect(() => {
    document.documentElement.setAttribute('data-variant', variant);
  }, [variant]);

  // (3) Hidden admin route — short-circuits the questionnaire entirely so
  // no questionnaire-state hooks run on /admin. isAdminRoute() is a pure
  // pathname read; safe to use as a non-hook conditional branch.
  if (isAdminRoute()) {
    return <AdminPanel />;
  }

  // (4) Post-submit guard — once the session is sealed, every screen
  // request short-circuits to the terminal screen. Answers are no longer
  // reachable from the UI; the terminal screen offers a reset path.
  if (submittedAt !== null) {
    return <SubmittedTerminalScreen />;
  }

  return <QuestionnaireApp />;
}

function QuestionnaireApp(): JSX.Element {
  useUrlSync();
  const screenId = useSessionStore((s) => s.currentScreenId);
  const screen = requireScreen(screenId);
  const [overlayKind, setOverlayKind] = useState<OverlayKind>(null);

  // Tweaks (review-mode only — defaults to production register otherwise).
  const affordanceMode = useTweaksStore((s) => s.affordanceMode);
  const overlayStyle = useTweaksStore((s) => s.overlayStyle);
  const shellSide = useTweaksStore((s) => s.shellSide);

  const snap = progressFor(screenId);
  const affordances = affordancesFor(screenId);
  const hasAffs = affordances.length > 0;
  const showShell = screen.hasShell !== false;
  const railOn = showShell && affordanceMode === 'rail' && hasAffs;

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

  const shellClass = !railOn
    ? 'shell shell--no-rail'
    : shellSide === 'left'
      ? 'shell shell--rail-left'
      : 'shell';

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
          {showShell && affordanceMode === 'inline-expanders' && hasAffs && (
            <InlineExpanders affordances={affordances} />
          )}
          <ScreenRouter />
        </div>
        {railOn && <Rail affordances={affordances} />}
      </div>

      {showShell && affordanceMode === 'floating-tools' && hasAffs && (
        <FloatingTools affordances={affordances} />
      )}

      <ReferenceOverlay
        kind={overlayKind}
        onClose={() => setOverlayKind(null)}
        contextRelevant={contextRelevantFor(screenId)}
        variant={overlayStyle}
      />

      <TweaksPanel onOpenOverlay={setOverlayKind} />
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
