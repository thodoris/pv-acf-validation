/* Pre-boot compatibility gate.

   Runs synchronously from src/main.tsx BEFORE the App module is imported.
   Importing App transitively loads sessionStore (whose Zustand `persist`
   middleware reads localStorage at module load) and code paths that touch
   src/lib/firebase.ts (which calls initializeApp / initializeAppCheck at
   module load). Gating in main.tsx keeps the failure path free of storage
   writes, Firebase initialisation, and the reCAPTCHA script injection.

   Probes:
     - viewport: window.innerWidth >= MIN_VIEWPORT_PX
     - localStorage: write + read-back inside try/catch
     - indexedDB: typeof global is not 'undefined'
     - customElements: registry + define() function present

   Touch-pointer is intentionally NOT a probe — Surface Pro / iPad Pro in
   landscape are at >=1100px and fully usable; pointer-coarse is a false
   signal. Network / reCAPTCHA / fetch / WebSocket are also out of scope:
   the Firebase SDK degrades gracefully on those, and any ES2022 / CSS Grid
   failure kills the bundle before this code runs anyway. */

export const MIN_VIEWPORT_PX = 1100;

export type CompatibilityFailure =
  | { kind: 'viewport'; widthPx: number; minPx: number }
  | { kind: 'localStorage' }
  | { kind: 'indexedDB' }
  | { kind: 'customElements' };

export type CompatibilityResult =
  | { ok: true }
  | { ok: false; failures: CompatibilityFailure[] };

/** Probe localStorage with write + read-back inside try/catch. A bare
 *  setItem can silently no-op in some quota-zero modes without throwing,
 *  so we read back to confirm the value landed. */
function probeLocalStorage(): boolean {
  try {
    const k = '__pvacf_probe';
    localStorage.setItem(k, '1');
    const ok = localStorage.getItem(k) === '1';
    localStorage.removeItem(k);
    return ok;
  } catch {
    return false;
  }
}

function probeIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

function probeCustomElements(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.customElements !== 'undefined' &&
    typeof window.customElements.define === 'function'
  );
}

function probeViewport(): { ok: true } | { ok: false; widthPx: number } {
  if (typeof window === 'undefined') return { ok: false, widthPx: 0 };
  // Take the smaller of innerWidth and screen.width:
  //   - innerWidth alone is fooled by mobile devices when the page's
  //     <meta name="viewport" content="width=1280"> forces a wide layout
  //     viewport. An iPhone in landscape reports innerWidth=1280 while
  //     its actual screen.width is 390.
  //   - screen.width alone misses the case where the device has a wide
  //     monitor but a narrow browser window.
  // The min catches both: a narrow window OR a small device blocks.
  //
  // Edge case: some headless / preview / iframe environments report
  // `screen.width === 0` (no screen emulation attached). 0 is not a
  // device telling us "I am small" — it's "I don't know". Treat any
  // falsy / zero value as unknown and fall back to innerWidth alone.
  const innerW = window.innerWidth;
  const screenW = window.screen?.width;
  const w = screenW && screenW > 0 ? Math.min(innerW, screenW) : innerW;
  if (w >= MIN_VIEWPORT_PX) return { ok: true };
  return { ok: false, widthPx: w };
}

/** Synchronous capability check. Returns ok-or-failures; callers gate on
 *  the result without performing any side-effects of their own. */
export function checkCompatibility(): CompatibilityResult {
  const failures: CompatibilityFailure[] = [];

  const viewport = probeViewport();
  if (!viewport.ok) {
    failures.push({ kind: 'viewport', widthPx: viewport.widthPx, minPx: MIN_VIEWPORT_PX });
  }

  if (!probeLocalStorage()) failures.push({ kind: 'localStorage' });
  if (!probeIndexedDB()) failures.push({ kind: 'indexedDB' });
  if (!probeCustomElements()) failures.push({ kind: 'customElements' });

  if (failures.length === 0) return { ok: true };
  return { ok: false, failures };
}

/** True when every failure is a viewport failure. Used by main.tsx to
 *  decide whether to arm the resize-recovery listener: storage / API
 *  failures need a manual reload after the user fixes browser settings;
 *  viewport failures auto-recover when the window is widened. */
export function isViewportOnlyFailure(result: CompatibilityResult): boolean {
  if (result.ok) return false;
  return result.failures.every((f) => f.kind === 'viewport');
}
