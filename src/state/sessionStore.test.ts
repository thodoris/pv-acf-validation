import { beforeEach, describe, expect, it } from 'vitest';
import { useSessionStore, CONSENT_VERSION } from './sessionStore';

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
    localStorage.clear();
  });

  it('starts at welcome with no completed screens', () => {
    const s = useSessionStore.getState();
    expect(s.currentScreenId).toBe('welcome');
    expect(s.completedScreens.size).toBe(0);
    expect(s.consent.acknowledged).toBe(false);
  });

  it('markComplete adds to the set, idempotent', () => {
    const { markComplete } = useSessionStore.getState();
    markComplete('profile');
    markComplete('profile'); // second call is a no-op
    markComplete('g1');
    const s = useSessionStore.getState();
    expect(s.completedScreens.size).toBe(2);
    expect(s.completedScreens.has('profile')).toBe(true);
    expect(s.completedScreens.has('g1')).toBe(true);
  });

  it('setScreen stamps sessionStartedAt on first move off welcome', () => {
    const { setScreen } = useSessionStore.getState();
    expect(useSessionStore.getState().sessionStartedAt).toBeNull();
    setScreen('profile');
    const stamped = useSessionStore.getState().sessionStartedAt;
    expect(stamped).not.toBeNull();
    // Subsequent moves do not reset the stamp
    setScreen('g1');
    expect(useSessionStore.getState().sessionStartedAt).toBe(stamped);
  });

  it('acknowledgeConsent records version + timestamp', () => {
    useSessionStore.getState().acknowledgeConsent(CONSENT_VERSION);
    const c = useSessionStore.getState().consent;
    expect(c.acknowledged).toBe(true);
    expect(c.version).toBe(CONSENT_VERSION);
    expect(c.acknowledgedAt).toBeGreaterThan(0);
  });

  it('setProfile / setInterview store data', () => {
    useSessionStore.getState().setProfile({ name: 'Test', years: '5–10 years' });
    expect(useSessionStore.getState().profile?.years).toBe('5–10 years');
    useSessionStore.getState().setInterview({ willingness: 'Yes — please contact me' });
    expect(useSessionStore.getState().interview?.willingness).toBe('Yes — please contact me');
  });
});
