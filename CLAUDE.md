# Agent guidance — PV-ACF Expert Validation Platform

You are working on a production build of a doctoral-thesis expert-review platform. Read this before touching code.

## The three governing rules

These override everything else:

1. **The implemented prototype is the source of truth.** Authoritative copy lives at `docs/reference-prototype/` (frozen). Where the bundle's design documents (`docs/handoff/`) disagree, **the prototype wins**.
2. **Visual register is approved as-is.** No restyling for taste reasons. No CSS rename or selector tidy-up. If a technical constraint forces a visual change, flag and wait for sign-off.
3. **Major changes need explicit approval.** Architecture, framework choice, file structure, component contracts, screen flow, styling. Recommendations welcome; unilateral changes are not.

## What to read, in order

When picking up a task cold:

1. `docs/user-brief/pvacf_platform_implementation_brief.md` — the governing brief (v2.0). Read in full.
2. `docs/ARCHITECTURE.md` — the approved implementation plan. The five locked architectural decisions, variant-readiness design, verification plan. **Binding.**
3. `docs/decisions/` — ADR-style notes for tactical decisions made during implementation that are not in the plan. Read these to avoid re-litigating choices.
4. `docs/SOURCE_OF_TRUTH.md` — known discrepancies between prototype and design docs (prototype wins; do **not** silently align).
5. The relevant prototype source under `docs/reference-prototype/` for whatever you are porting.
6. `git log` — phase-by-phase narrative of what was built and why.

The handoff bundle docs at `docs/handoff/` are **historical references** — useful for understanding *intent*, not authoritative for what to build.

The chat transcripts at `docs/design-history/` are inert. Do not consult them unless the user explicitly asks.

## When to add an ADR

Add a new entry to `docs/decisions/` (next sequential number, kebab-case slug)
when you make a tactical choice that:

- contradicts the plan in `docs/ARCHITECTURE.md`, or
- materially extends the plan with something it did not anticipate, or
- a future agent might otherwise re-litigate (e.g. a non-obvious library
  workaround, a deliberate non-idiom).

Skip ADRs for routine porting that just executes the plan. Commit messages
already carry that narrative.

## Locked architectural decisions

| Decision | Value |
|---|---|
| Stack | Vite 5 + React 18 + TypeScript (strict), Node 24 LTS (pinned via `.nvmrc` + `package.json` `engines`) |
| State | Zustand — two stores: `sessionStore`, `answerStore` |
| Routing | No router. Flat `SCREENS` array + URL sync `?s=<id>&v=<variant>` |
| Styles | Plain CSS files copied **verbatim** from prototype (`styles.css`, `styles-phase-a.css`). No CSS-in-JS. |
| AST | Vanilla `<ast-explore>` Web Component kept as-is. Thin React wrapper `ExploreOverlay` mounts it imperatively. |
| Fonts | Self-hosted woff2 with `unicode-range`. Preload Latin subsets only. |
| Persistence + Hosting + Auth | Firebase: Firestore (`europe-west3`) for sealed submissions, Firebase Hosting for the SPA, Google Sign-In for the admin at `/admin`. See [ADR 0007](./docs/decisions/0007-firebase-persistence-and-hosting.md). |

## Hard rules for the AST (`<ast-explore>`)

- **Do not rewrite as React.** Side-effect-import the JS file once at app boot.
- **No state retention after close.** On overlay close, remove the element from the DOM — the shadow root and all internal state must be destroyed. Re-opening creates a fresh instance.
- **Ignore `ast:verdict` events.** AST is exploration-only. No runs counter, no capture, no persistence.
- **F5 firewall.** Opening, running, and closing the AST must produce **zero** mutation in `sessionStore` or `answerStore`. The only channel is the locked Q1/Q2 evaluation answers the reviewer types into the host screen below.

## Hard rules for the answer store

- **`lockAnswer(questionId, value)` is the working save.** Second writes for the same id overwrite the previous value and refresh `lockedAt`. Reviewers can revise any answer at any point before submitting. (Superseded F4 lock-on-Continue — see [ADR 0009](./docs/decisions/0009-f4-boundary-shift.md).)
- **Final immutability is the seal boundary.** The client-side boundary is `sessionStore.submittedAt`: once set, the App-level guard short-circuits every screen request to `<SubmittedTerminalScreen />` and answers are no longer reachable in the UI. The server-side boundary is Firestore rules at `responses/{docId}` (`update/delete: if false`).
- **24-hour TTL on unsubmitted sessions.** If `sessionStartedAt !== null && submittedAt === null && Date.now() - sessionStartedAt > 24h`, the App boot check wipes both localStorage keys and reloads `/`. Submitted sessions are persistent until the terminal screen's reset button is pressed.

## Variant-readiness

The current questionnaire is the FULL variant. SHORT is architecturally supported (URL `?v=short`, config in `src/content/variants.ts`) but not populated. Variants can only:

- hide whole screens (atomic — paired screens go together), and/or
- relax `required` attributes on questions.

Variants can **never** add questions or change question types. Always-on screens (`welcome`, `profile`, `submit`, `thanks`) cannot be hidden by any variant.

## Review mode (`?tweaks=1`)

A dev-only URL flag toggling three behaviours simultaneously:

- **Validation skipped on Continue.** Required-field checks return true regardless of input.
- **F1 phase gate bypassed.** Direct `?s=c3-ast` lands on c3-ast without redirecting through Phase 1.
- **TweaksPanel mounted** at bottom-right with a jump-to-screen picker for all 32 screens.

Detection is via `isReviewMode()` (`src/dev/reviewMode.ts`), a pure read of `window.location.search`. Consumers: `ProfileScreen`, `QuestionScreen`, `PairedQuestionScreen`, `ClosePairScreen`, `InstrumentScreen`, `routing/navigation.ts:jumpTo`, `routing/urlSync.ts`. `<TweaksPanel />` is mounted unconditionally in `App.tsx` and short-circuits to null when the flag is absent.

**Submitted sessions stay submitted.** Once `sessionStore.submittedAt` is set, the App-level guard renders the terminal screen regardless of any URL or review-mode flag — `?tweaks=1` cannot reach a question screen in a submitted session. Pre-submit, review mode allows free editing exactly like normal navigation; over-length text and seal-time invariants are the only hard blockers.

**Launchers:** `npm start:review` / `view:review` and `start-review.bat` / `view-review.bat`.

## Answer hydration pattern

Every screen that calls `lockAnswer` follows the same dance, repeated in `QuestionScreen.tsx`, `PairedQuestionScreen.tsx`, `InstrumentScreen.tsx`, `ClosePairScreen.tsx`:

1. Read the existing answer at mount: `useAnswerStore((s) => s.getAnswer(screenId))`.
2. **Hydrate local field state** from the `AnswerValue` discriminated union — a small `hydrateFromLocked(value)` helper private to each screen, since the variant shapes differ.
3. Render fields normally — no `disabled` plumbing, no Locked banner. On Continue, validate then call `lockAnswer` (overwrite-safe).

The App-level submitted guard handles the post-submit case: a submitted session never reaches a question screen, so screens themselves don't need a `disabled` mode.

If you're authoring a new answer-saving screen, follow this pattern. Don't extract into a shared hook yet — the variant shapes diverge enough that the abstraction would leak.

See [ADR 0002 — AnswerValue wire format](./docs/decisions/0002-answer-value-wire-format.md) for the union shape each screen consumes.

## Submission persistence (Firebase)

The sealed payload is written to Firestore on submit. Write happens in `SubmitScreen.onSubmit` via `sealToFirestore(getSealedPayload())`; failure is surfaced as an inline Retry on the same screen, and the localStorage `pvacf:answers` map is preserved so retry replays cleanly. Schema: `{ variant, answerCount, answers, submittedAt: serverTimestamp(), userAgent }` per submission, auto-id, append-only (Firestore rules enforce `update/delete: if false`, mirroring the client-side F4 lock contract).

## App Check (anti-bot)

Firebase App Check is initialized in `src/lib/firebase.ts` with the reCAPTCHA v3 provider (site key in `VITE_FIREBASE_APPCHECK_SITE_KEY`). Tokens attach automatically to every Firestore + Auth request. **Enforcement is configured in the Firebase Console, not in code** — toggling enforcement on rejects unverified requests server-side; until then, tokens are observed-only. For local dev, the file sets `self.FIREBASE_APPCHECK_DEBUG_TOKEN` to either the pinned `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN` (if set in `.env.local`) or `true` (auto-generate + log to console). Pinned tokens are pre-registered in Console → App Check → Manage debug tokens, so every local browser/profile/machine sharing the same `.env.local` reuses them without re-registration.

## Deployment / CI

Production is served by Firebase Hosting at **`validation.thodoris.net`** (custom domain), with the default `pv-acf-questionnaire.web.app` and `*.firebaseapp.com` URLs serving the same `live` channel.

**Auto-deploy on push to `main`** via GitHub Actions ([.github/workflows/deploy-firebase.yml](./.github/workflows/deploy-firebase.yml)). The workflow installs deps, writes `.env.local` from repo Secrets, runs `npm test` (gate), builds, and calls `FirebaseExtended/action-hosting-deploy@v0` on the `live` channel. Concurrency is queued (`cancel-in-progress: false`) so overlapping pushes don't race.

**Secrets in GitHub → repo → Settings → Secrets and variables → Actions:**

- `FIREBASE_SERVICE_ACCOUNT_PV_ACF_QUESTIONNAIRE` — deploy-only service account JSON, `roles/firebasehosting.admin` only. Created via `firebase init hosting:github`.
- Seven build-time `VITE_*` vars (see `.env.example`).

**Skip a deploy** with `[skip ci]` in the commit subject. The commit pushes; the workflow doesn't run. Used for env-only or docs-only changes that don't affect the production bundle.

**Manual re-deploy** via GitHub Actions UI → workflow → "Run workflow" — uses latest `main` without needing a code change. Useful for redeploying after a Console-only flag flip (e.g. enabling App Check enforcement).

**No PR previews.** `firebase init hosting:github` generates `firebase-hosting-pull-request.yml` for PR previews; that file was deliberately deleted because it inherits no env-var injection step (previews would build with empty Firebase config). If preview deploys become desirable later, port the `.env.local` write step from the production workflow before keeping the PR file.

**Lint is intentionally NOT in CI** today — two pre-existing errors in `src/content/content.test.ts` (unrelated to Firebase) would block every deploy. When those are fixed, add `npm run lint` to the workflow.

## Admin route (`/admin`)

Hidden Google-Sign-In page at `/admin`. No entry point in the questionnaire UI; reach it by typing the URL. Detection is via `isAdminRoute()` (`src/admin/adminMode.ts`) — a pure pathname check, mirroring `isReviewMode()`. `App.tsx` short-circuits to `<AdminPanel />` when true. Authorization is a single-email whitelist read from `VITE_ADMIN_EMAIL`. The admin can export all submissions to xlsx in-browser, or run `npm run export:firestore` for an offline backup via the Admin SDK service-account key.

## Out of scope

- ~~Backend (data path, schema, save-and-resume across devices). Treat answer payload as opaque.~~ **Superseded 2026-05-21** — Firestore persists sealed submissions; SPA on Firebase Hosting. See [ADR 0007](./docs/decisions/0007-firebase-persistence-and-hosting.md). Save-and-resume *across devices* remains out of scope (localStorage is still the only progressive store; the Firestore write is one-shot at submit).
- `D:\Users\thodo\OneDrive\Learning\Phd\PhD Thesis\PLATFORM\design & adr\`, `D:\Users\thodo\OneDrive\Learning\Phd\PhD Thesis\PLATFORM\content and questions\`, `D:\Users\thodo\OneDrive\Learning\Phd\PhD Thesis\PLATFORM\AST Explore Tool\` — user's private working drafts (remain in OneDrive, separate from the repo at `E:\source\repos\personal\pv-acf`). Do not consult.
- Anything not in the plan file without sign-off.

## When you find a discrepancy

If the prototype and a design document disagree, **build what the prototype does** and add a row to `docs/SOURCE_OF_TRUTH.md`. Do not silently align in either direction.
