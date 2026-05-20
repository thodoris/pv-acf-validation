# C3 Questions Updates

_Started 2026-05-17 18:00 UTC_

---

## User

Ok I have some instructions for updates in C3 questions. Read them, verify that everything is clear and procced with implementation.

## Assistant

_[tool: list_files]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

The instructions are clear and the targets are unambiguous — all four MATURITY card bodies live in `content.js` under `C.instruments[]`. The amendments touch only the `body` strings; titles (`level`) stay as-is. Let me apply them.

_[tool: done]_

All four MATURITY card bodies updated in `content.js`:

- **CIW (23):** function-first opening; dropped "Essentially complete as a structure" and "and procedural" descriptor; verdict clause folded into opening sentence.
- **AST (24):** added the anti-drift clause ("When evidence for a per-architecture condition is uncertain, the Tool escalates rather than treating the uncertainty as clearance.") before the set-up sentence.
- **DMA (25):** two-word substitution — "decision-making authority" → "effective authority" in the opening clause.
- **CPD (26):** compacted — removed the two deliberate-openness rationale sentences (relying on the DETAILED EXPLANATION card already on the screen to carry that material).

Title lines (`level`) are unchanged on all four, as specified. No other elements touched.

## User

Additional instructions for Cluster's 3 questions.

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Consolidated SCOPE card applied across all four cluster 3 instrument screens in `app.jsx → instrumentAffs()`:

- Two SCOPE cards (Q.1 / Q.2) collapsed into one card using the existing `.aff__qnotes` dl/dt/dd pattern.
- Card title falls back to the default `kindLabel("scope")` → "Scope · What makes a good answer" (kept as-is per spec).
- Sub-heads written title-case in markup ("Q.1 — Quality" / "Q.2 — Applicability"); CSS renders them in the mono uppercase kicker register that matches the rest of the platform.
- Bullets shortened to one per sub-section: paperwork-not-sacred (Q.1) + design-difficulty-vs-set-up-work (Q.2). The stale "the maturity note above already names" phrasing is gone — replaced with "the MATURITY card names" per the amendment.
- Content is byte-identical across CIW / AST / DMA / CPD (single source — the `out` array in `instrumentAffs`); rail order preserved (SCOPE → MATURITY → operable on AST, → explanation on CPD).

Verifier dispatched to confirm rendering across all four screens.

## User

Verifier agent check completed

## Assistant

Verifier confirms clean implementation across all four screens — single SCOPE card, identical content, correct rail order, no console errors. Both amendments (01 MATURITY rewrites + 02 SCOPE consolidation) are now live in `content.js` and `app.jsx`.

## User

more changes for cluster 3:

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Amendment 03 applied:

- **AST (24)** — `app.jsx` instrumentAffs(): EXPLORE card opening sentence now reads "You can run the AST against scenarios via **Explore it** in the inspection panel above." ("freely" dropped, "in the top panel" → "in the inspection panel above"). Remainder of the card body, the three numbered steps, and the title/status line untouched.
- **DMA (25) tagline** — `content.js`: single-clause form, "Maps where effective authority moves when an AI system is introduced." Lands "effective authority" consistent with the at-a-glance card and the post-amendment-01 MATURITY body.
- **DMA (25) inspection-panel caption** — `screens-templates.jsx`: second sentence (four-level discretion typology / known structural gap) removed. Caption now ends after "the oversight response that calls for." The structural-gap acknowledgment now lives only in the MATURITY card.

CIW and CPD untouched, as specified.

