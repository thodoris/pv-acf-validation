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
};

type SessionState = Omit<SerializedState, 'completedScreensList'> & {
  completedScreens: Set<ScreenId>;

  setScreen: (id: ScreenId) => void;
  markComplete: (id: ScreenId) => void;
  setProfile: (p: ProfileData) => void;
  acknowledgeConsent: (version: string) => void;
  setVariant: (v: VariantId) => void;
  setInterview: (p: InterviewPrefs) => void;
  resetSession: () => void;
};

export const CONSENT_VERSION = '1.0';

const initialState = {
  currentScreenId: 'welcome' as ScreenId,
  completedScreens: new Set<ScreenId>(),
  profile: null,
  consent: { acknowledged: false, acknowledgedAt: null, version: CONSENT_VERSION },
  variant: 'full' as VariantId,
  sessionStartedAt: null,
  interview: null,
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

      setProfile: (p) => set({ profile: p }),

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
