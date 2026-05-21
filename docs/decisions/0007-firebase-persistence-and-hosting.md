# 0007 — Firebase: persistence, hosting, admin export

- **Status:** Accepted · 2026-05-21
- **Touches:** `src/lib/firebase.ts`, `src/lib/sealSubmission.ts`, `src/state/sealPayload.ts`, `src/screens/SubmitScreen.tsx`, `src/admin/*`, `scripts/export-firestore.ts`, `firebase.json`, `.firebaserc`, `package.json`

## Context

The build plan ([ARCHITECTURE.md](../ARCHITECTURE.md) §"Items deferred" #1) explicitly defers the data path: "treat answer payloads as opaque `{questionId, value, lockedAt}` records. `POST /seal` is a stub." [CLAUDE.md](../../CLAUDE.md) repeats this: backend is "Out of scope."

Expert review begins shortly. Submissions must be captured durably (a thesis depends on it) and the user must be able to download them as a workbook for analysis. The deferral has to end. We need three things at once: a place to put sealed responses, a place to host the SPA, and a private path for the user to pull the data out.

## Decision

**One Firebase project (`pv-acf-questionnaire`) backs all three:**

1. **Firestore (`europe-west3`)** for persistence. One collection, `responses`; one document per sealed submission; auto-id. Schema is the `SealPayload` (`variant`, `answerCount`, `answers: Record<QuestionId, LockedAnswer>`) plus `submittedAt: serverTimestamp()` and `userAgent`. Security rules: `create: if true`, `read: if request.auth.token.email == <admin>`, `update/delete: if false`. The client-side `lockAnswer` append-only contract (F4) is mirrored on the server by the `update: false` rule.
2. **Firebase Hosting** for the SPA. Replaces the (non-existent) GitHub Pages story. `firebase.json` sets `public: "dist"` and rewrites all paths to `/index.html` so the `/admin` route works under SPA routing.
3. **Hidden admin route at `/admin`** with **Google Sign-In** (`signInWithPopup`). Authorization is a single-email whitelist read from `VITE_ADMIN_EMAIL`. No entry point in the questionnaire UI — only direct URL access. Admin can export all submissions to xlsx in the browser, or run a Node CLI script using a service-account key for offline backups.

The seal write is **awaited** (block-and-retry, not fire-and-forget). On Firestore failure the SubmitScreen shows an inline Retry button; `pvacf:answers` in localStorage stays intact so a retry replays cleanly.

## Alternatives considered

- **Stay deferred, do nothing now.** Rejected — expert review starts; we need durable capture.
- **Custom Node backend on Render/Fly.** Rejected — adds a second deploy target, a secrets boundary, and a runtime to babysit for what is effectively a write-only endpoint and an admin export. Firebase collapses the stack into one console.
- **Fire-and-forget Firestore write.** Rejected — submissions are high-value (each is a recruited expert's complete review). Silent loss if the tab closes mid-write is unacceptable.
- **Use the Admin SDK from the client.** Not possible by design — Admin SDK bypasses security rules and requires a service-account key. Kept strictly server-side (the Node CLI).
- **Wrap export in a Cloud Function.** Rejected — Functions billing tier and an extra runtime to maintain, for an action the admin can already do in their own browser via the rules-enforced client SDK.
- **Per-question column in xlsx via SCREENS-ordered headers.** Considered, but rejected for column-order brittleness: future variants could add/hide screens. The export collects the union of question ids present in the actual data and sorts alphabetically; raw `answers` in Firestore is the durable source if re-ordering is ever needed.

## Consequences

- The build now depends on six `VITE_FIREBASE_*` env vars + `VITE_ADMIN_EMAIL` at build time. `.env.example` is committed; `.env.local` is gitignored.
- The service-account JSON for the CLI script must NEVER be committed. `.gitignore` patterns `firebase-admin-*.json` and `service-account*.json` enforce this; the CLI reads its path from `GOOGLE_APPLICATION_CREDENTIALS`.
- ARCHITECTURE.md "Items deferred" #1 is superseded by this ADR. CLAUDE.md "Out of scope" is amended accordingly.
- The SubmitScreen now has a network dependency. Offline reviewers see the Retry UI; this is the only screen with that property and it's intentional.
- Anonymity is preserved: no auth on submit, no client identifier in the document. `userAgent` is the only triage hint and is informational only.
- Export column order is keyed off the *union of observed question ids*, not SCREENS. If a clean, ordered re-export is ever needed, regenerate from the raw `answers` map in Firestore using a one-off script.

## Amendment — 2026-05-22 — App Check (reCAPTCHA v3)

Added Firebase App Check at app boot (`src/lib/firebase.ts`) with the reCAPTCHA v3 provider. The client mints a token per request and attaches it transparently to all Firestore + Auth traffic. Site key lives in `VITE_FIREBASE_APPCHECK_SITE_KEY`; init is conditional on its presence so a missing env var degrades gracefully to no-App-Check rather than a hard crash at module load.

**Enforcement is deliberately left off** in the Firebase Console for the initial rollout — tokens are observed-only until the Console "Requests" graph confirms the client is minting valid tokens. Enforcement is toggled per-service (Firestore, Auth) in Console → App Check → APIs and requires no code change.

Localhost development uses the SDK's debug-token mechanism. The DEV branch in `src/lib/firebase.ts` reads `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN` from `.env.local`: if pinned, that exact UUID (pre-registered in Console → Manage debug tokens) is reused across every browser/profile/machine sharing the env file; if absent, the SDK auto-generates a token and logs it for one-off registration.

## Amendment — 2026-05-22 — CI auto-deploy via GitHub Actions

`.github/workflows/deploy-firebase.yml` deploys on every push to `main` and on manual `workflow_dispatch`. The workflow installs deps, writes a build-time `.env.local` from repo Secrets, runs `npm test` (test failure aborts the deploy), runs `npm run build` (which includes `tsc --noEmit`), and calls `FirebaseExtended/action-hosting-deploy@v0` on the `live` channel of `pv-acf-questionnaire`. Concurrency is grouped under `firebase-deploy-prod` with `cancel-in-progress: false` so overlapping pushes queue rather than race.

**Service account scope.** Created via `firebase init hosting:github` with `roles/firebasehosting.admin` only. Cannot read or mutate Firestore submissions; cannot impersonate users; cannot create or grant further IAM roles. Compromise = attacker can publish hosting bundles, nothing more — the deploy bundle still has to pass Firebase Hosting's static-asset rules.

**Skip mechanism.** A `[skip ci]` (or `[ci skip]`, `[no ci]`, etc.) marker in the commit subject skips the workflow entirely. Used in commit `74ada1c` to publish the pinned-debug-token env var change without re-running the deploy (the change has no effect on the production bundle).

**No PR previews.** `firebase init hosting:github` generates a `firebase-hosting-pull-request.yml` workflow that was deliberately deleted: it inherits no env-var injection, so PR preview builds would produce a bundle with empty `VITE_FIREBASE_*` config (broken). If preview deploys become desirable later, port the `.env.local` write step from the production workflow before keeping the PR file.

**Lint deliberately not in CI.** `npm run lint` would block every deploy because of two pre-existing errors in `src/content/content.test.ts` unrelated to this work. Add the lint step once those are fixed.

**Custom domain.** `validation.thodoris.net` is bound to the same `live` channel as the default `pv-acf-questionnaire.web.app` URL — no per-domain workflow configuration. `VITE_FIREBASE_AUTH_DOMAIN` remains `pv-acf-questionnaire.firebaseapp.com` (Firebase Auth's OAuth handler domain, not the user-facing app domain); the custom domain just needs to be in Console → Authentication → Authorized domains for sign-in popups to return cleanly.
