/* Admin route detector — pure read of window.location.

   The admin panel is mounted when the pathname is `/admin`. No entry point
   exists anywhere in the questionnaire UI; reviewers can only reach it by
   typing the URL directly. Mirrors the style of src/dev/reviewMode.ts so that
   future agents can see the convention. */

export const ADMIN_PATH = '/admin';

export function isAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname === ADMIN_PATH;
}
