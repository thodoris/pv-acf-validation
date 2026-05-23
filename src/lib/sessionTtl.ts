/* Session-age TTL for unsubmitted sessions.

   Unsubmitted sessions expire 24 hours after `sessionStartedAt`. On app
   boot, if `isSessionExpired(...)` returns true, App.tsx wipes the two
   persistence keys (`pvacf:answers` and `pvacf:session`) and reloads
   `/` for a clean start.

   Submitted sessions (those with a non-null `submittedAt`) are NEVER
   expired by this helper — the terminal screen persists indefinitely
   until the reset button is pressed.

   Caveat: the check fires on mount only. A tab kept open continuously
   for >24h does not auto-wipe; the next reload / navigation / browser-
   back triggers the check and the wipe. */

/** Maximum age of an unsubmitted session in milliseconds (24 hours). */
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/** True if the given session has exceeded its TTL.
 *
 *  - `submittedAt` non-null → false (submitted sessions are persistent).
 *  - `sessionStartedAt` null → false (the user is still on Welcome).
 *  - elapsed > SESSION_TTL_MS → true.
 *  - exactly at the boundary → false (strictly greater).
 *
 *  `now` is injectable for tests; defaults to `Date.now()`.
 */
export function isSessionExpired(
  sessionStartedAt: number | null,
  submittedAt: number | null,
  now: number = Date.now(),
): boolean {
  if (submittedAt !== null) return false;
  if (sessionStartedAt === null) return false;
  return now - sessionStartedAt > SESSION_TTL_MS;
}
