# 0011 — Cluster 4 setup screen merged into the close-pair screen

- **Status:** Accepted · 2026-05-25
- **Touches:** `src/routing/screens.ts`, `src/routing/screens.test.ts`, `src/routing/ScreenRouter.tsx`, `src/screens/ClosePairScreen.tsx`, `src/screens/setup/ClusterSetupScreen.tsx` (deleted), `src/screens/setup/clusterPreview.ts`, `src/content/content.ts` (`clusters.close.setup`), `src/content/content.test.ts`, `e2e/walk-all-screens.spec.ts`, `e2e/walk-all-screens-short.spec.ts`, `docs/SOURCE_OF_TRUTH.md`

## Context

The prototype gives Cluster 4 a two-screen flow that mirrors Clusters 1–3: a setup screen (`c4-setup`, kind `cluster-setup`, "One last invitation") followed by the close-pair screen (`c4-close`, kind `close-pair`, Q4.1 + Q4.2). Clusters 1–3 have several questions each, so a dedicated setup screen earns its keep — the reviewer needs grounding before a six- or eight-question stretch. Cluster 4 has two questions, both open-only catch-alls, and the setup screen's substantive content collapses cleanly into one orienting paragraph above the questions.

The setup screen also creates an awkward two-step landing for Cluster 4: a setup-then-questions rhythm that fits Clusters 1–3 but reads as ceremony for two open prompts. The reviewer presses *Begin the close* on a screen that is itself only a few sentences and a preview list.

## Decision

**Cluster 4 is a single screen.** `c4-setup` is removed from the spine. `c4-close` (kind `close-pair`) absorbs the architecturally load-bearing copy from the deleted screen and becomes the only Cluster 4 screen between Cluster 3 and the interview.

Concretely:

1. **Spine.** `c4-setup` entry removed from `SCREENS` in `src/routing/screens.ts`. `c4-close` inherits the freed progress slot (`percentAtStart: 95`, `minutesAtStart: 2`) — landing earlier on the bar reflects that it now does both the orient-the-reviewer and the ask-the-questions jobs. Spine count: 32 → 31 (SHORT 31 → 30).
2. **Screen kind.** The `cluster-setup` kind is removed from the `ScreenKind` union. With no screen carrying it, the dedicated template (`ClusterSetupScreen.tsx`) and the optional `clusterId` field on `Screen` are deleted along with the corresponding `ScreenRouter` case.
3. **Copy moved into `ClosePairScreen.tsx`:**
   - Breadcrumb flipped to `CLUSTER 4 OF 4 · CLOSE` (matches the `CLUSTER N OF 4 · [phase]` convention used by setup screens).
   - Title becomes **The close** (from the deleted setup screen), replacing **Final two questions**.
   - Tagline becomes **Two final open questions. Set the agenda yourself.** — combining the new opener with the moved "Set the agenda yourself" fragment.
   - A new distinguished `.lede-panel` paragraph sits between the tagline and Q4.1: *"You have now crossed the whole framework — the problem it addresses, its design, and its four instruments. Two final open questions remain: one required catch-all, and one optional flag on the validation exercise itself."* This absorbs the closing-rhythm marker, the scope-of-everything-you've-seen, and the question preview from the deleted setup screen, plus the substance of the previous c4-close tagline.
4. **Copy dropped entirely** (absorbed by the new lede or the existing Q4.1/Q4.2 stems): the setup screen's three "sections" body, its preview list, its right-rail panel, its footer button (*Begin the close*), and its tagline fragment *"One last open invitation"*.
5. **Content data.** `CONTENT.clusters.close.setup` is stubbed to `{ title: '', sections: [], footer: null }`. The `Cluster` type still requires `setup`, but the data is no longer read by any renderer.
6. **`clusterPreview('close')`** returns `null`. The branch was reached only from the deleted `ClusterSetupScreen`.

## What stays unchanged on `c4-close`

- Both `QuestionCard`s — stems, subtitles, character limits, required/optional badges, scope-cards in the right rail.
- The lock-on-Continue paired save (`AnswerValue.type === 'paired'`, sub-answers under `c4-q1` / `c4-q2`).
- Variant levers (`requiredOverrides['c4-q1']` etc.) and the seal-payload normaliser path for the close pair.
- F1 phase-gate routing — `c4-close` remains a Phase 2 screen reachable only after Phase 1 completion (or via review mode).

## Alternatives considered

- **Keep `c4-setup` but trim it to one tight paragraph and a "Continue" button.** Rejected — the two-screen rhythm is what makes Cluster 4 feel ceremonious. Compressing the setup body doesn't change the underlying screen count.
- **Move the lede paragraph inside the right-rail of `c4-close`** rather than above the question cards. Rejected — Cluster 4's right rail already carries methodological scope cards per question; pushing orientation copy there competes with them. Above-the-fold prose is the right register for a "you've crossed the whole framework" moment.
- **Re-style `c4-close` with a new container** for the new opening paragraph. Rejected — the existing `.lede-panel` utility (used on the four Cluster 1–3 setup screens) is the prototype's approved distinguished-prose treatment and matches the visual register the deleted `c4-setup` already used for the same kind of content.
- **Strip `CONTENT.clusters.close` entirely** by making `setup` optional on the `Cluster` type. Rejected — propagates an optional through three Cluster 1–3 paths that don't need it. Stubbing the field is a smaller scar.

## Consequences

- **One fewer click between c3-cpd and the interview.** Reviewers landing on Cluster 4 read one paragraph above the questions rather than tap *Begin the close* on a setup screen.
- **TweaksPanel** still lists every screen by id; `c4-setup` no longer appears in the picker because it is gone from `SCREENS`.
- **Cross-variant invariant holds.** The seal payload schema is unchanged — `c4-close` already carries Q4.1 + Q4.2 under a single paired `AnswerValue`. Both FULL and SHORT submissions continue to write the same column set.
- **The prototype now diverges further from the implementation** on the Cluster 4 layout. Logged as a new row in `docs/SOURCE_OF_TRUTH.md`.

## Verification

- Unit: `screens.test.ts` asserts the 31-screen spine and the absence of `c4-setup`. `content.test.ts` asserts the close cluster has an empty setup-sections list while the other three retain non-empty sections.
- E2E: both walk specs (FULL + SHORT) drop `c4-setup` from their id arrays and assert 31 / 30 screens respectively.
- Manual: open `/?s=c4-close` — breadcrumb reads `CLUSTER 4 OF 4 · CLOSE`, title is *The close*, the lede paragraph sits above Q4.1, Q4.1/Q4.2 still save together on Continue.
