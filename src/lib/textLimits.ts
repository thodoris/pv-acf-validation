/* Centralised character limits and lightweight format validators for
   text fields. Importers: ProfileScreen, InterviewScreen, OpenResponse.

   If a limit ever needs to change, change it here — the three call sites
   all read from this module so the HTML `maxLength` attribute, the
   character counter, and the on-Continue validation stay in lock-step. */

export const TEXT_LIMITS = {
  /** Single-line free-text profile fields (name, institution name). */
  PROFILE_TEXT: 100,
  /** Optional follow-up email on the InterviewScreen. */
  INTERVIEW_EMAIL: 100,
  /** Open-response textareas on cluster question screens + instruments. */
  OPEN_RESPONSE: 1000,
} as const;

/** Loose `local@domain.tld` check — no whitespace, exactly one `@`, at
 *  least one `.` in the domain. Good enough for a self-reported follow-up
 *  address; we are not parsing RFC 5322 in the client.
 *  Empty strings are NOT valid; callers should treat empty as "no email
 *  given" *before* invoking this. */
export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

/** True if `s` exceeds `limit` characters. `null` / `undefined` / empty
 *  return false. Used by per-screen Continue handlers to gate locking,
 *  and by the seal-time validator as the last client-side safety net. */
export function isOverLength(s: string | null | undefined, limit: number): boolean {
  return (s?.length ?? 0) > limit;
}
