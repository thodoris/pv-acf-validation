# 0002 — AnswerValue wire format (discriminated union)

- **Status:** Accepted · 2026-05-21
- **Touches:** `src/state/answerStore.ts`, every screen that calls `lockAnswer`

## Context

`answerStore.lockAnswer(id, value, screenId, locale?)` must persist responses for many shapes — single ratings, single open texts, rating + open pairs, the Q2.4 rating-grid + composite single-select, the c1-q3q4 paired analytical unit, the four instrument screens with q1 + q2 ratings and a shared open, and the profile + interview captures that ride alongside the validation set.

The plan said "treat answer payloads as opaque `{questionId, value, lockedAt}` records" (brief §8) and deferred the wire format to the backend workstream. But screens are already writing values today, and a future backend agent will need to know what is being stored.

## Decision

`AnswerValue` is a **discriminated union with seven `type` variants** declared in `src/state/answerStore.ts`:

```ts
export type AnswerValue =
  | { type: 'rating'; value: string }
  | { type: 'open'; value: string }
  | { type: 'rating-and-open'; rating: string; open?: string }
  | { type: 'grid-and-composite'; grid: Record<string, string>; composite?: string }
  | { type: 'paired'; subAnswers: Record<string, { rating?: string; open?: string }> }
  | { type: 'instrument'; q1Rating?: string; q2Rating?: string; sharedOpen: string }
  | { type: 'profile'; data: Record<string, string> }
  | { type: 'interview'; data: Record<string, string | string[] | undefined> };
```

**Numeric values are stored as strings.** Rating choice is an index into `rating.options`; we serialise it as `String(index)` (e.g. `"2"`) at lock time and parse it back via `Number()` on hydrate. This keeps the JSON portable and avoids the JSON-doesn't-have-undefined gotcha for sparse grids.

**Which screen writes which variant:**

| Screen kind | `type` | Lock id | Notes |
|---|---|---|---|
| `profile` | `profile` | `profile` | Also mirrored in `sessionStore.profile` — see [[0004-profile-interview-dual-storage]] |
| `question` (rating only) | `rating` | the question id (e.g. `c1-q1`) | |
| `question` (open only) | `open` | the question id | |
| `question` (rating + open) | `rating-and-open` | the question id | |
| `question` Q2.4 (grid + composite) | `grid-and-composite` | `c2-q4` | grid keyed `row0`..`row3` |
| `paired` (c1-q3q4) | `paired` | `c1-q3q4` | `subAnswers["Q1.3"]`, `subAnswers["Q1.4"]` |
| `close-pair` (c4-close) | `paired` | `c4-close` | `subAnswers["c4-q1"]`, `subAnswers["c4-q2"]` |
| `instrument` (×4) | `instrument` | the instrument id (e.g. `c3-ast`) | |
| `interview` | `interview` | `interview` | Also mirrored in `sessionStore.interview` — see [[0004-profile-interview-dual-storage]] |

**Hydration pattern.** Each screen that locks an answer has a `hydrateFromLocked(value)` helper that converts the persisted shape back to the local field state (`number | null` for ratings, string for opens). Helpers are private to each screen file; not yet generalised because each screen's hydration is small and the variant shapes differ.

## Alternatives considered

- **Store ratings as numbers.** Cleaner in-memory but the same `grid-and-composite` shape would mix numbers and undefined under JSON; the round-trip story is messier. Strings are uniform and safe.
- **One opaque `{ value: unknown }` payload.** The brief permits this — but every screen would have to redo its own runtime guards. A typed union catches drift at compile time.
- **Per-screen storage tables instead of a union.** Six storage shapes is too many for this scale.

## Consequences

- **The backend integration (deferred per brief §8) inherits this contract.** When a real `POST /seal` lands, the payload it ships is `{ [questionId]: LockedAnswer }` where `LockedAnswer = { questionId, value: AnswerValue, lockedAt, screenId, locale? }`. The backend either consumes the union directly (e.g. via a TS-compatible Python/Go schema) or projects each variant into normalised tables.
- **Backwards-compat on changes.** Adding a new `type` is non-breaking. Renaming or removing one would invalidate any locked answer in a returning reviewer's `localStorage`. If we ever rename a variant, also bump `useAnswerStore`'s `persist({ version })` and provide a migrate function.
- **Locale field is reserved but unused.** `LockedAnswer.locale` exists for future per-response language detection (English vs Greek open text). No screen sets it today; safe to leave undefined.
