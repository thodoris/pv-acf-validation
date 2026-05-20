# PV-ACF Expert Review Platform — Implementation Brief

*Status: design-locked, content-drafted, prototype implemented, production code pending. This brief hands off from Claude Design to Claude Code as the starter for the production build.*

---

## 1. What the application is

A small, single-purpose web application that an invited domain expert uses **once**, in a single ~75–90 minute session, to give structured feedback on a doctoral-thesis framework (PV-ACF, for AI in public administration). It is not a generic survey tool. It is a **guided review environment**: it first orients the reviewer to the framework, then asks them to judge it. Orientation comes first because the validity of expert judgment is bounded by the reviewer's comprehension of what they are evaluating.

Two phases sit inside one stable shell, with a non-linear reference layer reachable from every screen.

- **Phase 1 — Orientation.** Five wide-to-narrow grounding movements. Linear, completion-tracked, light.
- **Phase 2 — Questionnaire.** Four clusters of structured items. Sequential, gated, answer-locking on advance.
- **Reference layer.** Concept cards + whole-framework presentation. Overlay, summonable from any screen, never gating progression.

Target audience: ~15–25 invited experts (academics, civil-society researchers, regulator-adjacent practitioners). Remote, unsupervised, single session, desktop-only.

---

## 2. Scope and authority — read this first

Three governing principles for the implementation. These override anything else in this brief or in any referenced document if they conflict.

**The implemented prototype is the source of truth.** A working hi-fi prototype already exists (`prototype.html` plus split-file sources `app.jsx`, `shell.jsx`, `screens-*.jsx`, `overlays.jsx`, `content.js`, `ast-explore.js`, `styles.css`, `styles-phase-a.css`). Production code carries this forward. Where the prototype and any design document disagree, the prototype wins. The design documents listed in section 12 are historical references — useful for understanding intent, **not** authoritative for what to build.

**The current styling and UI are approved and preserved as-is.** The visual register — colour palette, typography, spacing, component appearance, interaction signals — is settled. Do not redesign visual elements. Do not refactor styling for taste reasons. If a technical constraint forces a visual change, flag it explicitly and wait for sign-off before applying it.

**Major changes require explicit approval.** Production implementation is a faithful carry-forward of the prototype, not a re-imagining. Major changes — to architecture, framework choice, file structure, component contracts, screen flow, styling, or anything that visibly changes the reviewer's experience — must be proposed and approved before being applied. Recommendations are welcome; unilateral changes are not. When in doubt, ask.

---

## 3. Locked top-level decisions

These are settled across the prototype and the design documents. **Do not re-litigate.**

| Decision | Value |
|---|---|
| **UI language** | English throughout. Reviewers may reply in English *or* Greek in open-text fields, but every label, button, helper, and screen is English. |
| **Viewport** | Desktop-only, 1280–1440 px. No responsive mobile/tablet build in scope. |
| **Macro-structure** | Six top-bar steps: **Profile → Grounding → Problem → Framework → Instruments → Close**. |
| **Master shell** | TopBar (location · 6-step indicator · % complete · time-left · two reference triggers) + right Rail (per-screen contextual affordances). **No bottom bar.** |
| **Affordance pattern** | Rail panels are the default (right-side contextual cards). Inline expanders and floating tools exist as Tweaks-only alternates. |
| **Reference overlay** | Side drawer is the default. Fullscreen and floating variants exist as Tweaks-only alternates. |
| **Question composition (P5)** | Question + subtitle/scope note sit in the reading path. Full source material and rationale sit in the Rail, never inline. |
| **Answer locking (F4)** | Answers lock on advance. Reviewable on return, **not editable.** Prevents answer-shopping. |
| **Explore/response firewall (F5, P6)** | The operable AST may be re-run freely. **None** of that activity is captured as response data. Only the locked questionnaire answers are recorded. |
| **Maturity honesty (P7)** | Each of the four instruments carries its own maturity badge with level + body paragraph. The four are **deliberately not uniform.** Do not smooth them. |
| **Visual register** | PV-ACF foundations, quieter. **Coral** is reserved for engagement signals (progress fill, active step, primary CTA, focus ring, question-card top accent). Saffron / cobalt / sage appear only inside content (maturity badges, AST architecture pool, time-bar legend, summary pills). |
| **Type** | GFS Neohellenic (display, full Greek coverage), IBM Plex Sans (body/UI), IBM Plex Mono (metadata/numerics). Self-hosted woff2; preload Greek subsets. |
| **Reading mode** | Reference-mode (denser type scale, 1080 px container, tighter rhythm), not reader-mode. |

---

## 4. The 34-screen spine

A respondent moves through exactly 34 screens, in order. Numbers below are positional and match the prototype's `SCREENS` array in `app.jsx`.

| # | id | Step | Kind | Notes |
|---|---|---|---|---|
| 1 | `welcome` | — | welcome | Invitation, how-it-works, consent grid, time-by-cluster legend |
| 2 | `profile` | Profile | profile | Name (optional) · institution type · years in practice |
| 3 | `g1` | Grounding | orientation | The subject — AI in public administration |
| 4 | `g2` | Grounding | orientation | The framework's foundations — three theoretical pillars |
| 5 | `g3` | Grounding | orientation | What PV-ACF is — preparatory diagnostic + five-stage lifecycle |
| 6 | `g4` | Grounding | orientation | Visual concept presentation |
| 7 | `g5` | Grounding | orientation | Bridge to the instrument — how the questionnaire and rail work |
| 8 | `c1-setup` | Problem | cluster-setup | Problem-space presentation + 8-item preview |
| 9 | `c1-q1` | Problem | question | Frequency scale |
| 10 | `c1-q2` | Problem | question | Frequency scale |
| 11 | `c1-q3q4` | Problem | paired | Q1.3 + Q1.4 on one screen as one analytical unit |
| 12 | `c1-q5` | Problem | question | Rating + open (rationale-card) |
| 13 | `c1-q6` | Problem | question | Rating + open |
| 14 | `c1-q7` | Problem | question | Rating + open (rationale-card) |
| 15 | `c1-q8` | Problem | question | Rating + open (rationale-card) |
| 16 | `c2-setup` | Framework | cluster-setup | Framework as object of evaluation |
| 17–23 | `c2-q1` … `c2-q7` | Framework | question | 7 questions. Q2.2, Q2.3, Q2.6 open-only; Q2.4 per-gap rating grid; Q2.1/Q2.2/Q2.5/Q2.6/Q2.7 carry rationale cards |
| 24 | `c3-setup` | Instruments | cluster-setup | Spec-vs-set-up, maturity differs, four-instrument lifecycle order |
| 25 | `c3-ciw` | Instruments | instrument | Contextual Integrity Worksheet (Stage 2) — static panel + 2 Qs |
| 26 | `c3-ast` | Instruments | instrument | **Architecture Selection Tool — operable widget** + 2 Qs |
| 27 | `c3-dma` | Instruments | instrument | Discretion Migration Analysis (Stage 3) — static panel + 2 Qs |
| 28 | `c3-cpd` | Instruments | instrument | Contestation Pathway Design (Stage 3) — static panel + 2 Qs |
| 29 | `c4-setup` | Close | cluster-setup | One last invitation |
| 30 | `c4-q1` | Close | question | Catch-all, open-only, required |
| 31 | `c4-q2` | Close | question | Meta-feedback on the exercise, open-only, optional |
| 32 | `interview` | Close | interview | Optional follow-up willingness + window preferences |
| 33 | `submit` | Close | submit | Cluster-by-cluster summary + consent recap + final confirm |
| 34 | `thanks` | — | thanks | Sealed; what happens next; 30-day withdrawal window |

**Totals.** 24 required validation items + 1 optional (`c4-q2`) + 1 optional capture (`interview`). 8 questions carry rationale cards in the Rail.

---

## 5. The clusters

Four clusters in the questionnaire, each opening with a setup screen and closing into the next.

**Cluster 1 — Problem (8 items on 7 screens).** Asks whether the problem space PV-ACF claims to address actually exists in the reviewer's practice. Q1.1 and Q1.2 use frequency scales; Q1.3+Q1.4 share one screen as a paired analytical unit; Q1.5–Q1.8 are rating-plus-open with rationale cards on the contested positions.

**Cluster 2 — Framework (7 items on 7 screens).** Evaluates the framework as a whole. Mix of rating-plus-open and open-only. Q2.4 uses a per-gap rating grid. Q2.2, Q2.3, Q2.6 are open-only. Rationale cards on Q2.1/Q2.2/Q2.5/Q2.6/Q2.7.

**Cluster 3 — Instruments (4 instruments on 4 screens, 2 questions each).** Four-instrument lifecycle order, each with its own maturity level and a uniform two-question template on the same analytical object — the instrument itself. Maturity is **not uniform** across the four (P7).

1. **CIW — Contextual Integrity Worksheet** (Stage 2, static panel)
2. **AST — Architecture Selection Tool** (Stage 2, **operable widget**)
3. **DMA — Discretion Migration Analysis** (Stage 3, static panel)
4. **CPD — Contestation Pathway Design** (Stage 3, static panel, mild rationale on the deliberate openness of the six dimensions)

**Cluster 4 — Close (2 questions + optional interview).** Q4.1 catch-all open-required; Q4.2 meta-feedback on the exercise, open-optional; Interview screen for optional 30–45 minute follow-up opt-in with window preferences.

---

## 6. Component library — anatomy

The build groups into four layers. Items marked **[engine]** are framework-agnostic shell pieces; **[content]** items are declared per-screen by content data; **[widget]** items are bespoke interactive parts.

### Shell [engine]

- **TopBar** — fixed at top, 64 px tall. Location indicator, six-step indicator (Profile / Grounding / Problem / Framework / Instruments / Close), % complete (numeric + 2 px coral progress fill), time-left estimate (Plex Mono, anchored to 75–90 min total, never resets), two reference triggers (Concepts + Whole framework).
- **Rail** — right-side panel, sticky, 320 px wide. Receives per-screen `AffordanceCard`s. When a screen declares no rail content, the rail still occupies its column (per P2 — the shell does not reflow).
- **AffordanceCard** — Rail unit. Five variants, declared per screen: `scope`, `source`, `rationale`, `explanation`, `widget-trigger`.
- **ReferenceOverlay** — side drawer (default). Holds concept-card index (15 cards: foundations / gaps / lifecycle / instruments) + whole-framework presentation. Modal-but-non-blocking: preserves underlying screen state on close (F3, F4). Carries the firewall tagline.

### Screen templates [engine + content]

A screen is a `{id, step, kind, contentKey}` tuple. The router instantiates the right template and feeds it content. Templates: `WelcomeScreen`, `ProfileScreen`, `OrientationScreen`, `ClusterSetupScreen`, `QuestionScreen`, `PairedQuestionScreen`, `InstrumentScreen`, `InterviewScreen`, `SubmitScreen`, `ThanksScreen`.

### Field types [engine]

Used by `QuestionScreen` and declared per question in `CONTENT.questions[<id>].type`:

- `likert-5` / `likert-7` — pill row, endpoints labelled in Plex Mono.
- `chips-single` / `chips-multi` — wrapping pill cluster.
- `frequency-5` — Cluster 1's special scale: *never seen this · seen it once or twice · seen it occasionally · seen it often · it is the norm*.
- `open` — textarea with character counter top-right. Open-only questions skip the rating row entirely.
- `per-gap-grid` — Q2.4 only: items × completeness rating, sticky first column.
- `slider` — Plex Mono value bubble above an 18 px coral thumb.

### The AST flagship [widget]

The Architecture Selection Tool is the **one operable instrument** in the build. The other three (CIW, DMA, CPD) are rich static panels. Making four instruments operable is a different project — out of scope here.

Implementation in the prototype is the `<ast-explore>` **vanilla Web Component** (`ast-explore.js`), wrapped by a thin React `ExploreOverlay`. The component owns its subtree — React never reconciles its children. The wrapper mounts the element imperatively on overlay open, bridges two CustomEvents to React state (`ast:verdict` bumps a runs counter on the host screen; `ast:close` closes the overlay), and guarantees the overlay backdrop and click-outside dismiss.

The AST is structured around five candidate architectures (A1 Full automation, A2 …, A5 …) with progressive elimination driven by gateway questions and a conditional generative tollgate. Three outcome types: ordered proposal / structural incompatibility / deployment revoked. Operating it should teach its procedure (P1).

**Fallback if implementation slips:** a recorded video of the AST in operation. Local degradation; does not cascade.

### Tweaks panel [dev-only]

The prototype exposes a floating `TweaksPanel`: *Jump to screen* selector (all 34 screens), affordance-mode toggle, reference-overlay style toggle, question-density toggle. **Strip from production or gate behind a query param.**

---

## 7. Flows

Six flows cover the user's possible paths through the system.

**Flow A — First entry (cold visit).** Reviewer lands on `welcome` from an invitation email link (token in URL). Reads invitation + how-it-works + consent grid; confirms consent. → `profile`. Fills three fields. Continue persists the profile and creates the session. → `g1` … `g5` (orientation, 5 screens). Continue from `g5` lands at `c1-setup` (Phase 2 begins). Per F1, Phase 2 is not reachable without Phase 1 complete.

**Flow B — Question screen (the dominant flow).** Screen mounts: TopBar updates location and progress; Rail renders declared `AffordanceCard`s; question stem and subtitle render in the reading path. Reviewer engages with the field. May consult the Rail or summon the reference overlay — neither advances or blocks; both preserve field state on close (F3). On Continue: if required fields are unanswered, validation runs, focus anchors to the first invalid field. Continue is not disabled — it triggers validation. If valid, answers lock (F4), screen advances. Locked answers are reviewable on Back, **not editable.**

**Flow C — AST explore flow (one screen only — `c3-ast`).** Top panel renders the claim + structured representation + maturity badge. Two questions render below. Rail carries a *Open the AST* trigger. Click opens `ExploreOverlay` (fullscreen). `<ast-explore>` mounts; firewall tagline pinned at top. Reviewer runs the AST freely — selects scenario characteristics, runs, sees verdict, re-runs as wanted. Each verdict fires `ast:verdict`; host screen increments a runs counter (UI only — not captured as response data). Close (Escape, ×, or outside click) returns to `c3-ast` with question state preserved.

**Flow D — Reference layer (orthogonal to spine).** From any screen, reviewer clicks one of the two reference triggers in the TopBar: Concepts or Whole framework. Drawer slides in from the right. Underlying screen state preserved. Concepts is context-aware — surfaces cards relevant to the current screen first, then the full 15-card set is browsable. Close returns the reviewer exactly where they were. No state lost. No progression. No data captured (P6, F3).

**Flow E — Save and resume (F8, mechanism TBD).** Reviewer leaves the tab. State persists per the chosen mechanism (open question — see section 9). On return, reviewer lands on the screen they last left. Completed sections still complete; locked answers intact. Progress and time-left numbers reflect spine, not wall-clock.

**Flow F — Submission and sealing.** Reviewer reaches `c4-q1` → `c4-q2` (optional) → `interview` (optional opt-in) → `submit`. Shows cluster-by-cluster summary: each of the 24 required items with locked, truncated answer preview, plus consent recap. Reviewer can optionally expand any row to see the full answer (still not editable — F4). Click *Submit and seal*. Confirmation modal. Confirm → response set posts to backend. → `thanks`. Sealed. URL no longer routes back to the questionnaire — session token consumed.

---

## 8. Suggested implementation stack

The prototype uses React + inline JSX via Babel-standalone, web components for the AST, and plain CSS with tokens. For the production build, the following are recommendations — adopt them or propose alternatives, but flag changes before applying.

- **Framework.** React 18+ with a real bundler (Vite recommended). The prototype's component tree carries over; the inline-JSX scripts split into modules.
- **Routing.** A flat router over the 34-screen array, with each screen owning its id in the URL. Honour F1 (no Phase 2 without Phase 1 complete) at the router level.
- **State.** Two stores:
  - **Session/spine state** (current screen, completed screens, % complete) — local, persisted per F8 mechanism.
  - **Answer store** (per-question id → locked answer + timestamp). Append-only after lock. Never mutated.
  - Explore state for the AST stays in the component; **not persisted, not transmitted.**
- **Content store.** Carry over `content.js` as-is — `CONTENT.steps`, `CONTENT.profile`, `CONTENT.grounding`, `CONTENT.clusters`, `CONTENT.questions`, `CONTENT.instruments`, `CONTENT.interview`, `CONTENT.concepts`. Convert to TypeScript types so screen templates can't drift from the content shape.
- **Styling.** Carry `styles.css` and `styles-phase-a.css` as the token + chrome base. **The visual register is approved as-is** (section 2). Migrate to CSS Modules or a small utility layer only if a clear technical benefit justifies it, and only after sign-off. Tokens stay as CSS custom properties.
- **AST.** Keep `ast-explore.js` as a vanilla Web Component. Do not rewrite into React — its self-contained subtree + CustomEvent interface is the cleanest seam between the operable widget and the spine.
- **Backend.** Out of scope for this brief but expected to provide: session creation from invitation token, append-only answer persistence, final-submission seal endpoint, optional save-and-resume email mechanism, and a consent-aware data export for analysis.
- **Accessibility.** WCAG AA contrast, 3 px focus ring at 2 px offset on every focusable, 44 × 44 hit targets, keyboard reachable everywhere, `lang="en"` page-level with `<span lang="el">…</span>` on Greek interjections, `prefers-reduced-motion` honoured.
- **Build artefacts.** Single-page app; one HTML entry point; static hosting compatible. The existing `prototype.html` is a single-file Babel-standalone build for review purposes — production will look quite different.

---

## 9. What is still open

These need yes/no decisions before or during the first sprint, not before kickoff:

1. **Cluster 2 Q2.6 split** — may run heavy; piloting fallback is to split the consistency half into its own screen.
2. **Cluster 2 Q2.2 open-only weight** — may run heavy early in cluster; piloting fallback is rating-with-optional-open.
3. **Cluster 3 Q3.8 (CPD applicability)** — scope panel must redirect open-response away from template-fill answers; contingency is to move the redirect into the stem.
4. **AST third question** — currently held to uniform two-question template for cross-instrument comparability; possible AST-specific third question on three-verdict typology / governability ordering.
5. **Explore-mode engagement capture on the AST** — whether to capture a lightweight signal as a validity control. Currently deferred.
6. **Data schema and data path** — separate workstream. Until settled, treat answer payloads as opaque `{questionId, value, lockedAt}` records.
7. **Save-and-resume mechanism** — F8 open: session / account / email-link. Joint decision with ethics/data-path design.
8. **Generic-uptake ratings layer** — open question. If adopted, slots in before Cluster 2 as a lighter sub-phase. Not pre-empted.

---

## 10. Where the design lives — the prototype is authoritative

The implemented prototype is the source of truth for what to build. The design documents below exist as historical references — they document design-time thinking and may be out of date relative to the prototype. **They are not authority to refactor anything.** Where the prototype and a design document disagree, the prototype wins.

References, in approximate order of usefulness for understanding intent:

- `prototype.html` and its split-file sources (`app.jsx`, `shell.jsx`, `screens-*.jsx`, `overlays.jsx`, `content.js`, `ast-explore.js`, `styles.css`, `styles-phase-a.css`) — **authoritative for behaviour, layout, content, and styling.**
- `PV-ACF_DESIGN.md` — visual system reference; useful for tokens and accessibility intent. **May be out of date** on specifics; defer to the prototype.
- `C9_expert_platform_ui_spec_v1.md` — behavioural spec; useful for understanding why F-rules and P-rules exist. **May be out of date.** Do not use as a source of changes against the prototype.
- `C9_expert_platform_adr.md` — platform architecture decisions and rationale. Useful background. **May be out of date.**
- `C9_expert_platform_soft_description.md` — narrative overview. Useful framing. **May be out of date.**
- Cluster content drafts — useful for question vocabulary and design reasoning in their "Note." paragraphs. **The prototype's `content.js` is the rendered authority.**

If Claude Code reads one of these documents and finds something different from the prototype, it should **not** silently align the prototype to the document. Surface the discrepancy and wait for sign-off on which side to follow.

---

## 11. Suggested first prompt for Claude Code

> Pick up the PV-ACF Expert Review Platform. The design is locked, the question content is drafted, and a hi-fi React + Web-Components prototype already exists. The job is to turn this into a production build.
>
> **Read `IMPLEMENTATION_BRIEF.md` first (this file).** It defines what is settled, what is open, and the rules governing changes. The implemented prototype (`prototype.html` plus split sources) is the source of truth; the design documents are historical references and may be out of date.
>
> Before writing code, walk all 34 screens via the prototype's Tweaks panel *Jump to screen* selector, then propose: (a) the project scaffold (Vite + React + TS recommended), (b) the routing model for the 34-screen spine, (c) the answer-store / session-store split, (d) how `<ast-explore>` integrates with the bundler, (e) the styling carry-forward approach (preserving the current visual register exactly).
>
> **Wait for sign-off on each before scaffolding.** Do not make architectural decisions, restyle anything, or refactor based on the design documents without explicit approval. The current styling and UI are approved as-is. Recommendations are welcome; unilateral changes are not.

---

*Brief version: 2.0 · authored against prototype state at session close · supersedes prior briefs.*
