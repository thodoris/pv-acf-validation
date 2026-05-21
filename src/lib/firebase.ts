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
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
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

// App Check debug token — DEV ONLY.
// reCAPTCHA v3 doesn't work on `localhost`, so for local dev we hand
// Firebase a debug token instead. If VITE_FIREBASE_APPCHECK_DEBUG_TOKEN is
// set, we pin that exact UUID (already registered in Firebase Console →
// App Check → Manage debug tokens) so every browser / profile / machine
// with this .env.local reuses the same token — no per-device
// re-registration. If unset, we pass `true` and let Firebase auto-generate
// one (logged to DevTools console on first run for one-off registration).
// MUST be set BEFORE initializeAppCheck().
if (import.meta.env.DEV) {
  const pinnedDebugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
  (
    self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: string | boolean }
  ).FIREBASE_APPCHECK_DEBUG_TOKEN = pinnedDebugToken || true;
}

export const app: FirebaseApp = initializeApp(firebaseConfig);

// App Check — reCAPTCHA v3 attestation. The client mints and attaches a
// token to every Firestore + Auth request automatically. Enforcement is
// **off** in the Firebase Console for now; tokens are observed-only. Flip
// the toggle in Console → App Check → APIs once you're confident the
// client is sending valid tokens (visible in the Console's "Requests"
// graph). Init is conditional on the site key so a missing env var falls
// back to no-App-Check rather than a hard crash at module load.
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
if (appCheckSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

/** Email of the single admin user authorized to read submissions and export. */
export const ADMIN_EMAIL: string | undefined = import.meta.env.VITE_ADMIN_EMAIL;
