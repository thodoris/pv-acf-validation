/* Right-side rail. 320 px wide, sticky. When a screen declares no affordances,
   the rail still occupies its column with a "No contextual material" placeholder
   (P2 — stable shell, contextual affordances). */

import type { JSX } from 'react';
import { AffordanceCard } from './AffordanceCard';
import type { AffordanceDecl } from '@/content';

export type RailProps = {
  affordances: AffordanceDecl[];
};

export function Rail({ affordances }: RailProps): JSX.Element {
  if (!affordances || affordances.length === 0) {
    return (
      <aside className="rail">
        <p className="rail__title">For this screen</p>
        <div className="aff">
          <div className="aff__head">
            <span className="aff__kind">No contextual material</span>
          </div>
          <div className="aff__body">
            <p className="italic">
              This screen declares no extra affordances. The frame stays — the slot is
              empty, not relabelled.
            </p>
          </div>
        </div>
      </aside>
    );
  }
  return (
    <aside className="rail" aria-label="Contextual affordances">
      <p className="rail__title">For this screen</p>
      {affordances.map((a, i) => (
        <AffordanceCard key={i} {...a} />
      ))}
    </aside>
  );
}
