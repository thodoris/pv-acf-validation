/* Side-effect import: registers <ast-explore> via customElements.define.
   The vanilla JS file is the source of truth — DO NOT rewrite in React or
   TypeScript. Its self-contained shadow-DOM subtree + CustomEvent interface
   is the seam between the operable widget and the React spine.

   Plus a JSX IntrinsicElements augmentation so <ast-explore /> typechecks. */

import './ast-explore.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ast-explore': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export type AstVerdictDetail = {
  verdict: 'select-architecture' | 'stop-and-reframe';
  surviving: string[];
  active: string[];
  conditional: string[];
  eliminated: string[];
  stopReason: 'distributional' | 'no-survivors' | null;
};

export type AstCloseDetail = {
  timestamp: number;
  reachedResult: boolean;
};
