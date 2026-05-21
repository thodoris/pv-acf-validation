# Source of truth

## Authority

The **implemented prototype** at `docs/reference-prototype/` is the authoritative reference for what to build. Where the bundle's design documents at `docs/handoff/` disagree with the prototype, **the prototype wins**.

The user's brief at `docs/user-brief/pvacf_platform_implementation_brief.md` (v2.0) supersedes everything else on conflicts and is the rule book for change management.

## Bundle snapshot

| Field | Value |
|---|---|
| Source URL | `https://api.anthropic.com/v1/design/h/eaM0FavAtmGnrJk65NqN0w` |
| Bundle ID | `eaM0FavAtmGnrJk65NqN0w` |
| Snapshot date | 2026-05-21 |
| Snapshot kind | **One-time mirror.** Not refreshed automatically. |

### Re-snapshot procedure (if ever needed)

The repo does **not** automatically re-fetch from Claude Design. If the user requires a design change, they will run the change through Claude Design manually and bring back the resulting artefact (a component, a CSS update, a content edit). The build does not pull from `api.anthropic.com/v1/design/…` again.

If a full re-snapshot is ever needed:

1. The user fetches the bundle URL and extracts the gzip tarball.
2. Replace the contents of `docs/handoff/`, `docs/reference-prototype/`, `docs/design-history/` from the new bundle.
3. Update the snapshot date above.
4. Re-validate the discrepancy table below against the new prototype.
5. Commit as a single change: `docs: re-snapshot Claude Design bundle (date)`.

## Known discrepancies — bundle brief vs. prototype

Per the user's brief §2: **prototype wins**. These items are deliberate, not bugs. Do not "fix" them by re-aligning to the brief.

| # | Bundle brief says | Prototype has | Disposition |
|---|---|---|---|
| 1 | 5 grounding screens (`g1`…`g5`) | 2 grounding screens (`g1`, `g2`) | Build 2. Brief is stale. |
| 2 | `c1-setup` (1 screen) | `c1-setup1` + `c1-setup2` (2 screens) | Build 2. Same for c2 and c3 setups. |
| 3 | `c2-q1`…`c2-q7` (7 questions) | 6 questions — `c2-q5` is skipped | Build 6. |
| 4 | `c4-q1` + `c4-q2` + `interview` as 3 distinct screens | `c4-close` pairs Q4.1 + Q4.2; `interview` is its own screen post-spine | Build the prototype's structure. |
| 5 | "34-screen spine" | ~32 screens by `SCREENS` array count | Final count comes from the prototype's `SCREENS` array. |
| 6 | Concept cards "context-aware" (relevant cards first) | Feature **not implemented** in prototype | Carry forward as TODO. Do not silently add. |
| 7 | Self-hosted woff2 fonts (preload Greek subsets) | Google Fonts CDN | User brief overrides — self-host woff2. Preload **Latin only**; Greek loaded on demand via `unicode-range`. |
| 8 | Welcome consent checkbox — unchecked by default | **`defaultChecked` on the first checkbox** | Preserved verbatim from prototype. Looks like a UX smell (consent should not be pre-checked) but the prototype does this deliberately and the user has reviewed it. Do **not** change without sign-off. |
| 9 | Three setup-1 SVG diagrams (ThreeLevels, FrameworkOrganisation, InstrumentReading) | **Placeholder fallback** rendered via `DiagramSlot` | See [ADR 0003](./decisions/0003-diagram-fallback.md). The prototype itself falls back to the same placeholder when its diagram script fails to load; this is faithful, not a missing port. |

## Deferred items (per user brief)

The brief §9 lists eight open items. The user has closed items 1–5 (build as-is per prototype):

- ~~Cluster 2 Q2.6 split~~ — closed.
- ~~Cluster 2 Q2.2 open-only vs. rating-with-optional-open~~ — closed.
- ~~Cluster 3 Q3.8 (CPD applicability) scope-redirect~~ — closed.
- ~~AST third question~~ — closed; AST considered complete.
- ~~Explore-mode engagement capture on the AST~~ — closed; AST is explore-only.

Carried forward as architectural placeholders (not implemented in this sprint):

1. **Data schema + data path** — separate workstream. Answer payload treated as opaque.
2. **Save-and-resume mechanism (F8)** — currently `localStorage` per browser. Cross-device resume via email link is open.
3. **Generic-uptake ratings layer** — not pre-empted. If introduced, slots before Cluster 2.
4. **Questionnaire variants (FULL / SHORT)** — FULL implemented; SHORT architecturally supported but not populated.

## How design changes happen now

1. The user identifies a needed change (a component update, a content edit, a layout tweak).
2. The user hands it off to Claude Design manually and brings back the artefact.
3. We apply the artefact to the relevant files in `src/` and update `docs/reference-prototype/` only if the prototype itself was regenerated.
4. We log the change in the git commit message with reference to the design-side artefact.

The build does not pull design data on its own.
