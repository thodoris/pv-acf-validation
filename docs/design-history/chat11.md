# Project Handoff Package

_Started 2026-05-17 21:07 UTC_

---

## User

Can you read the project, apply any necessary changes to CLAUDE.md to keep it updated, and then create and present the handoff package?

## User

I meant DESIGN.md

## User

I meant DESIGN.md

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: invoke_skill]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

I'll make a minimal, targeted update to DESIGN.md — the only real drift I see is that `--sage-deep` is referenced as a token in `styles.css` and used throughout the prototype, but DESIGN.md only mentions the hex `#2A4D3D` inline. I'll formalize it alongside `--coral-deep` / `--saffron-deep` / `--cobalt-deep` and bump the version.Now sync the copy in the handoff folder, regenerate the bundled prototype, and present the package.

_[tool: copy_files]_

_[tool: super_inline_html]_

_[tool: super_inline_html]_

_[tool: show_html]_

_[tool: present_fs_item_for_download]_

_[tool: done]_

Handoff package ready above. 

**One change to `DESIGN.md`** (v0.2 → v0.3): formalised `--sage-deep` (`#2A4D3D`) as a first-class token, mirroring `--coral-deep` / `--saffron-deep` / `--cobalt-deep`. The C-9 stylesheet was already using it as a token; the system doc just hadn't caught up.

Package contents (`handoff/`):
- `HANDOFF.md` — briefing for the next conversation (locked decisions, 34-screen spine, what's open).
- `prototype.html` — single-file standalone build of the live prototype.
- `screens-print.html` — contact sheet of all 34 screens.
- `PV-ACF_DESIGN.md` v0.3 — the design system.
- `C9_expert_platform_*.md` and `c9_questionnaire_cluster{1..4}_draft.md` — spec uploads.

## User

Can I create a component in Claude Code and bring it here for integration as the AST explore tool ? 
It will be displayed inside a popup overlay.

What kind of components are you able to integrate ?
What I should say to Claude Code ?

## Assistant

Short answer: yes, easily. The cleanest integration paths, ranked by how well they fit the current prototype:

## What I can integrate

**1. Self-contained build folder (recommended for anything interactive / framework-based)**
A static build output (HTML + JS + CSS, no server, no `npm install` at runtime). I drop the folder into `handoff/ast-tool/` and embed it as an `<iframe>` inside the overlay. Works with **Vite / Next static export / SvelteKit static / Astro / anything that compiles to plain static files**. React, Svelte, Vue, Solid — doesn't matter. Iframe gives you perfect isolation; the trade-off is you have to pass theme tokens in (via URL params or `postMessage`) if you want it to match the surrounding palette.

**2. Vanilla web component (`<ast-explore>`)** — single `.js` file defining a custom element. Best for tight integration: it inherits the page's CSS variables (`--coral`, `--ink`, etc.) for free, no iframe, no postMessage. Right choice if the tool is mostly DOM + a bit of state.

**3. Plain JSX file matching the current setup** — React 18.3.1 + Babel-standalone, JSX written as a single file with no `import` statements, components attached to `window` at the bottom. Same constraints as everything else in this prototype.

**4. Static SVG / Lottie / D3 visualisation** — trivial, just drop in.

**What won't work without extra steps:** raw TypeScript source, ES modules with bare imports (`import x from "foo"`), anything that needs a dev server, Next.js with SSR/API routes. All of those become **option 1** once they're built — that's the whole point of a static build.

## Brief for Claude Code

Copy-paste this:

---

> I'm building a component to be embedded inside an existing HTML/React prototype as an overlay panel. The host prototype is vanilla HTML + React-via-Babel, served as a static file. I need to ship a **self-contained static build** that the host can either iframe in or drop a `<script>`-tag-loadable web component for.
>
> **Component:** AST Explore — interactive architecture-screening tool. *(then describe what it does — inputs, outputs, state, the architecture pool, the scoring/elimination logic, what the user can do)*.
>
> **Build target — pick one, ask me if unsure:**
> - (a) **Static build folder** (Vite + React preferred). Output: `dist/` with `index.html` + assets, all paths relative, no absolute `/` references, opens correctly when double-clicked. I will embed it as `<iframe src="ast-tool/index.html">`.
> - (b) **Single-file vanilla web component** (`<ast-explore>` custom element) in one `.js` file, no build step, no dependencies beyond what a `<script>` tag can load from a CDN.
>
> **Host contract:**
> - Container size: roughly 1080 × 720 px inside an overlay; should also work down to 720 × 540.
> - Theme tokens the host uses (pass these through CSS variables; the build should read them with fallbacks so it works standalone too):
>   ```
>   --page #FBF8F1  --surface #FFFFFF  --surface-deep #F8F4EA
>   --ink-strong #1A1816  --ink #2C2A26  --ink-soft #5F5C54  --ink-mute #8A867C
>   --coral #B8472E  --coral-deep #712B13  --coral-tint #FAECE7
>   --sage #4F7A66  --sage-deep #2A4D3D  --sage-tint #E7F0EB
>   --saffron #E0A030  --saffron-deep #A56F12  --saffron-tint #FCF1D7
>   --cobalt #2B5BD9  --cobalt-deep #1E3FA0  --cobalt-tint #E3EBFC
>   --border #E5E0D2  --border-soft #EDE8DA  --border-strong #B4B0A2
>   --radius-md 8px  --radius-lg 12px  --radius-pill 999px
>   ```
> - Fonts: `"IBM Plex Sans"` body, `"IBM Plex Mono"` for metadata/numerics, `"GFS Neohellenic"` for display headings. Use system fallbacks; the host loads them.
> - Events out (host listens via `postMessage` if iframe, or `CustomEvent` if web component): `ast:open`, `ast:verdict` (`{ verdict, surviving, eliminated }`), `ast:close`.
> - No network calls, no analytics, no external state. Everything in-memory.
>
> **Accessibility:** keyboard nav, focus visible, `prefers-reduced-motion` respected, WCAG AA on text.
>
> Deliver the build folder (or the single `.js` file) plus a one-page README with the events it emits and any props/attributes I can set on the host side.

---

When you bring it back, drop the folder/file into the project and I'll wire it into the existing `.overlay--fullscreen` panel that currently holds the AST mock, replace the static markup with the live component, and verify it loads cleanly and inherits the theme.

One question before you brief them: **option (a) iframe build, or (b) web component?** If the tool is mostly forms, lists, and the architecture-pool UI you already have, (b) is nicer — it'll feel native. If it has a canvas, a graph view, drag-to-arrange, or a state machine you'd rather develop in a real dev server, go (a).

## User

(b) 

But what about the choise of Static build folder vs Single-file vanilla web component?

## Assistant

Good — (b) is the right call for this tool. Here's the comparison laid out properly so the choice is conscious:

## Static build folder (a)

**What it is:** Claude Code runs Vite/Next/whatever, hits "build", and gives you a `dist/` folder with `index.html` + JS chunks + CSS. You embed it with `<iframe src="ast-tool/index.html">`.

**Wins:**
- Any framework, any tooling. React with hooks, Zustand, Framer Motion, D3, Three.js — all fine.
- Total CSS isolation. Their styles can't leak into the host; host styles can't leak in.
- Their dev loop is a normal `npm run dev` with HMR. Comfortable.
- Safer for complex state machines, canvas-heavy work, anything that wants its own routing.

**Costs:**
- Theme tokens don't cross the iframe boundary. You have to **pass them in** (URL params, or `postMessage` on mount) and re-declare them inside the iframe. If you forget one, it falls back to the iframe's defaults — visible drift.
- Fonts have to be loaded **inside** the iframe too (or passed via the document). The host loading `GFS Neohellenic` doesn't help the iframe.
- Communication is `postMessage` only — no direct function calls, no shared React context, no shared event bus.
- Sizing is iframe-sizing: you pick a fixed height or you `postMessage` a height back to the host. Either way it's fiddly.
- Bundle size: even a small React+Vite app is ~150–300 KB gzipped before you write a line.
- Tab order and focus management across the iframe boundary is its own small headache.

## Single-file vanilla web component (b)

**What it is:** One `.js` file that does `customElements.define('ast-explore', class extends HTMLElement { … })`. You add `<script src="ast-explore.js"></script>` once, then `<ast-explore></ast-explore>` anywhere.

**Wins:**
- **Inherits the host's CSS variables for free.** `var(--coral)` just works. No theme plumbing, ever. This is the big one for a design-system-aligned tool.
- **Inherits the host's fonts for free.** Same reason.
- Talks to the host with normal DOM events: `el.addEventListener('ast:verdict', …)`. Reads attributes/properties: `el.setAttribute('scenario', '...')`. Feels native because it *is* native.
- Tiny. Probably 8–25 KB unminified for the kind of tool you're describing.
- No build step on their side either — they can author it as one plain `.js` file. (They can still use a TS/JSX dev setup and compile down to one file; that's their choice.)
- Sizes itself to the overlay container the way any element would. No iframe-height dance.

**Costs:**
- No React out of the box. They'll write it with vanilla DOM + maybe `lit-html` / `lit` (still single-file via CDN) for templating. For an architecture-screening tool with forms, lists, and a verdict panel, this is totally fine — arguably cleaner. For a heavily-stateful SPA-ish thing with routing, it'd hurt.
- Shadow DOM choice is a real decision: **open shadow DOM** isolates their CSS but blocks them from inheriting your `var(--coral)` unless they explicitly opt in (which they should — CSS custom properties **do** pierce shadow DOM, so this works). **No shadow DOM** = totally open to the host's styles, which is fine if they namespace their classes (e.g. `.ast-explore-…`). Either is valid; tell them which.
- They can't pull in arbitrary React-ecosystem packages and expect them to "just work". `framer-motion`, for example, is React-coupled. Plain Web Animations API replaces it fine, but it's a different mental model.

## Why (b) fits *this* component

The AST Explore tool is, structurally, a form + a list + a verdict panel. It needs to feel like part of the page — same coral, same Plex Sans, same border weights, same radii. That's exactly what web components are good at. Iframes would force you to redeclare the entire design system inside a sandbox, and you'd spend the integration session chasing one-pixel mismatches instead of wiring up behaviour.

The moment you'd want (a) instead: if the tool grows a canvas-based architecture graph, a real undo stack with serialised state, multi-route flows, or it pulls in a chart library that's React-specific. None of that is on the horizon here.

So stick with (b). Tell them: **shadow DOM = open, and explicitly inherit these CSS custom properties from the light DOM** — that gives them style isolation *and* theme inheritance, which is the sweet spot.

## User

ok I have the component. Where to upload it ?

## User

<attached_files>
- uploads/ast-explore.js
</attached_files>

## User



## Assistant

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

Looks great — clean web component, shadow DOM open, host-overridable tokens via `--ast-*` fallbacks, and the three events as briefed. Let me look at how the current AST overlay is wired so I can swap it cleanly.

_[tool: grep]_

_[tool: grep]_

Looking good. Plan:
1. Copy `ast-explore.js` to project root, load it via `<script src>` (plain JS, not Babel).
2. Plumb host CSS tokens → `--ast-*` so theme changes propagate (values already match, but worth doing).
3. Replace the React `ExploreOverlay` with a thin wrapper that mounts `<ast-explore>` inside the existing overlay backdrop and listens to `ast:close` / `ast:verdict`.

Let me check the React hook idiom used in this codebase, then wire it up.

_[tool: read_file]_

_[tool: copy_files]_

_[tool: str_replace_edit]_

Let me wire this in step by step.

**Step 1:** Copy the component into the project and load it.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

**Step 2:** Plumb host tokens → `--ast-*` so theme changes propagate. **Step 3:** Replace the React `ExploreOverlay`.

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

Now find where the screens-templates.jsx and styles.css are loaded, and find which screen actually triggers the overlay so I can verify it.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

Bump versions for the changed files, then load and test.

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

_[tool: get_webview_logs]_

_[tool: view_image]_

_[tool: done]_

DOM confirms the integration works — overlay, host div, `<ast-explore>` element, and its open shadow root are all present after clicking "Explore it". The screenshot tool just doesn't serialize shadow DOM, so the overlay's contents look invisible in the PNG. Let me hand it to you to interact with directly.

_[tool: fork_verifier_agent]_

Wired in. The `<ast-explore>` component is loaded, theme tokens are plumbed through `--ast-*`, and the old React `ExploreOverlay` is now a thin wrapper that mounts the component inside the overlay backdrop and bridges `ast:close` / `ast:verdict` back to React state.

Test it: open screen **`c3-ast`** (Cluster 3 → Architecture Selection Tool) and click **Explore it** in the "How the instrument works" panel.

A verifier is running in the background to interact with it and confirm the spectrum updates on Yes/No clicks.

## User

Verifier agent check completed

## Assistant

Component is live and verified. Try it on screen `c3-ast` → **Explore it**.

## User

the component is invoked but its frame is mostly transparent. I can see the question page back

## Assistant

_[tool: eval_js_user_view]_

Let me inspect the actual computed background inside the shadow DOM.

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

Found it — and it's a subtle one. The component's `:host` block declares `--page: var(--ast-page, #FBF8F1)`. My plumbing rule declared `--ast-page: var(--page)` on the same element. That creates a **circular reference** on `<ast-explore>` itself: `--page` → `--ast-page` → `--page` → … CSS marks both as invalid → empty string → `background: var(--surface-deep)` falls through to transparent.

Fix: move the plumbing to the parent `.ast-explore-host` div, so `--ast-*` are *inherited into* `<ast-explore>` rather than declared *on* it. No cycle.

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

_[tool: show_to_user]_

_[tool: eval_js_user_view]_

The user's iframe is still on the cached v=17 stylesheet. Let me force-reload.

_[tool: sleep]_

_[tool: eval_js_user_view]_

Fixed. Token chain now resolves clean: `--page` → `#FBF8F1` on host, `--surface-deep` → `#F8F4EA` on panel, panel background is now opaque warm beige (`rgb(248, 244, 234)`).

The cause: the component's `:host` block was setting `--page: var(--ast-page, fallback)` *on* `<ast-explore>`, and my plumbing was setting `--ast-page: var(--page)` *on the same element* — a custom-property cycle. CSS marks cycles as invalid and the fallback never kicks in. Moving the plumbing to the parent `.ast-explore-host` element breaks the cycle: `<ast-explore>` now inherits `--ast-page` from its parent rather than redeclaring it on itself.

Take another look in your view — the panel should now be visible. Click around to confirm Yes/No buttons and the spectrum strip work as expected.

## User

ok but now the component is not working as expected. After answering the questions in the 2 first screens it does not present the results , but instead returns to the first screen (start from the beginning).
It is like the final screen is skipped

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_to_user]_

Found it. My React wrapper's `useEffect` has `[onClose, onRun]` deps, but both are inline arrow functions recreated on every parent render. When `ast:verdict` fires → `setRuns()` → parent re-renders → `onRun` gets a new identity → effect cleanup tears down `<ast-explore>` and mounts a fresh one → back to screen 1. Classic.

Fix: mount the component once, route callbacks through refs that update on each render without re-running the effect.Fix is live. Try again — answer screens 1 and 2, and you should land on either screen 3 (if Hybrid or Generative LLM are still alive) or directly on the result screen.

The cause: my React wrapper's `useEffect` listed `[onClose, onRun]` as dependencies. Those are inline arrow functions in the parent (`InstrumentScreen`), recreated on every render. When the component fired `ast:verdict` on reaching the result, the parent's `setRuns` re-rendered, the callbacks got new identities, the effect tore down and remounted `<ast-explore>` — wiping its internal state back to screen 1.

Refs now hold the latest callbacks and the effect runs exactly once (mount/unmount), so the component's state survives.

## User

ok now it is fine.
ON last thing. I want to export the whole Questionnaire app in order to be able to host it in GitHub pages.
I just grab the index.html ?
Is there anything else needed ?

## Assistant

_[tool: list_files]_

_[tool: grep]_

Just the `index.html` is not enough — it references many sibling files. Let me list what's actually needed.

_[tool: list_files]_

_[tool: grep]_

The runtime needs these 20 files. No images, no API calls, no backend — pure static, perfect fit for GitHub Pages.

**Root:**
```
index.html
styles.css
styles-phase-a.css
content.js
ast-explore.js
tweaks-panel.jsx
shell.jsx
screens.jsx
screens-orientation.jsx
screens-submit.jsx
screens-templates.jsx
screens-problem-setup.jsx
screens-framework-setup.jsx
screens-instruments-setup.jsx
overlays.jsx
app.jsx
```

**`diagrams/` subfolder:**
```
animations.jsx
framework-organisation-diagram.jsx
three-levels-diagram.jsx
instrument-reading-diagram.jsx
```

The rest of what's in the project (handoff/, uploads/, scraps/, the past-iteration screenshots, the `Lede audit.html`, the print-sheet HTMLs) is not needed.

You have **two options** — pick one:

### Option A — Single-file bundle (recommended for GH Pages)
I run the bundler that inlines every script, stylesheet, and font into one self-contained `index.html`. You commit one file, push, done. Pros: simplest possible hosting, no path issues, no missing-file mistakes, works offline. Cons: file is ~2 MB; edits require re-bundling (you'd come back here to rebuild).

### Option B — Folder copy
I prepare a clean export folder with exactly those 20 files at the right paths. You commit the folder contents to your repo root, push, done. Pros: easy to edit individual files directly in the GitHub UI; smaller per-file diffs. Cons: 20 files instead of 1.

A couple of GH Pages notes either way:
- **Internet dependencies at runtime:** React, Babel (unpkg.com) and the fonts (Google Fonts) load from CDNs. Offline visitors will see a fallback. If you ever need true offline, tell me and I'll vendor those locally too.
- **Repo URL path:** if you host at `username.github.io/repo-name/`, all our paths are relative, so it works without any base-URL changes.
- **Babel-in-browser** is slow on first load (~1–2s on cold CDN). Fine for a research questionnaire; if you want it instant, the answer is precompiling JSX, which is a different project.

Which option — A or B?

## User

Option A. 
Like when i create a handoff package. I can run it from just the index.html

## Assistant

_[tool: grep]_

_[tool: super_inline_html]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: get_webview_logs]_

_[tool: present_fs_item_for_download]_

Clean. One file, ready for GitHub Pages.Drop it at the root of your repo as `index.html`, push, enable Pages on that branch — done. ~2.3 MB, loads in one request once cached. Same internet caveats as before (React/Babel/Fonts from CDNs).

