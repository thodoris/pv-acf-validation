# I'm ready to help, but I don't see the instructions pasted in your message. Could you please share the instructions for c3-setup1

_Started 2026-05-17 20:38 UTC_

---

## User

I paste instructions for 2 new grounding screens c3-setup1 & c3-setup2 which are replacing the current c3 grounding screen (c3-setup). 

Read the instructions and tell me if everything is clear. Then proceed with the implementation.

## Assistant

_[tool: read_file]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: update_todos]_

Yes — the instructions are clear and richly detailed. Quick acknowledgement and a few small notes before I start:

**Clear:**
- Two new screens replace the single `c3-setup` (becoming `c3-setup1` "How to read an instrument here" + `c3-setup2` "What you will inspect").
- Mirror the existing two-screen pattern from Cluster 1 (`c1-setup1`/`c1-setup2`) and Cluster 2 (`c2-setup1`/`c2-setup2`): empty right rail, no question, `Continue` → `Begin the instruments`.
- New `instrument-reading-diagram-v1` — vertical three-tier (FRAMEWORK SPECIFIES → INSTITUTION CONFIGURES → YOU JUDGE), optional staggered build, sibling in form to the cluster 1/2 diagrams but distinct shape (vertical, not horizontal/lifecycle).
- Screen 2 builds a stage-grouped 2×2 instrument grid (CIW/AST in Stage 2, DMA/CPD in Stage 3) with badges + one-line function descriptions, three small italic notes, the register callout, the preserved `"Distinctive analytical work…"` callout, the four-item enumeration (now `2 RATINGS + SHARED REQUIRED OPEN`), and the closing italic line.

**Notes I'll act on without blocking:**
- I'll override the `clusterPreview("instruments")` tag locally for the new screen 2 (like cluster-1's Q1.4 override) so it shows `2 RATINGS + SHARED REQUIRED OPEN` rather than the existing `Stage 2 · … · 2 questions per instrument`. Leaving the registry's existing tag untouched in case anything else uses it.
- Keeping `CONTENT.clusters.instruments` in `content.js` in place but unused on the wired path — the new screens carry their own copy. Cleaner than ripping the block out, given how often you may want to compare wording.

Proceeding now.

_[tool: read_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now wire the screens into app.jsx — replace the single `c3-setup` SCREENS entry with two new ones, update progress/time maps, and add the new kinds to NavBar.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: grep]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: grep]_

_[tool: update_todos]_

_[tool: grep]_

_[tool: grep]_

All clean. Calling done and forking the verifier to check the new screens render.

_[tool: done]_

_[tool: fork_verifier_agent]_

Implementation complete. Both new screens are wired in, replacing the single `c3-setup`:

- **`c3-setup1` — "How to read an instrument here"** — lede + new `instrument-reading-diagram-v1` (vertical three-tier, optional staggered build, honours reduced motion) + italic caption + maturity-card paragraph.
- **`c3-setup2` — "What you will inspect"** — lede + stage-grouped 2×2 instrument grid (CIW/AST under Stage 2, DMA/CPD under Stage 3, with badges + one-line function descriptions) + three small italic notes + register callout + preserved "Distinctive analytical work…" load-bearing callout + four-item enumeration tagged `2 RATINGS + SHARED REQUIRED OPEN` + closing italic line.

**Files touched:**
- `diagrams/instrument-reading-diagram.jsx` (new) — `window.InstrumentReadingDiagram`, alt-text covers all three propositions + flow direction
- `screens-instruments-setup.jsx` (new) — `InstrumentsSetup1` / `InstrumentsSetup2`, with a local `2 RATINGS + SHARED REQUIRED OPEN` tag override on the existing `clusterPreview` index
- `styles-phase-a.css` — appended `.ird-caption`, `.instgrid*`, `.instnotes*`, `.loadbear-callout`, `.closing-italic`
- `app.jsx` — `c3-setup1`/`c3-setup2` SCREENS entries (replaces `c3-setup`), `PROGRESS_MAP`/`TIME_MAP` split, dispatcher + NavBar kinds
- `index.html` / `print.html` — script tag for the new files, cache bust v33/v16, print mounts renumbered (22 + 23 → CIW now 24, etc.)

Right rails are empty on both screens, footer note is *"Introductory setup · not a graded screen"*, advance label on screen 2 is `Begin the instruments`. Old `CONTENT.clusters.instruments` block left in place (unused on the wired path) for easy wording comparison.

Verifier is checking the two screens now and will report back.

