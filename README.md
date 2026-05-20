# PV-ACF Expert Validation Platform

A guided, single-session expert review environment for the **PV-ACF** doctoral thesis framework (Public Value, Anticipatory & Contestable Framework, for AI in public administration).

Invited experts use this platform **once** in a ~75–90 minute session: first oriented to the framework, then asked to judge it. Desktop-only, English UI (reviewers may reply in English or Greek in open text), single-page React + Vite app.

## Layout

- `src/` — production code (Vite + React 18 + TypeScript, Zustand state, vanilla `<ast-explore>` Web Component)
- `docs/` — frozen reference material (see `docs/SOURCE_OF_TRUTH.md`)
- `index.html` — Vite entry
- `package.json`, `vite.config.ts`, `tsconfig.json` — scaffolding

## Source of truth

The **implemented prototype** at `docs/reference-prototype/` is authoritative for behaviour, layout, content, and styling. Where the bundle's design documents (`docs/handoff/`) disagree with the prototype, **the prototype wins**. See `docs/SOURCE_OF_TRUTH.md`.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run test       # Vitest (unit)
npm run e2e        # Playwright (E2E)
npm run lint
```

## Dev-only URL parameters

- `?tweaks=1` — show the Tweaks panel (jump-to-screen, overlay toggles).
- `?v=full` (default) or `?v=short` — questionnaire variant. SHORT is architecturally supported but not currently populated.
- `?s=<screenId>` — deep-link to a specific screen (subject to F1 phase gate).

## Plan + decisions

The build plan is at `C:/Users/thodo/.claude/plans/ok-this-repo-started-floofy-lynx.md` (outside the repo).
