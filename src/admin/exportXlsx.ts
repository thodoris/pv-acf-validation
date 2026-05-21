/* Exports — flat xlsx + structured JSON.

   xlsx layout:
     · One row per submission.
     · Meta columns: docId, submittedAt (ISO), variant, answerCount, userAgent.
     · Then one column per atomic value (via `flattenAnswerValue`). Dotted keys
       under the question id, e.g. `c4-close.q41.rating`, `c3-ast.open`,
       `profile.institution`. Every cell is a scalar — Excel pivot-friendly,
       `pandas.read_excel` consumes it directly.

   JSON layout:
     · Array of submission objects, each preserving the full structured
       `answers: Record<QuestionId, LockedAnswer>` map verbatim. Best for
       pandas/R/SPSS where you'll re-shape programmatically.

   Both flows share row collection — the difference is serialization. */

import * as XLSX from 'xlsx';
import type { LockedAnswer } from '@/state/answerStore';
import { flattenAnswerValue } from '@/admin/flattenAnswerValue';

export type SubmissionRow = {
  docId: string;
  submittedAt: Date | null;
  variant: string;
  answerCount: number;
  answers: Record<string, LockedAnswer>;
  userAgent: string;
};

const META_COLS = ['docId', 'submittedAt', 'variant', 'answerCount', 'userAgent'] as const;

/** Sort columns by question-id (everything before the first `.`), then by
 *  the rest of the dotted path. Keeps related sub-fields adjacent. */
function compareColumnKeys(a: string, b: string): number {
  const [aHead, ...aRest] = a.split('.');
  const [bHead, ...bRest] = b.split('.');
  if (aHead !== bHead) return aHead!.localeCompare(bHead!);
  return aRest.join('.').localeCompare(bRest.join('.'));
}

function flattenSubmission(row: SubmissionRow): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [qid, locked] of Object.entries(row.answers)) {
    Object.assign(out, flattenAnswerValue(qid, locked.value));
  }
  return out;
}

function collectAnswerColumns(rows: SubmissionRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    for (const k of Object.keys(flattenSubmission(r))) set.add(k);
  }
  return Array.from(set).sort(compareColumnKeys);
}

function buildMetaCols(row: SubmissionRow): Record<string, string | number> {
  return {
    docId: row.docId,
    submittedAt: row.submittedAt ? row.submittedAt.toISOString() : '',
    variant: row.variant,
    answerCount: row.answerCount,
    userAgent: row.userAgent,
  };
}

export function buildWorkbook(rows: SubmissionRow[]): XLSX.WorkBook {
  const answerCols = collectAnswerColumns(rows);
  const header = [...META_COLS, ...answerCols];
  const aoa: (string | number)[][] = [header as unknown as string[]];
  for (const r of rows) {
    const meta = buildMetaCols(r);
    const flat = flattenSubmission(r);
    const merged = { ...meta, ...flat };
    aoa.push(header.map((h) => merged[h] ?? ''));
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'submissions');
  return wb;
}

/** Build the JSON payload — full structured answers preserved per row. */
export function buildJsonPayload(rows: SubmissionRow[]): unknown[] {
  return rows.map((r) => ({
    docId: r.docId,
    submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
    variant: r.variant,
    answerCount: r.answerCount,
    userAgent: r.userAgent,
    answers: r.answers,
  }));
}

/** Group rows by their `variant` field. Empty/missing variants land under
 *  `'unknown'` so they're not silently lost. The map's iteration order
 *  follows insertion; consumers that want a stable ordering should sort the
 *  returned keys. */
export function groupRowsByVariant(rows: SubmissionRow[]): Map<string, SubmissionRow[]> {
  const out = new Map<string, SubmissionRow[]>();
  for (const r of rows) {
    const key = r.variant || 'unknown';
    const bucket = out.get(key);
    if (bucket) bucket.push(r);
    else out.set(key, [r]);
  }
  return out;
}

/** Build the base filename for a variant export. Variant is at the start
 *  so alphabetical sort groups files by variant first, then by timestamp. */
export function exportBaseName(variant: string, stampStr: string): string {
  return `${variant}-pvacf-submissions-${stampStr}`;
}

/* ── browser-only download helpers ─────────────────────────────────────── */

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

export function exportSubmissionsToXlsx(rows: SubmissionRow[]): void {
  const groups = groupRowsByVariant(rows);
  const s = stamp();
  for (const [variant, variantRows] of groups) {
    XLSX.writeFile(buildWorkbook(variantRows), `${exportBaseName(variant, s)}.xlsx`);
  }
}

export function exportSubmissionsToJson(rows: SubmissionRow[]): void {
  const groups = groupRowsByVariant(rows);
  const s = stamp();
  for (const [variant, variantRows] of groups) {
    const blob = new Blob([JSON.stringify(buildJsonPayload(variantRows), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportBaseName(variant, s)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
