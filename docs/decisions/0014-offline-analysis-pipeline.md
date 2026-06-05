# 0014 — Offline analysis pipeline (codebook, dataset, snapshots)

- **Status:** Accepted · 2026-06-05
- **Touches:** `scripts/lib/codebook.ts` (new), `scripts/lib/submissions.ts` (new), `scripts/build-codebook.ts` (new), `scripts/build-dataset.ts` (new), `scripts/clean-runs.ts` (new), `scripts/freeze-snapshot.ts` (new), `scripts/analyze-results.ts`, `scripts/export-firestore.ts`, `package.json`, `docs/validation/**` (new, tracked)
- **Related:** [ADR 0007](./0007-firebase-persistence-and-hosting.md) (Firestore + admin export), [ADR 0010](./0010-short-variant-as-default.md) (SHORT default), [ADR 0009](./0009-f4-boundary-shift.md) (seal boundary)

## Context

The platform is live and collecting expert responses; the next deliverable is the doctoral thesis's **validation chapter**. The existing tooling (`export:firestore` + `analyze`) produced a flat xlsx of raw 0-based index codes plus an aggregate markdown report — but nothing a researcher can analyse: no codebook (question text + answer vocabulary + code map), no decoded respondent-level dataset, no reproducible frozen snapshot, and no privacy tiering. The questionnaire also ships two variants, but the author confirmed **only SHORT is in use** (the 7 FULL submissions in Firestore are pre-launch author dry-runs).

## Decision

A single offline pipeline, all derived from the two sources of truth — `CONTENT` (the questionnaire) and the SHORT submissions — so artifacts cannot drift:

1. **SHORT-only.** `export:firestore` filters to `variant === 'short'`; `analyze` drops the FULL machinery and the fields SHORT hides (`c1-q7`, each instrument's Q2, the interview).
2. **Permanent cut-off** at `2026-05-27T00:00:00.000Z` — submissions before it (dry-runs / early pilot) are excluded from every artifact. Single source: `scripts/lib/submissions.ts`.
3. **Codebook** (`npm run codebook`, run once) enumerates every SHORT variable from `CONTENT` — name, full stem, ordered options with 1-based codes, scale kind, required/optional, restricted-or-not — to `docs/validation/codebook.{md,json}` (tracked). One shared enumerator (`scripts/lib/codebook.ts`) backs the codebook, the dataset, and the report's NA logic.
4. **Dataset** (`npm run dataset`) decodes each answer to its codebook value (ratings → 1-based option position; blank → NA) in two privacy tiers — **restricted** (everything incl. verbatim opens + name/institution + `doc_id`) and **anonymised** (coded only, no free text, no `doc_id`) — each as xlsx (safe) + RFC-4180 CSV (UTF-8 BOM, quoted, formula-injection guard). Respondents get stable anonymised `R##` codes ordered by submission time.
5. **Non-substantive options are kept at their scale position** ("Cannot judge", "Not familiar enough to say", "…not yet in place"), not recoded to missing — the dataset stays faithful to the instrument. The report transparently adds a per-item **no-opinion / not-applicable rate**, and the codebook tags each option's `substantive` flag so a downstream recode is one step.
6. **Opens grouped by question**, under the `R##` codes, in the `--include-opens` side-file (for qualitative coding/quoting).
7. **Per-snapshot folder layout** — `results/<stamp>/` and `analysis/<stamp>/`, one self-contained folder per export; the newest is auto-selected. **Explicit prune** (`npm run clean`, never automatic) keeps the newest N and deletes older. Safe because Firestore is append-only — any re-export is a superset.
8. **Freeze** (`npm run freeze`) copies only the shareable subset (report + anonymised dataset + codebook + manifest) of a chosen snapshot into a **tracked** `docs/validation/snapshot-<stamp>/`, so the chapter's numbers are reproducible and version-controlled. A hardcoded forbidden-list guard refuses to copy any PII artifact.

## Alternatives considered

- **Recode non-substantive options to NA in the dataset.** Methodologically cleaner for interval stats (the current mean for the "existing checks" item is inflated by a "Not familiar" anchor scored as a 6). Rejected per author decision: keep the dataset faithful and make the recode a downstream choice; surface the NA rate in the report instead.
- **Latest-only / overwrite storage.** Simpler, always one current set. Rejected — loses the audit trail and the ability to freeze a specific snapshot.
- **Auto-prune on each export.** Convenient but deletes data folders silently. Rejected — pruning is explicit only.
- **Commit the raw/restricted data for reproducibility.** Rejected — it carries names + verbatim opens; only the anonymised, count-only subset is tracked. Raw `submissions.json`, `dataset-restricted.*`, `opens.txt`, `respondent-map.csv` stay gitignored / offline.

## Consequences

- **One number, one place.** The cut-off, the variable model, and the non-substantive set each live in a single module; codebook, dataset, and report can't disagree.
- **Reproducibility.** A frozen snapshot pins the exact data the chapter is written against, even as Firestore keeps growing.
- **Privacy contract.** `results/` and `analysis/` are gitignored (PII); `docs/validation/` is tracked (shareable). The freeze guard is the backstop.
- **Outstanding:** `submitted_at` is retained in the anonymised tier as a faint quasi-identifier — drop it before any wider release if stricter de-identification is needed. The codebook regenerates only if `CONTENT` or the SHORT trim changes.

## Verification

- `npm run codebook` → 43 variables; `npm run dataset` → 28 respondents, 43 restricted / 23 anonymised columns (anonymised confirmed to carry zero open/`doc_id`/name columns); CSV round-trips with multi-line open text and zero column-count mismatches; ratings decode to in-range integers.
- `npm run analyze` → per-item no-opinion/NA lines present; opens regrouped by question.
- `npm run freeze` → `docs/validation/snapshot-<stamp>/` with no forbidden file present (guard verified).
- `npm run clean --dry-run` then real → only the non-newest snapshot deleted from both folders.
- `npm test` → 210/210 pass (no `src/` change).
