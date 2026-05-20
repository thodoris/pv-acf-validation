# Design system — PhD thesis web app

A friendly, modern, Greek-primary interface for presenting a doctoral thesis
in Public Administration to practitioners and students, with first-class
support for concept pages, short animations, embedded video, and
questionnaires.

Status: v0.3 draft. The intent is a foundation that is opinionated where it
needs to be and flexible where it pays to be — and that absorbs the
existing SVG figures without forcing them to be recoloured.

---

## 0. Vision and principles

The site does two things at once. It explains a thesis in a form that feels
generous to non-academic readers, and it asks them, gently, to contribute
back through questionnaires. The design must hold both registers without
either crowding the other.

Five working principles guide every decision below:

1. **Greek first, English alongside.** Type, line-heights, and component
   sizing are tuned to Greek glyph proportions; English fits inside that.
2. **Light by default, cinema for media.** The page is warm and bright.
   Video and animation containers switch to a dark "cinema" surface,
   borrowed from a documentary aesthetic, so motion content reads as
   deliberate, not arbitrary.
3. **Two reading modes.** Long-form pages (a concept walkthrough, a
   chapter) prioritise readability. Reference pages (a glossary, a
   questionnaire, an index) prioritise density. Pages declare which mode
   they are in; tokens shift accordingly.
4. **Friendly, not casual.** The voice should disarm an academic visitor
   without losing the seriousness of the subject. Warm ink, soft borders,
   italic taglines as the signature voice device.
5. **Absorb the legacy, don't impersonate it.** Existing SVG figures
   (`figure_7_1_nested_governance_gap_v6.svg`,
   `figure_8_2_pvacf_lifecycle_detail.svg`, etc.) drop into a figure
   container unchanged. The new system shares colour DNA with them but does
   not borrow their slide chrome.

---

## 1. Foundations

### 1.1 Colour

The palette is anchored on warm paper plus the existing signature coral.
Navy is demoted from a "display heading" colour to a functional link
colour; the new display ink is warm-black. Sage is added so positive /
"thesis voice" signals don't have to lean on coral. The full legacy SVG
palette is preserved as a parallel set so existing figures slot in.

**Page surfaces (light, default)**

| Token              | Hex       | Usage                                            |
| ------------------ | --------- | ------------------------------------------------ |
| `--page`           | `#FBF8F1` | Primary page background. Warmer than #F1EFE8.    |
| `--page-subtle`    | `#F4EFE3` | Secondary page wash, alternating sections.       |
| `--surface`        | `#FFFFFF` | Default card / panel.                            |
| `--surface-deep`   | `#F8F4EA` | Inset surface inside `--page`.                   |

**Ink scale**

| Token            | Hex       | Usage                                                  |
| ---------------- | --------- | ------------------------------------------------------ |
| `--ink-strong`   | `#1A1816` | Display headlines, primary emphasis.                   |
| `--ink`          | `#2C2A26` | Default body text.                                     |
| `--ink-soft`     | `#5F5C54` | Secondary copy, descriptors.                           |
| `--ink-mute`     | `#8A867C` | Tertiary, labels, captions, small-caps section labels. |
| `--ink-faint`    | `#BFBBB0` | Placeholder, disabled.                                 |

**Accents**

| Token              | Hex       | Usage                                                 |
| ------------------ | --------- | ----------------------------------------------------- |
| `--coral`          | `#B8472E` | Primary accent: locus markers, calls to action, key.  |
| `--coral-deep`     | `#712B13` | Hover/active for coral; hero italic taglines.         |
| `--coral-tint`     | `#FAECE7` | Coral-tinted backgrounds and bands.                   |
| `--navy`           | `#1F4E89` | Link colour, secondary accent (web).                  |
| `--navy-tint`      | `#E6F1FB` | Navy-tinted callout backgrounds; matches legacy SVGs. |
| `--sage`           | `#4F7A66` | "Thesis voice" / positive findings / data positive.   |
| `--sage-deep`      | `#2A4D3D` | Body-safe text on `--sage-tint` or white.             |
| `--sage-tint`      | `#E7F0EB` | Sage-tinted backgrounds, success badges.              |
| `--saffron`        | `#E0A030` | Warm vivid accent. Borders, large headings, icons.    |
| `--saffron-deep`   | `#A56F12` | Body-safe text on `--saffron-tint` or white.          |
| `--saffron-tint`   | `#FCF1D7` | Saffron-tinted backgrounds, instructional bands.      |
| `--cobalt`         | `#2B5BD9` | Cool vivid accent. Borders, headings, large text.     |
| `--cobalt-deep`    | `#1E3FA0` | Body-safe text on `--cobalt-tint` or white.           |
| `--cobalt-tint`    | `#E3EBFC` | Cobalt-tinted backgrounds, data sections.             |

**Cinema surfaces (dark, used only inside media containers)**

| Token              | Hex       | Usage                                                |
| ------------------ | --------- | ---------------------------------------------------- |
| `--cinema-bg`      | `#0E0E0C` | Video / animation container background.              |
| `--cinema-ink`     | `#F4F0E8` | Primary text on cinema bg (subtitles, captions).     |
| `--cinema-mute`    | `#8A867C` | Secondary text on cinema bg (timestamps, metadata).  |
| `--cinema-accent`  | `#E8C46B` | Chapter markers, focus on cinema bg.                 |

**Semantic**

| Token              | Hex       | Usage                                        |
| ------------------ | --------- | -------------------------------------------- |
| `--success`        | `#2F7F5E` | Success state. Use sparingly.                |
| `--warning`        | `#B5710E` | Warning state.                               |
| `--danger`         | `#A33321` | Destructive / error.                         |
| `--info`           | `#1F4E89` | Informational (same hex as `--navy`).        |
| `--focus-ring`     | `rgba(184, 71, 46, 0.55)` | 3px outer focus ring, 2px offset. |

**Borders and lines**

| Token              | Hex       | Weight | Usage                                       |
| ------------------ | --------- | ------ | ------------------------------------------- |
| `--border`         | `#E5E0D2` | 0.5px  | Default card / input border.                |
| `--border-soft`    | `#EDE8DA` | 0.5px  | Hairline section separator.                 |
| `--border-strong`  | `#B4B0A2` | 1px    | Emphasised border / table header underline. |
| `--rule-warm`      | `#B8472E` | 0.8px  | Locus marker border. Match legacy.          |
| `--rule-dashed`    | `#8A867C` | 0.5px dashed (4 2.5) | Inherited / dashed card. Match legacy. |

**Category encoding — when to use which accent**

The system supports up to four categorical accents (plus the neutral
default). A single page should declare itself as one register and stay
in it; the four only meet on nav, index pages, or category overviews.
Never two strong accents fighting for the same square inch.

| Register      | Accent     | Suggested use                                              |
| ------------- | ---------- | ---------------------------------------------------------- |
| Finding       | `--coral`  | Thesis-original findings, locus markers, primary CTAs.     |
| Method        | `--saffron`| Methods, concepts, glossary, how-it-works, instructional.  |
| Data          | `--cobalt` | Tables, downloads, references, technical appendices.       |
| Voice         | `--sage`   | Thesis voice / personal reflection / positive signals.     |

Legacy categorical tones (purple `#534AB7`, teal `#0F6E56`) remain
available for figures and any content that already uses them — see the
legacy palette block below — but new pages should pick from the four
registers above first.

**Accessibility for the vivid accents.** Mid stops of saffron and
cobalt do not meet WCAG AA on white at body sizes. Use the mid stops
only for borders, icons, large headings (≥18 px medium / 24 px regular),
and chip fills with white text. For body text on a tint, always use the
deep stop:

| On `--saffron-tint`   | Use `--saffron-deep` (`#A56F12`) for text. |
| On `--cobalt-tint`    | Use `--cobalt-deep` (`#1E3FA0`) for text.  |
| On `--coral-tint`     | Use `--coral-deep` (`#712B13`) for text.   |
| On `--sage-tint`      | Use `--sage-deep` (`#2A4D3D`) for text.    |

**Cinema-mode equivalents.** On `--cinema-bg`, vivid accents shift to
their lifted-tint pair so they read against dark: coral `#D85A30` /
saffron `#E0A030` (unchanged, already vivid) / cobalt `#4F73E0` /
sage `#6A9381`. Backgrounds use a 18–22% alpha of the mid stop.

**Legacy palette (preserved so existing SVG figures need no changes)**

This is the same palette the existing SVGs use. New components should
prefer the tokens above, but these are guaranteed not to be deprecated:
`#143A6E` (legacy display navy), `#0C447C` `#185FA5` (legacy blue family),
`#3C3489` `#534AB7` `#EEEDFE` (purple), `#0F6E56` `#E1F5EE` `#085041`
(teal), `#993C1D` `#712B13` `#4A1B0C` `#FAECE7` (coral), `#888780`
`#5F5E5A` `#2C2C2A` `#F1EFE8` (warm gray), `#1D9E75` (data green),
`#185FA5` (data blue), `#B8472E` (warm accent border).

**Mapping legacy → new**

| Legacy hex           | New token equivalent          | Note                                  |
| -------------------- | ----------------------------- | ------------------------------------- |
| `#F1EFE8` page       | `--page-subtle`               | Use new `--page` for fresh pages.     |
| `#143A6E` title navy | `--ink-strong` for new pages  | Keep `#143A6E` *inside* legacy SVGs.  |
| `#2C2C2A` body       | `--ink`                       | Direct match.                         |
| `#5F5E5A` secondary  | `--ink-soft`                  | Direct match.                         |
| `#888780` tertiary   | `--ink-mute`                  | Direct match.                         |
| `#B8472E` coral      | `--coral`                     | Direct match.                         |
| `#712B13` coral deep | `--coral-deep`                | Direct match.                         |
| `#D5D3CB` border     | `--border`                    | Slight warming.                       |

### 1.2 Typography

Three families, all free, all with full Greek coverage.

| Role            | Family             | Why                                                                                  |
| --------------- | ------------------ | ------------------------------------------------------------------------------------ |
| Display         | **GFS Neohellenic**| Greek-native sans with twentieth-century heritage. Distinctive without being kitsch. |
| Body / UI       | **IBM Plex Sans**  | Full Greek + Latin, modern, technical, large x-height. Works at every size.          |
| Numerics / mono | **IBM Plex Mono**  | Metadata, citations, code, dates, page references, data tables.                      |

Loading: self-host woff2 from `/static/fonts/`. Preload only the Greek
subsets of GFS Neohellenic Regular/Bold and Plex Sans Regular/Medium/
Italic. Fallback stack: `'Helvetica Neue', system-ui, sans-serif`.

**Weights used**

| Weight | Use                                                                                        |
| ------ | ------------------------------------------------------------------------------------------ |
| 400    | Default body, descriptions.                                                                 |
| 500    | Section labels, card labels, button labels, primary emphasis.                              |
| 600    | Card titles, h3, h4. Verb-prefix emphasis in I-phrases.                                    |
| 700    | Display (GFS Neohellenic only). Hero, chapter open. Never override the master title family.|

**Italic discipline.** Italics are reserved for the same five things the
existing system uses them for: hero taglines, closing taglines, italic
descriptors under section labels, citations, and "from the published
papers" subordinate subtitles. Italic is the signature voice device — do
not dilute it with decorative italic use.

**Type scale, two reading modes**

| Role                | Reader mode          | Reference / form mode |
| ------------------- | -------------------- | --------------------- |
| Display 1 (hero h1) | 52 / 1.05 / −0.02em  | 40 / 1.10 / −0.02em   |
| Display 2 (chapter) | 36 / 1.10 / −0.015em | 28 / 1.15 / −0.015em  |
| h2                  | 28 / 1.20 / −0.01em  | 22 / 1.25 / −0.01em   |
| h3                  | 22 / 1.30            | 17   / 1.30           |
| h4                  | 18 / 1.35            | 14.5 / 1.35           |
| Body                | 17 / 1.70            | 14.5 / 1.55           |
| Body small          | 14.5 / 1.60          | 13   / 1.50           |
| Caption / metadata  | 13 / 1.50            | 12   / 1.40           |
| Section label (sc)  | 11 / 1.40 +1.6pt LS  | 10.5 / 1.40 +1.5pt LS |

LS = letter-spacing. Sizes in px; line-heights unitless.

**Greek tuning.** GFS Neohellenic Greek glyphs sit slightly taller than
its Latin glyphs. On any heading where Greek dominates (a hero in Greek
with an English subtitle, say), drop the heading one step from the table
above. Inside body copy, `font-feature-settings: "case" on` improves
caps + diacritic combinations.

**Pairings.** Hero headings are GFS Neohellenic 700, with an italic Plex
Sans subtitle below in `--coral-deep` (a pattern that bridges old and new).
Section labels are Plex Sans Medium small-caps with letter-spacing. Body
is always Plex Sans Regular.

### 1.3 Spacing scale

A 4 pt base. The first eight steps cover almost everything; the last two
are for hero spacing and section breaks.

| Token       | Value | Typical use                             |
| ----------- | ----- | --------------------------------------- |
| `--space-0` | 0     |                                         |
| `--space-1` | 4 px  | Inside chips, between icon + label.     |
| `--space-2` | 8 px  | Tight component-internal gaps.          |
| `--space-3` | 12 px | Card body, input padding.               |
| `--space-4` | 16 px | Card padding, section internal gap.     |
| `--space-5` | 24 px | Between cards, between paragraphs.      |
| `--space-6` | 32 px | Between sections (reference mode).      |
| `--space-7` | 48 px | Between sections (reader mode).         |
| `--space-8` | 64 px | Above / below hero blocks.              |
| `--space-9` | 96 px | Chapter separation in reader mode.      |
| `--space-10`| 128 px| Page-top / hero pad on lg screens.      |

### 1.4 Radius, borders, elevation

| Token            | Value     | Use                                        |
| ---------------- | --------- | ------------------------------------------ |
| `--radius-sm`    | 4 px      | Chips, inputs, small buttons.              |
| `--radius-md`    | 8 px      | Cards, buttons, segmented controls.        |
| `--radius-lg`    | 12 px     | Large cards, panels.                       |
| `--radius-xl`    | 18 px     | Hero blocks, video frames.                 |
| `--radius-pill`  | 999 px    | Pills (chips, breadcrumb tags, tag clouds).|

Default border weight is `0.5px`. Emphasised borders are `1px`. Locus
markers (the warm-accent variant) are `0.8px` to match legacy SVGs.

Elevation is intentionally restrained. No drop shadows on cards by
default. Allowed shadows:

| Token            | Value                                          | Use                                  |
| ---------------- | ---------------------------------------------- | ------------------------------------ |
| `--elev-flat`    | none                                           | All cards by default.                |
| `--elev-sticky`  | `0 1px 2px rgba(26,24,22,0.06)`                | Sticky top nav once scrolled.        |
| `--elev-modal`   | `0 24px 48px rgba(26,24,22,0.18)`              | Modals, popovers.                    |
| `--elev-focus`   | `0 0 0 3px var(--focus-ring)`                  | Focus ring, all focusable elements.  |

### 1.5 Motion

A four-step duration scale with a clear narrative: most things move
quickly; only chapter / scene transitions allowed to be slow.

| Token              | Duration | Use                                            |
| ------------------ | -------- | ---------------------------------------------- |
| `--dur-instant`    | 80 ms    | Hover state, tooltip appear.                   |
| `--dur-quick`      | 140 ms   | Default button / card interactions.            |
| `--dur-base`       | 220 ms   | Most reveals, accordions, tabs.                |
| `--dur-deep`       | 420 ms   | Deliberate page-internal transitions.          |
| `--dur-cinema`     | 720 ms   | Chapter / scene transitions in cinema mode.    |

| Token              | Easing                                       | Use         |
| ------------------ | -------------------------------------------- | ----------- |
| `--ease-out`       | `cubic-bezier(0.22, 1, 0.36, 1)`             | Default.    |
| `--ease-in-out`    | `cubic-bezier(0.6, 0, 0.4, 1)`               | Loops, sym. |
| `--ease-linear`    | linear                                       | Loops only. |

What animates: figure reveals on scroll (fade + 8px translateY), chapter
transitions (cross-fade), questionnaire step transitions (slide +
opacity), video player chapter markers (scale + ink shift).

What does **not** animate: body text reflow, table sort, card hover (use
border + cursor only, never transform).

**`prefers-reduced-motion`.** All non-essential animation falls back to a
plain opacity transition at `--dur-instant`. Auto-playing animation
containers pause; scroll-driven effects become instantaneous.

### 1.6 Iconography

Tabler Icons (outline) as the default set. Free, comprehensive, line
weights match the type. Sizes: 16 / 20 / 24 px.

Use icons sparingly — they should clarify meaning, not decorate. Never
emoji; never filled / coloured icons. Icon colour inherits `--ink`,
unless paired with semantic intent (then the semantic token).

---

## 2. The two reading modes

A page declares its mode via a single class on `<body>` or the page
wrapper. Components read tokens that change with the mode.

### 2.1 Reader mode — long-form pages

For concept walkthroughs, chapter pages, essays.

- Content column max-width: **720 px** (text). 960 px with figures.
- Body 17 / 1.70.
- Generous vertical rhythm: `--space-5` between paragraphs, `--space-7`
  between sections.
- Right rail (lg+): sticky in-page table of contents, 220 px wide.
- Footnotes / sidenotes: right margin on lg+, inline expandable on md and
  below.

### 2.2 Reference / form mode — questionnaires, glossary, index

For pages where the user needs to scan, compare, or fill.

- Content column max-width: **1080 px**.
- Body 14.5 / 1.55.
- Tighter vertical rhythm: `--space-3` to `--space-4` between fields.
- Tables and forms get table-layout `fixed` with explicit column widths.
- Right rail used for navigation between question groups.

---

## 3. Layout and grid

### 3.1 Breakpoints

| Name | Min width | Notes                                |
| ---- | --------- | ------------------------------------ |
| `sm` | 600 px    | Phone landscape, small tablet.       |
| `md` | 900 px    | Tablet.                              |
| `lg` | 1200 px   | Default desktop.                     |
| `xl` | 1440 px   | Wide desktop. Add hero breathing.    |

Below `sm`, single column, all sidebars collapse, sticky nav becomes a
hamburger.

### 3.2 Containers

- `.container--narrow` — 720 px, reader text.
- `.container--reader` — 960 px, reader with figures.
- `.container--reference` — 1080 px, dense.
- `.container--wide` — 1280 px, dashboards or comparative views.
- `.container--bleed` — 100 vw, hero / video / animation.

### 3.3 Page chrome (replacement for slide chrome)

The existing slide system has master-painted breadcrumb, sphinx mark, and
page number. None of those carry over. The web equivalents:

- **Top nav (sticky):** logo (small, monochrome), primary nav, language
  toggle (Ελ / EN), search.
- **Chapter bar (optional, sticky on chapter pages):** chapter name +
  inline progress.
- **In-page TOC (right rail, sticky, lg+):** flat list of section
  headings, current section highlighted with `--coral`.
- **Footer:** thesis title, author, supervisor, university, license, ISBN
  (if any), citation block, contact.

---

## 4. Components

A small core, designed to compose. Each component lists its anatomy and
state behaviour; visual details inherit foundation tokens.

### 4.1 Buttons

Three styles. Sentence case labels always.

| Style       | Background      | Border          | Text             |
| ----------- | --------------- | --------------- | ---------------- |
| `primary`   | `--coral`       | none            | `#FFFFFF`        |
| `secondary` | `--surface`     | `--border-strong` | `--ink`        |
| `ghost`     | transparent     | none            | `--coral`        |
| `danger`    | `--danger`      | none            | `#FFFFFF`        |

Sizes: `sm` 32 px tall, `md` 40 px (default), `lg` 48 px (only for hero
CTAs). Hover darkens the fill by ~6% in HSL L; active drops opacity to 92%.
Focus shows `--elev-focus`.

### 4.2 Inputs

Text, textarea, select, checkbox, radio, toggle, slider.

All inputs are 40 px tall, `--radius-sm`, `--border` border, white fill,
`--ink` text, `--ink-faint` placeholder. Focus: 2 px offset
`--focus-ring`. Disabled: `--page-subtle` fill, `--ink-faint` text.

Validation: error border `--danger`, helper text `--danger` below the
field; success border `--success`. Never colour-only — always pair with a
label or icon.

### 4.3 Cards

Five variants. All share `--radius-lg`, `--surface` fill, `--border`
0.5px, internal padding `--space-4` to `--space-5`.

- **Card — default.** White, subtle border. Default content unit.
- **Card — locus.** Same, but border `--rule-warm` 0.8px. Marks a
  thesis-original finding. Same role as the existing locus-marker card.
- **Card — inherited.** Transparent fill, `--rule-dashed` border. Marks
  inherited / material premise content.
- **Card — categorical.** One of five tints + matching border, one per
  register: coral (`--coral-tint` / `--coral`), saffron
  (`--saffron-tint` / `--saffron`), cobalt
  (`--cobalt-tint` / `--cobalt`), sage (`--sage-tint` / `--sage`), or a
  legacy purple / teal where existing figures already use them. Use only
  when content semantics need a categorical encoding, not for aesthetics.
  Text on the tint uses the matching `-deep` token (e.g.
  `--saffron-deep` on `--saffron-tint`).
- **Card — quote.** Transparent fill, no border, large left bar
  `--coral` 3 px, italic body, attribution in caption style.

Internal anatomy follows the existing pattern: optional small-caps
label (in `--coral` or `--ink-mute`), optional italic subtitle, title,
body, optional in-card rule, optional italic closing tagline.

### 4.4 Figure container

Critical for "drop existing SVGs in without recolouring".

A figure container is a bounded panel that frames any SVG (or image) with
caption, source, and optional controls. It is theme-aware: in default
light mode it sits on `--surface`; if marked `cinema`, it sits on
`--cinema-bg` and the caption switches to `--cinema-ink`.

Anatomy, top to bottom:

1. (Optional) small-caps label, e.g. `FIGURE 7.1 · GOVERNANCE GAP`,
   colour `--ink-mute`.
2. The figure itself, full container width, with `max-height: 80vh` on
   tall figures, scrollable inside the frame.
3. Caption (italic Plex Sans, `--ink-soft` light / `--cinema-ink` dark).
4. Source line (Plex Mono 12 px, `--ink-mute`).
5. Optional toolbar: download SVG, copy link, fullscreen.

Existing SVGs paste into slot 2 unchanged. The frame doesn't impose any
colour on the SVG.

### 4.5 Hero block

Two patterns:

- **Concept hero (light).** Display 1 heading (GFS Neohellenic 700,
  often Greek), italic Plex Sans tagline below in `--coral-deep`,
  optional small-caps section label above. No background image; rely on
  type.
- **Media hero (cinema).** Full-bleed video or looping animation behind a
  semantic overlay; heading sits at left bottom or centred, in
  `--cinema-ink`; tagline in `--cinema-accent` italic.

### 4.6 Video player

A bespoke skin around HTML5 video. Dark cinema chrome.

- Container: `--cinema-bg`, `--radius-xl`, full-bleed in reader mode.
- Controls: play / pause, scrubber, time, chapter markers, captions
  toggle, transcript toggle (slides down a transcript panel beneath the
  video), fullscreen.
- Chapter markers: small `--cinema-accent` ticks on the scrubber; chapter
  title appears above the scrubber at the current point.
- Captions: 18 px Plex Sans, `--cinema-ink`, semi-opaque `--cinema-bg`
  pill background, bottom centre, never overlapping controls.
- Transcript: 14.5 px Plex Sans, two columns on lg+, line numbers in Plex
  Mono 12 px `--cinema-mute`.

### 4.7 Animation container

For short scripted SVG / Lottie / WebGL animations.

- Container: `--cinema-bg`, `--radius-lg`, default 16:9.
- Header (above): small-caps title + duration in Plex Mono.
- Body: the animation. Always with replay control (icon, top right).
- Footer (below): one-line italic caption.
- Behaviour: autoplay on intersection (visible >50% for >400 ms), pause
  off-screen, replay on click. `prefers-reduced-motion` shows a static
  poster instead and reveals a "play once" button.

### 4.8 Questionnaire kit

The defining capability of the site. All questionnaire components live in
reference mode by default.

**Question container** — wraps every question. Has:

- Question number (`Question 4 of 12`) in Plex Mono 12 px `--ink-mute`.
- Question text (h3 in reference mode).
- Optional supporting italic descriptor below.
- Field area.
- Optional "skip" / "save and return" inline action.
- Validation slot at the bottom.

**Field types**

- **Likert 5-point and 7-point scale.** A horizontal row of pill buttons.
  Selected pill: `--coral` background, white text. Endpoints labelled in
  Plex Mono 12 px `--ink-mute`. Mobile: stacks vertically.
- **Single-select chips.** Pill row, multi-line wrap. Selected: `--coral`
  fill.
- **Multi-select chips.** Same, but with a small check icon when
  selected.
- **Open text.** Standard textarea with character counter top-right, hint
  text below, optional spell-check toggle.
- **Slider.** 4 px track, 18 px thumb in `--coral`, value bubble in Plex
  Mono above the thumb.
- **Matrix.** Rows = items, columns = scale. First column sticky on
  horizontal scroll. Compact mode uses smaller chips.
- **Ranking.** Drag-to-order list, with a numeric badge for each.
  Keyboard accessible: up/down arrows reorder; screen reader announces
  position.

**Multi-step questionnaire**

- Linear progress bar at top (height 2 px, fill `--coral`, track
  `--border-soft`).
- Step header: `Step 2 of 5 · Demographics` in Plex Mono 12 px.
- Step body: question containers stacked.
- Step nav: secondary "Back", primary "Continue". On the last step,
  primary becomes "Submit".
- Save-and-resume: a quiet inline link `Save my answers and come back
  later` opens a modal asking for an email; replies with a one-time
  resume link.
- Validation runs on Continue, not on blur. Errors anchor focus to the
  first invalid field.

**Submission confirmation**

A full-width hero in reader mode: Display 2 thank-you heading (Greek),
italic Plex Sans tagline ("Η συνεισφορά σου ενισχύει την έρευνα.
Your contribution strengthens the research."), one CTA back to a
relevant chapter, optional "share this thesis" inline.

### 4.9 Navigation

- **Top nav:** 64 px tall, `--surface`, sticky, with a `--border-soft`
  hairline at the bottom of the row. After the page scrolls past
  hero, `--elev-sticky` shadow appears beneath the hairline.

  Items sit on the same baseline; each item gets a 2.5 px bottom
  indicator slot that overlaps the row hairline (negative `-0.5px`
  margin-bottom on each item so the indicator absorbs the hairline,
  not stacks on it).

  **Inactive item.** `--ink-soft` text, weight 400, transparent 2.5 px
  bottom indicator.

  **Hover item.** `--ink-strong` text, indicator becomes
  `--border-strong` 2.5 px.

  **Active item.** `--coral` text, weight 500, indicator
  `--coral` 2.5 px. The active item is the only one in coral on the
  entire chrome; everything else is muted. The contrast must be the
  loudest signal in the top bar.

  The logo cluster (logo circle + thesis short title) is always the
  first item; it carries the active indicator when the user is on a
  thesis-root page (`/`).

- **Chapter nav:** secondary 40 px bar below top nav on chapter pages.
  Lists chapter sections horizontally; current section uses the same
  active-state recipe as top nav (coral text + 2 px coral underline).
- **In-page TOC:** right rail, sticky, lg+. Items are Plex Sans 13 px
  `--ink-soft`; active item `--coral` with a 2 px left border.
- **Breadcrumb (page level):** Plex Mono 12 px, sits *under* the top
  nav with `--space-3` top padding. Format:
  `Διατριβή · Κεφάλαιο 7 · Ορατότητα και αφάνεια`. All segments are
  `--ink-mute` except the final (current) segment, which is `--coral`.
  Separator dots are `--ink-faint`. Replaces the slide-deck breadcrumb
  conceptually but is text-only and content-driven.
- **Language toggle:** segmented control top-right of top nav. Two
  options: `Ελ` / `EN`. Default `Ελ`. Active option: `--coral` fill,
  `#FFFFFF` text, weight 500. Inactive option: transparent fill,
  `--ink-mute` text.

### 4.10 Quote, footnote, citation

Long-form pages need real citation grammar.

- **Pull-quote.** See Card — quote.
- **Block quote.** Italic body, indented `--space-4`, no marks.
- **Inline citation.** Plex Mono 12 px superscript number; click reveals
  the footnote.
- **Footnote / sidenote.** On lg+, footnotes render as sidenotes in the
  right margin (Plex Sans 13 px italic). On md and below, they collapse;
  the superscript opens an inline accordion.
- **Bibliography entry.** Hanging indent, Plex Sans 14.5 px, year in Plex
  Mono. Use a consistent style (Chicago author-date is recommended given
  the field).

### 4.11 Inline alerts and toasts

- **Inline alert.** A flat panel with a 2 px left bar in the semantic
  colour. Title bold, body 14.5 px. No icon by default; use one if it
  improves comprehension.
- **Toast.** Appears bottom-right, slides up 8 px with `--dur-base`, auto-
  dismisses in 6 s, manually dismissible. Used for save confirmations,
  questionnaire autosave, share-link copied.

### 4.12 Loading and empty states

- **Skeleton.** Light grey blocks (`--border-soft`), pulsing opacity
  between 0.6 and 1 at `--dur-deep` `--ease-in-out`. Disabled under
  reduced motion (static).
- **Empty state.** Centred, vertically. Plex Sans italic 15 px in
  `--ink-soft`, optional secondary action ghost button.
- **Error state.** Inline alert variant.

---

## 5. Voice and content patterns

The voice rests on three habits the existing slide system already
practises and one new one.

1. **Italic tagline as the page's central claim.** Keep this. Every
   concept page has one italic Plex Sans line, centred, in
   `--coral-deep`, near the top. Single line where possible.
2. **Small-caps section labels.** Keep this. Plex Sans Medium, +1.5pt
   letter-spacing, `--coral` for locus / found-here labels, `--ink-mute`
   for descriptive labels.
3. **Italic closing tagline.** Keep this. Near the bottom of a page,
   often pointing forward to the next chapter.
4. **New: invitational closings.** On every concept page that has a
   matching questionnaire, end with a single sentence that invites the
   reader to react. Example: *"Έχετε δει αυτό στην πράξη; Πείτε μας."*
   linked to the relevant questionnaire step.

**Bilingual labelling.** Where both languages co-exist on a page, Greek
goes first, then English in a smaller secondary style (italic Plex Sans,
`--ink-soft`, one step smaller). Never mid-sentence parentheticals as the
default — that pattern is reserved for glossary entries.

**Sentence case everywhere** including buttons, nav, section labels
content (the labels themselves render in small-caps via CSS, but the
underlying text is sentence case so screen readers don't read them as
shouting).

---

## 6. Accessibility

Non-negotiable, codified at the token level.

- **Contrast.** All body text meets WCAG AA at minimum (4.5:1).
  `--ink` on `--page` = 12.4:1. `--ink-soft` on `--page` = 6.7:1.
  `--ink-mute` on `--page` = 4.7:1 (use only at 13 px+).
  `--coral` on `--surface` = 4.9:1 (passes AA for normal body, pass AAA
  only at 18 px+).
- **Focus visible.** 3 px `--focus-ring`, 2 px offset, on all focusable
  elements. Never removed.
- **Hit target.** Minimum 44 × 44 px on touch.
- **Keyboard.** All interactive components reachable via Tab; ranking and
  matrix questions support arrow keys; modals trap focus and restore it
  on close.
- **Screen reader.** Every figure container has an SVG-internal `<title>`
  + `<desc>`, and a redundant caption. Form fields have associated
  `<label>`s. Live regions announce save confirmations and step changes.
- **`lang` attribute.** Page-level `lang="el"`; inline English uses
  `<span lang="en">…</span>`.
- **Reduced motion.** Honoured globally (see 1.5).

---

## 7. How the existing materials map in

| Existing artefact                                | Lands as…                                                       |
| ------------------------------------------------ | --------------------------------------------------------------- |
| `phd_main.css` (Mermaid theme)                   | Kept for SVG / Mermaid embeds. Tokens map to the legacy palette.|
| `mermaid diagram.mmd` + PNG                      | Drops into a Figure container, light variant.                   |
| `figure_7_1_nested_governance_gap_v6.svg`        | Figure container, light. Caption + source provided around it.   |
| `figure_8_2_pvacf_lifecycle_detail.svg`          | Figure container, light.                                        |
| `slide18A_gpai_threshold_loop.svg`               | Figure container, light. Already uses Noto Sans Greek.          |
| `Papadopoulos_PhD_defense_v5.pptx`               | Source of chapter narratives. Not embedded; reused as content.  |
| `logos/` family                                  | Top-nav logo: `logo_sfiga_uof_aegean_el.svg` at 32 px height,   |
|                                                  | swap to `…-en.svg` when language is EN. Favicon: `sfiga.svg`.   |
| `design_system_presentation.txt`                 | Reference for slide-only outputs; web design system supersedes  |
|                                                  | it for the website itself.                                      |

**Slide chrome that does NOT carry over to the web:** master title
separator, footer rule, slide breadcrumb, sphinx mark on every slide,
auto page number. The web replaces these with top nav, in-page TOC,
chapter bar, footer.

---

## 8. Open decisions

Before this becomes v1, the following decisions need a yes/no:

1. **Citation style.** Chicago author-date recommended given public
   administration norms; APA is the other plausible choice.
2. **Save-and-resume mechanism.** Email link vs. browser-only? Email is
   warmer but introduces GDPR considerations for an EU-hosted site.
3. **Questionnaire data destination.** Self-hosted Postgres? Airtable?
   Google Forms backend? Choice affects export and analysis.
4. **Logo wordmark colour.** Logos in the folder are currently
   `--coral`-coloured; do we keep them coloured in the top nav, or
   monochrome them down to `--ink` for a quieter chrome?
5. **Author photo + bio block.** Where in the chrome — footer only, or
   also "About" page?
6. **Print stylesheet.** A clean print stylesheet (for visitors who want
   to read a chapter offline) is cheap to add but currently undefined.
7. **Search.** Local lunr.js index for the whole site, or skip search
   and rely on TOC?

---

## 9. Component checklist for build

Not exhaustive, but enough to start. Items grouped by build dependency.

Foundations to wire up first: colour tokens (light + cinema), type
families loaded + scale, spacing scale, radius scale, motion tokens,
focus ring, two-mode body class, container widths.

Layout primitives next: top nav, chapter bar, in-page TOC, footer,
language toggle, breadcrumb.

Content primitives: hero (light + cinema), section header (label + h2 +
italic descriptor), pull-quote, footnote / sidenote, citation, figure
container (light + cinema), animation container, video player.

Cards: default, locus, inherited, categorical (purple / teal / coral-
tint), quote.

Forms: button, text input, textarea, select, checkbox, radio, toggle,
slider, validation, focus, disabled, helper text.

Questionnaire kit: question container, Likert 5/7, single-select chips,
multi-select chips, open text, slider, matrix, ranking, multi-step shell,
progress bar, step nav, submission confirmation, save-and-resume modal.

Feedback: inline alert, toast, skeleton, empty state, error state.

---

## 10. Versioning

This file is `DESIGN.md` v0.3. Future revisions stamp here:

- v0.3 — formalised `--sage-deep` (`#2A4D3D`) as a first-class token
  alongside `--coral-deep` / `--saffron-deep` / `--cobalt-deep`, so the
  four-register category encoding now has a uniform deep-stop story for
  body-safe text on tints. No visual change; tidies an asymmetry the
  C-9 expert-validation platform's stylesheet had already taken on.
- v0.2 — strengthened top-nav active state (coral text + 2.5px coral
  underline absorbing the row hairline); added explicit breadcrumb
  recipe under the nav; added two vivid accents (Saffron `#E0A030`,
  Cobalt `#2B5BD9`) with tint and deep stops; introduced the four-
  register category encoding (Finding / Method / Data / Voice).
- v0.1 — initial draft, hybrid of Scholarly Reader + Documentary
  Editorial + Quiet Interface; based on the existing slide design system
  reference and the Greek-primary, two-reading-mode brief.
