# UI Approach and Platform Architecture — C-9 Expert Validation Platform

*Drafted: Session 094 (2026-05-14)*
*Status: Working specification — platform structure, design principles, and flow rules. Base document for later system design.*
*Tracker item: C-9-expert*
*Companion documents: C9_expert_platform_adr.md (the delivery-architecture decision this specification implements); memo_C9_expert_component_v1.md (authoritative for constructs, instruments, block structure, sample targets); memo_C9_validation_approach_v2.md (retrospective component, separate workstream)*
*Out of scope for this document: verbatim question content (separate drafting work); the response data schema (separate design work); hosting and deployment (implementation decision); visual design tokens, palette, and typography (implementation decision, constrained by the principles below)*

---

## 1. Purpose and Status of This Document

This specification defines *what the platform is and how it behaves* — its structure, its governing principles, and its flow rules. It is the base an implementer works from. It deliberately does not fix question wording, the data schema, or visual styling; those are separate work products that slot into the structure defined here.

The document is engineer-ready by intent. Where a behaviour is non-negotiable it is stated as a rule; where a choice is left to implementation it is marked **[implementer's discretion]**. The distinction matters because the build runs with no conventional fallback (see the ADR): the implementer must be able to proceed without round-tripping for clarification on load-bearing behaviour, and must equally know where they have latitude.

---

## 2. Design Principles

Seven principles govern every downstream decision. Where a later flow rule or structural choice needs justification, it traces to one of these.

**P1 — Comprehension precedes judgment.** The platform's reason for existing is that the validity of an expert judgment is bounded by the respondent's comprehension of the framework before they answer. Every structural choice serves the comprehension precondition. A feature that does not improve comprehension or does not improve response quality is out of scope.

**P2 — Stable shell, contextual affordances.** The master layout's *structure* never reconfigures. The location indicator, progress model, time estimate, and standard triggers occupy fixed positions on every screen. What varies per screen is which *contextual affordances* are active — a detailed-explanation card here, an instrument video there, an operable widget on another screen. The respondent learns the frame once; the frame then offers different things without ever rearranging itself. Adaptivity means *what is offered*, never *where things are*.

**P3 — Structured spine, non-linear reference.** The questionnaire progression is sequential and must be completed in order. The *reference layer* sitting over it is non-linear and summonable at any point. These are different systems with different rules. Navigation freedom belongs to reference; analytical sequence belongs to the spine.

**P4 — One screen, one analytical unit.** A respondent should never scroll through prose to find the question. Each screen presents one coherent analytical unit — a construct, or an instrument — with its questions short and fully visible. Context, scope, and source material move into panels and overlays, available but not in the reading path.

**P5 — Decompose the long question.** A questionnaire item is three separable things: the *question* (short, sharp, always visible), the *scope note* (what bounds a good answer — the construct's meaning, the Pass-1 level, the domain-level qualifier), and the *source material* (instrument excerpt, maturity statement, the operable widget). Only the question sits in the reading path. This is instrument hygiene, not cosmetics: collapsing the three into prose forces each respondent to separate them differently, which degrades comparability of responses against a construct.

**P6 — Firewall exploration from response.** The respondent may freely operate the flagship instrument and freely consult the reference layer. None of that free engagement is captured as response data. Only the deliberate, locked questionnaire answers are captured. Exploration informs judgment; it does not become judgment. This keeps interface experience and exploration order out of the response record.

**P7 — Engineered honesty about maturity.** The four Block 2 instruments do not sit at uniform Pass-1 maturity (memo_C9_expert_component_v1.md §3.2). Each instrument sub-block opens with a brief, honest statement of that instrument's maturity, lifted from memo_C8_instrument_maturity_vFinal.md, so the respondent evaluates each instrument against its own claim rather than an implicit uniform standard. The platform surfaces this; it does not smooth it over.

---

## 3. Macro-Structure

The platform has three parts. Two are *phases* the respondent moves through; the third is a *layer* available throughout.

### 3.1 Phase 1 — Orientation

A linear, wide-to-narrow sequence that converts a recruited expert into a competent respondent before any question is asked. It is completion-tracked but light — the respondent moves through it once, at the start. Its content is drawn from the same content store as the reference layer (Section 5), so what the respondent learns here is exactly what they can later recall.

Orientation moves through five movements, wide to narrow:

1. **The subject.** AI in public administration and why its governance is contested — the "why are we here" frame.
2. **The framework's foundation.** The three theoretical pillars, the co-production stance, what "critical-deliberative" means — why PV-ACF exists and what gap it answers.
3. **What the framework is.** The two-layer architecture (preparatory diagnostic layer plus five-stage recursive lifecycle), the four structural absences, the upward-visibility commitment — the structural overview.
4. **Visual concept presentation.** The main concepts presented visually — the abstract made concrete before any question is asked.
5. **Bridge to the instrument.** What the questionnaire will ask the respondent to do, how the reference layer and the operable instrument work, the realistic time estimate. Orientation to the instrument itself.

Orientation is not a preamble to be skipped. Per P1, it is the component doing the comprehension grounding that the entire validation rests on. It is specified as carefully as the questions.

### 3.2 Phase 2 — Questionnaire

The structured instrument. Its progression is sequential and must be completed (P3). It carries the three blocks from memo_C9_expert_component_v1.md §3.3:

- **Block 1 — Framework-level constructs.** Open-response items probing C1' (architectural soundness), C2' (four-absence enumeration completeness), C3' (instrument-to-absence mapping), C7' (upward-visibility prominence) against the framework as a whole. The Generative LLM Gate is probed here at framework level. C5' (self-limitation discipline) is *not* in the questionnaire — it is reserved for interview per the memo.
- **Block 2 — Instrument-level evaluation.** Four instruments in lifecycle order: Contextual Integrity Worksheet (Stage 2), Architecture Selection Tool (Stage 2), Discretion Migration Analysis Operational Template (Stage 3), Contestation Pathway Design Specification Table (Stage 3). The AST sub-block carries the flagship operable instrument (Section 7); the other three are rich static panels.
- **Block 3 — Open feedback.** One or two catch-all open items.

*Note on a possible additional ratings layer.* Whether Block 1 is preceded or accompanied by a layer of generic-uptake rating items remains an open design question (ADR §8). If it is adopted, it slots in as a distinct, lighter sub-phase before Block 1's open-response items; the structure here accommodates it without rework. It is not specified further until the author resolves it.

### 3.3 The Reference Layer

A non-linear system of overlays, summonable from the master shell at any point in Phase 1 or Phase 2. It holds two things:

- **Terminology / concept cards** — short recall units for the framework's concepts.
- **The whole-framework presentation** — the framework presented as a single consultable piece (presentation or video form — **[implementer's discretion]** on medium, constrained by P1).

The reference layer's content is the *same content store* as Phase 1 orientation (Section 5). Orientation walks through it linearly; the reference layer jumps into it on demand. Built once, surfaced twice.

---

## 4. The Master Shell

The persistent frame present on every screen of both phases. Per P2, its structure is fixed; only its contextual affordances vary.

### 4.1 Fixed elements (every screen, same position, always)

- **Location indicator.** Where the respondent is — which phase, which block, which screen within it.
- **Step-completion indicator.** Which sections and instruments are done, which remain.
- **Percent-complete.** A single completion figure for the whole instrument.
- **Estimated time remaining.** A live estimate, decreasing as the respondent progresses. **[implementer's discretion]** on the estimation model, constrained by: it must be honest (anchored to the memo's 75–90 minute total) and must not reset or jump disconcertingly.
- **Reference-layer triggers.** Two standard triggers, always present, always in the same place: one summons terminology / concept cards, one summons the whole-framework presentation.

### 4.2 Contextual affordances (declared per screen, variable)

Each screen declares which contextual affordances it activates. The shell renders the declared set; an undeclared affordance is simply absent on that screen (its slot empty, not relabelled). The affordance vocabulary:

- **Detailed-explanation card** — a deeper explanation specific to this screen's question or construct.
- **Instrument video** — a short video specific to this screen's instrument.
- **Operable widget** — the flagship operable instrument (AST screen only, in the current scope).
- **Scope panel** — the P5 scope note for the question(s) on this screen.
- **Source-material panel** — instrument excerpt, summary, or maturity statement.

This declaration model is the contract between content and engine. The engine reads a screen's affordance declaration and renders accordingly; it does not carry per-screen special cases. Adding or removing an affordance on a screen is a content-layer change, not an engine change.

### 4.3 Overlay behaviour

Reference-layer content and contextual cards open as **overlays over the current screen**, not as navigation away from it. Rules:

- The overlay is modal and dismissable. Underneath it, the current screen's state is fully preserved — any partial answer, any widget state.
- Closing the overlay returns the respondent exactly where they were.
- The terminology trigger is **context-aware**: it surfaces the cards relevant to the current screen first, with the rest of the card set browsable from there. It is not a generic glossary dump on every invocation.
- Overlays do not capture response data (P6). Consulting the reference layer is not answering.

---

## 5. The Content Store

A single underlying content layer feeds both Phase 1 orientation and the reference layer (Section 3.3). It is specified here because the build-once-surface-twice principle depends on it being one store, not two parallel sets.

The store holds the framework's concepts as modular units — each concept a unit with a short recall form (the terminology card) and a place in the orientation sequence. The whole-framework presentation is a single composed piece drawn from the same units.

Consequence for the build: concept content is authored once, as units. Phase 1 sequences the units into the wide-to-narrow walk; the reference layer indexes them for on-demand recall; the contextual detailed-explanation cards are deeper-tier units against the same scheme. No concept content is authored twice. This guarantees consistency between what the respondent learned in orientation and what they can re-consult mid-questionnaire.

---

## 6. Flow Rules

The rules governing movement through the platform. These are the behaviours the implementer must get exactly right; they are stated as rules, not suggestions.

**F1 — Orientation precedes questionnaire.** A respondent cannot enter Phase 2 without completing Phase 1. Comprehension grounding is a precondition, not an option (P1).

**F2 — The questionnaire spine is sequential and gated.** Within Phase 2, the respondent moves through blocks and screens in order. A screen with unanswered required items does not release forward progress. This is the P3 structured spine.

**F3 — The reference layer is always available and never gates.** From any screen of Phase 1 or Phase 2, the two reference triggers are live. Consulting reference content never advances or blocks the spine; it is orthogonal to progression (P3).

**F4 — Answers lock on advance.** When a respondent completes a screen's items and advances, those answers lock. This follows the proof-of-concept's anti-"answer-shopping" behaviour and keeps the response record stable. **[implementer's discretion]** on whether a locked answer is reviewable-but-not-editable or fully sealed; the default recommendation is reviewable, not editable.

**F5 — The operable instrument runs in explore mode, separate from its evaluation questions.** On the AST screen, the respondent may freely operate the AST widget — running it, re-running it, trying different inputs — as many times as they wish. This free operation is *explore mode*. The *evaluation questions* about the AST are the normal locked, sequential questionnaire items on the same screen (or immediately following). Explore-mode activity is not captured as response data (P6); only the evaluation-question answers are. This firewall is non-negotiable: it is what keeps "is the AST analytically sound" separate from "did I enjoy the widget," and it is what keeps exploration order out of the response record.

**F6 — Completion requires a full response set.** The questionnaire must be filled. At the end of Phase 2, submission requires all required items answered. **[implementer's discretion]** on handling of any explicitly-optional items (e.g., a second Block 3 catch-all), but the four constructs and four instrument sub-blocks are required.

**F7 — Progress and time reflect the spine only.** The percent-complete and time-remaining indicators track Phase 1 plus the Phase 2 spine. Time spent in the reference layer or in explore mode is the respondent's own and is not penalised or counted against them in the visible model. (Whether reference-layer dwell time is *recorded* at all, separately and silently, is a data-schema question, not a flow rule — deferred to schema design, and if recorded must be consistent with the consent terms.)

**F8 — State survives interruption.** A respondent who leaves and returns resumes where they were, with completed sections still complete and locked answers intact. **[implementer's discretion]** on the mechanism (session, account, resumable link), constrained by the data-path and consent terms — this is a point of contact with the ethics design and must be settled with it.

---

## 7. The Flagship Operable Instrument

The Architecture Selection Tool is the one Block 2 instrument presented as genuinely operable. The other three are rich static panels (excerpt + maturity statement + structured summary).

### 7.1 Evolution base

An existing single-page proof-of-concept (the AATP demo) establishes feasibility. It implements: a candidate pool of five architectures, progressive elimination as the respondent answers gateway questions, answer-locking on phase advance, a conditional generative tollgate, and three outcome types (ordered proposal / structural incompatibility / deployment revoked). It is logic-faithful to the Compatibility Table but is not a 1:1 of the AST's literal five-phase structure.

Whether the flagship is this proof-of-concept evolved in place, or rebuilt against the AST's literal five phases, is an implementation decision (ADR §8). Either way it is the evolution base, and it de-risks the single most complex component of the platform.

### 7.2 What the operable instrument must do

- Let the respondent **run the AST** against a deployment scenario — entering or selecting deployment characteristics and watching the architecture-selection logic resolve.
- Make the **verdict logic visible** — the respondent should see *why* an architecture is eliminated or survives, not just the outcome. Operating the instrument should teach its procedure (P1).
- Permit **free re-running** in explore mode (F5).
- Be **firewalled** from the evaluation questions about it (F5, P6).

### 7.3 Graceful degradation within the build

If evolving the proof-of-concept into the integrated flagship proves harder than the timeline allows, the in-build fallback is a **video presentation of the AST in operation** — not abandonment of the platform (ADR §4, Alternative E; ADR §5, Risk 1). The video shows the same procedure the operable widget would let the respondent run themselves. This degradation is local to one screen; it does not cascade.

### 7.4 The other three instruments

Contextual Integrity Worksheet, Discretion Migration Analysis Operational Template, and Contestation Pathway Design Specification Table are presented as rich static panels: an excerpt or structured summary from the appendix, the instrument's maturity statement (P7), and orientation on operational purpose. They are not operable widgets. This is a deliberate scope boundary (ADR §1, §5 Risk 3): one genuinely operable instrument is buildable and defensible within the timeline; four is a different project.

---

## 8. Minimum Viable Platform and Deferrable Features

Per ADR Risk 3, scope creep is a primary slip risk. This section fixes the boundary.

### 8.1 Minimum viable platform — required for a fieldable instrument

- The master shell with all fixed elements (4.1).
- Phase 1 orientation, all five movements, including the visual concept presentation.
- Phase 2 questionnaire, all three blocks, all required items, sequential and gated (F2).
- The reference layer: terminology / concept cards and the whole-framework presentation, summonable as overlays (3.3, 4.3).
- The contextual-affordance declaration model (4.2) with at least the scope panel and source-material panel affordances.
- The flagship operable AST **or** its video degradation (7.3).
- The three static instrument panels (7.4).
- Custom response capture sufficient for the memo's analytical needs, satisfying the consent and data-path terms.
- Full-response-set completion and submission (F6); state survival across interruption (F8).

### 8.2 Deferrable — valuable, but not required to field

- Per-instrument videos beyond the AST (the contextual instrument-video affordance on non-AST screens).
- Operability for any instrument beyond the AST.
- The generic-uptake ratings layer (open question, ADR §8) — if adopted, it is an addition, not a precondition.
- Silent recording of reference-layer dwell time (F7) — a data-schema enrichment, not a flow requirement.
- Refinements to the time-estimation model beyond an honest baseline.

Anything in 8.2 added after handoff is weighed against the timeline as a change, not absorbed as a free improvement (ADR Risk 3).

---

## 9. Open Questions Carried Forward

- **Generic-uptake ratings layer.** Whether to add it, and if so its exact placement and weight relative to the open-response constructs. Methodological tension noted in the ADR §8. The author has deferred this; the structure here accommodates it either way.
- **AST evolution path.** Proof-of-concept evolved in place vs. literal five-phase rebuild vs. video degradation. Implementation decision; proof-of-concept is the recommended base.
- **Reference medium for the whole-framework presentation.** Presentation vs. video. **[implementer's discretion]**, constrained by P1.
- **State-survival mechanism.** Session vs. account vs. resumable link. Must be settled jointly with the ethics / data-path design (F8).
- **Data schema and the data path.** Separate design work. This specification's data-capture references (F5, F6, F7, F8) are constraints *on* that work, not the work itself.
- **Visual design system.** Palette, typography, tokens. **[implementer's discretion]**, constrained by the principles in Section 2 — particularly P2 (stable shell), P4 (one screen, one unit), and P7 (honest maturity surfacing).

---

## 10. Provenance and Authority

- **Drafted:** Session 094, 2026-05-14, immediately following C9_expert_platform_adr.md in the same session.
- **Implements:** C9_expert_platform_adr.md — the bespoke-interactive-platform delivery decision, the no-fallback commitment, and the AST-as-flagship decision.
- **Subordinate to:** memo_C9_expert_component_v1.md for all question content, constructs, instrument set, block structure, sample targets, expert-selection criteria, timeline, cut-line logic, and dual Chapter 9 framing. This specification governs platform structure and behaviour only and changes none of that.
- **Feeds:** the question-content drafting work (Block 1, Block 2 per instrument, Block 3) and the data-schema design work, both of which slot into the structure defined here.
- **Authoritative anchors:** C8_framing_adr.md (framework architecture the platform presents); memo_C8_instrument_maturity_vFinal.md (maturity statements for the Block 2 panel openers, per P7); chapter8.md and appendices.md (the framework specification respondents engage with); the AATP proof-of-concept (Session 094 upload) as the flagship operable instrument's evolution base.
- **Status:** Working specification. Complete for platform structure, principles, and flow rules. Question content, data schema, hosting, and visual design are downstream work products that build on this document.
