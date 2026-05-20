# PV-ACF Expert Validation Platform — Design Handoff

*A briefing for the next conversation where the platform will be refined further or its remaining open questions resolved. The platform's structure is locked; the question content is drafted for all four clusters. Read this once before continuing the work.*

---

## What this package is

This folder accompanies a working hi-fi clickable prototype of the PV-ACF Expert Validation Platform. The prototype's purpose is to make the platform's **structure** and its **question content** legible together — you can move through the entire instrument as a respondent would, with real (drafted) question stems, subtitles, rating scales, open prompts, rail affordances, and rationale cards.

If you are picking this up cold, read in this order:

1. The four spec uploads (`C9_expert_platform_ui_spec_v1.md` and the four cluster-content files).
2. This handoff document.
3. The bundled prototype (`prototype.html`) — open in a browser; the Tweaks panel at bottom-right has a *Jump to screen* selector that lets you skip through all 34 screens.
4. The contact sheet (`screens-print.html`) for a single-document overview.

---

## Locked design decisions

These are settled. Do not re-litigate them.

| Decision | Value |
|---|---|
| Macro-structure | Cluster spine: **Profile → Grounding → Problem → Framework → Instruments → Close**. Six top-bar steps. No "blocks" — the memo's Block 1/2/3 vocabulary maps onto the framework/instruments/close clusters; the problem cluster is the new front section. |
| Master shell | Top bar (fixed location · 6-step indicator · % complete · time-left · two reference triggers) + right rail (contextual affordances per screen). No bottom bar. |
| Affordance mode | Rail panels (default); inline-expanders + floating-tools available as Tweaks for comparison |
| Reference overlay style | Side drawer (default); fullscreen + floating available as Tweaks |
| Question composition (P5) | Separated — *subtitle* (scope note) is in the reading path under each question; full source material and rationale are in the rail, not in the reading path |
| UI language | English throughout. Reviewers may reply in English or Greek in open-text fields. |
| Visual register | PV-ACF foundations, quieter. Coral reserved for engagement signals (progress, active step, primary CTA, focus ring, q-card top accent). Saffron / cobalt / sage appear only inside content (maturity badges, architecture pool, time-bar legend, summary pills). |
| Viewport | Desktop-only, 1280–1440px |

---

## The 34-screen spine

| # | id | Step | Kind | Notes |
|---|---|---|---|---|
| 1 | welcome | — | welcome | Invitation, how-it-works, consent grid, time-by-cluster legend |
| 2 | profile | Profile | profile | Name (optional) · institution type · years in practice |
| 3–7 | g1 – g5 | Grounding | orientation | Subject · Foundations · What PV-ACF is · Visual presentation · Bridge |
| 8 | c1-setup | Problem | cluster-setup | Problem-space presentation + 8-item preview |
| 9–15 | c1-q1, c1-q2, **c1-q3q4**, c1-q5, c1-q6, c1-q7, c1-q8 | Problem | question / paired | Cluster 1 — 8 questions on 7 screens (Q1.3+Q1.4 are paired on one screen) |
| 16 | c2-setup | Framework | cluster-setup | Framework as object of evaluation |
| 17–23 | c2-q1 … c2-q7 | Framework | question | Cluster 2 — 7 questions (Q2.2, Q2.3, Q2.6 are open-only; Q2.4 uses a per-gap rating grid) |
| 24 | c3-setup | Instruments | cluster-setup | Spec-vs-set-up, maturity differs, four-instrument order |
| 25–28 | c3-ciw, c3-ast, c3-dma, c3-cpd | Instruments | instrument | Each: top panel (claim + structured representation + P7 maturity) + 2 questions (Q.1 required open, Q.2 optional open) |
| 29 | c4-setup | Close | cluster-setup | One last invitation |
| 30 | c4-q1 | Close | question | Catch-all, open-only, required |
| 31 | c4-q2 | Close | question | Meta-feedback on the exercise, open-only, optional |
| 32 | interview | Close | interview | Optional follow-up willingness + window preferences |
| 33 | submit | Close | submit | Cluster-by-cluster summary table + consent recap + final confirm |
| 34 | thanks | — | thanks | Sealed; what happens next; contact; 30-day withdrawal |

**Total: 24 required validation items + 1 optional (c4-q2) + 1 optional capture (interview).**

---

## The eight design principles (P1–P8)

Stated in the UI spec; implemented throughout the prototype:

- **P1** — Comprehension precedes judgment.
- **P2** — Stable shell, contextual affordances.
- **P3** — Structured spine, non-linear reference.
- **P4** — One screen, one analytical unit (Q1.3+Q1.4 share a screen as a single analytical unit; instrument screens carry two questions on one analytical object — the instrument itself).
- **P5** — Decompose the long question. The four elements: question · subtitle (scope note, in the reading path) · open-response field with its own label and prompt · source material (in the rail).
- **P6** — Firewall exploration from response. The reference overlay and the AST Explore overlay both carry a "this activity is not captured" note; explicitly not recorded.
- **P7** — Engineered honesty about maturity. Each Cluster 3 instrument screen carries its own maturity badge with the level and a body paragraph; the four are deliberately not uniform.
- **P8** — Present-and-ask are one motion, on the claim spine. The platform-wide grounding does the *wide* pass; each cluster's introductory setup does the *narrow* pass for the questions that follow. Rationale for deliberate thesis choices is carried in detailed-explanation cards in the rail, not in the reading path.

---

## What is rationale-dependent

Eight questions carry rationale cards in the rail under the title "Why the framework takes this position":

- **Cluster 1**: Q1.3 (critical-political-economy / consultocracy) · Q1.5 (cross-layer nesting) · Q1.7 (recognise-and-name as contribution) · Q1.8 (LLMs as qualitative shift, mild)
- **Cluster 2**: Q2.1 (two-stage rationale, mild) · Q2.2 (recursion + default-discontinuation) · Q2.5 (overview-level structural reading, mild) · Q2.6 (returning to the conditions) · Q2.7 (stopping-condition vs. score)
- **Cluster 3**: only CPD carries a mild rationale element on its sub-block (the deliberate openness of the six dimensions)
- **Cluster 4**: none

All rationale-card content is in `content.js` as the `rationaleBody` field on each question.

---

## Content store

In `content.js`, structured as:

- `CONTENT.steps` — the 6 top-bar steps
- `CONTENT.profile` — profile-screen field definitions
- `CONTENT.grounding` — 5 grounding-movement titles + taglines (the bodies are still in `screens-orientation.jsx`)
- `CONTENT.clusters` — per-cluster setup content (intro, sections, footer)
- `CONTENT.questions` — keyed registry of every question screen (stem, subtitle, type, rating, open, rationaleBody, sourceNote, scopeNote)
- `CONTENT.instruments` — Cluster 3 data (4 instruments × 2 questions + top-panel content + maturity)
- `CONTENT.interview` — post-spine interview-willingness fields
- `CONTENT.concepts` — reference-overlay concept cards (15 cards: foundations, gaps, lifecycle, instruments)

---

## File layout

```
project root/
├── index.html                            ← the prototype entry point
├── styles.css                            ← foundation tokens + layout chrome
├── styles-phase-a.css                    ← cluster + question + instrument screens
├── content.js                            ← all question content, cluster setups, concept cards
├── shell.jsx                             ← TopBar + Rail + AffordanceCard + Icon set
├── screens.jsx                           ← Welcome screen
├── screens-orientation.jsx               ← 5 grounding movements
├── screens-templates.jsx                 ← ProfileScreen, ClusterSetupScreen, QuestionScreen, PairedQuestionScreen, InstrumentScreen, InterviewScreen, ExploreOverlay (AST)
├── screens-submit.jsx                    ← Submit + Thanks
├── overlays.jsx                          ← Reference overlay (concept cards + whole-framework diagram)
├── app.jsx                               ← SCREENS array, ScreenRouter, NavBar, Tweaks panel, progress maps
├── tweaks-panel.jsx                      ← Reusable tweaks panel component

handoff/
├── HANDOFF.md                            ← this file
├── prototype.html                        ← single-file standalone build
├── screens-print.html                    ← contact sheet of all 34 screens
├── C9_expert_platform_soft_description.md
├── C9_expert_platform_ui_spec_v1.md
├── PV-ACF_DESIGN.md
```

The cluster-content files in `uploads/` are not copied into `handoff/` — they are draft work products, kept in `uploads/`.

---

## What is still open

From the cluster files and ADR §9:

- **Cluster 1 Q1.1 / Q1.2 frequency scales** — wording is finalised as *never seen this · seen it once or twice · seen it occasionally · seen it often · it is the norm* (confirmed). Non-verdict-option consistency sweep flagged but not blocking.
- **Cluster 2 Q2.6 split** — flagged as possibly running heavy (asks two things: does the move earn its place, is it consistent). Piloting fallback is to spin the consistency half into its own screen. Not pre-empted.
- **Cluster 2 Q2.2 open-only** — flagged as possibly running heavy this early in the cluster. Piloting fallback is rating-with-optional-open. Not pre-empted.
- **Cluster 3 Q3.8 (CPD applicability)** — scope panel must redirect open-response away from template-fill answer. Named contingency: move the redirect into the stem itself. Not pre-empted.
- **AST third question** — the cluster file flags whether the AST warrants a third, AST-specific question (on the three-verdict typology or governability ordering). Currently held to the uniform two-question template for cross-instrument comparability.
- **Explore-mode capture on the AST** — whether to capture a lightweight engagement-fact signal as a validity control. Deferred.
- **Maturity-statement rendering** — the cluster file flags that maturity statements are "directly lifted" from the maturity memo per the construct spec, but the prototype renders them in practitioner-legible plain language. Genuine deviation; should be confirmed with the author.
- **Data schema and the data path** — separate workstream; not in the prototype.
- **Save-and-resume mechanism** — separate workstream; flagged in UI spec F8.

---

## Suggested first prompt for a new chat

> Pick up the PV-ACF expert-validation prototype. The platform's structure is locked (cluster spine: profile → grounding → 4 clusters → close → submit) and Cluster 1–4 question content is drafted in the prototype. Read `index.html`, `content.js`, `app.jsx`, and the four spec uploads (`C9_expert_platform_ui_spec_v1.md` + `c9_questionnaire_cluster{1..4}_draft.md`) plus the `HANDOFF.md` in this folder. Then ask me what to refine next.
