# Decision records

Lightweight ADRs for tactical decisions made during implementation that are
**not in `docs/ARCHITECTURE.md`**. The architecture doc is the binding plan;
this folder catches the small choices made along the way that a future agent
might otherwise re-litigate.

## When to write one

- A non-obvious library workaround (e.g. serialising a `Set` through a JSON
  middleware).
- A deliberate non-idiom that looks like a smell but isn't.
- A material extension of the plan that the plan didn't anticipate.
- A trade-off resolved during implementation where the loser would be a
  reasonable choice for someone arriving cold.

Skip ADRs for routine porting that just executes the plan. The commit
messages carry that narrative.

## Format

One file per decision, numbered, kebab-case slug:

```
NNNN-short-slug.md
```

Body:

```markdown
# NNNN — Short title

- **Status:** Accepted · YYYY-MM-DD
- **Touches:** path/to/file.ts, path/to/other.ts

## Context
What forced the choice. One paragraph.

## Decision
What we did. One paragraph. Code snippets if useful.

## Alternatives considered
- Option A — why not.
- Option B — why not.

## Consequences
What this commits us to. What we still owe (if anything).
```

Status values: `Proposed` / `Accepted` / `Superseded by NNNN`. Don't delete
superseded entries — mark them and link forward.

## Index

- [0001 — Zustand persist + Set serialisation](./0001-zustand-set-serialisation.md)
- [0002 — AnswerValue wire format (discriminated union)](./0002-answer-value-wire-format.md)
- [0003 — Diagram fallback for setup screens (SVG components deferred)](./0003-diagram-fallback.md)
- [0004 — Profile + interview are dual-stored (sessionStore + answerStore)](./0004-profile-interview-dual-storage.md)
- [0005 — Playwright runs with workers: 1 (no parallel)](./0005-playwright-workers-one.md)
- [0006 — `meta` string replaced by structured `clusterPosition` + `registers`](./0006-meta-restructure-and-registers.md)
- [0007 — Firebase: persistence, hosting, admin export](./0007-firebase-persistence-and-hosting.md)
- [0014 — Offline analysis pipeline (codebook, dataset, snapshots)](./0014-offline-analysis-pipeline.md)
