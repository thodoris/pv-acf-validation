# PV-ACF — Design Tokens at a Glance (for diagram work)

A one-page handoff for the diagram session. Everything here is already in
`styles.css` as CSS custom properties — use the variable names, do not
invent new colors. If you need a hex inside an SVG `fill=""` where a CSS
var isn't supported, use the listed hex but write it `/* via --coral */`
in a comment so it stays linked.

---

## Color tokens

### Surfaces

| Token              | Hex       | Use                                                |
| ------------------ | --------- | -------------------------------------------------- |
| `--page`           | `#FBF8F1` | Primary page background (warm cream).              |
| `--page-subtle`    | `#F4EFE3` | Alternating wash, soft inset.                      |
| `--surface`        | `#FFFFFF` | Default panel / diagram canvas.                    |
| `--surface-deep`   | `#F8F4EA` | Inset surface inside a panel.                      |

### Ink

| Token              | Hex       | Use                                                |
| ------------------ | --------- | -------------------------------------------------- |
| `--ink-strong`     | `#1A1816` | Display titles, lifecycle node labels.             |
| `--ink`            | `#2C2C2A` | Body text, default label color.                    |
| `--ink-soft`       | `#5F5E5A` | Secondary text, caption row.                       |
| `--ink-mute`       | `#888780` | Tertiary text, axis labels.                        |
| `--ink-faint`      | `#B7B5AE` | Placeholder text, disabled.                        |

### Accent (USE SPARINGLY in diagrams)

| Token              | Hex       | Use                                                |
| ------------------ | --------- | -------------------------------------------------- |
| `--coral`          | `#B8472E` | Primary accent — only on the Gate marker, the four reference-back markers, and the recursive-arrow pulse. |
| `--coral-deep`     | `#712B13` | Hover / pressed state of accented elements; body text on `--coral-tint` only. |
| `--coral-tint`     | `#FAECE7` | Soft fill behind a callout. Not for the diagram itself. |

### Borders / rules

| Token              | Hex       | Weight   | Use                                                |
| ------------------ | --------- | -------- | -------------------------------------------------- |
| `--border`         | `#E5E0D2` | 0.5 px   | Default panel border, lifecycle-node stroke.       |
| `--border-soft`    | `#EDE8DA` | 0.5 px   | Hairline section rule.                             |
| `--border-strong`  | `#B4B0A2` | 1 px     | Emphasised stroke (arrows, connectors).            |
| `--rule-warm`      | `#B8472E` | 0.8 px   | Locus marker / accent stroke.                      |
| `--focus-ring`     | `rgba(184,71,46,0.55)` | 3 px outer | Focus outline on the replay button. |

### What gets the accent in this diagram

- **Coral / `--coral`:** the four reference-back markers, the Generative LLM Gate badge, the recursive arrow's pulse highlight.
- **Neutral / `--ink-strong` on `--surface`:** the five lifecycle stage nodes, the diagnostic-layer container, the forward-flow arrows between stages.
- **Muted / `--ink-mute` / `--font-mono`:** captions like "completed once before deployment" and "re-runs across the deployment's life".

Do not give every load-bearing element coral. The diagram earns its
contrast by keeping coral scarce.

---

## Type

| Family             | CSS var          | Use                                                |
| ------------------ | ---------------- | -------------------------------------------------- |
| GFS Neohellenic    | `--font-display` | Display titles only (the diagram doesn't need this). |
| IBM Plex Sans      | `--font-body`    | Lifecycle stage labels, body text inside callouts. |
| IBM Plex Mono      | `--font-mono`    | Stage numbers, ordinals, small-caps labels, captions. |

### Type ladder for the diagram

- **Stage label:** Plex Sans 14 px, weight 500, `--ink-strong`. ~22 px line height.
- **Diagnostic-layer label:** Plex Sans 15 px, weight 600, `--ink-strong`.
- **Reference-back marker label:** Plex Mono 10.5 px, letter-spacing 0.08em, uppercase, `--coral`. ("BACK TO CONDITIONS" / no label if space-constrained).
- **Caption (under arrows, gate subtitle):** Plex Mono 11 px, `--ink-mute`, letter-spacing 0.04em. Italic acceptable for short subtitles only.
- **Gate label:** Plex Sans 12 px, weight 600, `--coral-deep` on `--coral-tint`. Subscript "when generative AI architecture" in Plex Mono 9.5 px italic, `--coral-deep`.

Never mix more than two type families on the diagram (Plex Sans + Plex
Mono is the pairing).

---

## Spacing & radii

| Token         | Value | Token         | Value |
| ------------- | ----- | ------------- | ----- |
| `--space-1`   | 4 px  | `--radius-sm` | 4 px  |
| `--space-2`   | 8 px  | `--radius-md` | 8 px  |
| `--space-3`   | 12 px | `--radius-lg` | 14 px |
| `--space-4`   | 16 px | `--radius-pill` | 999 px |
| `--space-5`   | 20 px |               |       |
| `--space-6`   | 28 px |               |       |
| `--space-7`   | 40 px |               |       |
| `--space-8`   | 56 px |               |       |

Use **`--radius-md` (8 px)** for the lifecycle stage rectangles.
Use **`--radius-sm` (4 px)** for the diagnostic-layer container.
Use **`--radius-pill` (999 px)** for any badge (the Gate marker).

---

## Motion

| Token              | Value                                | Use         |
| ------------------ | ------------------------------------ | ----------- |
| `--dur-instant`    | 80 ms                                | Tap feedback. |
| `--dur-quick`      | 140 ms                               | Hover, focus. |
| `--dur-base`       | 220 ms                               | Default transitions. |
| `--dur-deep`       | 420 ms                               | Element entry / exit. |
| `--ease-out`       | `cubic-bezier(0.22, 1, 0.36, 1)`     | Default easing. |
| `--ease-in-out`    | `cubic-bezier(0.6, 0, 0.4, 1)`       | Symmetric loops. |

### For the diagram's build sequence

- **Step durations:** target ~1 s per step (5 steps = ~5 s total per spec).
  Use `--dur-deep` (420 ms) for individual element entry, `--ease-out`.
- **Recursive-arrow pulse:** ~2.5 s full cycle, `--ease-in-out`. Pulse =
  stroke-opacity 0.35 → 1.0 → 0.35 *or* a thin highlight tracing along
  the path. Keep it quiet — peripheral-vision presence only.
- **Reduced motion:** if `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, skip the build, skip the pulse, render the final state directly.

---

## Stroke weights

| Element                                | Weight                       |
| -------------------------------------- | ---------------------------- |
| Lifecycle stage node border            | 0.5 px `--border`            |
| Diagnostic-layer container border      | 0.5 px `--border`            |
| Forward-flow arrow between stages      | 1 px `--ink-mute`            |
| Recursive arrow (Stage 5 → Stage 1)    | 1 px `--ink-soft` (default), `--coral` during pulse |
| Reference-back markers (4 arrows up)   | 0.8 px `--coral`, dashed (4 4) acceptable |
| Gate connector to Stage 2              | 0.8 px `--coral`, dashed (3 3) |

Arrowheads: simple triangle, filled with the line color. 6–8 px on the
long side. Avoid double-headed arrows — one direction only.

---

## What the diagram is NOT

- Not illustrative. No avatars, characters, icons of people, hand-drawn
  flourishes. The framework is being treated as an architecture.
- Not a brand exercise. No gradients, no shadows, no glow. The platform
  uses one accent — coral — and a neutral ink scale. Anything else is
  off-palette.
- Not a chart. No data, no axes, no scales.
- Not symmetrical for symmetry's sake. Stage 4 has **no** reference-back
  marker — that asymmetry is load-bearing.

---

## Print + screenshot reliability

The diagram appears in PDF exports via `print.html` at A4 portrait. It
must render legibly in the static final state with no animation. If you
use CSS animations rather than React-driven keyframes, gate them on
`@media not print` (and on the reduced-motion query) so print rendering
is always the final frame.
