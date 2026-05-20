/* Dispatches the active screen to the right template based on its `kind`.
   Sets data-cluster on <html> for cluster identity rebinding (per-cluster
   accent: problem→coral, framework→cobalt, instruments→sage, close→saffron,
   grounding→ink-soft). */

import { useEffect } from 'react';
import type { JSX } from 'react';
import { useSessionStore } from '@/state/sessionStore';
import { Placeholder } from '@/screens/placeholders';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { OrientG1, OrientG2 } from '@/screens/OrientationScreen';
import { requireScreen, type Screen } from './screens';

export function ScreenRouter(): JSX.Element {
  const screenId = useSessionStore((s) => s.currentScreenId);
  const screen = requireScreen(screenId);

  // Cluster identity rebinding — sets data-cluster on <html> so CSS tokens
  // (--coral, --coral-deep, --coral-tint, --focus-ring) per-cluster rebind.
  useEffect(() => {
    if (screen.stepId) {
      document.documentElement.dataset.cluster = screen.stepId;
    } else {
      delete document.documentElement.dataset.cluster;
    }
  }, [screen.stepId]);

  // Reset scroll on screen change.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screenId]);

  return renderByKind(screen);
}

function renderByKind(screen: Screen): JSX.Element {
  switch (screen.kind) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'orient-1':
      return <OrientG1 />;
    case 'orient-2':
      return <OrientG2 />;
    case 'problem-setup-1':
      return <Placeholder name="Problem · Setup 1 of 2" />;
    case 'problem-setup-2':
      return <Placeholder name="Problem · Setup 2 of 2" />;
    case 'framework-setup-1':
      return <Placeholder name="Framework · Setup 1 of 2" />;
    case 'framework-setup-2':
      return <Placeholder name="Framework · Setup 2 of 2" />;
    case 'instruments-setup-1':
      return <Placeholder name="Instruments · Setup 1 of 2" />;
    case 'instruments-setup-2':
      return <Placeholder name="Instruments · Setup 2 of 2" />;
    case 'cluster-setup':
      return <Placeholder name={`Cluster setup · ${screen.clusterId ?? '(no cluster id)'}`} />;
    case 'question':
      return <Placeholder name={`Question · ${screen.id}`} />;
    case 'paired':
      return <Placeholder name={`Paired question · ${screen.id}`} />;
    case 'close-pair':
      return <Placeholder name="Close · Q4.1 + Q4.2" />;
    case 'instrument':
      return <Placeholder name={`Instrument · ${screen.id}`} />;
    case 'interview':
      return <Placeholder name="Interview willingness" />;
    case 'submit':
      return <Placeholder name="Submit and seal" />;
    case 'thanks':
      return <Placeholder name="Thank you" body="Sealed. 30-day withdrawal window." />;
  }
}
