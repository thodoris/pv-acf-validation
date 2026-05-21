# 0004 — Profile + interview are dual-stored (sessionStore + answerStore)

- **Status:** Accepted · 2026-05-21
- **Touches:** `src/screens/ProfileScreen.tsx`, `src/screens/InterviewScreen.tsx`, both stores

## Context

The plan separates `sessionStore` (current screen, completed screens, profile, consent, variant, interview) from `answerStore` (per-question locked validation answers). The profile and interview captures don't fit cleanly into either box:

- They are **inputs the reviewer provides**, like validation answers.
- They are **not validation responses** — the Welcome consent grid promises profile is "stored separately" from validation data, and interview is "stored separately" from validation answers.
- They have **session-affecting consequences** the spine needs to consult (the TopBar's Profile-step indicator reads `sessionStore.profile`; the variant gate reads consent; future save-and-resume reads them all).

The brief says "Backend... expected to provide consent-aware data export for analysis" (§8). Whatever schema lands, profile and interview will be exported alongside validation answers but kept in a separate analytical bucket.

## Decision

**Write profile and interview values to BOTH stores on the screen's Continue:**

```ts
// ProfileScreen.tsx
setProfile({ name, institutionName, institution, years });        // sessionStore
lockAnswer('profile', { type: 'profile', data: values }, 'profile'); // answerStore

// InterviewScreen.tsx
setInterview({ willingness, window, contact });                   // sessionStore
lockAnswer('interview', { type: 'interview', data: values }, 'interview');
```

Reads pick the appropriate store:

- **Shell + navigation reads** (TopBar 6-step indicator, post-spine "interview opt-in" hint) → `sessionStore`. These reads happen across screens, on every render, and benefit from sitting in the spine store.
- **Submit-time export reads** (the eventual `POST /seal` payload) → `answerStore`. The backend extraction iterates `answerStore.answers` and produces a single payload of locked records — profile and interview are first-class entries in that payload, distinguished from validation answers by their `type` discriminator (`profile` / `interview` vs. `rating` / `open` / etc.).
- **Re-hydrate on revisit** (Back navigation, save-and-resume in a later browser session) → both stores hydrate independently from `localStorage`. The screen's local state seeds from `sessionStore` (more current if the user moved on without locking), falls back to the `answerStore` locked record if the screen has been locked.

## Alternatives considered

- **Only `sessionStore`.** Then the eventual `POST /seal` extraction code must read two stores instead of one, and decide for each record whether to export it. Spreads the consent-aware split logic across the boundary.
- **Only `answerStore`.** The TopBar would have to read `answerStore.answers['profile']`, type-narrow on `value.type === 'profile'`, and pull `data.years`. Awkward and brittle across every render.
- **A third "metadata" store.** Three stores, two of them rarely-used. Not worth the conceptual overhead.

## Consequences

- **Two writes per Continue on profile + interview screens.** Trivially cheap; both stores' `persist` middleware writes through to `localStorage` synchronously.
- **The backend extraction reads `answerStore` only.** The presence of `type: 'profile'` and `type: 'interview'` entries in the payload is the consent-segregation signal. The extraction code separates them downstream.
- **F4 still applies to both.** Second `lockAnswer('profile', …)` / `lockAnswer('interview', …)` is a silent no-op, same as any validation question.
- **Save-and-resume across devices (F8, deferred)** will rebuild both stores from the same backend payload. The dual-write is symmetric — no extra hydration logic needed.
- **If a future schema collapses profile + interview into pure `sessionStore`-only** (i.e. you decide consent-aware export doesn't need `answerStore` mirroring), this ADR documents what to remove: the two `lockAnswer` calls on those screens. Make sure to update the AnswerValue union ([[0002-answer-value-wire-format]]) to drop the `profile` and `interview` variants.
