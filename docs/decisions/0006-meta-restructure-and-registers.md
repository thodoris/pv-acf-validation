# 0006 — `meta` string replaced by structured `clusterPosition` + `registers`

- **Status:** Accepted · 2026-05-21
- **Touches:** `src/content/types.ts`, `src/content/content.ts`, `src/content/displayMeta.ts`, `src/screens/QuestionScreen.tsx`, `src/screens/PairedQuestionScreen.tsx`, `src/screens/ClosePairScreen.tsx`, `src/shell/affordances.ts`

## Context

Every question used to carry an authored `meta` string, e.g. `"Question 2.5 of 6 · Judgment"` for cluster-2 standard questions, `"Judgment"` for paired sub-questions, `"Question 4.1 of 2 · Required"` for the close-pair catch-alls. Three screens read the field by splitting on `" · "` and feeding the parts to `QuestionCard`'s `tag` + `meta` props.

Two problems:

1. **The "X of N" portion is wrong under a SHORT variant.** SHORT may hide whole question screens. Authored `"Question 2.5 of 6"` lies if SHORT hides c2-q3 and c2-q4 — the actual visible position of c2-q5 is then 3 of 4, not 5 of 6. The label has to be recomputed against the visible-cluster spine.
2. **Dual encoding.** The register (Judgment / Recognition) and the cluster-4 validation hint (Required / Optional) were embedded as positional segments in a free string. Pre-existing case drift (c2-q4 carried lowercase `"recognition · judgment"` while every sibling used Title-Case) couldn't be type-enforced. The "Required" / "Optional" descriptor on c4-q1 / c4-q2 was a second source of truth alongside `open.required`, with no link to the variant-effective required-ness.

The user's chosen direction (plan + approval): full replacement, no deprecation window.

## Decision

Structured fields on every authored question, with display strings composed at render time.

```ts
// types.ts additions
export type Register = 'judgment' | 'recognition';
export type ClusterPosition = { ordinal: number; totalInFull: number };

// StandardQuestion + PairedSubQuestion both carry:
clusterPosition: ClusterPosition;
registers: Register[];
```

Render-time composition lives in [`src/content/displayMeta.ts`](../../src/content/displayMeta.ts):

- `displayMetaForStandard(q, screenId, variant) -> { tag, meta }` for non-paired questions.
- `displayMetaForSub(wrapperId, sub, variant) -> { tag, meta }` for paired-pair legs.
- `displayMetaForWrapper(wrapperId, wrapper, variant) -> { tag, meta }` for the pair wrapper itself (synthesised; not currently rendered).

The `tag` is `Question {clusterDigit}.{visibleOrdinal} of {visibleTotal}`. Both numbers are recomputed from `effectiveScreens(SCREENS, variant)` — under FULL they reproduce the authored values; under any variant with `hiddenScreens`, the visible-cluster count and the question's visible position shrink accordingly.

The `meta` segment Title-Cases the question's `registers` and joins on `" · "`. When `registers` is empty *and* the question has an `open` field (the cluster-4 catch-alls), the helper appends `Required` or `Optional` derived from `effectiveRequired(q, screenId, 'open', variant)` — so a SHORT that relaxes c4-q1.open to optional automatically renders "Optional" on the question card.

## Alternatives considered

- **Keep `meta` and recompute only the X-of-N portion at render.** Rejected. The register descriptor stays embedded in the string and forces the consumer to split it back out; positional `" · "` splitting was already fragile when c2-q4 carried two registers (the consumer couldn't tell which segments were registers vs. position).
- **Additive with deprecation window.** Rejected. Doubles the authoring surface for the lifetime of the deprecation. With only ~17 question objects to migrate and one renderer per shape, the cost of going clean in one pass is low.
- **Author `requiredHint?: 'required' | 'optional'` on c4-q1 / c4-q2.** Rejected. Introduces a second source of truth alongside `open.required`. Deriving from `effectiveRequired()` means SHORT relaxation is automatically reflected in the badge with no content edit.
- **Treat 'required' / 'optional' as a third Register value.** Rejected. They describe validation state, not cognitive register. The taxonomies don't share a level.

## Consequences

- **One visible behaviour change under FULL: c2-q4 normalises from `"recognition · judgment"` to `"Recognition · Judgment"`.** Pre-existing inconsistency, fixed during the migration.
- **The cluster-4 affordance-card titles drop their Required/Optional segment too.** `"Q4.1 · Required · Coverage catch-all"` becomes `"Q4.1 · Coverage catch-all"` and likewise for Q4.2. The descriptor now lives in exactly one place (the question card via `displayMeta`), preventing drift under SHORT.
- **`PairedQuestion.meta` (the wrapper-level string like `"Questions 1.3 + 1.4 of 8"`) was dead data and is also removed.** `displayMetaForWrapper` synthesises an equivalent if any future caller needs it.
- **`composite.required` has no override path in `VariantConfig`.** Intentional: c2-q4 is the only composite, and its grid + composite are analytically bound — relaxing one without the other would be incoherent. Documented in the `VariantConfig` JSDoc.
- **The F1 drift-guard tests that compared authored meta to structured fields were removed in F4** once `meta` was deleted. Three structural-integrity tests stayed: ordinal uniqueness within cluster, `totalInFull` consistency within cluster, and register-value whitelist.
- **Per-cluster `displayMeta` snapshot tests under FULL** (19 in [`displayMeta.test.ts`](../../src/content/displayMeta.test.ts)) pin the rendered tag + meta for every cluster-defining example plus three SHORT fixtures (hide c2-q3+c2-q4; atomically hide c1-q3q4; relax c4-q1.open).
- **SHORT-variant content authoring becomes a small isolated pass.** Add `hiddenScreens` / `requiredOverrides` to `VARIANTS.short` in `variants.ts`; every label, badge, and counter re-derives correctly with no further plumbing. F5 wires `effectiveRequired()` into the screens' required-checks so SHORT can actually relax fields at validation time.
