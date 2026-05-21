# 0005 — Playwright runs with workers: 1 (no parallel)

- **Status:** Accepted · 2026-05-21
- **Touches:** `playwright.config.ts`

## Context

The E2E suite has 39 tests. With Playwright's default `fullyParallel: true` + auto-detected workers (3 on this machine), the first run had **35 of 39 tests timeout on `page.goto`** — the Vite dev server (used as the `webServer`) couldn't keep up with three concurrent navigations doing on-the-fly TS transpile and bundle re-evaluation per request. With `workers: 1`, all 39 tests pass cleanly in ~75 s.

The temptation will be to revert to `fullyParallel: true` because "parallel tests are faster". They aren't, in this setup — they're a flaky 4-minute run with one in ten passes vs. a green 75-second sequential run.

## Decision

`playwright.config.ts` pins `fullyParallel: false` and `workers: 1`:

```ts
fullyParallel: false,
workers: 1,
```

Comment in the file calls it out: "Vite dev server can struggle with parallel page loads; keep workers low."

## Alternatives considered

- **Spin up `vite preview` (built bundle) as the webServer instead of `vite`.** Built assets serve in microseconds; parallel would work fine. But `webServer.command` would have to `npm run build && vite preview --port 5173 --strictPort`, which adds 1–2 s build time to every test session and breaks the "edit code, run E2E, see result" cycle (the dev server doesn't pick up changes when preview is what's serving). Net not worth it for now.
- **Restart the dev server between tests.** Slow and adds new failure modes.
- **`workers: 2`.** Tried — still flaky on cluster-3 screens (the AST web component is heavy). 1 is the safe number.

## Consequences

- **E2E suite runs ~75 s end-to-end** (a tolerable cost for 39 tests).
- **CI should keep `workers: 1`.** No `CI` branch in the config currently; the same value applies everywhere.
- **If we later switch to a `vite preview` webServer**, parallel becomes feasible and this ADR can be marked Superseded. Until then, keep it sequential.
- **Re-running a single spec** (`npx playwright test e2e/f1-gate.spec.ts`) is fast regardless of this setting because there are only 3 tests in that file.
