# Application Design Brief

_Started 2026-05-20 18:34 UTC_

---

## User

Can you generate a brief which includes the main design aspects of this application, including the screens , the clusters , the main decisions (e.g. UI in english), Components (e.g. AST) and flows ? 
I want to be able to use it as a starter for hand-over to Claude Code in order to continue with the real implementation of this app

## Assistant

_[tool: read_file]_

_[tool: write_file]_

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

Let me read the key existing files to make this brief accurate and comprehensive.

_[tool: read_file]_

I have a strong grounding now. Let me peek at a couple more files for component-level accuracy, then write the brief.

_[tool: grep]_

_[tool: write_file]_

I'll write a focused implementation brief that distills the existing spec + prototype into a Claude Code starter — organized around the five things you asked for (screens, clusters, decisions, components, flows) plus a short stack/build section so a coding agent can pick it up.

_[tool: show_to_user]_

Wrote `handoff/IMPLEMENTATION_BRIEF.md` — a single-doc starter for Claude Code that distills the existing spec + prototype into nine sections:

1. **What we are building** — two-phase guided review env, single ~75–90 min session, desktop-only, ~15–25 invited experts.
2. **Locked top-level decisions** — UI in English (open answers may be EN or EL), desktop 1280–1440, 6-step macro-structure, rail affordances, side-drawer reference overlay, answer locking on advance, explore/response firewall, P7 maturity honesty, coral reserved for engagement signals, type stack.
3. **The 34-screen spine** — full table with id, step, kind, notes, and totals (24 required + 1 optional + 1 capture).
4. **The clusters** — Problem (8/7) · Framework (7/7) · Instruments (4 with the AST flagship operable, the other three static) · Close (2 + interview).
5. **Components** — shell (TopBar, Rail, AffordanceCard variants, ReferenceOverlay), screen templates (Welcome/Profile/Orientation/ClusterSetup/Question/Paired/Instrument/Interview/Submit/Thanks), field types, and the AST as a `<ast-explore>` Web Component wrapped by a thin React `ExploreOverlay` (with the CustomEvent contract documented).
6. **Flows** — A first entry, B question screen, C AST explore, D reference layer, E save & resume, F submission/sealing.
7. **Suggested stack** — Vite + React + TS, routing over the 34-screen array, two stores (session/spine + append-only answer store), carry `content.js` and CSS tokens, keep the AST as vanilla web component (do *not* rewrite into React).
8. **What is still open** — the nine carry-forward items (Q2.6 split, Q2.2 weight, CPD Q3.8, AST third Q, explore capture, maturity rendering, data schema, save-resume mechanism, ratings layer).
9. **Suggested first prompt for Claude Code** — ready-to-paste opener that sequences the reading order and asks the agent to propose scaffold + routing + state model + AST integration before writing code.

Two notes:

- **Tweaks panel** is flagged as design-time only — strip from production or gate behind a query param.
- The brief defers to `PV-ACF_DESIGN.md` for visual tokens and to `C9_expert_platform_ui_spec_v1.md` for the F1–F8 flow rules and the P1–P7 principles, rather than restating them.

## User

Ok how should I provide the current app from Claude Design to Claude Code ?

## User

Is Option A the same as the Share→ Handoff to Claude Code in the top Bar of Claude design ?

## User

Is Option A the same as the Share→ Handoff to Claude Code in the top Bar of Claude design ?

## Assistant

_[tool: invoke_skill]_

Good question — they overlap a lot but they're not identical. Here's the honest comparison:

## What "Share → Handoff to Claude Code" does

It builds a `design_handoff_<feature>/` folder with:

- A **freshly generated `README.md`** following a fixed template (Overview, Fidelity, Screens/Views with per-component specs, Interactions, State Management, Design Tokens, Assets, Files).
- Copies of **the design files themselves** (the HTML prototype, component sources).
- Hands you a **zip download**.

The framing is generic — "design references, not production code; recreate in your codebase's environment." It's optimised for the common case where someone made a pixel-mock and wants a dev to rebuild it.

## What Option A would be

A zip of the **handoff documents you already have** — `IMPLEMENTATION_BRIEF.md` (the one we just wrote), `PV-ACF_DESIGN.md`, `C9_expert_platform_ui_spec_v1.md`, the soft description, the four cluster drafts, the existing `HANDOFF.md`, plus `prototype.html` and the split sources.

The framing is specific to *this* project — there's already a behavioural spec, a content store, locked decisions, and a working AST web component. Those documents are richer and more load-bearing than a generic per-component README would be.

## So which to use?

Honestly, **both, and they don't conflict.** Recommended sequence:

1. Run **Share → Handoff to Claude Code** first. You get its generated `README.md` with the per-screen component-level specs (colors / spacing / type-by-component) — that's genuinely useful and would be tedious to write by hand.
2. The auto-generated package will copy the design files in. **Make sure the existing `handoff/` folder contents come along** (the brief, the design system, the UI spec, the cluster drafts) — they're the substantive content. If the auto-handoff drops them, I can manually add them back into the same zip before you download.
3. Tell Claude Code on the other end: *"Read `IMPLEMENTATION_BRIEF.md` first, then the auto-generated `README.md` for per-screen specs, then the design system + UI spec."*

The generated README is the **mechanical inventory** (what's on each screen, exact tokens). The brief + spec are the **decisions and contracts** (why it's shaped this way, what the rules are). Claude Code wants both.

Want me to (a) wait for you to run Share → Handoff to Claude Code and then top up the resulting zip with anything that got dropped, or (b) just build the manual Option A zip now as a belt-and-suspenders alternative?

