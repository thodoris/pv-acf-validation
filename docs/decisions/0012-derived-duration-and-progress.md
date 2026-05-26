# 0012 — Derived duration + progress from a single constant

- **Status:** Accepted · 2026-05-25
- **Touches:** `src/lib/duration.ts` (new), `src/lib/duration.test.ts` (new), `src/routing/screens.ts` (delete two fields), `src/routing/progress.ts` (rewrite), `src/screens/WelcomeScreen.tsx` (drop CSS variant forks for duration + questions; derive time bar), `src/routing/screens.test.ts`, `src/routing/progress.test.ts`

## Context

The questionnaire's "minutes" and "percent complete" numbers used to live in three places that did not agree:

1. **Per-screen `percentAtStart` + `minutesAtStart`** hand-tuned across every entry of `SCREENS` in `src/routing/screens.ts`. 31 pairs of numbers, with a comment marking them "Hand-tuned by the prototype to reflect uneven effort per screen."
2. **A pair of duplicated `hide-in-short` / `hide-in-full` `<span>`s** on the welcome screen (`WelcomeScreen.tsx`) carrying the literal copy `30–35 minutes` and `45–50 minutes`. The `[data-variant]` CSS lever in `styles-phase-a.css` chose which paint. Same anti-pattern on the Questions-count row (`20` vs `24 + 1 optional`).
3. **A separate set of per-cluster anchor numbers** in the welcome meta-card's "Time, by cluster" tooltips — `Grounding ~3 / Problem ~10 / Framework ~15 / Instruments ~15 / Close ~5`. Hard-coded `flex` and `title` strings; unrelated to either source above.

The three didn't reconcile. `SCREENS[0].minutesAtStart = 50` while the welcome string said `45–50` for FULL; the cluster tooltips summed to 48; the progress helper recomputed percent for SHORT but used the FULL-tuned `minutesAtStart` unchanged. There was no single number to edit and have everything stay consistent.

## Decision

One module — `src/lib/duration.ts` — owns the duration story. Three constants:

```ts
DEFAULT_EST_DURATION_MIN = 35   // SHORT total
FULL_VARIANT_EXTRA_MIN   = 10   // FULL = DEFAULT + EXTRA
WELCOME_SPAN_OFFSET_MIN  = 5    // welcome's "X–Y" upper bound
```

Everything else is derived:

- **Welcome's "X–Y minutes" string** ⇐ `formatDurationRange(variant)` returns `"35–40 minutes"` (SHORT) or `"45–50 minutes"` (FULL).
- **TopBar percent + minutes-left** ⇐ `progressFor(screenId)` walks the variant-effective spine, looks up each screen's phase via `phaseFor`, divides each phase's `PHASE_WEIGHTS` share evenly across the screens visible in that phase, and computes cumulative weight share × total duration. Result rounded to integer. Monotonic by construction (cumulative weight only grows; total weight is constant).
- **Welcome meta-card "Time, by cluster" bar** ⇐ segments and tooltips both read `PHASE_WEIGHTS` and `phaseMinutesFor(phase, variant)`. The five charted phases (grounding/problem/framework/instruments/close) are listed in `TIMEBAR_PHASES`.
- **Welcome meta-card Questions row** ⇐ `formatQuestionCount(variant)` walks the variant-effective spine and counts visible standard + paired-sub + instrument questions, returning `"20"` (SHORT) or `"23 + 1 optional"` (FULL).

The two per-screen `percentAtStart` and `minutesAtStart` fields are removed from the `Screen` type. The 31 hand-tuned pairs in `SCREENS` vanish.

The `hide-in-short` / `hide-in-full` `<span>` pairs on the welcome screen — both the duration row and the Questions-count row — are deleted. The strings are computed once per render from the active variant.

### Phase mapping and weights

```ts
PHASE_WEIGHTS = {
  pre: 1,           // welcome
  profile: 1,
  grounding: 3,
  problem: 10,
  framework: 15,
  instruments: 15,
  close: 5,         // c4-close
  post: 1,          // interview / submit / thanks share this slice
};
```

The shape mirrors the prototype's existing welcome time-bar `flex` values (3/10/15/15/5) so the rail's visual proportions stay consistent. Total weight = 51. Under SHORT (35 min total), each weight unit ≈ 0.686 min; under FULL (45 min total), each ≈ 0.882 min. Per-phase rounded minutes drift by ≤2 min from the total — within rounding tolerance.

Within a phase, the weight is divided evenly across the screens visible in that phase under the active variant. SHORT hides `interview`, so `post` is shared between `submit` and `thanks` (each weight 0.5) rather than three screens (each 0.333). The visible bar accordingly tracks SHORT's slightly tighter post-completion tail.

### Terminal screen special case

`thanks` is the post-submit confirmation. Start-of-screen semantics would land it at 99% (the last screen's own share is still ahead at start-of-screen time). To match user expectation of a "100% / 0 remaining" terminal display, `progressFor('thanks')` short-circuits to `{percent: 100, minutesLeft: 0}`. It's the one terminal special case — the welcome screen's 0% / total-duration lands by formula.

## Alternatives considered

- **Pure linear by position.** No per-phase weights — every screen advances the bar equally. Simplest possible scheme. Rejected — the bar would advance the same amount for a 30-second profile field as for a 3-minute instrument, which would feel wrong on the longer screens.
- **Per-screen `weight` field on `Screen`.** Finest-grained; preserves uneven effort precisely. Rejected — close in maintenance burden to the hand-tuned status quo, just with a different shape. Cluster-level granularity is sufficient and visually equivalent.
- **Attribute the +10 FULL extra to specific phases (e.g. all to `instruments`).** Rejected — the user's spec was a flat `+10`. Distributing it uniformly across all phases via the scaling factor is the simplest interpretation and what `totalDurationFor(variant)` implements.
- **End-of-screen semantics (welcome = total/total minutes; thanks = 100%/0 naturally).** Rejected — flipping welcome to a non-zero percent feels worse than special-casing thanks. The "you start at 0%" UX anchor is more load-bearing than the "thanks shows 100%" anchor.

## Consequences

- **One number to change.** Bumping `DEFAULT_EST_DURATION_MIN` from 35 to 40 ripples through the welcome copy, the top-bar minutes-left on every screen, the cluster tooltips, and the FULL total simultaneously. Same for the +10 FULL offset and the +5 welcome span.
- **Variant changes happen by editing `variants.ts`.** When a new SHORT trim hides additional screens, `progressFor` automatically recomputes per-screen percent and minutes-left against the slimmer spine. No second hand-tuning pass needed.
- **Per-screen percent / minutes-left will differ from the prototype's hand-tuned values.** This is expected and the trade is deliberate. The previous numbers were inconsistent across the three sources; the derived numbers are consistent by construction. Tests pin the formula's contract (endpoints, monotonicity, integer-ness, cluster-level spot-checks), not the specific intermediate values, so future weight or duration tweaks don't require test rewrites.
- **The CLAUDE.md "Locked architectural decisions" table didn't carry a progress/time row.** Not modified.

## Verification

- **Unit**: `npm test -- --run` passes (183 tests). The new `duration.test.ts` covers constants, range, formatter, phase mapping, cumulative-weight monotonicity, question count. The rewritten `progress.test.ts` covers endpoint contracts (welcome=0% / total, thanks=100%/0), integer-ness across every visible screen in both variants, monotonicity, and FULL > SHORT remaining-minutes on the same screen.
- **TypeScript**: `npx tsc --noEmit` clean. Deleting `percentAtStart` + `minutesAtStart` from `Screen` would surface any consumer that read them; none remained.
- **Manual / preview**: load welcome under SHORT — duration row reads "35–40 minutes", Questions row reads "20", the cluster time-bar tooltips report SHORT-scaled minutes. Switch to FULL via Tweaks — duration becomes "45–50 minutes", Questions becomes "23 + 1 optional". Walk c2-q3 / c3-ast / c4-close / submit — TopBar percent is non-decreasing, minutes-left is non-increasing, every value an integer.
