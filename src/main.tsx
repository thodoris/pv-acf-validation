import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

// Verbatim from the prototype (frozen in docs/reference-prototype/). The visual register
// is approved as-is; do not refactor these files without explicit sign-off.
import './styles/styles.css';
import './styles/styles-phase-a.css';

import {
  checkCompatibility,
  isViewportOnlyFailure,
  type CompatibilityResult,
} from './lib/compatibility';
import { IncompatibleEnvironmentScreen } from './screens/IncompatibleEnvironmentScreen';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Mount point #root not found');
}
const root: Root = createRoot(rootEl);

/* The App module is imported DYNAMICALLY when the compatibility check
   passes. This is load-bearing: a static `import App from './App'` would
   eagerly resolve sessionStore (whose Zustand `persist` middleware reads
   localStorage at module load) and the Firebase init module. Gating in
   main.tsx is only meaningful if the failure path never touches those
   modules. */
function mountApp(): void {
  void import('./App').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
}

function mountIncompatible(result: Extract<CompatibilityResult, { ok: false }>): void {
  root.render(
    <StrictMode>
      <IncompatibleEnvironmentScreen result={result} />
    </StrictMode>,
  );
}

/* Recovery: when the only failure is viewport, the questionnaire should
   auto-mount once the user widens the window, exits DevTools device
   emulation, etc. Two complementary triggers:

     1. `resize` event — primary, catches window drag.
     2. Polling at POLL_MS — fallback for silent changes that don't fire
        resize. The most common case is DevTools device emulation toggle:
        turning emulation OFF can change `screen.width` (from the emulated
        device width back to the real monitor) without firing resize.

   Resize is coalesced via setTimeout(0) so a window drag doesn't thrash
   React. setTimeout rather than requestAnimationFrame: rAF is throttled
   to zero in background tabs / headless / some preview environments,
   and this work isn't visually-tied.

   Both triggers funnel into the same re-check; both stop the moment
   compatibility passes. Named handler so StrictMode's double-effect
   doesn't stack listeners. */
const POLL_MS = 1000;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let mounted: 'app' | 'incompatible' = 'incompatible';

function stopRecovery(): void {
  window.removeEventListener('resize', onResize);
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function recheck(): void {
  const next = checkCompatibility();
  if (next.ok) {
    stopRecovery();
    mounted = 'app';
    mountApp();
    return;
  }
  if (!isViewportOnlyFailure(next)) {
    // A non-viewport failure has appeared (unlikely in practice — usually
    // means customElements or storage was just unset). Stop trying to
    // auto-recover; user must reload manually.
    stopRecovery();
  }
  // Re-render with updated widthPx so the copy reflects the live size.
  // If we already mounted the app (race with a previous re-check), don't
  // unmount it just because a momentary narrow read came back.
  if (mounted === 'incompatible') mountIncompatible(next);
}

function onResize(): void {
  if (pendingTimer !== null) return;
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    recheck();
  }, 0);
}

function startRecovery(): void {
  window.addEventListener('resize', onResize);
  pollTimer = setInterval(recheck, POLL_MS);
}

const initial = checkCompatibility();
if (initial.ok) {
  mounted = 'app';
  mountApp();
} else {
  mountIncompatible(initial);
  if (isViewportOnlyFailure(initial)) {
    startRecovery();
  }
}
