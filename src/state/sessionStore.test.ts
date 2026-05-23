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

  it('acknowledgeListing starts unchecked, can be set, persists across setProfile while name stays', () => {
    const s = () => useSessionStore.getState();
    expect(s().acknowledgeListing).toBe(false);

    s().setProfile({ name: 'Reviewer A', years: '5–10 years' });
    s().setAcknowledgeListing(true);
    expect(s().acknowledgeListing).toBe(true);

    // Updating the profile while keeping the name does NOT reset the tick.
    s().setProfile({ name: 'Reviewer A', years: 'Over 20 years' });
    expect(s().acknowledgeListing).toBe(true);
  });

  it('markSubmitted stamps submittedAt + sealedDocId and is idempotent', () => {
    const s = () => useSessionStore.getState();
    expect(s().submittedAt).toBeNull();
    expect(s().sealedDocId).toBeNull();

    s().markSubmitted('doc-abc');
    const first = s().submittedAt;
    expect(first).toBeGreaterThan(0);
    expect(s().sealedDocId).toBe('doc-abc');

    // Second call must NOT overwrite the timestamp or docId.
    s().markSubmitted('doc-xyz');
    expect(s().submittedAt).toBe(first);
    expect(s().sealedDocId).toBe('doc-abc');
  });

  it('resetSession clears submittedAt + sealedDocId', () => {
    const s = () => useSessionStore.getState();
    s().markSubmitted('doc-abc');
    s().resetSession();
    expect(s().submittedAt).toBeNull();
    expect(s().sealedDocId).toBeNull();
  });

  it('clearing the profile name auto-resets acknowledgeListing to false', () => {
    const s = () => useSessionStore.getState();
    s().setProfile({ name: 'Reviewer A', years: '5–10 years' });
    s().setAcknowledgeListing(true);
    expect(s().acknowledgeListing).toBe(true);

    // Clearing the name discards the prior preference per spec.
    s().setProfile({ name: '', years: '5–10 years' });
    expect(s().acknowledgeListing).toBe(false);

    // Whitespace-only is also "no name" for this purpose.
    s().setProfile({ name: 'Reviewer A', years: '5–10 years' });
    s().setAcknowledgeListing(true);
    s().setProfile({ name: '   ', years: '5–10 years' });
    expect(s().acknowledgeListing).toBe(false);

    // Undefined name (field omitted) also counts as cleared.
    s().setProfile({ name: 'Reviewer A', years: '5–10 years' });
    s().setAcknowledgeListing(true);
    s().setProfile({ years: '5–10 years' });
    expect(s().acknowledgeListing).toBe(false);
  });
});
