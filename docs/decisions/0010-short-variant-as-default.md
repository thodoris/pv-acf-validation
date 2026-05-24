# 0010 — SHORT variant becomes the default

- **Status:** Accepted · 2026-05-25
- **Touches:** `src/content/variants.ts` (`DEFAULT_VARIANT_ID`), `src/state/sessionStore.ts` (`variant:` initial), `index.html` (`<html data-variant="…">`), `src/content/variants.test.ts`, `src/routing/progress.test.ts`, `CLAUDE.md`

## Context

The platform ships with two variants — `full` and `short` — projected from a single FULL spine via the levers in `src/content/variants.ts` (`hiddenScreens`, `hiddenFields`, `requiredOverrides`). FULL has always been the default; SHORT was architecturally supported but empty until commit `4be6469` populated it.

The user has decided that, at release, **SHORT is the variant most reviewers should take**. FULL becomes the elevated path for the subset of reviewers who specifically opt in (typically: those with time to engage with the applicability question per instrument and willingness to consider a follow-up interview).

The app is in pre-release testing with no submitted responses yet, so the flip can land without a migration story.

## Decision

**SHORT is the default variant** from this commit forward. Concretely:

1. **`DEFAULT_VARIANT_ID: VariantId = 'short'`** in `src/content/variants.ts`. `parseVariantId(null | undefined | '' | <unknown>)` returns `'short'`.
2. **`variant: 'short' as VariantId`** in `sessionStore.ts`'s `initialState`. Both must flip — otherwise the persist-middleware-rehydrated-state beats the parsed default, and a bare URL keeps re-instantiating with `'full'`.
3. **`<html lang="en" data-variant="short">`** in `index.html`. The CSS-class lever (`.hide-in-short` / `.hide-in-full`) reads from `data-variant`, and matching the post-flip default eliminates flash-of-FULL-copy on first paint for SHORT reviewers.

### URL semantics post-flip

- `https://validation.thodoris.net/` → **SHORT**.
- `https://validation.thodoris.net/?v=full` → **FULL**.
- `https://validation.thodoris.net/?v=short` → **SHORT** (explicit-equals-default).
- Any unknown `?v=` value → **SHORT** (defensive fallback in `parseVariantId`).

`urlSync`'s "bare URL means use the persisted store value" branch (`src/routing/urlSync.ts:60`) is unaffected by this flip — it preserves a reviewer's in-progress variant across tab close regardless of which value is the default.

## Alternatives considered

- **Keep FULL as default; require `?v=short` to opt in.** Rejected — this is the inverse of the user's intent. Most reviewers should reach SHORT; FULL is the exception.
- **Flip only `DEFAULT_VARIANT_ID` but not the store initial.** Rejected — Zustand's `persist` middleware writes the store's initial-state shape into localStorage on first load if no entry exists. With persist-init = `'full'` and `parseVariantId(null)` = `'short'`, a bare URL would write `'full'` to storage (from the store init) and then later urlSync would reconcile and overwrite to `'short'` — a flicker and an unnecessary localStorage write. Flipping both keeps the boot path simple.
- **Add a per-variant URL alias (`/short`, `/full`).** Rejected — the existing `?v=` parameter scheme is established, tested, and already consumed by `urlSync`. Adding a path-based alias means a router or rewrites; both are scope creep for a one-bit decision.
- **Re-author the welcome to label "Short review" prominently as a hint that FULL exists.** Rejected for now — the welcome copy already says "Short review" implicitly through the hide-in-short-forked count and duration. Reviewers explicitly invited to FULL receive a `?v=full` link from the researcher; everyone else doesn't need to know FULL exists.

## Migration safety

- **No live responders at the flip.** The app has not yet been opened to recruited experts; the only submissions to date are author-side dry runs marked `variant: 'full'` in the seal payload. These remain analytically distinguishable from future SHORT submissions via the `variant` field on each Firestore document.
- **Existing pinned tests are insulated.** `e2e/walk-all-screens.spec.ts` and `e2e/answer-lifecycle.spec.ts` either pin the variant explicitly (`?v=full` / `?v=short`) or test the variant-recovery logic with both polarities; the flip does not regress them. `e2e/walk-all-screens-short.spec.ts` covers the new default path.
- **The schema-invariance contract holds across the flip.** The seal payload's column set is identical for FULL and SHORT (hidden fields land as `null` / empty string, not omitted). Downstream analysis pipelines read both under one schema with `variant` as the only differentiator. See `normalizeForVariantInvariance` in `src/state/sealPayload.ts`.

## Consequences

- **Researcher comms.** Any link previously shared as "the questionnaire" now delivers SHORT. Invitations meant for FULL reviewers must explicitly carry `?v=full`. (Pre-launch invitations have not been sent yet — this is a comms hygiene point for the launch beat, not a migration headache.)
- **Future SHORT trims happen by editing `src/content/variants.ts`, not by re-flipping.** Adding screens to `hiddenScreens` / fields to `hiddenFields` / overrides to `requiredOverrides` extends SHORT in place. `assertVariantInvariants` continues to enforce the structural guards (no hiding always-on screens; no hiding `sharedOpen`; no hiding both `q1` and `q2` on an instrument).
- **Naming relict.** `clusterPosition.totalInFull` in `src/content/types.ts` still says "InFull" — the value is unchanged (it's the FULL anchor that the renderer divides off `effectiveScreens().length` against). Cosmetic only; left as-is to avoid a churn-prone rename on a stable field.
- **TweaksPanel** is the canonical pre-launch QA path. The dev-only variant switcher introduced in commit `4be6469` lets the author toggle FULL ↔ SHORT live without manually editing the URL.

## Verification

- Unit: `parseVariantId(null)` returns `'short'`; `parseVariantId('full')` returns `'full'`; `parseVariantId('short')` returns `'short'`. Sessionstore initialises with `variant: 'short'`. `progressFor` tests pin FULL explicitly where their assertions depend on the 32-screen spine length.
- Manual: clear localStorage, open bare `/` — Welcome shows the SHORT count + duration, no interview bullet. Open `/?v=full` — FULL copy renders, interview screen reachable through nav. Open `/?v=short` — identical to bare. URL `data-variant` attribute reflects each state.
- E2E: both walk specs pass post-flip (they're variant-pinned).
- Bundle: chunk split unchanged (`index-*.js` ~149 KB, `App-*.js` ~1 MB). The compat-gate's dynamic-import boundary is upstream of variant resolution; the flip has no bundling consequence.
