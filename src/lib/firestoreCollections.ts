/* Firestore collection names — single source of truth.
   Kept in its own no-deps module so the Node CLI export script can pull
   it without dragging in src/lib/firebase.ts (which references
   `import.meta.env` and only works in the Vite bundle). */

/** Sealed expert submissions. Matches the security-rule path
 *  `/responses/{docId}`. */
export const SUBMISSIONS_COLLECTION = 'responses';
