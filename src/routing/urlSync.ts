/* URL ↔ session sync. The current screen id is reflected in the URL as
   ?s=<screenId>&v=<variantId>. Reading on mount; writing on screen change;
   popstate restores on Back/Forward.

   Invalid or gated ids redirect to the F1-correct landing screen via
   resolveNavigation. */

import { useEffect } from 'react';
import { useSessionStore } from '@/state/sessionStore';
import { parseVariantId, type VariantId } from '@/content/variants';
import { resolveNavigation } from './navigation';
import { isReviewMode } from '@/dev/reviewMode';
import type { ScreenId } from './screens';

const SCREEN_PARAM = 's';
const VARIANT_PARAM = 'v';

function readUrl(): {
  screen: ScreenId | null;
  variant: VariantId;
  variantRaw: string | null;
} {
  const params = new URLSearchParams(window.location.search);
  const variantRaw = params.get(VARIANT_PARAM);
  return {
    screen: params.get(SCREEN_PARAM),
    variant: parseVariantId(variantRaw),
    variantRaw,
  };
}

function writeUrl(screen: ScreenId, variant: VariantId, replace = false): void {
  const params = new URLSearchParams(window.location.search);
  params.set(SCREEN_PARAM, screen);
  params.set(VARIANT_PARAM, variant);
  const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  if (replace) {
    window.history.replaceState({ screen }, '', newUrl);
  } else {
    window.history.pushState({ screen }, '', newUrl);
  }
}

/** Reads URL on mount, applies the variant, and resolves the screen against
 *  the F1 gate. Sets up popstate listener for Back/Forward.
 *  Writes URL whenever the store's currentScreenId changes. */
export function useUrlSync(): void {
  const currentScreenId = useSessionStore((s) => s.currentScreenId);
  const variant = useSessionStore((s) => s.variant);
  const setScreen = useSessionStore((s) => s.setScreen);
  const setVariant = useSessionStore((s) => s.setVariant);
  const completedScreens = useSessionStore((s) => s.completedScreens);

  // Initial mount: read URL, apply variant + screen with F1 gate.
  useEffect(() => {
    const fromUrl = readUrl();
    // Variant reconciliation: only let the URL override the persisted
    // variant when it is *explicitly* set. A bare `/` URL (no `v=` param)
    // means "use whatever the store holds" — critical for SHORT recovery
    // after closing the tab, since `parseVariantId(null)` would otherwise
    // default to 'full' and clobber the persisted 'short'.
    const effectiveVariant =
      fromUrl.variantRaw === null ? variant : fromUrl.variant;
    if (effectiveVariant !== variant) {
      setVariant(effectiveVariant);
    }
    if (fromUrl.screen) {
      const result = resolveNavigation(fromUrl.screen, completedScreens, {
        bypassGate: isReviewMode(),
      });
      const landing = result.ok ? result.screen.id : result.redirectTo;
      if (landing !== currentScreenId) setScreen(landing);
      writeUrl(landing, effectiveVariant, true);
    } else {
      writeUrl(currentScreenId, effectiveVariant, true);
    }
    // We deliberately run this once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // popstate: Back/Forward — read URL again, re-gate.
  useEffect(() => {
    const onPop = () => {
      const fromUrl = readUrl();
      if (fromUrl.screen) {
        const result = resolveNavigation(
          fromUrl.screen,
          useSessionStore.getState().completedScreens,
          { bypassGate: isReviewMode() },
        );
        setScreen(result.ok ? result.screen.id : result.redirectTo);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setScreen]);

  // Push URL on screen change.
  useEffect(() => {
    const fromUrl = readUrl();
    if (fromUrl.screen !== currentScreenId || fromUrl.variant !== variant) {
      writeUrl(currentScreenId, variant);
    }
  }, [currentScreenId, variant]);
}
