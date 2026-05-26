# 0013 — Rebalance the close-phase weight after the c4-setup merge

- **Status:** Accepted · 2026-05-26
- **Touches:** `src/lib/duration.ts` (PHASE_WEIGHTS.close)
- **Supersedes (in part):** [ADR 0012](./0012-derived-duration-and-progress.md) — the `close: 5` line specifically.

## Context

[ADR 0011](./0011-cluster-4-merge.md) merged `c4-setup` into `c4-close`, dropping the spine from 32 to 31 screens. [ADR 0012](./0012-derived-duration-and-progress.md), which landed the same day, set `PHASE_WEIGHTS.close = 5` to mirror the prototype's existing welcome time-bar `flex` values. At the time, the `close` phase was a two-screen budget (c4-setup + c4-close) sharing that weight.

After the merge, `phaseFor` routes only `c4-close` into the `close` phase (interview / submit / thanks fall into `post`), so the entire weight of 5 lands on a single screen. With a total weight of 51, c4-close was consuming `5/51 ≈ 9.8%` of progress — visibly larger than any other single screen:

- A c1 question screen: `10/8 ÷ 51 ≈ 2.4%`
- A c2 question screen: `15/8 ÷ 51 ≈ 3.7%`
- A c3 instrument screen: `15/6 ÷ 51 ≈ 4.9%`

Reviewer-observable symptom: the progress bar reads 88% at the start of `c4-close` and jumps to 98% at the start of `submit`. A 10-point jump for one screen with a required catch-all + an optional flag is heavier than the screen's actual effort.

## Decision

`PHASE_WEIGHTS.close` drops from **5 to 3**. New shape:

```ts
PHASE_WEIGHTS = {
  pre: 1, profile: 1, grounding: 3,
  problem: 10, framework: 15, instruments: 15,
  close: 3, post: 1,
};
// Total weight = 49 (was 51)
```

Effects:

- **c4-close share:** `3/49 ≈ 6.1%` (was 9.8%). Progress reads ~92% at start of c4-close and ~98% at start of submit — a 6-point jump, in line with a c3 instrument screen.
- **Welcome time-bar Close segment** narrows proportionally (`flex: 3` instead of `flex: 5`); the saffron Close band on the welcome meta-card is visibly smaller, again matching the per-screen reality.
- **Phase minutes** (rounded): SHORT close ~2 min (was 3), FULL close ~3 min (was 4). Per-phase rounding still sums to within ±1 of the variant total — the existing tolerance test (`|sum - total| ≤ 2`) still holds.

All other phase shares grow slightly because the denominator shrank (`51 → 49`), so every prior screen's percent ticks up by a fraction of a point. Tests that pin formula contracts (endpoints, monotonicity, integer-ness) are unaffected; no test was hard-coded to the specific c4-close percentage.

## Alternatives considered

- **Move `interview` into the `close` phase too**, so `close = 5` splits between c4-close + interview under FULL and lands on c4-close alone under SHORT. Rejected — leaves SHORT's c4-close at 9.8% (the original complaint) and creates a variant-specific weight allocation, which is harder to reason about than a single number tweak.
- **Leave `close = 5`.** Defensible on the grounds that q4.1 is the load-bearing catch-all for the thesis and visual prominence reflects analytical weight. Rejected — the progress bar is a UX time-remaining signal, not an editorial cue. Overweighting one screen makes the bar's pace feel uneven in the closing stretch.
- **Drop to `close = 2`.** Tested — gives a 4.1% share (jump 92 → 96). Slightly under-weights a screen that does ask for a substantive open response. `3` lands closer to the c3 instrument screens, which are the right comp.

## Consequences

- **Test suite:** all 210 tests still pass. `phaseMinutesFor` rounding-sum tolerance test (`|sum - total| ≤ 2`) confirmed by hand: SHORT sums to 36 vs total 35 (Δ=1), FULL sums to 46 vs total 45 (Δ=1).
- **Welcome time bar:** Close segment width drops from `5/48` (visible-phase share) to `3/46`. Visually the change is subtle.
- **No follow-up needed in `progress.ts`.** `totalWeightFor` reads `PHASE_WEIGHTS` live, so the per-screen percent recomputes automatically.
- **ADR 0012's `PHASE_WEIGHTS` snippet is now stale** as a literal source. Left as historical record; this ADR is the current value.

## Verification

- Unit: `npm test` — 210/210 pass.
- TypeScript: `npx tsc --noEmit` — clean.
- Manual / preview: SHORT path c3-cpd → c4-close → submit reads ~89 / ~92 / ~98 on the top bar (was 86 / 88 / 98). FULL likewise lands c4-close at ~92% rather than ~88%.
