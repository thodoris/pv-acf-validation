import { describe, expect, it } from 'vitest';
import { SESSION_TTL_MS, isSessionExpired } from './sessionTtl';

describe('sessionTtl', () => {
  const NOW = 1_700_000_000_000; // arbitrary fixed point — picks no actual date

  it('returns false when sessionStartedAt is null (still on Welcome)', () => {
    expect(isSessionExpired(null, null, NOW)).toBe(false);
  });

  it('returns false when submittedAt is set (terminal state is persistent)', () => {
    // Started a year ago AND submitted yesterday — still not expired.
    expect(isSessionExpired(NOW - 365 * 24 * 60 * 60 * 1000, NOW - 24 * 60 * 60 * 1000, NOW)).toBe(false);
  });

  it('returns false when the session is within the 24h window', () => {
    // Started 23 hours ago — still within window.
    expect(isSessionExpired(NOW - 23 * 60 * 60 * 1000, null, NOW)).toBe(false);
  });

  it('returns true when the session has exceeded 24h', () => {
    // Started 25 hours ago — expired.
    expect(isSessionExpired(NOW - 25 * 60 * 60 * 1000, null, NOW)).toBe(true);
  });

  it('returns false at exactly the 24h boundary (strictly greater)', () => {
    // Exactly 24h ago — equal, not greater.
    expect(isSessionExpired(NOW - SESSION_TTL_MS, null, NOW)).toBe(false);
  });

  it('returns true one millisecond past the boundary', () => {
    expect(isSessionExpired(NOW - SESSION_TTL_MS - 1, null, NOW)).toBe(true);
  });

  it('SESSION_TTL_MS is exactly 24 hours', () => {
    expect(SESSION_TTL_MS).toBe(24 * 60 * 60 * 1000);
  });
});
