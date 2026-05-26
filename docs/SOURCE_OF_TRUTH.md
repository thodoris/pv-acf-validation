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
| 3 | `c2-q1`…`c2-q7` (7 questions) | 6 questions — `c2-q5` is skipped | Build 6. **Note (2026-05-21):** the user later directed renumbering the IDs to a dense `c2-q1`…`c2-q6` to align IDs with the displayed `Question 2.x of 6` labels. See row 10. |
| 4 | `c4-q1` + `c4-q2` + `interview` as 3 distinct screens | `c4-close` pairs Q4.1 + Q4.2; `interview` is its own screen post-spine | Build the prototype's structure. |
| 5 | "34-screen spine" | ~32 screens by `SCREENS` array count | Final count comes from the prototype's `SCREENS` array. |
| 6 | Concept cards "context-aware" (relevant cards first) | Feature **not implemented** in prototype | Carry forward as TODO. Do not silently add. |
| 7 | Self-hosted woff2 fonts (preload Greek subsets) | Google Fonts CDN | User brief overrides — self-host woff2. Preload **Latin only**; Greek loaded on demand via `unicode-range`. |
| 8 | Welcome consent checkbox — unchecked by default | ~~`defaultChecked` on the first checkbox~~ — **resolved 2026-05-24**: checkbox now starts unchecked and the Begin button is disabled until the reviewer actively ticks it. GDPR Art. 7 / Recital 32 prohibits pre-ticked consent boxes; the prototype's pre-tick was a dark-pattern liability for an ethics-approved doctoral study. The frozen prototype still has `defaultChecked` — deliberate divergence, aligned with the user brief. | Build per the brief (unchecked + gated). |
| 9 | Three setup-1 SVG diagrams | **All three now ported** (`ThreeLevelsDiagram`, `InstrumentReadingDiagram`, `FrameworkOrganisationDiagram` under `src/screens/setup/diagrams/`) | See [ADR 0003](./decisions/0003-diagram-fallback.md) — now **Superseded**. `DiagramSlot` keeps the placeholder path as a defensive fallback for any future caller that omits the `diagram` prop. |
| 10 | Sparse cluster-2 IDs: `c2-q1`…`c2-q4`, `c2-q6`, `c2-q7` (skipping `c2-q5`) | **Dense IDs: `c2-q1`…`c2-q6`** as of 2026-05-21 | User-directed renumber so screen IDs match the `Question 2.x of 6` labels shown in the meta line. The prior question stem for the new `c2-q5` ("Bringing structural conditions back into view") also had its trailing sub-question on cross-stage consistency removed in the same change. This is a deliberate divergence from the frozen prototype, not a porting error. |
| 11 | Authored `meta` string per question (e.g. `"Question 2.5 of 6 · Judgment"`) | **Structured `clusterPosition: { ordinal, totalInFull }` + `registers: Register[]` fields**; `meta` string deleted | SHORT-variant scaffolding F1–F4 (2026-05-21). The renderer composes the display string via `src/content/displayMeta.ts` at render time, recomputing the visible "X of N" from `effectiveScreens(variant)` and deriving the cluster-4 `Required` / `Optional` descriptor from `effectiveRequired()` on the open field. See [ADR 0006](./decisions/0006-meta-restructure-and-registers.md). Prototype tree under `docs/reference-prototype/` keeps the legacy `meta` strings unchanged — deliberate divergence, not drift. |
| 12 | `three-levels-diagram.jsx` v1: three horizontal boxes (Strategy → Institutional → Deployment) connected by left-to-right flow arrows; optional dashed right-to-left feedback arrow underneath | **v2: vertical trace-back ladder** — Strategy at top (dashed border), Institutional in the middle (lighter outline), Deployment at the bottom (solid border). A horizontal "TRACING BACK" cursor fades in at the deployment rung, dwells, climbs to institutional, dwells, climbs to strategy, dwells, then exits above the diagram. Total sweep ~5s. The `feedback` prop is retained but ignored | User-supplied v2 design (2026-05-23) authored externally (Claude Design) and ported mechanically into `src/screens/setup/diagrams/ThreeLevelsDiagram.tsx`. The frozen prototype at `docs/reference-prototype/diagrams/three-levels-diagram.jsx` still contains v1 — **deliberate divergence**, not drift. Do not "fix" by re-syncing to v1. STYLE_ID bumped from `__tld_styles_v1` to `__tld_styles_v2`. |
| 13 | Cluster 4 is a two-screen flow: `c4-setup` (kind `cluster-setup`, "One last invitation") then `c4-close` (Q4.1 + Q4.2) | **Cluster 4 is one screen** — `c4-setup` removed; `c4-close` absorbs the load-bearing setup copy (title *The close*, "Set the agenda yourself" tagline fragment, the closing-rhythm + scope-of-everything-you've-seen + question preview rolled into a `.lede-panel` paragraph above Q4.1). Spine count 32 → 31 (SHORT 30). The `cluster-setup` `ScreenKind`, `ClusterSetupScreen.tsx`, and the `'close'` branch of `clusterPreview()` are deleted along with the screen. See [ADR 0011](./decisions/0011-cluster-4-merge.md). | Build one screen. The prototype still has the two-screen flow — deliberate divergence, not drift. |

## Deferred items (per user brief)

The brief §9 lists eight open items. The user has closed items 1–5 (build as-is per prototype):

- ~~Cluster 2 Q2.6 split~~ — closed.
- ~~Cluster 2 Q2.2 open-only vs. rating-with-optional-open~~ — closed; resolved as **rating + optional open** (2026-05-21), mirroring Q2.1's structure with a soundness scale on the recurring-cycle commitment.
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
