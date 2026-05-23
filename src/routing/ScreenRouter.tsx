/* Dispatches the active screen to the right template based on its `kind`.
   Sets data-cluster on <html> for cluster identity rebinding (per-cluster
   accent: problem→coral, framework→cobalt, instruments→sage, close→saffron,
   grounding→ink-soft). */

import { Fragment, useEffect } from 'react';
import type { JSX } from 'react';
import { useSessionStore } from '@/state/sessionStore';
import { Placeholder } from '@/screens/placeholders';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { OrientG1, OrientG2 } from '@/screens/OrientationScreen';
import { QuestionScreen } from '@/screens/QuestionScreen';
import { PairedQuestionScreen } from '@/screens/PairedQuestionScreen';
import { InstrumentScreen } from '@/screens/InstrumentScreen';
import { ClosePairScreen } from '@/screens/ClosePairScreen';
import { InterviewScreen } from '@/screens/InterviewScreen';
import { SubmitScreen } from '@/screens/SubmitScreen';
import { ThanksScreen } from '@/screens/ThanksScreen';
import type { InstrumentId } from '@/content';
import { ProblemSetup1, ProblemSetup2 } from '@/screens/setup/ProblemSetup';
import { FrameworkSetup1, FrameworkSetup2 } from '@/screens/setup/FrameworkSetup';
import {
  InstrumentsSetup1,
  InstrumentsSetup2,
} from '@/screens/setup/InstrumentsSetup';
import { ClusterSetupScreen } from '@/screens/setup/ClusterSetupScreen';
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

  // Key the rendered subtree by screenId so navigating between two
  // screens that map to the SAME component type (e.g. two `question`
  // screens, c1-q5 → c1-q6) forces a full remount. Without this, React
  // reuses the same component instance — only the `screenId` prop
  // changes — and per-screen useState initialisers don't re-run, so
  // local field state (selected rating pill, textarea value) leaks from
  // the previous screen into the new one. Keying the Fragment also
  // forces a remount for ClusterSetupScreen across different clusters.
  return <Fragment key={screen.id}>{renderByKind(screen)}</Fragment>;
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
      return <ProblemSetup1 />;
    case 'problem-setup-2':
      return <ProblemSetup2 />;
    case 'framework-setup-1':
      return <FrameworkSetup1 />;
    case 'framework-setup-2':
      return <FrameworkSetup2 />;
    case 'instruments-setup-1':
      return <InstrumentsSetup1 />;
    case 'instruments-setup-2':
      return <InstrumentsSetup2 />;
    case 'cluster-setup':
      return screen.clusterId ? (
        <ClusterSetupScreen clusterId={screen.clusterId} />
      ) : (
        <Placeholder name="Cluster setup · (no cluster id)" />
      );
    case 'question':
      return <QuestionScreen screenId={screen.id} />;
    case 'paired':
      return <PairedQuestionScreen screenId={screen.id} />;
    case 'close-pair':
      return <ClosePairScreen />;
    case 'instrument':
      return <InstrumentScreen screenId={screen.id as InstrumentId} />;
    case 'interview':
      return <InterviewScreen />;
    case 'submit':
      return <SubmitScreen />;
    case 'thanks':
      return <ThanksScreen />;
  }
}
