/* Firebase client SDK initialization.

   Config is read from Vite env vars at build time (VITE_FIREBASE_*). The values
   are *public* by Firebase's design — access control lives in the Firestore
   security rules, not in the API key.

   Exports:
     · `app`  — initialized FirebaseApp
     · `db`   — Firestore handle for the `submissions` collection
     · `auth` — Firebase Auth handle for Google Sign-In on the /admin route

   This module is side-effect-on-import: the SDKs initialize once at module
   load. If env vars are missing at runtime, the SDK throws a clear error
   (better than a silent misconfiguration). */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

/** Email of the single admin user authorized to read submissions and export. */
export const ADMIN_EMAIL: string | undefined = import.meta.env.VITE_ADMIN_EMAIL;
