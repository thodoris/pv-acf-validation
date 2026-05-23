# ADR 0009 — F4 boundary shift: editable until submit, immutable in Firestore

## Status

Accepted (2026-05-24). Supersedes the "F4 append-only" rule documented in
earlier versions of CLAUDE.md, ARCHITECTURE.md, and ADR 0002.

## Context

The original F4 rule treated every Continue as a permanent lock:
`lockAnswer` was a single-write-only operation that no-op'd on the second
call, every question screen rendered fields with `disabled={isLocked}` on
revisit, and a "Locked." banner explained why nothing could be changed.
The rationale was data integrity — once a reviewer affirmed an answer,
nothing should silently mutate it.

But that integrity guarantee only actually matters at the **storage
boundary** (Firestore). Before submission, the answers live in
`localStorage`; there is no third party reading them. The "editable until
submit" model better fits the platform's framing — an expert reviewer
refining their judgements over a 45-minute session.

## Decision

Shift the immutability boundary from "per-screen Continue" to
"session-wide Submit":

- **`lockAnswer` becomes overwrite-safe.** A second write for the same
  `questionId` replaces the previous value and refreshes `lockedAt` to
  "now". Reviewers can revise any answer at any time before they submit.
- **`sessionStore.submittedAt` + `sealedDocId`** record the seal event.
  Set by `markSubmitted(docId)` after `sealToFirestore` succeeds.
- **App-level guard** in `src/App.tsx`: if `submittedAt !== null`, render
  `<SubmittedTerminalScreen />` regardless of `currentScreenId`. The
  question screens are unreachable post-submit by any URL, browser-back,
  or refresh path.
- **Terminal screen** (`src/screens/SubmittedTerminalScreen.tsx`) shows
  the confirmation, the sealed doc id, and a confirm-gated **Start a new
  session** button that wipes both localStorage keys and reloads `/` for
  a different reviewer on the same device.
- **24-hour TTL on unsubmitted sessions.** `src/lib/sessionTtl.ts` exposes
  `isSessionExpired`; the App boot check wipes localStorage + reloads if
  the user has been idle without submitting for 24h. Submitted sessions
  are persistent — only the reset button clears them.
- **Per-screen `isLocked` plumbing is removed** from all six screens
  (`QuestionScreen`, `PairedQuestionScreen`, `InstrumentScreen`,
  `ClosePairScreen`, `ProfileScreen`, `InterviewScreen`). No
  `disabled={isLocked}`, no LockedBanner, no `alreadyLocked` guard, no
  early-exit in `onContinue`. The screen-level state is "editable",
  full stop.
- **urlSync variant reconciliation** (`src/routing/urlSync.ts`): a bare
  `/` URL (no `?v=` param) now preserves the persisted variant instead of
  defaulting to `'full'`. SHORT recovery from a closed-and-reopened tab
  works correctly. Explicit `?v=full` overrides still apply.

## What does NOT change

- **`SealPayload` wire format**: same fields, same union shapes. `lockedAt`
  semantics are clarified (latest save, not first); see [ADR 0002](./0002-answer-value-wire-format.md)
  amendment.
- **Firestore security rules**: `create: if true`, admin-only read,
  `update/delete: if false`. The server-side immutability guarantee is
  unchanged — see [ADR 0007](./0007-firebase-persistence-and-hosting.md)
  amendment for the updated rationale.
- **F5 AST firewall**: completely independent. The AST widget still
  cannot mutate any store.
- **Sealed-document integrity**: once written, a Firestore document is
  immutable. The boundary moved on the client; the server boundary is
  untouched.

## Consequences

**Good:**

- Reviewers can refine answers as their thinking develops — natural for
  the platform's "drawing on practice and judgement" framing.
- Post-submit answers are not just disabled, they are *hidden*. No risk
  of a different reviewer on the same device reading the previous
  reviewer's responses.
- A single App-level guard is the single point of post-submit protection;
  the previous design distributed `disabled` checks across six screens.
- Removes ~120 lines of `isLocked` / LockedBanner / `alreadyLocked`
  machinery from screens.

**Bad / accepted:**

- A reviewer who walks away from a submitted device without pressing
  reset leaves the terminal screen visible. A different reviewer sees
  the confirmation message (and the doc id) but cannot read the
  underlying answers. Acceptable.
- The terminal screen has no automatic expiry — only the reset button.
  Submitted state persists indefinitely until reset. Trade-off chosen
  because the alternative (auto-expire submitted state) would break the
  refresh-safe terminal property.
- Client clock dependency on the 24h TTL: a user who manually changes
  their device clock can extend or shorten the window. Acceptable — the
  TTL is a UX convenience for shared devices, not a security control.

## Alternatives considered

- **Per-screen "disabled review" of submitted answers** (initial draft).
  Rejected during planning — user noted that exposing the submitted
  answers in disabled form to a different reviewer on the same device
  is undesirable. The terminal screen hides them entirely.
- **Auto-redirect to Thanks instead of an App-level guard.** Rejected
  because manual URL navigation (`?s=c1-q1`) would still render the
  question screen if the redirect only fired on browser-back. The
  App-level guard intercepts every render path.
- **Rename `lockAnswer` to `saveAnswer`.** Rejected during planning —
  minimal churn was preferred; the "lock" now refers to the eventual
  seal lock, still accurate.

## Migration

Pre-launch state — no in-flight reviewer traffic. Anyone with an
existing `pvacf:answers` from before this change will, after the change,
be able to edit those answers until submit. Anyone with a pre-change
`pvacf:session` will not have a `submittedAt` field (it didn't exist);
the missing field defaults to `null` via Zustand's merge, so they land
in the "unsubmitted, editable" path correctly.
