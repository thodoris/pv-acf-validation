/* Contact addresses for the researcher and supervisor.

   Stored as split `user` + `domain` parts so the joined `user@domain` form
   never appears as a single string literal anywhere in the source tree.
   The split makes regex scrapers that look for `\S+@\S+\.\S+` in source
   miss the addresses entirely — bots that download the bundled JS find the
   parts isolated, never adjacent.

   Joining only happens at runtime, inside `ProtectedEmail`'s click handler
   and post-mount effect. A unit test enforces a grep-style invariant that
   no source file outside this one carries a joined address. */

export type Contact = {
  user: string;
  domain: string;
  /** Short label used in the rendered `aria-label`, e.g. "Researcher" →
   *  "Email Researcher" so a screen reader announces the action even when
   *  the visible text is split across nodes. */
  label: string;
};

export const RESEARCHER: Contact = {
  user: 't.papadopoulos',
  domain: 'aegean.gr',
  label: 'Researcher',
};

export const SUPERVISOR: Contact = {
  user: 'yannisx',
  domain: 'aegean.gr',
  label: 'Supervisor',
};
