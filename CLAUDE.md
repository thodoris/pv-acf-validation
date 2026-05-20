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
| Stack | Vite 5 + React 18 + TypeScript (strict) |
| State | Zustand — two stores: `sessionStore`, `answerStore` |
| Routing | No router. Flat `SCREENS` array + URL sync `?s=<id>&v=<variant>` |
| Styles | Plain CSS files copied **verbatim** from prototype (`styles.css`, `styles-phase-a.css`). No CSS-in-JS. |
| AST | Vanilla `<ast-explore>` Web Component kept as-is. Thin React wrapper `ExploreOverlay` mounts it imperatively. |
| Fonts | Self-hosted woff2 with `unicode-range`. Preload Latin subsets only. |

## Hard rules for the AST (`<ast-explore>`)

- **Do not rewrite as React.** Side-effect-import the JS file once at app boot.
- **No state retention after close.** On overlay close, remove the element from the DOM — the shadow root and all internal state must be destroyed. Re-opening creates a fresh instance.
- **Ignore `ast:verdict` events.** AST is exploration-only. No runs counter, no capture, no persistence.
- **F5 firewall.** Opening, running, and closing the AST must produce **zero** mutation in `sessionStore` or `answerStore`. The only channel is the locked Q1/Q2 evaluation answers the reviewer types into the host screen below.

## Hard rules for the answer store

- **`lockAnswer(questionId, value)` is append-only.** Second writes are silent no-ops with a dev-only console warning. No `unlockAnswer`, no `editAnswer`. F4 by construction.
- **Locked answers are reviewable on Back, not editable.** The UI must render locked answers in a disabled state.

## Variant-readiness

The current questionnaire is the FULL variant. SHORT is architecturally supported (URL `?v=short`, config in `src/content/variants.ts`) but not populated. Variants can only:

- hide whole screens (atomic — paired screens go together), and/or
- relax `required` attributes on questions.

Variants can **never** add questions or change question types. Always-on screens (`welcome`, `profile`, `submit`, `thanks`) cannot be hidden by any variant.

## Out of scope

- Backend (data path, schema, save-and-resume across devices). Treat answer payload as opaque.
- `PLATFORM/design & adr/`, `PLATFORM/content and questions/`, `PLATFORM/AST Explore Tool/` — user's private working drafts. Do not consult.
- Anything not in the plan file without sign-off.

## When you find a discrepancy

If the prototype and a design document disagree, **build what the prototype does** and add a row to `docs/SOURCE_OF_TRUTH.md`. Do not silently align in either direction.
