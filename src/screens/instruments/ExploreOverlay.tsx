/* Thin React wrapper around <ast-explore> (the vanilla Web Component).
   Mounts the element imperatively into a host div; listens to ast:close to
   dismiss the overlay. ast:verdict is intentionally ignored — AST is
   exploration-only per user direction; no runs counter, no state capture.

   On close, the <ast-explore> element is removed from the DOM, which
   destroys the shadow root, listeners, and all internal state. Re-opening
   creates a fresh instance — verified by the F5 firewall test (Phase 5b). */

import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import '@/widgets/ast-explore';

export type ExploreOverlayProps = {
  onClose: () => void;
};

export function ExploreOverlay({ onClose }: ExploreOverlayProps): JSX.Element {
  const hostRef = useRef<HTMLDivElement | null>(null);

  // Latest-callback ref so the effect runs once and doesn't tear down the
  // element when the parent re-renders with new inline arrows.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const el = document.createElement('ast-explore');
    const handleClose = () => {
      onCloseRef.current?.();
    };
    el.addEventListener('ast:close', handleClose);
    host.appendChild(el);
    return () => {
      el.removeEventListener('ast:close', handleClose);
      if (el.parentNode === host) host.removeChild(el);
    };
  }, []);

  return (
    <div className="overlay overlay--fullscreen overlay--ast-explore">
      <button
        type="button"
        aria-label="Close AST overlay"
        className="overlay__backdrop"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
        }}
      />
      <div ref={hostRef} className="ast-explore-host" style={{ position: 'relative' }} />
    </div>
  );
}
