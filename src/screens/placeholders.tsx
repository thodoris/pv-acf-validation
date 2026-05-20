/* Temporary placeholder components. Each kind in ScreenKind gets a real
   implementation in Phase 4; until then, the placeholder lets the router
   and shell render end-to-end. */

import type { JSX } from 'react';
import { next, prev } from '@/routing/navigation';
import { useSessionStore } from '@/state/sessionStore';

export function Placeholder({
  name,
  body,
}: {
  name: string;
  body?: string;
}): JSX.Element {
  const screen = useSessionStore((s) => s.currentScreenId);
  return (
    <div className="main">
      <div className="main__inner">
        <p className="kicker">Placeholder</p>
        <h1 style={{ fontFamily: 'var(--font-display)', marginTop: 8 }}>{name}</h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 12 }}>
          Screen id: <code>{screen}</code>
        </p>
        {body && (
          <p style={{ marginTop: 16, maxWidth: 640 }}>{body}</p>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="button" onClick={prev}>
            Back
          </button>
          <button type="button" onClick={next}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
