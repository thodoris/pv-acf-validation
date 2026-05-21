# PV-ACF Expert Validation Platform — Production Build Plan

> **Status: approved 2026-05-20 · governs the build.** This is the
> implementation plan you (the user) approved before scaffolding began. It
> documents the five architectural decisions that are locked in
> ([a] scaffold, [b] routing, [c] state-store split, [d] AST integration,
> [e] styling carry-forward), plus the variant-readiness design and the
> verification plan.
>
> **For agents:** read this once at the start of any session. Treat it as
> binding. Deviations require explicit user sign-off. Tactical decisions made
> during implementation that are not in this plan live in
> [`decisions/`](./decisions/) (ADR-style).

## Context

The `CODE/` repo currently contains only the bundled Babel-standalone prototype (`index.html`, 2.4 MB) — the same artefact that lives at `pv-acf/project/handoff/prototype.html` in the Claude Design bundle at `api.anthropic.com/v1/design/h/eaM0FavAtmGnrJk65NqN0w`. The repo's first commit was a holding pen for that single artefact.

We are now turning the prototype into a real production build. Per the user's `pvacf_platform_implementation_brief.md` (v2.0):

1. **The implemented prototype is the source of truth.** Design documents are historical references. Where they disagree, prototype wins.
2. **Visual register is approved as-is.** No restyling for taste reasons.
3. **Major changes require explicit approval.** Architecture, framework choice, file structure, component contracts, screen flow, styling — all need sign-off before any code is written.

This plan asks for sign-off on the five decisions the brief explicitly calls out: scaffold, routing, state store split, AST integration, styling carry-forward. Plus folder layout, discrepancy disposition, and a couple of clarifying questions.

---

## Source-of-truth rule (locked)

- **Authoritative inside the repo:** the **one-time snapshot** of the Claude Design bundle, mirrored into `CODE/docs/` with bundle ID + snapshot date. After this initial mirror, the repo no longer relies on Claude Design directly.
- **No automated re-fetching.** If the user needs a design change, they will hand it to Claude Design manually and bring back the resulting artefacts (a component, a CSS update, a content edit). The build does not pull from `api.anthropic.com/v1/design/…`.
- **Out of scope for build:** `PLATFORM/design & adr/`, `PLATFORM/content and questions/`, `PLATFORM/AST Explore Tool/` — private working drafts. The build never consults them.
- **Where the bundle's design docs and the prototype disagree:** prototype wins. Discrepancies are flagged in this plan and in `docs/SOURCE_OF_TRUTH.md`, not silently aligned.

---

## Folder layout

```
CODE/
├── README.md                          ← project orientation
├── CLAUDE.md                          ← agent guidance + source-of-truth rule
├── docs/
│   ├── SOURCE_OF_TRUTH.md             ← bundle ID, snapshot date, re-sync procedure, known discrepancies
│   ├── handoff/                       ← frozen mirror of pv-acf/project/handoff/
│   │   ├── IMPLEMENTATION_BRIEF.md    (bundle's version — historical reference)
│   │   ├── HANDOFF.md
│   │   ├── PV-ACF_DESIGN.md
│   │   ├── C9_expert_platform_ui_spec_v1.md
│   │   ├── C9_expert_platform_soft_description.md
│   │   ├── c9_questionnaire_cluster{1..4}_draft.md
│   │   └── c9_questionnaire_profile_screen_draft.md
│   ├── user-brief/
│   │   └── pvacf_platform_implementation_brief.md  ← v2.0; supersedes bundle brief on conflicts
│   ├── reference-prototype/           ← frozen mirror of pv-acf/project/* (excl. handoff/)
│   │   ├── prototype.html, index.html
│   │   ├── app.jsx, shell.jsx, overlays.jsx
│   │   ├── screens.jsx, screens-orientation.jsx,
│   │   │   screens-templates.jsx, screens-submit.jsx,
│   │   │   screens-problem-setup.jsx, screens-framework-setup.jsx,
│   │   │   screens-instruments-setup.jsx
│   │   ├── tweaks-panel.jsx
│   │   ├── content.js
│   │   ├── ast-explore.js
│   │   ├── styles.css, styles-phase-a.css
│   │   └── (diagram .jsx components: three-levels, framework-organisation,
│   │        instrument-reading, animations)
│   └── design-history/                ← 13 chat transcripts (chat1..chat13.md)
├── src/                               ← production code (Vite + React + TS)
├── public/                            ← static assets (fonts/, favicons)
├── index.html                         ← new Vite entry (replaces current bundled file)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .gitignore
```

**Deletions before scaffolding:**
- The current `CODE/index.html` (the bundled prototype) — its content already lives at `docs/reference-prototype/prototype.html`. Delete to avoid two copies and to clear the root for the new Vite-generated index.html.

---

## Proposal (a) — Project scaffold

**Recommendation: Vite + React 18 + TypeScript (strict) + Vitest + Playwright.**

| Layer | Choice | Why |
|---|---|---|
| Bundler | Vite 5 | Brief recommends it. Fast dev, native ESM, easy single-page deploy. |
| UI | React 18 | Direct carry from prototype's component tree. |
| Language | TypeScript, `strict: true` | Brief calls for typed CONTENT so screen templates can't drift. |
| State | Zustand (two stores) | Lightweight; matches the brief's "two stores" model without Redux ceremony. **Confirm choice before coding.** |
| Routing | None — flat `useReducer`-driven screen state synced to `?s=<id>` | The 34-screen spine doesn't need React Router. See proposal (b). |
| Styles | Plain CSS files copied verbatim + CSS Modules for new component-scoped overrides only | Brief approves current styling as-is. |
| Testing | Vitest (unit/component) + Playwright (E2E "walk all 34 screens") | Minimal; only what the brief implies. |
| Lint/format | ESLint + Prettier with React + a11y plugins | a11y plugin enforces the brief's WCAG AA + 3 px focus ring requirement at lint time. |

**Folder shape inside `src/`:**

```
src/
├── main.tsx                          ← Vite entry; mounts <App/> at #root
├── App.tsx                           ← session bootstrap, top-level providers
├── routing/
│   ├── screens.ts                    ← SCREENS array (typed, carried from app.jsx)
│   ├── ScreenRouter.tsx              ← kind-based template dispatch
│   ├── navigation.ts                 ← next()/prev() + F1 phase gate
│   └── progress.ts                   ← derived progress/time maps from SCREENS (no hard-coded indices)
├── shell/
│   ├── TopBar.tsx, Rail.tsx, AffordanceCard.tsx, Icon.tsx
│   └── shell.module.css              ← only if new selectors needed; chrome stays in styles.css
├── screens/
│   ├── WelcomeScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── OrientationScreen.tsx         ← parametrised; g1, g2 stay grouped
│   ├── ClusterSetupScreen.tsx        ← handles multi-screen setups (c1-setup1/2 etc.)
│   ├── QuestionScreen.tsx, PairedQuestionScreen.tsx
│   ├── InstrumentScreen.tsx
│   ├── InterviewScreen.tsx, SubmitScreen.tsx, ThanksScreen.tsx
│   └── fields/                       ← Likert, Chips, Frequency, Open, PerGapGrid, Slider, CompositeSelect
├── overlays/
│   ├── ReferenceOverlay.tsx          ← side-drawer; concept cards + whole-framework
│   └── ExploreOverlay.tsx            ← thin React wrapper around <ast-explore>
├── widgets/
│   └── ast-explore/
│       ├── ast-explore.js            ← copied verbatim from prototype; side-effect import
│       └── react-bridge.ts           ← typed event listeners + verdict shape
├── content/
│   ├── content.ts                    ← CONTENT typed and exported (was window.CONTENT)
│   └── types.ts                      ← Question, Instrument, Concept, etc.
├── state/
│   ├── sessionStore.ts               ← current screen, completed screens, % complete, profile
│   ├── answerStore.ts                ← append-only locked answers (questionId → {value, lockedAt})
│   └── persistence.ts                ← localStorage for now; backend hook later (F8 deferred)
├── styles/
│   ├── styles.css                    ← verbatim copy of prototype's chrome + tokens
│   ├── styles-phase-a.css            ← verbatim copy of screen-specific styles
│   └── fonts/                        ← self-hosted woff2 (GFS Neohellenic, Plex Sans, Plex Mono)
├── lib/
│   └── validation.ts                 ← required-field check on Continue (F4 prep)
└── dev/
    └── TweaksPanel.tsx               ← carried over; mounted only when ?tweaks=1
```

**Self-hosted fonts.** The prototype uses Google Fonts CDN; the user brief calls for self-hosted woff2 with Greek subsets preloaded. I'll add the woff2 files to `public/fonts/` and update the `@font-face` declarations. Listed as a deliberate, brief-mandated deviation from the prototype (not a unilateral change).

---

## Proposal (b) — Routing model for the 34-screen spine

**Recommendation: no React Router. A typed `SCREENS` array + a small `screenId` reducer in `sessionStore`, with the screen id reflected in the URL as `?s=<id>`.**

Why no router:
- The spine is **strictly linear** (forward/back) with one branch — the AST overlay. A router buys us nothing here and adds reconciliation overhead.
- The current prototype already works this way (`useState<screen>` + `setScreen(id)` in `app.jsx`). Carrying that pattern over is the brief's "faithful carry-forward."

What I add over the prototype:

1. **F1 phase gate at the navigation layer.** `next()` checks the current screen's `step` against `sessionStore.completedSteps`; advancing into Phase 2 (`c1-setup1` onward) requires `profile` + all grounding screens completed. Direct URL access to a gated screen redirects to the first un-completed prior screen.
2. **URL sync.** On `setScreen(id)` push `?s=<id>` via `history.pushState`; on `popstate` restore. Enables shareable deep-links *within the same session*; the invitation-token check still happens at `?token=…` entry. Resumability across sessions is F8 (deferred).
3. **Derived progress + time maps.** Replace the prototype's hardcoded `PROGRESS_MAP` / `TIME_MAP` with derivations from `SCREENS` (% complete = `completedScreens.size / scoredScreens.length`; time-left = sum of `screen.estimatedMinutes` for remaining screens). One source of truth.
4. **F1 redirect on invalid `?s=…`.** Land on `welcome` if the requested screen is gated or unknown.

`SCREENS` shape (TypeScript):
```ts
type Screen = {
  id: string;                  // 'welcome' | 'profile' | 'g1' | 'c1-setup1' | …
  step: StepId | null;         // 'profile' | 'grounding' | 'problem' | 'framework' | 'instruments' | 'close' | null
  kind: ScreenKind;            // 'welcome' | 'profile' | 'orientation' | 'cluster-setup' | 'question' | 'paired' | 'instrument' | 'interview' | 'submit' | 'thanks'
  contentKey?: string;         // key into CONTENT.questions / .clusters / .instruments
  affs?: AffordanceDecl[];     // rail affordances; can be derived helper or inline
  advanceLabel?: string;       // override
  estimatedMinutes?: number;   // for time-left derivation
};
```

---

## Proposal (b+) — Variant-readiness (FULL implemented, SHORT architecturally supported)

The current questionnaire is the **FULL** variant. A possible future **SHORT** variant may:

- **hide whole screens.** This includes question screens (a question is hidden by hiding its screen), paired screens (atomic — both questions go together), and non-question screens like grounding (`g1`, `g2`) or cluster-setup screens (`c1-setup1`, `c1-setup2`, …) if the user decides SHORT skips the lighter orientation; and/or
- **change a question's `required` attribute** (relax open-required to optional, or relax rating-required to optional).

It must **never** add questions or change question types.

**Always-on screens** (cannot be hidden by any variant): `welcome`, `profile`, `submit`, `thanks`. These are session-mechanics, not content. A dev-time assertion rejects any variant config that lists them.

To be ready without implementing SHORT now:

1. **URL parameter `?v=<variantId>`** alongside `?s=<screenId>`. Default `?v=full` if omitted. Unknown variant → fall back to `full`.
2. **`sessionStore.variant: 'full' | 'short'`** — set once on session entry from URL. Locked for the session (cannot switch mid-session).
3. **Variant config module** `src/content/variants.ts`:
   ```ts
   export type VariantId = 'full' | 'short';

   export type VariantConfig = {
     id: VariantId;
     label: string;
     hiddenScreens?: ScreenId[];          // entire screens (questions) skipped
     requiredOverrides?: Partial<Record<QuestionId, {
       rating?: boolean;
       open?: boolean;
     }>>;
   };

   export const VARIANTS: Record<VariantId, VariantConfig> = {
     full: { id: 'full', label: 'Full review' },
     // short: <-- not implemented; user will populate when introduced
   };
   ```
4. **Navigation filter.** `routing/navigation.ts` derives an `effectiveScreens` array = `SCREENS.filter(s => !variant.hiddenScreens?.includes(s.id))`. `next()`/`prev()` walk this filtered array. Progress + time-left also compute from the filtered array — SHORT will naturally show shorter progress and lower time-left.
5. **Required-attribute resolution.** Question rendering and validation read `effectiveRequired(questionId, kind)` = `variant.requiredOverrides?.[questionId]?.[kind] ?? CONTENT.questions[questionId][kind].required`. One helper, one call site.
6. **Submit summary respects variant.** Only required items for the active variant appear in the "required items" total. Hidden items are absent.
7. **No content forking.** `CONTENT` stays the single source for question stems, types, ratings, content. Variants only overlay visibility + required-attribute changes.
8. **Paired-screen edge case** (e.g. `c1-q3q4`): hiding only half of a pair is **not allowed** in SHORT — pairs are atomic. If SHORT later wants to drop one half, the screen as a whole must be hidden (or the pair restructured upstream, which would be a content change, not a variant change). I'll add a dev-time runtime assertion that catches partial-pair hiding.

This costs us essentially nothing now: a string field on `sessionStore`, a URL param parser, and three helper functions (`effectiveScreens`, `effectiveRequired`, `assertNoPartialPairHiding`). It buys you the ability to introduce SHORT in a future session by populating `VARIANTS.short` and nothing else.

> **Update (2026-05-21).** The infrastructure is now actually consumable end-to-end:
>
> - Display labels are no longer authored. The previously hand-written `meta` string per question (e.g. `"Question 2.5 of 6 · Judgment"`) was replaced by structured `clusterPosition: { ordinal, totalInFull }` + `registers: Register[]` fields. The renderer composes the display string at render time via `src/content/displayMeta.ts`, recomputing the visible "X of N" from `effectiveScreens(variant)`. See [ADR 0006](./decisions/0006-meta-restructure-and-registers.md) and [SOURCE_OF_TRUTH row 11](./SOURCE_OF_TRUTH.md).
> - Cluster-4 `Required` / `Optional` badges are derived from `effectiveRequired()` on `open`, so SHORT that relaxes c4-q1 automatically renders "Optional" with no content edit.
> - `effectiveRequired()` is consumed by the screens themselves once F5 lands.
>
> Populating SHORT now reduces to adding `hiddenScreens` and `requiredOverrides` to `VARIANTS.short` in `variants.ts`; no further plumbing is required.

---

## Proposal (c) — Session store / Answer store split

**Recommendation: two Zustand stores, both persisted to `localStorage` (F8 deferred mechanism), with disjoint responsibilities.**

### `sessionStore`
- `currentScreenId: string`
- `completedScreens: Set<string>`
- `profile: { name?, institutionType, yearsInPractice } | null`
- `consent: { acknowledged: boolean, version: string }`
- `sessionStartedAt: number`
- `interview: InterviewPrefs | null` (optional opt-in)
- **Mutations:** `setScreen`, `markComplete`, `setProfile`, `acknowledgeConsent`, `setInterview`.
- **Not in this store:** any question answer.

### `answerStore` (append-only after lock)
- `answers: Record<QuestionId, LockedAnswer>` where `LockedAnswer = { value, lockedAt: number, screenId, locale }`
- **One write per question.** Subsequent writes are no-ops with a console warning in dev.
- **Mutations:** `lockAnswer(questionId, value)`. No `unlockAnswer`, no `editAnswer`. F4 by construction.
- **Reads:** `getAnswer(id)` for the Submit summary; `isAnswered(id)` for navigation gates.

### Explore state (AST) — fully ephemeral, destroyed on close

- AST is **exploration-only**. No state is retained anywhere after the overlay closes.
- All AST state lives inside `<ast-explore>`'s shadow DOM. On overlay close, the React wrapper **removes the element from the DOM**, which destroys the shadow root, listeners, and all internal state. Re-opening the overlay creates a fresh `<ast-explore>` from scratch.
- **Drop the runs counter.** The prototype's `InstrumentScreen` increments a UI-only `runs` counter via `ast:verdict`. Per user direction (AST is explore-only), we will not carry this counter forward — no UI element, no state, no persistence. The `ExploreOverlay` still listens to `ast:close` to dismiss itself; `ast:verdict` is ignored.
- P6/F5 firewall is therefore by construction: there is literally no channel from the widget into any store.
- Verified at test time: opening the overlay, running the AST any number of times, closing — `sessionStore` and `answerStore` show zero mutation beyond the locked Q1/Q2 evaluation answers the reviewer types into the `c3-ast` form below the overlay.

### Persistence
- `localStorage` keys: `pvacf:session`, `pvacf:answers`. Hydrate on `App` mount.
- Backend write is out of scope for this build per brief §8; we'll add `POST /seal` hook at the `submit` step as a stub.
- F8 (save-and-resume across devices via email link) deferred. The brief flags this as an open question.

---

## Proposal (d) — `<ast-explore>` integration with Vite

**Recommendation: keep `ast-explore.js` verbatim as a vanilla Web Component, side-effect-imported once at app boot, wrapped by a thin `ExploreOverlay` React component.**

Concretely:

1. Copy `ast-explore.js` to `src/widgets/ast-explore/ast-explore.js` (no rewrite, no TypeScript port).
2. Side-effect-import at the **top of `main.tsx`**: `import './widgets/ast-explore/ast-explore.js';` — registers `customElements.define('ast-explore', …)` exactly once.
3. `ExploreOverlay.tsx` declares the element via TypeScript's IntrinsicElements augmentation:
   ```ts
   declare global {
     namespace JSX {
       interface IntrinsicElements {
         'ast-explore': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
       }
     }
   }
   ```
4. Mount imperatively as the prototype does: a `useRef` on a host div, create the element, append, attach `ast:verdict` and `ast:close` listeners, teardown on unmount.
5. Token plumbing: parent `.ast-explore-host` class sets `--ast-*` variables from the document tokens. Carry the existing CSS verbatim — no rewrites needed.
6. Vite-specific: add `'ast-explore'` to `vite.config.ts`'s `optimizeDeps.exclude` if HMR misbehaves; otherwise leave defaults.

The Explore agent confirmed zero blockers for Vite: no relative URLs, no top-level await, no document.write, proper teardown in `disconnectedCallback`, idempotent registration guard.

**Fallback (per brief):** if `<ast-explore>` fails to load, swap the overlay body for a recorded video of the AST in operation. Local degradation; does not cascade.

---

## Proposal (e) — Styling carry-forward (visual register preserved as-is)

**Recommendation: copy `styles.css` and `styles-phase-a.css` verbatim into `src/styles/`. Import once from `main.tsx`. No refactor. No CSS-in-JS. No utility-first rewrite.**

The two files are production-quality (no TODOs, no commented-out rules, no inline styles in components). They use:
- 38 CSS custom properties at `:root`, semantically grouped.
- `[data-cluster=…]` attribute rebinding for per-cluster accent (problem→coral, framework→cobalt, instruments→sage, close→saffron, grounding→ink-soft). The React tree must set `data-cluster` on the relevant subtree wrappers — I'll do that in `ScreenRouter`.
- Hard-pinned categorical hexes (`#B8472E`, `#712B13`, `#FAECE7`) in `.brand__mark`, `.verdict--no`, etc. — preserved as comments explicitly require.
- Implicit responsive breakpoints at `880px` inside `styles-phase-a.css` — kept (build is desktop-only anyway).

Two deliberate, brief-mandated deviations from the prototype's stylistic delivery (flagged explicitly, not unilateral):

1. **Self-host fonts.** Replace the Google Fonts CDN link with `@font-face` declarations pointing at `public/fonts/*.woff2`. **Preload Latin subsets only** — the UI is English. Greek subsets are still declared in `@font-face` with `unicode-range: U+0370-03FF, U+1F00-1FFF` so the browser fetches them on-demand only when a reviewer types Greek into an open textbox. No upfront cost for the common case (English-only response).
2. **Drop `?v=…` cache-busting query strings on CSS imports** — Vite handles cache busting.

Any further restyling — even token-naming or selector tidying — is **out of scope** without sign-off.

---

## Discrepancies between brief and prototype (prototype wins, per user brief §2)

I'll record these in `docs/SOURCE_OF_TRUTH.md` so the next agent doesn't try to "fix" them:

| # | Bundle brief says | Prototype actually has | Disposition |
|---|---|---|---|
| 1 | 5 grounding screens (`g1`…`g5`) | **2 grounding screens** (`g1`, `g2`) | Build 2. Brief is stale. |
| 2 | `c1-setup` (1 screen) | `c1-setup1` + `c1-setup2` (2 screens) | Build 2. Same for c2/c3. |
| 3 | `c2-q1`…`c2-q7` (7 questions) | **6 questions**; `c2-q5` is skipped | Build 6. (User later renumbered the IDs to a dense `c2-q1`…`c2-q6` on 2026-05-21 — diverges from the prototype's sparse IDs; see SOURCE_OF_TRUTH row 10.) |
| 4 | `c4-q1` + `c4-q2` + `interview` as 3 distinct screens | `c4-close` pairs Q4.1 + Q4.2; interview is its own screen post-spine | Build the prototype's structure. |
| 5 | "34-screen spine" | **~32 screens** by `SCREENS` array count | Final count from prototype; documented. |
| 6 | Concept cards "context-aware" first | Feature **not implemented** in prototype | Carry forward as TODO. Don't silently add. |
| 7 | Self-hosted woff2 fonts | Google Fonts CDN | User brief overrides — self-host. |

Items 1–5 are the brief being stale; the user brief explicitly says the prototype wins. Item 6 is a real feature gap noted but not built without sign-off. Item 7 is a brief-mandated correction to the prototype's delivery.

---

## Gaps the production build must fill (not "redesigns" — listed in brief §8)

| Gap | Where it lands |
|---|---|
| Answer persistence (none in prototype) | `answerStore` + localStorage |
| F1 phase gating | `routing/navigation.ts` |
| F4 answer locking (declared, not implemented) | `answerStore.lockAnswer` append-only contract |
| Required-field validation on Continue | `lib/validation.ts` |
| Hardcoded `PROGRESS_MAP` / `TIME_MAP` | `routing/progress.ts` derived from `SCREENS` |
| Tweaks panel always visible | gated behind `?tweaks=1` |
| Error boundary around `<ast-explore>` | wrapper in `ExploreOverlay` with video fallback |
| TypeScript types for CONTENT | `content/types.ts` |

None of these change the reviewer-visible experience — they're production-quality additions to a prototype that was never wired for persistence.

---

## Items deferred

The brief §9 lists eight open items. The user has now closed items 1–5 (go with the prototype's current decisions):

- ~~Cluster 2 Q2.6 split~~ — closed; build as-is.
- ~~Cluster 2 Q2.2 open-only vs. rating-with-optional-open~~ — closed; build as-is (open-only per prototype).
- ~~Cluster 3 Q3.8 (CPD applicability) scope-redirect~~ — closed; build as-is.
- ~~AST third question~~ — closed; AST is considered complete.
- ~~Explore-mode engagement capture on the AST~~ — closed; AST is exploration-only, no capture.

Carried forward as architectural placeholders (not implemented in this sprint):

1. **Data schema + data path** — separate workstream. Until settled, treat answer payloads as opaque `{questionId, value, lockedAt}` records. `POST /seal` is a stub.
2. **Save-and-resume mechanism (F8)** — currently `localStorage` per browser. Cross-device resume via email link is open.
3. **Generic-uptake ratings layer** — not pre-empted. If introduced later, slots before Cluster 2 as a lighter sub-phase.
4. **Questionnaire variants (FULL / SHORT)** — see *Variant-readiness* section below. FULL is implemented; SHORT is architecturally supported but not implemented.

---

## Verification

A change is "done" when all of these pass; I'll automate the runnable ones in CI:

1. `npm run build` succeeds with zero TypeScript errors and zero ESLint errors.
2. **Walk all screens.** A Playwright test that does the "Jump to screen" walk for every screen id and asserts each renders without errors.
3. **F1 gate.** Test: direct-link to `?s=c1-setup1` without completing profile + grounding redirects to `welcome`.
4. **F4 lock.** Test: answering `c1-q1`, advancing, then `Back` shows the answer disabled/uneditable; calling `answerStore.lockAnswer('c1-q1', …)` a second time is a no-op.
5. **F5 firewall + AST disposal.** Test: opening the AST overlay, running it 3 times, closing — `answerStore` and `sessionStore` show no `c3-ast` mutation other than the locked Q1/Q2 evaluation answers, and the `<ast-explore>` element is removed from the DOM (shadow root and all internal state destroyed). Re-opening creates a fresh instance.
6. **Variant readiness.** Test: with `VARIANTS.short` populated by a fixture (`hiddenScreens: ['c1-q3q4']`, `requiredOverrides: { 'c1-q5': { open: false } }`), `?v=short` walks the filtered spine, `effectiveRequired('c1-q5', 'open')` returns `false`, and progress denominator reflects the filtered count. Smoke-only; SHORT is not shipped.
7. **A11y smoke.** axe-core run via Playwright on a handful of representative screens: no critical violations.
8. **Visual diff** against the prototype (manual, side-by-side) — at minimum: welcome, profile, g1, c1-setup1, c1-q1, c2-q4 (per-gap grid), c3-ast (instrument + overlay), submit. Sign-off before merging.
9. **Manual:** `?tweaks=1` shows the panel; without it, the panel is gone. `?v=full` is default; `?v=short` (when populated) walks the filtered spine.

---

## What I am NOT doing in this plan

- Implementing anything. This is a plan + proposals; awaiting sign-off on (a)–(e).
- Refactoring any visual element.
- Resolving any of the eight deferred items.
- Touching `PLATFORM/design & adr/`, `PLATFORM/content and questions/`, `PLATFORM/AST Explore Tool/`.
- Backend, data path, or anything beyond a stub `POST /seal` hook.

---

## Clarifications resolved (locked)

- **State library:** Zustand. Two stores (`sessionStore`, `answerStore`), both persisted to localStorage.
- **URL sync:** Yes — `?s=<id>` with phase gate. `popstate` restores; invalid/gated ids redirect to `welcome`.
- **Test scope:** Vitest (unit/component) + Playwright (walk-all-screens E2E + F1 gate + F4 lock + F5 firewall + a11y smoke). Set up from the start.
- **Chat transcripts:** mirrored to `docs/design-history/` but inert. Not indexed in CLAUDE.md.
