/* Shared submission loading + run layout for the offline analysis pipeline.

   Run layout (one self-contained folder per export snapshot):

     results/<stamp>/submissions.json   ← SHORT export (structured, analysis input)
     results/<stamp>/submissions.xlsx   ← SHORT export (flat, raw codes)
     analysis/<stamp>/report.md
     analysis/<stamp>/opens.txt              (with --include-opens)
     analysis/<stamp>/dataset-restricted.{xlsx,csv}
     analysis/<stamp>/dataset-anonymised.{xlsx,csv}
     analysis/<stamp>/respondent-map.csv

   `<stamp>` is the export wall-clock (e.g. 2026-06-04T23-08-47). analyze and
   dataset derive their stamp from the export they read, so every artifact of
   one snapshot lands under the same stamp folder.

   This module owns the permanent submission cut-off and the snapshot
   resolution. It reads only files already on disk; it never calls Firestore. */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import type { LockedAnswer } from '../../src/state/answerStore';

export const RESULTS_DIR = 'results';
export const ANALYSIS_DIR = 'analysis';
export const SUBMISSIONS_FILE = 'submissions.json';
export const SUBMISSIONS_XLSX = 'submissions.xlsx';

/* Permanent submission cut-off. Only submissions sealed on or after this
 * instant are reported; everything earlier is dropped before any stat is
 * computed. The boundary is midnight UTC starting 27 May 2026 — the pre-
 * cut-off runs (author dry-runs / early pilot traffic, 21–26 May) are
 * excluded. `submittedAt` is a UTC ISO-8601 string ("…Z"); lexicographic
 * comparison against this same-format constant is a valid chronological
 * comparison. */
export const SUBMISSION_CUTOFF_ISO = '2026-05-27T00:00:00.000Z';

export type SubmissionRow = {
  docId: string;
  submittedAt: string | null;
  variant: string;
  answerCount: number;
  answers: Record<string, LockedAnswer>;
  userAgent: string;
};

export function resultsDirFor(stamp: string): string {
  return path.join(RESULTS_DIR, stamp);
}

export function analysisDirFor(stamp: string): string {
  return path.join(ANALYSIS_DIR, stamp);
}

function submissionsPathFor(stamp: string): string {
  return path.join(RESULTS_DIR, stamp, SUBMISSIONS_FILE);
}

/** A `--short` path points at `results/<stamp>/submissions.json`; the stamp
 *  is the parent folder name. */
function stampFromPath(p: string): string {
  return path.basename(path.dirname(path.resolve(p)));
}

async function pathIfExists(p: string): Promise<string | null> {
  try {
    await fs.access(p);
    return p;
  } catch {
    return null;
  }
}

/** Stamp folders under results/ that actually contain a submissions.json. */
async function listSnapshotStamps(): Promise<string[]> {
  let entries: import('node:fs').Dirent[];
  try {
    entries = await fs.readdir(RESULTS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  const stamps: string[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (await pathIfExists(submissionsPathFor(e.name))) stamps.push(e.name);
  }
  return stamps;
}

/** Load a SHORT export and apply the permanent cut-off. Submissions with a
 *  null timestamp or one before SUBMISSION_CUTOFF_ISO are dropped. */
export async function loadShortSubmissions(
  filePath: string | null,
): Promise<SubmissionRow[]> {
  if (!filePath) return [];
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as SubmissionRow[];
  return parsed.filter(
    (r) => r.submittedAt !== null && r.submittedAt >= SUBMISSION_CUTOFF_ISO,
  );
}

/** Resolve which snapshot to read: an explicit submissions.json path, a
 *  stamp, or the newest snapshot folder under results/. */
export async function resolveShortInput(opts: {
  shortPath?: string | null;
  stamp?: string | null;
}): Promise<{ shortPath: string | null; stamp: string }> {
  if (opts.shortPath) {
    const stamp = opts.stamp ?? stampFromPath(opts.shortPath);
    return { shortPath: opts.shortPath, stamp };
  }
  if (opts.stamp) {
    return {
      shortPath: await pathIfExists(submissionsPathFor(opts.stamp)),
      stamp: opts.stamp,
    };
  }
  const stamps = await listSnapshotStamps();
  if (stamps.length === 0) {
    throw new Error(
      `No results/<stamp>/${SUBMISSIONS_FILE} found. ` +
        `Run \`npm run export:firestore\` first, or pass --short / --stamp.`,
    );
  }
  const newest = stamps.sort().reverse()[0]!;
  return { shortPath: submissionsPathFor(newest), stamp: newest };
}

/** All snapshot stamps present under results/ and/or analysis/ (union),
 *  used by the prune command. */
export async function listAllStamps(): Promise<string[]> {
  const set = new Set<string>();
  for (const dir of [RESULTS_DIR, ANALYSIS_DIR]) {
    let entries: import('node:fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) if (e.isDirectory()) set.add(e.name);
  }
  return [...set];
}
