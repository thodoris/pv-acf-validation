/* Review mode — enabled by the URL flag ?tweaks=1.
   When on:
     · screens skip required-field validation on Continue
     · the F1 phase gate (no Phase 2 before Phase 1 done) is bypassed
     · the TweaksPanel (jump-to-screen picker) mounts
   None of this is reachable in production. Detected at module load and on
   navigation; tweaks=1 is preserved across screen changes because urlSync
   uses URLSearchParams.set rather than overwriting the whole search string. */

const REVIEW_PARAM = 'tweaks';
const REVIEW_VALUE = '1';

export function isReviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(REVIEW_PARAM) === REVIEW_VALUE;
}
