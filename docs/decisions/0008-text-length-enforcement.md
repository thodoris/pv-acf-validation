# ADR 0008 — Text-length enforcement (defence in depth)

## Status

Accepted (2026-05-24).

## Context

Open-response textareas previously accepted up to 4 000 characters and the
two free-text profile fields and the interview email had no length cap.
The user tightened the limits to:

- Open responses on every question screen: **1 000 chars**.
- Profile free-text fields (`name`, `institutionName`): **100 chars**.
- Interview follow-up email (`contact`): **100 chars + valid email format**.

The user's actual requirement was sharper than a typing cap: **no value
above the recorded limit may reach Firestore**. That moves the question
from "what does the UI accept" to "where is the limit enforced".

## Decision

Limits live in one module, `src/lib/textLimits.ts`, and four layers of
enforcement read from it. Each layer addresses a different bypass:

| Layer | Where | Bypassable by |
|---|---|---|
| **1 — UI cap** | HTML `maxLength` on `<input>` / `<textarea>` (set in `OpenResponse`, `ProfileScreen`, `InterviewScreen`) | DevTools attribute removal, programmatic value injection |
| **2 — Lock guard** | Each Continue handler refuses to call `lockAnswer` when an open value exceeds its limit (and `ProfileScreen` / `InterviewScreen` block similarly). **Not bypassable by review mode `?tweaks=1`** — required-field checks are bypassable but data-integrity checks are not. | Direct mutation of `useAnswerStore.getState().answers` |
| **3 — Seal sanitiser** | `sanitizeSealPayload(payload)` runs in `SubmitScreen.onSubmit` before `sealToFirestore` and trims every over-length string to its limit (and drops a malformed `interview.contact` rather than persisting it). Mutates only the outbound copy — the `answerStore` and `localStorage` are left intact (F4 / append-only is preserved). | Direct call to `addDoc(collection(db, 'submissions'), …)` from the DevTools console |
| **4 — Server rule** | Firestore security rule (configured in Firebase Console — not in repo, per ADR 0007 and CLAUDE.md). Honest scope: cannot iterate dynamic map keys, so cannot directly per-answer-cap; what it *can* do is constrain top-level shape and reject pathological payloads. | Effectively unbypassable from the client. A Cloud Function `onCreate` trigger is the option for full per-field validation if the residual gap matters. |

Layers 1–3 are implemented in code. Layer 4 is the user's deployment step.

The seal-time pair (`findSealViolations` and `sanitizeSealPayload`, both in
`src/state/sealPayload.ts`) walks every `AnswerValue` variant. The
validator inspects only and returns `SealViolation[]`; the sanitiser
returns `{ payload, fixed }` where `payload` has trimmed values and
`fixed` lists the same violations the validator would have surfaced.
The sanitiser is pure — it never touches the `answerStore`, so the F4
append-only contract is preserved; the outbound document just differs
from the in-memory store. Both functions cover:

- `open.value`, `rating-and-open.open`, `paired.subAnswers[slot].open`,
  `instrument.sharedOpen` — all against `OPEN_RESPONSE` (1 000).
- `profile.data[*]` (strings only) — against `PROFILE_TEXT` (100). Covers
  free-text fields and select-option labels uniformly.
- `interview.data.contact` (when non-empty) — against `INTERVIEW_EMAIL`
  (100) and `isValidEmail`. Special case: trimming a malformed email
  yields a (shorter) malformed email, so the sanitiser **drops** the
  field instead — explicit `undefined`, which the Firestore SDK omits.
- `rating` and `grid-and-composite` carry no text fields and are skipped.

`SubmitScreen` uses **only the sanitiser**. The validator is still
exported for tests and for any future read-only consumer.

## Consequences

**Good:**

- One source of truth for limits. Future limit changes touch
  `textLimits.ts` only; UI cap, counter, lock guard, and seal guard all
  re-read.
- Layers 2 and 3 are independent — tampering with one is caught by the
  other.
- Over-length is treated as a *data-integrity* failure, not a *required-
  field* validation. Review mode (`?tweaks=1`) intentionally does NOT
  bypass it, because allowing review mode to lock an over-length value
  would dead-end the reviewer at submit when layer 3 refuses the write.

**Bad / accepted:**

- The sanitiser performs **silent truncation**. A user whose
  locked-but-unsubmitted answer somehow contained 1 050 characters
  (only possible via layer-1+layer-2 bypass) would submit 1 000
  characters without being told. In dev, a `console.warn` lists every
  trimmed field; in production there is no UI surfacing. Accepted: the
  scenario is pathological (requires DevTools tampering) and the
  alternative — refusing the submit — dead-ends users on locked answers
  they cannot edit. Truncation preserves the rest of their submission.
- Legacy locked answers from before this change (anyone with a
  partially-completed session in `localStorage` containing `open`
  values >1 000 chars) get silently truncated to 1 000 on submit. The
  in-memory store / `localStorage` retain the original — only the
  outbound Firestore document is clipped. Acceptable because the
  platform has not yet seen real reviewer traffic.
- Firestore rules can't perfectly enforce per-answer length caps because
  the `answers` map is keyed by question IDs and rules have no
  iteration primitive. The realistic server-side guarantee, if ever
  needed, is a Cloud Function `onCreate` trigger that re-runs
  `findSealViolations` on the written document and deletes violations.

## Alternatives considered

- **Validation inside `lockAnswer`.** Rejected: the store would need to
  refuse or truncate silently, which is worse UX than refusing at the
  Continue button with an inline error pointing at the offending field.
- **Refuse the submit on over-length.** Initial implementation — replaced
  same-session with the sanitiser approach. The user explicitly noted
  that locked answers cannot be edited from the Submit screen, so
  refusing leaves the reviewer with no remedy: their entire submission
  is held hostage by a single over-length field they cannot reach. The
  sanitiser preserves the rest of the submission; the dev-only
  `console.warn` records what was clipped.
- **Confirmation dialog before truncation.** Considered. Rejected for
  scope: the only way to hit truncation is via DevTools tampering or
  legacy data, and surfacing a dialog for either case adds friction
  for normal submitters who will never see it.
- **Single check at seal time only (skip per-screen guards).** Rejected:
  the per-screen layer is where a *normal* user notices and shortens
  their answer — at the moment they're authoring it. The seal-time
  sanitiser is a safety net, not the front line.

## Firestore-Console rules

The **production rules** currently in Console (verified 2026-05-24) match
ADR 0007 and the `responses` path written by `sealToFirestore`. They
enforce the core invariants — create-only writes, admin-read, append-only:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /responses/{docId} {
      allow create: if true;
      allow read: if request.auth != null && request.auth.token.email == "thodoris@thodoris.net";
      allow update, delete: if false;
    }
  }
}
```

These rules are correct for the system's documented invariants. They do
**not** add per-write shape validation — that's optional hardening, not
required for correctness, and Firestore rules cannot iterate the
dynamic `answers` map anyway (no per-answer length cap is reachable
from rules alone).

An **optional** harder variant adds top-level shape and size checks.
Worth turning on if a hostile client crafting malformed payloads is in
scope; otherwise the current rules are sufficient:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /responses/{docId} {
      allow read: if request.auth != null
                  && request.auth.token.email == "thodoris@thodoris.net";
      allow create: if
        request.resource.data.keys().hasOnly(
          ['variant', 'answerCount', 'answers', 'submittedAt', 'userAgent', 'acknowledgeListing']
        )
        && request.resource.data.variant is string
        && request.resource.data.variant.size() <= 16
        && request.resource.data.answerCount is number
        && request.resource.data.answerCount >= 0
        && request.resource.data.answerCount <= 64
        && request.resource.data.answers is map
        && request.resource.data.userAgent is string
        && request.resource.data.userAgent.size() <= 500
        && (
          !('acknowledgeListing' in request.resource.data)
          || request.resource.data.acknowledgeListing is bool
        );
      allow update, delete: if false;
    }
  }
}
```

`acknowledgeListing` is optional in the payload (only present when the
reviewer gave a name on the Profile screen — see Delta 3 of the
acknowledgement-listing relocation change). The `!('x' in data) || ...`
idiom checks the type only when the key is present, so name-given and
no-name reviewers both pass.

The harder variant uses `is number` rather than `is int` because the
JS SDK serialises integer-valued numbers as doubles by convention; the
predicate name is misleading on that front, and `is number` matches
both.

If full per-answer length enforcement is ever required server-side, the
right tool is a Cloud Function `onCreate` trigger that re-runs
`findSealViolations` on the written document and deletes anything that
fails — neither variant of the rules above can do that.
