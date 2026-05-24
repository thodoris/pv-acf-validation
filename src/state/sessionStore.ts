/* Session/spine state. Persisted to localStorage (key: pvacf:session).
   Tracks where the reviewer is, what they've completed, their profile, consent,
   and the active variant. Does NOT hold question answers — that's answerStore. */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ScreenId } from '@/routing/screens';
import type { VariantId } from '@/content/variants';

export type ProfileData = {
  name?: string;
  institutionName?: string;
  institution?: string;
  years?: string;
};

export type InterviewPrefs = {
  willingness?: string;
  window?: string[];
  contact?: string;
};

export type ConsentRecord = {
  acknowledged: boolean;
  acknowledgedAt: number | null;
  version: string;
};

type SerializedState = {
  currentScreenId: ScreenId;
  completedScreensList: ScreenId[];
  profile: ProfileData | null;
  consent: ConsentRecord;
  variant: VariantId;
  sessionStartedAt: number | null;
  interview: InterviewPrefs | null;
  /** Opt-in to be named in the thesis' acknowledgement of expert reviewers.
   *  Only meaningful when `profile.name` is non-empty. Decided on the
   *  Submit screen, persisted here so it survives Back→Profile→Submit
   *  round-trips. Auto-resets to `false` whenever the profile name is
   *  cleared, so a tick can never outlive the name it referred to. */
  acknowledgeListing: boolean;
  /** Timestamp at which `sealToFirestore` succeeded for this session.
   *  Null until submission. When set, the App-level guard short-circuits
   *  every screen request to the terminal screen — answers are no longer
   *  reachable in the UI. The reset button on the terminal screen wipes
   *  this (and everything else) by clearing localStorage and reloading. */
  submittedAt: number | null;
  /** Firestore document id returned by `sealToFirestore`. Surfaced on the
   *  terminal screen for support / audit reference. */
  sealedDocId: string | null;
};

type SessionState = Omit<SerializedState, 'completedScreensList'> & {
  completedScreens: Set<ScreenId>;

  setScreen: (id: ScreenId) => void;
  markComplete: (id: ScreenId) => void;
  setProfile: (p: ProfileData) => void;
  acknowledgeConsent: (version: string) => void;
  setVariant: (v: VariantId) => void;
  setInterview: (p: InterviewPrefs) => void;
  setAcknowledgeListing: (v: boolean) => void;
  markSubmitted: (docId: string) => void;
  resetSession: () => void;
};

export const CONSENT_VERSION = '1.0';

const initialState = {
  currentScreenId: 'welcome' as ScreenId,
  completedScreens: new Set<ScreenId>(),
  profile: null,
  consent: { acknowledged: false, acknowledgedAt: null, version: CONSENT_VERSION },
  // SHORT is the default at release (see ADR 0010). Keep in sync with
  // DEFAULT_VARIANT_ID in src/content/variants.ts.
  variant: 'short' as VariantId,
  sessionStartedAt: null,
  interview: null,
  acknowledgeListing: false,
  submittedAt: null,
  sealedDocId: null,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialState,

      setScreen: (id) =>
        set((s) => ({
          currentScreenId: id,
          // Lazily stamp sessionStartedAt the first time the reviewer
          // moves off `welcome`.
          sessionStartedAt:
            s.sessionStartedAt === null && id !== 'welcome' ? Date.now() : s.sessionStartedAt,
        })),

      markComplete: (id) =>
        set((s) => {
          if (s.completedScreens.has(id)) return s;
          const next = new Set(s.completedScreens);
          next.add(id);
          return { completedScreens: next };
        }),

      setProfile: (p) =>
        set((s) => ({
          profile: p,
          // Auto-reset the acknowledgement-listing tick if the name is
          // cleared. Per the spec, a tick cannot outlive the name it
          // referred to: clearing the name discards any prior preference.
          acknowledgeListing: p.name?.trim() ? s.acknowledgeListing : false,
        })),

      acknowledgeConsent: (version) =>
        set({
          consent: {
            acknowledged: true,
            acknowledgedAt: Date.now(),
            version,
          },
        }),

      setVariant: (v) => set({ variant: v }),

      setInterview: (p) => set({ interview: p }),

      setAcknowledgeListing: (v) => set({ acknowledgeListing: v }),

      markSubmitted: (docId) =>
        set((s) => {
          // Idempotent: once submitted, the first stamp wins. Re-calling
          // (e.g. a stray retry) does not overwrite the recorded timestamp
          // or docId.
          if (s.submittedAt !== null) return s;
          return { submittedAt: Date.now(), sealedDocId: docId };
        }),

      resetSession: () =>
        set({
          ...initialState,
          completedScreens: new Set<ScreenId>(),
        }),
    }),
    {
      name: 'pvacf:session',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Zustand's default JSON serializer can't handle Set — round-trip through
      // an array.
      partialize: (s): SerializedState => ({
        currentScreenId: s.currentScreenId,
        completedScreensList: Array.from(s.completedScreens),
        profile: s.profile,
        consent: s.consent,
        variant: s.variant,
        sessionStartedAt: s.sessionStartedAt,
        interview: s.interview,
        acknowledgeListing: s.acknowledgeListing,
        submittedAt: s.submittedAt,
        sealedDocId: s.sealedDocId,
      }),
      merge: (persisted, current): SessionState => {
        const p = persisted as Partial<SerializedState> | undefined;
        return {
          ...current,
          ...(p ?? {}),
          completedScreens: new Set<ScreenId>(p?.completedScreensList ?? []),
        };
      },
    },
  ),
);
