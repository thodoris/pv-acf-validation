# PV-ACF Expert Validation Platform — Implementation Brief

*A starter brief for handing the project from design prototype to real implementation. Pair this with `PV-ACF_DESIGN.md` (visual system), `C9_expert_platform_ui_spec_v1.md` (behavioural spec), the four cluster-content drafts, and the working hi-fi prototype (`prototype.html`).*

Status: design-locked, content-drafted, code-pending. Nothing below is exploratory — every decision here is settled in the prototype and the spec documents and should be carried through to the real build.

---

## 1. What we are building

A small, single-purpose web application that an invited domain expert uses **once**, in a single ~75–90 minute session, to give structured feedback on a doctoral-thesis framework (PV-ACF — Public Value, Anticipatory & Contestable Framework, for AI in public administration).

It is not a generic survey tool. It is a **guided review environment**: it first orients the reviewer to the framework, then asks them to judge it. Orientation comes first because the validity of expert judgment is bounded by the reviewer's comprehension of what they are evaluating.

Two phases sit inside one stable shell, with a non-linear reference layer reachable from every screen.

- **Phase 1 — Orientation.** Five wide-to-narrow grounding movements. Linear, completion-tracked, light.
- **Phase 2 — Questionnaire.** Four clusters of structured items. Sequential, gated, answer-locking on advance.
- **Reference layer.** Concept cards + whole-framework presentation. Overlay, summonable from any screen, never gating progression.

Target audience: ~15–25 invited experts (academics, civil-society researchers, regulator-adjacent practitioners). Remote, unsupervised, single session, desktop-only.

---

## 2. Locked top-level decisions

These are settled across the existing spec + prototype. **Do not re-litigate.**

| Decision | Value | Source |
|---|---|---|
| **UI language** | **English throughout.** Reviewers may reply in English *or* Greek in open-text fields, but every label, button, helper and screen is English. (The wider thesis website itself is Greek-primary — that is a separate surface.) | HANDOFF §Locked, UI Spec |
| **Viewport** | **Desktop-only**, 1280–1440 px. No responsive mobile/tablet build in scope. | HANDOFF §Locked |
| **Macro-structure** | Six top-bar steps: **Profile → Grounding → Problem → Framework → Instruments → Close**. The memo's "Block 1/2/3" vocabulary collapses into Framework / Instruments / Close; **Problem** is the new front cluster. | HANDOFF §Locked |
| **Master shell** | Top bar (location · 6-step indicator · % complete · time-left · two reference triggers) + right rail (per-screen contextual affordances). **No bottom bar.** | UI Spec §4 |
| **Affordance pattern** | **Rail panels** are the default (right-side contextual cards). Inline expanders + floating tools exist as Tweaks-only alternates. | HANDOFF §Locked |
| **Reference overlay** | **Side drawer** is the default. Fullscreen and floating variants exist as Tweaks-only alternates. | HANDOFF §Locked |
| **Question composition (P5)** | Question + *subtitle / scope note* sit in the reading path. **Full source material and rationale sit in the rail, never inline.** | UI Spec §2 P5 |
| **Answer locking (F4)** | Answers lock on advance. Reviewable on return, **not editable.** Prevents answer-shopping. | UI Spec §6 F4 |
| **Explore/response firewall (F5, P6)** | The operable AST may be re-run freely. **None** of that activity is captured as response data. Only the locked questionnaire answers are recorded. | UI Spec §6 F5 |
| **Maturity honesty (P7)** | Each of the four instruments carries its own maturity badge with level + body paragraph. The four are **deliberately not uniform.** Do not smooth them. | UI Spec §2 P7 |
| **Visual register** | PV-ACF foundations, quieter. **Coral** is reserved for engagement signals (progress fill, active step, primary CTA, focus ring, question-card top accent). Saffron / cobalt / sage appear only inside content (maturity badges, AST architecture pool, time-bar legend, summary pills). | HANDOFF §Locked |
| **Type** | GFS Neohellenic (display, full Greek coverage), IBM Plex Sans (body/UI), IBM Plex Mono (metadata/numerics). Self-hosted woff2; preload Greek subsets. | Design System §1.2 |
| **Reading mode** | The validation platform is **reference-mode** (denser type scale, 1080 px container, tighter rhythm) — not reader-mode. The thesis website uses reader-mode; this app does not. | Design System §2.2 |

---

## 3. The 34-screen spine

A respondent moves through exactly 34 screens, in order. Numbers below are positional (1-indexed) and match the prototype's `SCREENS` array in `app.jsx`.

| # | id | Step | Kind | Notes |
|---|---|---|---|---|
| 1 | `welcome` | — | welcome | Invitation, how-it-works, consent grid, time-by-cluster legend |
| 2 | `profile` | Profile | profile | Name (optional) · institution type · years in practice |
| 3 | `g1` | Grounding | orientation | The subject — AI in public administration, why governance is contested |
| 4 | `g2` | Grounding | orientation | The framework's foundations — three theoretical pillars, co-production stance |
| 5 | `g3` | Grounding | orientation | What PV-ACF is — preparatory diagnostic layer + five-stage recursive lifecycle |
| 6 | `g4` | Grounding | orientation | Visual concept presentation — abstract made concrete |
| 7 | `g5` | Grounding | orientation | Bridge to the instrument — how the questionnaire and rail work |
| 8 | `c1-setup` | Problem | cluster-setup | Problem-space presentation + 8-item preview |
| 9 | `c1-q1` | Problem | question | "Never seen → it is the norm" frequency scale |
| 10 | `c1-q2` | Problem | question | Frequency scale |
| 11 | `c1-q3q4` | Problem | **paired** | Q1.3 + Q1.4 on one screen as one analytical unit |
| 12 | `c1-q5` | Problem | question | Rating + open (rationale-card: cross-layer nesting) |
| 13 | `c1-q6` | Problem | question | Rating + open |
| 14 | `c1-q7` | Problem | question | Rating + open (rationale-card: recognise-and-name) |
| 15 | `c1-q8` | Problem | question | Rating + open (rationale-card: LLMs as qualitative shift) |
| 16 | `c2-setup` | Framework | cluster-setup | Framework as object of evaluation |
| 17–23 | `c2-q1` … `c2-q7` | Framework | question | 7 questions. Q2.2, Q2.3, Q2.6 are **open-only**; Q2.4 uses a **per-gap rating grid**; Q2.1/Q2.2/Q2.5/Q2.6/Q2.7 carry rationale cards |
| 24 | `c3-setup` | Instruments | cluster-setup | Spec-vs-set-up, maturity differs, four-instrument lifecycle order |
| 25 | `c3-ciw` | Instruments | instrument | Contextual Integrity Worksheet (Stage 2) — static panel + 2 Qs |
| 26 | `c3-ast` | Instruments | instrument | **Architecture Selection Tool — operable widget** + 2 Qs |
| 27 | `c3-dma` | Instruments | instrument | Discretion Migration Analysis (Stage 3) — static panel + 2 Qs |
| 28 | `c3-cpd` | Instruments | instrument | Contestation Pathway Design (Stage 3) — static panel + 2 Qs (mild rationale on CPD sub-block) |
| 29 | `c4-setup` | Close | cluster-setup | One last invitation |
| 30 | `c4-q1` | Close | question | Catch-all, **open-only, required** |
| 31 | `c4-q2` | Close | question | Meta-feedback on the exercise, **open-only, optional** |
| 32 | `interview` | Close | interview | Optional follow-up willingness + window preferences |
| 33 | `submit` | Close | submit | Cluster-by-cluster summary table + consent recap + final confirm |
| 34 | `thanks` | — | thanks | Sealed; what happens next; contact; 30-day withdrawal window |

**Totals.** 24 required validation items + 1 optional (`c4-q2`) + 1 optional capture (`interview`). 8 questions carry rationale cards in the rail. 34 screens; 5 distinct screen kinds (`welcome` / `profile` / `orientation` / `cluster-setup` / `question` / `paired` / `instrument` / `interview` / `submit` / `thanks`).

---

## 4. The clusters

Four clusters in the questionnaire, each opening with a setup screen and closing into the next.

### Cluster 1 — Problem (8 items on 7 screens)
The new front section, not in the original memo. Asks the reviewer whether the **problem space PV-ACF claims to address actually exists** in their practice. Q1.1/Q1.2 use frequency scales; Q1.3+Q1.4 share one screen as a paired analytical unit; Q1.5–Q1.8 are rating-plus-open with rationale cards on the contested positions (consultocracy framing, cross-layer nesting, recognise-and-name, LLMs as qualitative shift).

### Cluster 2 — Framework (7 items on 7 screens)
Evaluates the framework as a whole. Mix of rating-plus-open and open-only. **Q2.4 uses a per-gap rating grid** (the four structural absences × completeness rating). **Q2.2, Q2.3, Q2.6 are open-only.** Rationale cards on Q2.1/Q2.2/Q2.5/Q2.6/Q2.7 carry the deliberate thesis positions ("two-stage rationale", "recursion + default-discontinuation", "overview-level structural reading", "returning to the conditions", "stopping-condition vs. score").

### Cluster 3 — Instruments (4 instruments on 4 screens, 2 questions each)
Four-instrument lifecycle order, each with its own maturity level and a **uniform two-question template** (Q.1 required open, Q.2 optional open) on the same analytical object — the instrument itself (P4 exception: two questions per screen because the analytical unit is the instrument). Maturity is **not uniform** across the four (P7).

1. **CIW — Contextual Integrity Worksheet** (Stage 2, static panel)
2. **AST — Architecture Selection Tool** (Stage 2, **operable widget**)
3. **DMA — Discretion Migration Analysis Operational Template** (Stage 3, static panel)
4. **CPD — Contestation Pathway Design Specification Table** (Stage 3, static panel, mild rationale on the deliberate openness of the six dimensions)

### Cluster 4 — Close (2 questions + optional interview)
- Q4.1: catch-all open-required.
- Q4.2: meta-feedback on the exercise (was it tractable? did anything miss?), open-optional.
- Interview screen: opt-in for a 30–45 minute follow-up conversation, with window preferences.

---

## 5. Components — anatomy and contracts

The build groups into four layers. Items marked **[engine]** are framework-agnostic shell pieces; **[content]** items are declared per-screen by content data; **[widget]** items are bespoke interactive parts.

### 5.1 Shell [engine]

- **TopBar** — fixed at top, 64 px tall. Carries: location indicator ("Cluster 2 of 4 · Framework"), six-step indicator (Profile / Grounding / Problem / Framework / Instruments / Close — current step in coral, completed steps with a check, future steps muted), % complete (numeric + 2 px coral progress fill), time-left estimate (Plex Mono, honest, anchored to 75–90 min total, never resets), two reference triggers ("Concepts" + "Whole framework").
- **Rail** — right-side panel, sticky, 320 px wide. Receives per-screen `AffordanceCard`s. When a screen declares no rail content, the rail still occupies its column (the shell does not reflow per P2). The rail is a **declaration consumer**: it does not own per-screen logic.
- **AffordanceCard** — rail unit. Five variants, declared per screen:
  - `scope` — the P5 scope note (what bounds a good answer)
  - `source` — instrument excerpt, summary, or maturity statement
  - `rationale` — "Why the framework takes this position" (on 8 specific questions)
  - `explanation` — generic deeper-explanation card
  - `widget-trigger` — "Open the AST" button (AST screen only)
- **ReferenceOverlay** — side drawer (default). Holds concept-card index (15 cards: foundations / gaps / lifecycle / instruments) + whole-framework presentation. Modal-but-non-blocking: preserves underlying screen state on close (F3, F4). Carries the "this consultation is not captured" firewall tagline.

### 5.2 Screen templates [engine + content]

A screen is a `{id, step, kind, contentKey}` tuple. The router instantiates the right template and feeds it the content from `CONTENT.*`. Templates:

- `WelcomeScreen` — invitation + how-it-works + consent grid + time-by-cluster legend.
- `ProfileScreen` — name (optional) · institution type (select) · years in practice (select).
- `OrientationScreen` — title · italic tagline · body slot (markdown/JSX) · "Continue" / "Back".
- `ClusterSetupScreen` — cluster intro · section list · item-count preview · "Begin cluster".
- `QuestionScreen` — number badge · question stem · subtitle (scope) · field (Likert / chips / open / per-gap grid / slider) · validation slot · primary "Continue" / secondary "Back".
- `PairedQuestionScreen` — variant of `QuestionScreen` that carries two question stems sharing one rail and one Continue (Q1.3+Q1.4 only).
- `InstrumentScreen` — top panel (claim + structured representation + maturity badge) + two questions stacked + rail with source-material card. For the AST: also a "Open the AST" rail trigger that mounts the `ExploreOverlay`.
- `InterviewScreen` — opt-in toggle + window-preference grid + email field.
- `SubmitScreen` — cluster-by-cluster summary table (all 24 required items, each with truncated answer preview) + consent recap + final "Submit and seal" button.
- `ThanksScreen` — sealed-state confirmation + what-happens-next + contact + 30-day withdrawal note.

### 5.3 Field types [engine]

Used by `QuestionScreen` and declared per question in `CONTENT.questions[<id>].type`:

- `likert-5` / `likert-7` — pill row, endpoints labelled in Plex Mono.
- `chips-single` / `chips-multi` — wrapping pill cluster; multi-select shows a small check on selected.
- `frequency-5` — Cluster 1's special scale: "never seen this · seen it once or twice · seen it occasionally · seen it often · it is the norm".
- `open` — textarea with character counter top-right. **Open-only questions skip the rating row entirely.**
- `per-gap-grid` — Q2.4 only: items × completeness rating, sticky first column.
- `slider` — Plex Mono value bubble above 18 px coral thumb.

### 5.4 The AST flagship [widget]

The Architecture Selection Tool is the **one operable instrument** in the build. The other three (CIW, DMA, CPD) are rich static panels (excerpt + maturity statement + structured summary). This is a deliberate scope boundary — making four instruments operable is a different project.

Implementation in the prototype is the `<ast-explore>` **vanilla Web Component** (`ast-explore.js`), wrapped by a thin React `ExploreOverlay`. The component owns its subtree — React never reconciles its children. The wrapper:

- mounts the element imperatively on overlay open;
- bridges two CustomEvents back to React state: `ast:verdict` (bump a runs counter on the host screen) and `ast:close` (close the overlay);
- guarantees the overlay backdrop and click-outside dismiss.

The AST does:

- Lets the reviewer **run the tool** against a deployment scenario — selecting deployment characteristics and watching architecture selection resolve.
- Makes the **verdict logic visible** — *why* an architecture is eliminated or survives, not just the outcome. Operating it should teach its procedure (P1).
- Permits **free re-running** in explore mode.
- Is **firewalled** from the two evaluation questions about it (F5, P6) — explore activity is not response data.
- Renders a **fallback** if implementation slips: a recorded video of the AST in operation. Local degradation, does not cascade (UI Spec §7.3).

The AST is structured around five candidate architectures (A1 Full automation, A2 …, A5 …) with progressive elimination driven by gateway questions and a conditional generative tollgate. The existing AATP proof-of-concept is the evolution base. Three outcome types: ordered proposal / structural incompatibility / deployment revoked.

### 5.5 Tweaks panel [dev-only]

Per the design-system convention, the prototype exposes a floating `TweaksPanel` with: *Jump to screen* selector (all 34 screens), affordance-mode toggle (rail / inline / floating), reference-overlay style toggle (drawer / fullscreen / floating), question-density toggle. **The Tweaks panel is a design-time exploration aid — strip it from production or gate behind a query param.**

---

## 6. Flows

Six flows cover the user's possible paths through the system. Numbered to match the spec's `F*` rules where relevant.

### Flow A — First entry (cold visit)

1. Reviewer lands on `welcome` from an invitation email link (token in URL).
2. Reads invitation + how-it-works + consent grid; confirms consent (single primary CTA).
3. → `profile`. Fills three fields. Continue persists the profile and creates the session.
4. → `g1` … `g5` (orientation, 5 screens). Back is enabled within this stretch.
5. Continue from `g5` lands them at `c1-setup` (Phase 2 begins). Per F1, you cannot reach `c1-setup` without completing g1–g5.

### Flow B — Question screen (the dominant flow)

1. Screen mounts: TopBar updates location + progress; Rail renders declared `AffordanceCard`s; question stem + subtitle render in the reading path.
2. Reviewer engages with the field (selects a Likert pill, types an open response, or both).
3. Reviewer may **consult the rail** (scope card, rationale card) or **summon the reference overlay** (concept cards, whole framework). Neither advances or blocks. Both preserve field state on close (F3).
4. Reviewer clicks **Continue.**
   - If required fields are unanswered: validation runs, focus anchors to the first invalid field, helper text in danger colour. Continue is **not disabled** — it triggers validation. Continue is enabled by default so the failure is informative, not silent.
   - If valid: answers **lock** (F4), screen advances. Locked answers are **reviewable** on Back, **not editable.**

### Flow C — AST explore flow (one screen only — `c3-ast`)

1. Reviewer arrives at `c3-ast`. Top panel renders: claim + structured representation of the AST architecture pool + AST's maturity badge. Two questions render below.
2. Rail carries a **"Open the AST" trigger** (widget-trigger affordance).
3. Click opens `ExploreOverlay` (fullscreen). `<ast-explore>` mounts; firewall tagline pinned at top: *"This consultation is not captured as response data."*
4. Reviewer operates the AST freely — selects scenario characteristics, runs, sees verdict, re-runs as many times as they want. Each verdict fires `ast:verdict`; host screen increments a runs counter (UI only — also not captured as response data).
5. Reviewer closes overlay (Escape, ×, or click outside backdrop). Returns to `c3-ast` with question state preserved.
6. Reviewer answers the two evaluation questions and continues normally (Flow B).

### Flow D — Reference layer (orthogonal to spine)

1. From any screen (Phase 1 or Phase 2), reviewer clicks one of the two reference triggers in the TopBar: **Concepts** or **Whole framework.**
2. Drawer slides in from the right (default style). Underlying screen state is fully preserved.
3. Concepts: context-aware — surfaces cards relevant to the current screen first, then the full 15-card set is browsable. Whole framework: opens the composed-presentation surface.
4. Close: Escape, ×, or click outside. Reviewer is back exactly where they were. No state lost. No progression. No data captured (P6, F3).

### Flow E — Save & resume (F8, mechanism TBD)

1. At any time the reviewer can leave the tab. State persists per the chosen mechanism (session cookie / account / resumable email link — open question, ADR §F8).
2. On return, reviewer lands on the screen they last left. Completed sections are still complete; locked answers are intact (still reviewable, still not editable).
3. The shell's progress + time-left numbers reflect the spine, not real wall-clock — the time spent away is the reviewer's own.

### Flow F — Submission and sealing

1. Reviewer reaches `c4-q1` → `c4-q2` (optional) → `interview` (optional opt-in).
2. → `submit`. Shows cluster-by-cluster summary table: each of the 24 required items with its (locked, truncated) answer preview, plus the consent recap.
3. Reviewer reviews. Optional: click any row to expand the full answer in-place (still not editable — F4).
4. Click **"Submit and seal."** Confirmation modal. Confirm → response set posts to the backend.
5. → `thanks`. Sealed. What happens next + contact + 30-day withdrawal window. The URL no longer routes back to the questionnaire (the session token is consumed).

---

## 7. Suggested implementation stack

The prototype uses React + inline JSX via Babel-standalone, web components for the AST, and plain CSS with tokens. For the real build:

- **Framework.** React 18+ with a real bundler (Vite recommended). The prototype's component tree carries over cleanly; the inline-JSX scripts split into modules.
- **Routing.** A flat router over the 34-screen array, with each screen owning its id in the URL (`/?s=c2-q4` style or proper paths). Honour F1 (no Phase 2 without Phase 1 complete) at the router level.
- **State.** Two stores:
  - **Session/spine state** (current screen, completed screens, % complete) — local, persisted per F8 mechanism.
  - **Answer store** (per-question id → locked answer + timestamp). Append-only after lock. Never mutated.
  - Explore state for the AST stays in the component; **not persisted, not transmitted.**
- **Content store.** Carry over `content.js` as-is — `CONTENT.steps`, `CONTENT.profile`, `CONTENT.grounding`, `CONTENT.clusters`, `CONTENT.questions`, `CONTENT.instruments`, `CONTENT.interview`, `CONTENT.concepts`. Convert to TypeScript types so the screen templates can't drift from the content shape.
- **Styling.** Carry `styles.css` and `styles-phase-a.css` as the token + chrome base. Migrate to CSS Modules or a small utility layer when convenient; tokens stay as CSS custom properties.
- **AST.** Keep `ast-explore.js` as a vanilla Web Component. Do not rewrite into React — its self-contained subtree + CustomEvent interface is the cleanest seam between the operable widget and the spine.
- **Backend.** Out of scope for this brief but expected to provide: session creation from invitation token, append-only answer persistence, final-submission seal endpoint, optional save-and-resume email mechanism, and a consent-aware data export for analysis. **Data schema is a separate workstream** (deferred per UI Spec §9, HANDOFF §Open).
- **Accessibility.** Per `PV-ACF_DESIGN.md` §6 — WCAG AA contrast, 3 px focus ring at 2 px offset on every focusable, 44 × 44 hit targets, keyboard reachable everywhere, `lang="en"` page-level with `<span lang="el">…</span>` on Greek interjections, `prefers-reduced-motion` honoured.
- **Build artefacts.** Single-page app; one HTML entry point; static hosting compatible (the response payload posts to a small backend or function). The existing `prototype.html` is a single-file Babel-standalone build for review purposes — production will look quite different.

---

## 8. What is still open (carry into the first sprint)

These are flagged in HANDOFF §"What is still open" — they need a yes/no before or during the first sprint, not before kickoff:

1. **Cluster 2 Q2.6 split** — may run heavy; piloting fallback is to split the consistency half into its own screen.
2. **Cluster 2 Q2.2 open-only weight** — may run heavy early in cluster; piloting fallback is rating-with-optional-open.
3. **Cluster 3 Q3.8 (CPD applicability)** — scope panel must redirect open-response away from template-fill answers; contingency is to move the redirect into the stem itself.
4. **AST third question** — currently held to uniform two-question template for cross-instrument comparability; spec flags a possible AST-specific third question on three-verdict typology / governability ordering.
5. **Explore-mode engagement capture on the AST** — whether to capture a lightweight signal as a validity control. Currently deferred.
6. **Maturity-statement rendering** — the prototype renders maturity statements in practitioner-legible plain language; the construct spec says "directly lifted from the maturity memo." Confirm with author.
7. **Data schema and data path** — separate workstream. Until settled, treat answer payloads as opaque `{questionId, value, lockedAt}` records.
8. **Save-and-resume mechanism** — F8 open: session / account / email-link. Joint decision with ethics/data-path design.
9. **Generic-uptake ratings layer** — open question (ADR §8). If adopted, slots in before Cluster 2 (Framework Block 1) as a lighter sub-phase. Not pre-empted.

---

## 9. Suggested first prompt for Claude Code

> Pick up the PV-ACF Expert Validation Platform. The design is locked, the question content is drafted, and a hi-fi React + Web-Components prototype exists (`prototype.html`, plus the split-file sources `app.jsx`, `shell.jsx`, `screens-*.jsx`, `overlays.jsx`, `content.js`, `ast-explore.js`, `styles.css`, `styles-phase-a.css`). The job is to turn this into a production build.
>
> Read `handoff/IMPLEMENTATION_BRIEF.md` first (this file), then `handoff/PV-ACF_DESIGN.md` (visual system), then `handoff/C9_expert_platform_ui_spec_v1.md` (behavioural spec). Skim the four cluster-content drafts (`handoff/c9_questionnaire_cluster{1..4}_draft.md`) to internalise the question vocabulary. Open `handoff/prototype.html` in a browser and use the Tweaks panel's *Jump to screen* selector to walk all 34 screens.
>
> Then, before writing code, propose: (a) the project scaffold (Vite + React + TS recommended), (b) the routing model for the 34-screen spine, (c) the answer-store / session-store split, (d) how `<ast-explore>` integrates with the bundler. Wait for sign-off on each before scaffolding.

---

*Version: brief v1.0 · authored against prototype state at session close · supersedes nothing, complements HANDOFF.md.*
