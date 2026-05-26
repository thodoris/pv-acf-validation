/* Sanitise the `body` HTML on a concept card before it reaches
   `dangerouslySetInnerHTML` in the drawer renderer.

   Allow-list (per concept-cards spec §2.5):
   - <strong>  — highlight the central defined term
   - <em>      — italic emphasis
   - <span class="…">  — class-based styling consistent with the platform

   Everything else is stripped.  Inner text of stripped tags is preserved
   (e.g. <a href="...">foo</a> → foo) so author typos don't blank a card
   silently — KEEP_CONTENT: true does that.

   The pool is author-controlled (not user input) so the threat model is
   "an editor pasted unclean HTML by mistake," not "an attacker is trying
   to break out."  DOMPurify is overkill for that bar but eliminates the
   class of bugs entirely. */

import DOMPurify from 'dompurify';

const CONFIG = {
  ALLOWED_TAGS: ['strong', 'em', 'span'],
  // DOMPurify enforces ALLOWED_ATTR globally.  `class` is only meaningful
  // on <span> in the v1 allow-list; allowing it on <strong>/<em> is
  // harmless and avoids a per-tag attribute map.
  ALLOWED_ATTR: ['class'],
  KEEP_CONTENT: true,
};

export function sanitizeCardBody(html: string): string {
  return DOMPurify.sanitize(html, CONFIG);
}
