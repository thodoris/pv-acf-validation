# 0003 — Diagram fallback for setup screens (SVG components deferred)

- **Status:** Superseded · 2026-05-21 — all three diagrams now ported. `DiagramSlot` retains the placeholder path as a defensive fallback for callers that omit the `diagram` prop, but the three setup-1 screens (`c1-setup1`, `c2-setup1`, `c3-setup1`) now render real SVG components. See commits eb6f8c8 / ae78992 / 7f743f0.
- **Touches:** `src/screens/setup/DiagramSlot.tsx`, the three setup-1 screens that consume it

## Context

The prototype's three cluster-setup screens (`c1-setup1`, `c2-setup1`, `c3-setup1`) each embed an animated SVG diagram:

- **`ThreeLevelsDiagram`** — strategy / institution / deployment stack with arrows (c1-setup1)
- **`FrameworkOrganisationDiagram`** — two-layer + recursive-lifecycle + Generative-LLM Gate (c2-setup1)
- **`InstrumentReadingDiagram`** — three-tier "framework → institution → reviewer" hierarchy (c3-setup1)

These live as separate JSX files in `docs/reference-prototype/diagrams/` (~200–400 lines each, with shared animation primitives from `animations.jsx`). Porting them is its own substantial workstream — bespoke SVG geometry + entrance animations.

The plan didn't carry them as a Phase 4 task. The setup screens have already shipped without them.

## Decision

**Render the prototype's own `diagram-ph` placeholder fallback in production**, via a shared `DiagramSlot` component (`src/screens/setup/DiagramSlot.tsx`).

The placeholder is **visually identical to what the prototype shows when its diagram script fails to load** — same striped panel, same coral-tint chip badge ("Diagram placeholder · awaiting `<componentName>`"), same proposition bullet list summarising what the diagram would show. This is faithful carry-forward: the user has seen this fallback inside the prototype and signed off on the setup screens with it visible.

```tsx
<DiagramSlot
  variant="framework-organisation"
  size="full"
  caption="..."
  componentName="framework-organisation-diagram"
  placeholder={<ul className="diagram-ph__propos">{/* …content bullets… */}</ul>}
/>
```

The Replay button is wired (a `useReducer` key-bump pattern that the real components will accept too — same prop name `key` triggers a re-mount and animation restart). Drop-in replacement is on the contract.

## Alternatives considered

- **Skip the diagrams entirely.** Drops the `framework-diagram` block from the screen, breaks the spec's visual rhythm. The setup screens look thin without the visual anchor.
- **Static PNG screenshots from the prototype.** Cheap and looks done — but loses the animation, doesn't communicate motion ("how the lifecycle re-runs"), and a PNG can't replay. Not worth the inauthenticity.
- **Port one component now.** Tempting (the three-levels is the simplest), but porting one and not the others creates an inconsistent set. All-or-nothing keeps the screens visually consistent.

## Consequences

- **A future task is to port the three diagrams.** When that happens, the change is local: each setup-1 screen swaps `<DiagramSlot ... placeholder={...} />` for the real `<ThreeLevelsDiagram />` / `<FrameworkOrganisationDiagram />` / `<InstrumentReadingDiagram />`. The Replay button + caption row stay. No screen restructuring needed.
- **The prototype sources are mirrored under `docs/reference-prototype/diagrams/`** (animations.jsx + the three .jsx files). When porting, those are the source of truth — same rule as everything else.
- **The diagram-ph CSS** lives in `src/styles/styles-phase-a.css` (carried verbatim). Don't refactor the selectors when the real components ship; the real components also use `.framework-diagram__frame` etc., so the CSS is shared.
- **`docs/reference-prototype/diagrams/DESIGN_TOKENS.md`** documents the diagrams' visual contract. Read it before porting.
