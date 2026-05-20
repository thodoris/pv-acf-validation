# Screen 23 C3-ciw Updates

_Started 2026-05-17 11:27 UTC_

---

## User

I have instructions for changes in screen 23 C3-ciw. Read them and ask if you have any doubts. Then proceed and update the screen.

## Assistant

_[tool: list_files]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

I have a complete picture of the structure. Let me check the relevant CSS so the new card and table styles fit.

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

I have everything I need. The instructions are clear — I don't have any doubts. Let me summarize what I understand before applying:

- **Scope:** screen 23 (CIW / `c3-ciw`) only.
- **Changes 1–2 + 6–7:** data-only edits in `content.js` (stage, tagline, Q.1/Q.2 subtitles).
- **Change 3:** new "Instrument at a glance" card between tagline and the inst-panel.
- **Change 4:** rename panel kicker, drop the "Claimed contribution" line, drop the embedded P7 callout, swap the 4-col table for the new 5-col Flow-#/Description/Before/After/Verdict structure, replace caption.
- **Change 5:** the right-rail MATURITY card — rename kind-label to `MATURITY`, drop the `CIW maturity claim (P7)` sub-heading, replace body (bold first line + new paragraph).

These changes will be CIW-only (other instruments untouched). I'll also note that I will create original styling consistent with your existing system — no copyrighted/branded UI is involved here.

Let me apply.Now update the InstrumentScreen + CIW representation in screens-templates.jsx:

_[tool: str_replace_edit]_

Now replace the CIW representation table with the new 5-column structure:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now update the right-rail MATURITY card in `app.jsx` for CIW and add label-override support in `shell.jsx`:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now add styles for the new "Instrument at a glance" card and the CIW 5-column flow table. Let me append them to `styles-phase-a.css`:

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: show_html]_

_[tool: fork_verifier_agent]_

Applied the seven changes to screen 23 (CIW) only. Summary:

- **content.js** — stage → "Stage 2 · Design & Procurement"; tagline shortened; new `glance` data; new `flows` data (F1/F2/F3, five labelled parameters); Q.1 + Q.2 subtitles updated.
- **screens-templates.jsx** — new `INSTRUMENT AT A GLANCE` card between tagline and panel; panel kicker → "How the instrument works"; "Claimed contribution." line and embedded P7 callout removed (CIW only); CIW representation rewritten as the 5-column table with per-cell five-line parameter renderer.
- **app.jsx** — CIW maturity rail card: `labelOverride: "Maturity"`, sub-heading dropped, body opens with bold "High operational maturity · light set-up work".
- **shell.jsx** — `AffordanceCard` now honours `labelOverride`.
- **styles-phase-a.css** — styles for `.inst-glance` and `.inst-rep__table--ciw` / `.ci-params`.

All four other instrument screens (AST, DMA, CPD) are untouched.

## User

Verifier agent check completed

## Assistant

All nine changes verified clean on screen 23, and sibling instruments (AST, DMA, CPD) remain untouched as required. No console errors.

## User

Instructions for next screen c3-ast.

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Apply mirrored changes for AST. I'll generalize the CIW-only conditionals to trigger on any instrument carrying the new `glance` data so I don't have to keep duplicating per-code branches.Now update the AST entry in content.js and the AST representation block (architecture A2 label, caption):

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Applied. Mirrored the CIW pattern for AST and generalised the per-instrument switch onto presence of `inst.glance` so future instrument upgrades just need to add `glance` data. No console errors; verifier running.

## User

Verifier agent check completed

## Assistant

Confirmed clean — all AST changes applied correctly, and CIW / DMA / CPD remain as expected.

## User

instructions for the next screen c3-dma.

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

DMA updated. Verifier running.

## User

Verifier agent check completed

## Assistant

Confirmed clean for screen 25 (DMA), and CIW / AST still pass while CPD remains unchanged.

## User

instruction for next screen c3-cpd :

## Assistant

_[tool: str_replace_edit]_

Now update the CPD representation table in screens-templates.jsx (column header, six row values, caption):

_[tool: str_replace_edit]_

Now update the CPD "Why so much is deliberately left open" body in app.jsx:

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

CPD updated; verifier running.

## User

Verifier agent check completed

## User

refresh print.html

## Assistant

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: run_script]_

Bumping cache-bust versions in both index.html and print.html so the latest CSS and JS load on refresh:

_[tool: done]_

Bumped CSS to `?v=15` and JS to `?v=31` across both `index.html` and `print.html` so refreshes pick up the latest CIW/AST/DMA/CPD edits. No console errors.

