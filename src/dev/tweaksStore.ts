/* Tweaks store — dev-only ephemeral session state for the Tweaks panel.
   NOT persisted to localStorage. NOT exposed in production.

   The prototype defines three orthogonal toggles for comparing visual
   variants of the master shell + reference overlay. The defaults match the
   approved production register; alternates exist for review-time comparison
   only (per brief §3 "Affordance pattern" and "Reference overlay" rows). */

import { create } from 'zustand';

export type AffordanceMode = 'rail' | 'inline-expanders' | 'floating-tools';
export type OverlayStyle = 'drawer' | 'fullscreen' | 'floating';
export type ShellSide = 'right' | 'left';

export type TweaksState = {
  affordanceMode: AffordanceMode;
  overlayStyle: OverlayStyle;
  shellSide: ShellSide;
  setAffordanceMode: (m: AffordanceMode) => void;
  setOverlayStyle: (s: OverlayStyle) => void;
  setShellSide: (s: ShellSide) => void;
};

export const useTweaksStore = create<TweaksState>((set) => ({
  affordanceMode: 'rail',
  overlayStyle: 'drawer',
  shellSide: 'right',
  setAffordanceMode: (m) => set({ affordanceMode: m }),
  setOverlayStyle: (s) => set({ overlayStyle: s }),
  setShellSide: (s) => set({ shellSide: s }),
}));
