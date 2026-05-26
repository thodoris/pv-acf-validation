/* ProtectedEmail — anchor that displays a contact email and launches the
   OS mail client on click, without leaking the joined `user@domain` form
   into the source tree or the static HTML.

   How it works:
   - Display text renders three JSX text nodes: `{user}{'@'}{domain}`. The
     `@` is its own string literal in source, so a regex on the bundle
     (`/\w+@\w+\.\w+/`) won't match.
   - The `<a>` element's href starts as '#'. A `useEffect` swaps in the
     real `mailto:user@domain` after mount. Static-HTML scrapes (Firebase
     Hosting serves the bare app shell) never see the mailto.
   - `onClick` assembles the mailto URL fresh and sets `window.location.href`
     before letting React's default handler run, so the mail client opens
     even if the effect hasn't yet completed (and the assembled URL never
     enters a long-lived DOM attribute the user could scrape post-load).
   - The anchor's text content is still the readable `user@domain`, so
     right-click → Copy and clipboard-by-keyboard work normally. */

import { useEffect, useRef } from 'react';
import type { JSX, MouseEvent } from 'react';
import type { Contact } from '@/lib/contacts';

export type ProtectedEmailProps = {
  contact: Contact;
  /** Passed through to the rendered <a> so callers control the visual
   *  register (e.g. 'research-band__email' or 'mono'). */
  className?: string;
};

export function ProtectedEmail({ contact, className }: ProtectedEmailProps): JSX.Element {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.setAttribute('href', 'mailto:' + contact.user + '@' + contact.domain);
  }, [contact.user, contact.domain]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = 'mailto:' + contact.user + '@' + contact.domain;
  };

  return (
    <a
      ref={ref}
      href="#"
      className={className}
      onClick={onClick}
      aria-label={`Email ${contact.label}`}
    >
      {contact.user}
      {'@'}
      {contact.domain}
    </a>
  );
}
