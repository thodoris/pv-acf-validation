/* analyze-results — offline aggregation of a paired JSON export.

   Reads `results/{short,full}-pvacf-submissions-<stamp>.json` (the JSON
   payload produced by `npm run export:firestore`) and writes a single
   markdown report to `analysis/report-<stamp>.md`.

   The script does not call Firestore. It only consumes files already on
   disk. Submissions whose `submittedAt` is null are excluded.

   Pooling rule (per the approved plan): questions present in BOTH variants
   are reported as one combined frequency table / one set of stats — no
   per-variant breakdown rows. Questions or fields hidden in SHORT
   (c1-q7, interview, every instrument's q2) are reported as FULL-only and
   tagged in the section header.

   Usage:
     npm run analyze
     npm run analyze -- --stamp=2026-05-26T14-30-00
     npm run analyze -- --short=results/foo.json --full=results/bar.json
     npm run analyze -- --include-opens     # also writes analysis/opens-<stamp>.txt
*/

import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import { SCREENS, type Screen } from '../src/routing/screens';
import { VARIANTS, effectiveFieldHidden } from '../src/content/variants';
import { CONTENT, isPairedQuestion } from '../src/content/index';
import type {
  AnswerValue,
  LockedAnswer,
} from '../src/state/answerStore';
import type {
  Instrument,
  PairedSubQuestion,
  ProfileField,
  Rating,
  StandardQuestion,
} from '../src/content/types';

/* ── Types ────────────────────────────────────────────────────────────── */

type SubmissionRow = {
  docId: string;
  submittedAt: string | null;
  variant: string;
  answerCount: number;
  answers: Record<string, LockedAnswer>;
  userAgent: string;
};

type CliOptions = {
  shortPath: string | null;
  fullPath: string | null;
  stamp: string | null;
  includeOpens: boolean;
};

type RatingStats = {
  nTotal: number;
  nResponded: number;
  nMissing: number;
  frequencies: { label: string; count: number; percent: number }[];
  median: string | null;
  mode: string | null;
  mean: number | null;
  sd: number | null;
};

type OpenStats = {
  nTotal: number;
  nFilled: number;
  nBlank: number;
  wordMean: number | null;
  wordMedian: number | null;
  wordMin: number | null;
  wordMax: number | null;
  totalWords: number;
  charMedian: number | null;
};

type MultiSelectStats = {
  nTotal: number;
  nResponded: number;
  nMissing: number;
  totalSelections: number;
  frequencies: { label: string; count: number; percent: number }[];
};

/* ── Constants ────────────────────────────────────────────────────────── */

const RESULTS_DIR = 'results';
const ANALYSIS_DIR = 'analysis';
const FILE_PATTERN = /^(short|full)-pvacf-submissions-(.+)\.json$/;

const SHORT_HIDDEN_SCREENS = new Set(VARIANTS.short.hiddenScreens ?? []);

/* ── CLI ──────────────────────────────────────────────────────────────── */

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    shortPath: null,
    fullPath: null,
    stamp: null,
    includeOpens: false,
  };
  for (const arg of argv) {
    if (arg === '--include-opens') {
      opts.includeOpens = true;
    } else if (arg.startsWith('--short=')) {
      opts.shortPath = arg.slice('--short='.length);
    } else if (arg.startsWith('--full=')) {
      opts.fullPath = arg.slice('--full='.length);
    } else if (arg.startsWith('--stamp=')) {
      opts.stamp = arg.slice('--stamp='.length);
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      process.stderr.write(`[analyze] unknown arg "${arg}" — ignored\n`);
    }
  }
  return opts;
}

function printHelp(): void {
  process.stdout.write(
    'analyze-results — produce a markdown stats report from a JSON export pair.\n' +
      '\n' +
      'Usage:\n' +
      '  npm run analyze\n' +
      '  npm run analyze -- --stamp=<timestamp>\n' +
      '  npm run analyze -- --short=<path> --full=<path>\n' +
      '  npm run analyze -- --include-opens\n' +
      '\n' +
      'Defaults: picks the newest paired JSON export under results/.\n',
  );
}

/* ── Input resolution ─────────────────────────────────────────────────── */

async function resolveInputPair(
  opts: CliOptions,
): Promise<{ shortPath: string | null; fullPath: string | null; stamp: string }> {
  if (opts.shortPath || opts.fullPath) {
    const stamp =
      opts.stamp ?? deriveStampFromPaths(opts.shortPath, opts.fullPath) ?? nowStamp();
    return {
      shortPath: opts.shortPath ?? (opts.stamp ? defaultPath('short', opts.stamp) : null),
      fullPath: opts.fullPath ?? (opts.stamp ? defaultPath('full', opts.stamp) : null),
      stamp,
    };
  }
  if (opts.stamp) {
    return {
      shortPath: await pathIfExists(defaultPath('short', opts.stamp)),
      fullPath: await pathIfExists(defaultPath('full', opts.stamp)),
      stamp: opts.stamp,
    };
  }
  // Auto-discover the newest pair in results/.
  const entries = await safeReaddir(RESULTS_DIR);
  if (entries.length === 0) {
    throw new Error(
      `No results/ directory or no exports found. Run \`npm run export:firestore\` first, ` +
        `or pass --short / --full / --stamp explicitly.`,
    );
  }
  const stamps = new Set<string>();
  for (const f of entries) {
    const m = FILE_PATTERN.exec(f);
    if (m) stamps.add(m[2]!);
  }
  if (stamps.size === 0) {
    throw new Error(
      `results/ contained no files matching {short,full}-pvacf-submissions-*.json`,
    );
  }
  const newest = [...stamps].sort().reverse()[0]!;
  return {
    shortPath: await pathIfExists(defaultPath('short', newest)),
    fullPath: await pathIfExists(defaultPath('full', newest)),
    stamp: newest,
  };
}

function defaultPath(variant: 'short' | 'full', stamp: string): string {
  return path.join(RESULTS_DIR, `${variant}-pvacf-submissions-${stamp}.json`);
}

function deriveStampFromPaths(...paths: (string | null)[]): string | null {
  for (const p of paths) {
    if (!p) continue;
    const m = FILE_PATTERN.exec(path.basename(p));
    if (m) return m[2]!;
  }
  return null;
}

function nowStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

async function pathIfExists(p: string): Promise<string | null> {
  try {
    await fs.access(p);
    return p;
  } catch {
    return null;
  }
}

async function safeReaddir(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

async function loadSubmissions(filePath: string | null): Promise<SubmissionRow[]> {
  if (!filePath) return [];
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as SubmissionRow[];
  return parsed.filter((r) => r.submittedAt !== null);
}

/* ── Pool construction ────────────────────────────────────────────────── */

/** Generic pool: extract `T | null` per row, return only non-null values
 *  alongside the count of nulls (treated as "asked but not answered"). */
function pool<T>(
  rows: SubmissionRow[],
  extract: (row: SubmissionRow) => T | null | undefined,
): { values: T[]; nMissing: number; nTotal: number } {
  const values: T[] = [];
  let nMissing = 0;
  for (const r of rows) {
    const v = extract(r);
    if (v === null || v === undefined) {
      nMissing++;
    } else {
      values.push(v);
    }
  }
  return { values, nMissing, nTotal: rows.length };
}

/** Non-empty string after trim. Empty / whitespace-only / null / undefined
 *  collapse to null. */
function nonEmpty(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

/** Rating answers (question rating, paired-sub rating, instrument q1/q2,
 *  grid cells, composite) are stored as 0-based numeric index strings
 *  (`"0"`, `"1"`, ...). Resolve them to the option label so frequency tables
 *  can match. Returns null for empty / non-numeric / out-of-range values.
 *
 *  Profile and interview answers store the option label directly and
 *  should NOT pass through this helper. */
function indexToLabel(raw: string | null | undefined, options: string[]): string | null {
  if (raw === null || raw === undefined) return null;
  const t = raw.trim();
  if (t.length === 0) return null;
  const idx = Number(t);
  if (!Number.isInteger(idx) || idx < 0 || idx >= options.length) return null;
  return options[idx]!;
}

function extractByKind<T extends AnswerValue['type'], R>(
  row: SubmissionRow,
  screenId: string,
  kind: T,
  pull: (v: Extract<AnswerValue, { type: T }>) => R | null | undefined,
): R | null {
  const locked = row.answers[screenId];
  if (!locked) return null;
  if (locked.value.type !== kind) return null;
  const out = pull(locked.value as Extract<AnswerValue, { type: T }>);
  return out === undefined ? null : out;
}

/* ── Stats helpers ────────────────────────────────────────────────────── */

/** `inputMode`:
 *  - `'index'` (default): responses are 0-based numeric index strings (the
 *    questionnaire's storage convention for every rating). Each entry is
 *    translated to its option label; entries that don't translate are
 *    counted as missing.
 *  - `'label'`: responses are option labels already (profile, interview).
 *    No translation; entries that don't match an option go into a
 *    "(unrecognised)" bucket so the discrepancy is visible. */
function computeRatingStats(
  rawResponses: (string | null | undefined)[],
  options: string[],
  nTotal: number,
  inputMode: 'index' | 'label' = 'index',
): RatingStats {
  const counts = new Map<string, number>();
  for (const opt of options) counts.set(opt, 0);
  const responses: string[] = [];
  let unrecognised = 0;
  for (const raw of rawResponses) {
    const label = inputMode === 'index' ? indexToLabel(raw, options) : nonEmpty(raw);
    if (label === null) continue;
    if (!counts.has(label)) {
      unrecognised++;
      continue;
    }
    counts.set(label, (counts.get(label) ?? 0) + 1);
    responses.push(label);
  }
  const nResponded = responses.length;
  const frequencies = options.map((opt) => ({
    label: opt,
    count: counts.get(opt) ?? 0,
    percent: nResponded === 0 ? 0 : ((counts.get(opt) ?? 0) / nResponded) * 100,
  }));

  let median: string | null = null;
  let mode: string | null = null;
  let mean: number | null = null;
  let sd: number | null = null;

  if (nResponded > 0) {
    // Median: middle of sorted-by-option-order responses. For even N we take
    // the lower middle (conservative, unambiguous).
    const optionIndex = new Map(options.map((opt, i) => [opt, i] as const));
    const sortedIdx = responses
      .map((r) => optionIndex.get(r))
      .filter((v): v is number => v !== undefined)
      .sort((a, b) => a - b);
    if (sortedIdx.length > 0) {
      const middle = Math.floor((sortedIdx.length - 1) / 2);
      median = options[sortedIdx[middle]!] ?? null;
    }

    // Mode: option(s) with max count, joined by ' / ' on ties.
    let max = 0;
    for (const f of frequencies) if (f.count > max) max = f.count;
    if (max > 0) {
      const tied = frequencies.filter((f) => f.count === max).map((f) => f.label);
      mode = tied.join(' / ');
    }

    // Mean + SD: treat option index (1-based) as interval. Caveat is
    // declared in the report's introduction. Skips responses that don't
    // match any defined option (defensive — should not happen with normal data).
    const positions: number[] = [];
    for (const r of responses) {
      const idx = optionIndex.get(r);
      if (idx !== undefined) positions.push(idx + 1);
    }
    if (positions.length > 0) {
      mean = positions.reduce((a, b) => a + b, 0) / positions.length;
      const variance =
        positions.reduce((acc, p) => acc + (p - mean!) * (p - mean!), 0) / positions.length;
      sd = Math.sqrt(variance);
    }
  }

  return {
    nTotal,
    nResponded,
    nMissing: nTotal - nResponded,
    frequencies,
    median,
    mode,
    mean,
    sd,
  };
}

function computeOpenStats(responses: (string | null)[], nTotal: number): OpenStats {
  const filled = responses
    .map((r) => nonEmpty(r))
    .filter((r): r is string => r !== null);
  const nFilled = filled.length;
  const nBlank = nTotal - nFilled;

  if (nFilled === 0) {
    return {
      nTotal,
      nFilled,
      nBlank,
      wordMean: null,
      wordMedian: null,
      wordMin: null,
      wordMax: null,
      totalWords: 0,
      charMedian: null,
    };
  }

  const wordCounts = filled.map((t) => t.trim().split(/\s+/).length);
  const charCounts = filled.map((t) => t.length);
  const sortedW = [...wordCounts].sort((a, b) => a - b);
  const sortedC = [...charCounts].sort((a, b) => a - b);
  const totalWords = wordCounts.reduce((a, b) => a + b, 0);

  return {
    nTotal,
    nFilled,
    nBlank,
    wordMean: totalWords / nFilled,
    wordMedian: sortedW[Math.floor((sortedW.length - 1) / 2)] ?? null,
    wordMin: sortedW[0] ?? null,
    wordMax: sortedW[sortedW.length - 1] ?? null,
    totalWords,
    charMedian: sortedC[Math.floor((sortedC.length - 1) / 2)] ?? null,
  };
}

function computeMultiSelectStats(
  responses: (string | string[] | null | undefined)[],
  options: string[],
  nTotal: number,
): MultiSelectStats {
  const counts = new Map<string, number>();
  for (const opt of options) counts.set(opt, 0);
  let nResponded = 0;
  let totalSelections = 0;
  for (const r of responses) {
    if (r === null || r === undefined) continue;
    const picks = Array.isArray(r) ? r : nonEmpty(r) ? splitJoined(r) : [];
    if (picks.length === 0) continue;
    nResponded++;
    for (const pick of picks) {
      const trimmed = pick.trim();
      if (trimmed.length === 0) continue;
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
      totalSelections++;
    }
  }
  const frequencies = options.map((opt) => ({
    label: opt,
    count: counts.get(opt) ?? 0,
    percent: nResponded === 0 ? 0 : ((counts.get(opt) ?? 0) / nResponded) * 100,
  }));
  // If respondents picked values that were not in the option list, surface
  // them at the bottom (defensive — shouldn't happen with normal data).
  for (const [label, count] of counts) {
    if (!options.includes(label) && count > 0) {
      frequencies.push({
        label: `${label} (unrecognised option)`,
        count,
        percent: nResponded === 0 ? 0 : (count / nResponded) * 100,
      });
    }
  }
  return {
    nTotal,
    nResponded,
    nMissing: nTotal - nResponded,
    totalSelections,
    frequencies,
  };
}

/** Split a "; "-joined export string back into individual picks. The xlsx
 *  export joins arrays this way; the JSON export keeps them as arrays. We
 *  handle both paths so the script is robust to either. */
function splitJoined(s: string): string[] {
  return s.split(/\s*;\s*/).filter((part) => part.length > 0);
}

/* ── Markdown rendering helpers ───────────────────────────────────────── */

function renderRatingBlock(title: string, stats: RatingStats, tag?: string): string {
  const headerTag = tag ? ` *(${tag})*` : '';
  const lines: string[] = [];
  lines.push(`**${title}**${headerTag}`);
  lines.push('');
  lines.push(
    `- N = ${stats.nResponded} of ${stats.nTotal} eligible (${stats.nMissing} missing).`,
  );
  if (stats.nResponded === 0) {
    lines.push('- No responses recorded.');
    lines.push('');
    return lines.join('\n');
  }
  lines.push(`- Median: ${stats.median ?? '—'}.  Mode: ${stats.mode ?? '—'}.`);
  if (stats.mean !== null && stats.sd !== null) {
    lines.push(
      `- Mean position: ${stats.mean.toFixed(2)} (SD ${stats.sd.toFixed(2)}). ` +
        `*Interval treatment — see overview.*`,
    );
  }
  lines.push('');
  lines.push('| Option | Count | % of responded |');
  lines.push('| --- | ---: | ---: |');
  for (const f of stats.frequencies) {
    lines.push(`| ${escapePipes(f.label)} | ${f.count} | ${f.percent.toFixed(1)}% |`);
  }
  lines.push('');
  return lines.join('\n');
}

function renderOpenBlock(title: string, stats: OpenStats, tag?: string): string {
  const headerTag = tag ? ` *(${tag})*` : '';
  const lines: string[] = [];
  lines.push(`**${title}**${headerTag}`);
  lines.push('');
  lines.push(
    `- Filled: ${stats.nFilled} of ${stats.nTotal} eligible (${stats.nBlank} blank).`,
  );
  if (stats.nFilled === 0) {
    lines.push('- No responses recorded.');
    lines.push('');
    return lines.join('\n');
  }
  lines.push(
    `- Word count: mean ${stats.wordMean!.toFixed(1)}, median ${stats.wordMedian}, ` +
      `range ${stats.wordMin}–${stats.wordMax}. Total ${stats.totalWords} words across ${stats.nFilled} entries.`,
  );
  lines.push(`- Median character count: ${stats.charMedian}.`);
  lines.push('');
  return lines.join('\n');
}

function renderMultiSelectBlock(
  title: string,
  stats: MultiSelectStats,
  tag?: string,
): string {
  const headerTag = tag ? ` *(${tag})*` : '';
  const lines: string[] = [];
  lines.push(`**${title}**${headerTag}`);
  lines.push('');
  lines.push(
    `- N respondents = ${stats.nResponded} of ${stats.nTotal} eligible. ` +
      `${stats.totalSelections} total selection(s) across all respondents.`,
  );
  if (stats.nResponded === 0) {
    lines.push('- No selections recorded.');
    lines.push('');
    return lines.join('\n');
  }
  lines.push('| Option | Count | % of respondents |');
  lines.push('| --- | ---: | ---: |');
  for (const f of stats.frequencies) {
    lines.push(`| ${escapePipes(f.label)} | ${f.count} | ${f.percent.toFixed(1)}% |`);
  }
  lines.push('');
  return lines.join('\n');
}

function renderCountBlock(title: string, nFilled: number, nTotal: number, tag?: string): string {
  const headerTag = tag ? ` *(${tag})*` : '';
  return (
    `**${title}**${headerTag}\n\n` +
    `- Filled: ${nFilled} of ${nTotal} eligible (${nTotal - nFilled} blank).\n` +
    `- *Verbatim values not reported — protected field.*\n\n`
  );
}

function escapePipes(s: string): string {
  return s.replace(/\|/g, '\\|');
}

/* ── Per-screen analyzers ─────────────────────────────────────────────── */

/* Pooling rule recap:
 * - Screen visible in both variants → pool short + full rows for that field.
 * - Screen visible only in FULL (c1-q7, interview) → pool only full rows;
 *   tag the section "FULL only".
 * - Field hidden on a screen in SHORT (every instrument's q2) → pool only
 *   full rows for that field; tag it "FULL only". The screen as a whole
 *   stays "both".
 */

function combinedRowsFor(
  screenId: string,
  shortRows: SubmissionRow[],
  fullRows: SubmissionRow[],
): SubmissionRow[] {
  if (SHORT_HIDDEN_SCREENS.has(screenId)) return fullRows;
  return [...shortRows, ...fullRows];
}

function analyzeProfile(shortRows: SubmissionRow[], fullRows: SubmissionRow[]): string {
  const rows = combinedRowsFor('profile', shortRows, fullRows);
  const sections: string[] = [];
  sections.push('## Profile of reviewers');
  sections.push('');
  for (const field of CONTENT.profile.fields as ProfileField[]) {
    const values = pool(rows, (r) =>
      extractByKind(r, 'profile', 'profile', (v) => v.data[field.key] ?? null),
    );
    if (field.kind === 'select' || field.kind === 'radio') {
      const stats = computeRatingStats(values.values, field.options ?? [], values.nTotal, 'label');
      sections.push(renderRatingBlock(`${field.label} (${field.key})`, stats));
    } else {
      // text field — counts only, no verbatim
      const nFilled = values.values.filter((r) => nonEmpty(r) !== null).length;
      sections.push(renderCountBlock(`${field.label} (${field.key})`, nFilled, values.nTotal));
    }
  }
  return sections.join('\n');
}

function analyzeStandardQuestion(
  screen: Screen,
  shortRows: SubmissionRow[],
  fullRows: SubmissionRow[],
): string {
  const q = CONTENT.questions[screen.id];
  if (!q || isPairedQuestion(q)) return '';
  const stdQ = q as StandardQuestion;
  const isFullOnly = SHORT_HIDDEN_SCREENS.has(screen.id);
  const rows = combinedRowsFor(screen.id, shortRows, fullRows);
  const tag = isFullOnly ? 'FULL only' : undefined;
  const lines: string[] = [];
  lines.push(`### ${screen.location}`);
  lines.push('');
  lines.push(`*${stdQ.question}*`);
  lines.push('');

  // c2-q4 is rating-grid + composite; handle separately.
  if (stdQ.rating?.kind === 'grid') {
    lines.push(renderGridBlock(screen.id, stdQ.rating, rows, tag));
    if (stdQ.composite) {
      const compositeResponses = pool(rows, (r) =>
        extractByKind(r, screen.id, 'grid-and-composite', (v) => v.composite ?? null),
      );
      const stats = computeRatingStats(
        compositeResponses.values,
        stdQ.composite.options,
        compositeResponses.nTotal,
      );
      lines.push(renderRatingBlock(stdQ.composite.subStem, stats, tag));
    }
    return lines.join('\n');
  }

  // Standard rating-and-open (or open-only for c4-q1 / c4-q2 — but those
  // go through analyzeClosePair, not here).
  if (stdQ.rating) {
    const ratingResponses = pool(rows, (r) =>
      extractByKind(r, screen.id, 'rating-and-open', (v) => v.rating),
    );
    const stats = computeRatingStats(
      ratingResponses.values,
      stdQ.rating.options,
      ratingResponses.nTotal,
    );
    lines.push(renderRatingBlock('Rating', stats, tag));
  }

  if (stdQ.open) {
    const openResponses = pool(rows, (r) =>
      extractByKind(r, screen.id, 'rating-and-open', (v) => v.open ?? null),
    );
    const stats = computeOpenStats(openResponses.values, openResponses.nTotal);
    lines.push(renderOpenBlock(`Open — ${stdQ.open.label}`, stats, tag));
  }

  return lines.join('\n');
}

function renderGridBlock(
  screenId: string,
  rating: Extract<Rating, { kind: 'grid' }>,
  rows: SubmissionRow[],
  tag?: string,
): string {
  // The grid is persisted with synthetic keys `row0`, `row1`, ... (see
  // QuestionScreen.buildAnswerValue) — not the row text. Iterate by index
  // so we look up the right cell, then label the section with the row text.
  const lines: string[] = [];
  for (let i = 0; i < rating.rows.length; i++) {
    const rowText = rating.rows[i]!;
    const key = `row${i}`;
    const pulled = pool(rows, (r) =>
      extractByKind(r, screenId, 'grid-and-composite', (v) => v.grid[key] ?? null),
    );
    const stats = computeRatingStats(pulled.values, rating.options, pulled.nTotal);
    lines.push(renderRatingBlock(`Row · ${rowText}`, stats, tag));
  }
  return lines.join('\n');
}

function analyzePaired(
  screen: Screen,
  shortRows: SubmissionRow[],
  fullRows: SubmissionRow[],
): string {
  const q = CONTENT.questions[screen.id];
  if (!q || !isPairedQuestion(q)) return '';
  const rows = combinedRowsFor(screen.id, shortRows, fullRows);
  const tag = SHORT_HIDDEN_SCREENS.has(screen.id) ? 'FULL only' : undefined;
  const lines: string[] = [];
  lines.push(`### ${screen.location}`);
  lines.push('');
  for (const sub of q.questions as PairedSubQuestion[]) {
    lines.push(`*${sub.slot} — ${sub.question}*`);
    lines.push('');
    if (sub.rating) {
      const pulled = pool(rows, (r) =>
        extractByKind(r, screen.id, 'paired', (v) => v.subAnswers[sub.slot]?.rating ?? null),
      );
      const stats = computeRatingStats(pulled.values, sub.rating.options, pulled.nTotal);
      lines.push(renderRatingBlock(`Rating · ${sub.slot}`, stats, tag));
    }
    if (sub.open) {
      const pulled = pool(rows, (r) =>
        extractByKind(r, screen.id, 'paired', (v) => v.subAnswers[sub.slot]?.open ?? null),
      );
      const stats = computeOpenStats(pulled.values, pulled.nTotal);
      lines.push(renderOpenBlock(`Open · ${sub.slot} — ${sub.open.label}`, stats, tag));
    }
  }
  return lines.join('\n');
}

function analyzeClosePair(
  screen: Screen,
  shortRows: SubmissionRow[],
  fullRows: SubmissionRow[],
): string {
  const rows = combinedRowsFor(screen.id, shortRows, fullRows);
  const lines: string[] = [];
  lines.push(`### ${screen.location}`);
  lines.push('');
  for (const subId of ['c4-q1', 'c4-q2']) {
    const q = CONTENT.questions[subId];
    if (!q || isPairedQuestion(q)) continue;
    const stdQ = q as StandardQuestion;
    lines.push(`*${subId} — ${stdQ.question}*`);
    lines.push('');
    if (stdQ.open) {
      const pulled = pool(rows, (r) =>
        extractByKind(r, screen.id, 'paired', (v) => v.subAnswers[subId]?.open ?? null),
      );
      const stats = computeOpenStats(pulled.values, pulled.nTotal);
      lines.push(renderOpenBlock(`Open — ${stdQ.open.label}`, stats));
    }
  }
  return lines.join('\n');
}

function analyzeInstrument(
  screen: Screen,
  shortRows: SubmissionRow[],
  fullRows: SubmissionRow[],
): string {
  const inst = CONTENT.instruments.find((i) => i.id === screen.id) as Instrument | undefined;
  if (!inst) return '';
  const lines: string[] = [];
  lines.push(`### ${screen.location}`);
  lines.push('');

  for (const field of ['q1', 'q2'] as const) {
    const hiddenInShort = effectiveFieldHidden(screen.id, field, VARIANTS.short);
    const rows = hiddenInShort ? fullRows : [...shortRows, ...fullRows];
    const tag = hiddenInShort ? 'FULL only' : undefined;
    const sub = field === 'q1' ? inst.q1 : inst.q2;
    const pulled = pool(rows, (r) =>
      extractByKind(r, screen.id, 'instrument', (v) =>
        field === 'q1' ? v.q1Rating : v.q2Rating,
      ),
    );
    const stats = computeRatingStats(pulled.values, sub.rating.options, pulled.nTotal);
    lines.push(`*${field.toUpperCase()} — ${sub.question}*`);
    lines.push('');
    lines.push(renderRatingBlock(`Rating · ${field.toUpperCase()}`, stats, tag));
  }

  // sharedOpen: combined; required in FULL, optional in SHORT.
  const openRows = [...shortRows, ...fullRows];
  const pulled = pool(openRows, (r) =>
    extractByKind(r, screen.id, 'instrument', (v) => v.sharedOpen ?? null),
  );
  const stats = computeOpenStats(pulled.values, pulled.nTotal);
  lines.push(`*Shared open — ${inst.sharedOpen.label}*`);
  lines.push('');
  lines.push(
    renderOpenBlock(
      'Synthesis',
      stats,
      'required in FULL, optional in SHORT',
    ),
  );
  return lines.join('\n');
}

function analyzeInterview(_screen: Screen, fullRows: SubmissionRow[]): string {
  const section = CONTENT.interview;
  const lines: string[] = [];
  lines.push('## Optional follow-up — Interview *(FULL only)*');
  lines.push('');
  lines.push(`*${section.intro}*`);
  lines.push('');

  for (const field of section.fields) {
    const tag = 'FULL only';
    if (field.kind === 'radio') {
      const pulled = pool(fullRows, (r) =>
        extractByKind(r, 'interview', 'interview', (v) => {
          const raw = v.data[field.key];
          return typeof raw === 'string' ? raw : null;
        }),
      );
      const stats = computeRatingStats(
        pulled.values,
        field.options ?? [],
        pulled.nTotal,
        'label',
      );
      lines.push(renderRatingBlock(`${field.label} (${field.key})`, stats, tag));
    } else if (field.kind === 'checkbox-list') {
      const pulled = pool(fullRows, (r) =>
        extractByKind(r, 'interview', 'interview', (v) => {
          const raw = v.data[field.key];
          if (raw === null || raw === undefined) return null;
          return raw;
        }),
      );
      const stats = computeMultiSelectStats(
        pulled.values,
        field.options ?? [],
        pulled.nTotal,
      );
      lines.push(renderMultiSelectBlock(`${field.label} (${field.key})`, stats, tag));
    } else {
      // text — contact email; only count, never log.
      const pulled = pool(fullRows, (r) =>
        extractByKind(r, 'interview', 'interview', (v) => {
          const raw = v.data[field.key];
          return typeof raw === 'string' && nonEmpty(raw) !== null ? raw : null;
        }),
      );
      const nFilled = pulled.values.length;
      lines.push(renderCountBlock(`${field.label} (${field.key})`, nFilled, pulled.nTotal, tag));
    }
  }
  return lines.join('\n');
}

/* ── Overview section ────────────────────────────────────────────────── */

function analyzeOverview(
  shortRows: SubmissionRow[],
  fullRows: SubmissionRow[],
  stamp: string,
  inputs: { shortPath: string | null; fullPath: string | null },
): string {
  const all = [...shortRows, ...fullRows];
  const submittedAt = all
    .map((r) => r.submittedAt)
    .filter((v): v is string => v !== null && v.length > 0)
    .sort();
  const earliest = submittedAt[0] ?? '—';
  const latest = submittedAt[submittedAt.length - 1] ?? '—';
  return (
    `# PV-ACF validation analysis — ${stamp}\n\n` +
    `## Overview\n\n` +
    `- Submissions: short = **${shortRows.length}**, full = **${fullRows.length}**, ` +
    `total = **${shortRows.length + fullRows.length}**.\n` +
    `- Submission window: ${earliest} → ${latest}.\n` +
    `- Inputs: short = \`${inputs.shortPath ?? '(none)'}\`, full = \`${inputs.fullPath ?? '(none)'}\`.\n` +
    `\n` +
    `### Pooling rule\n\n` +
    `Questions present in **both** variants are reported as a single combined ` +
    `frequency table. Questions or fields hidden in SHORT (\`c1-q7\`, the ` +
    `\`interview\` screen, and every instrument's Q2 rating) are reported as ` +
    `**FULL only** and tagged in each section header.\n` +
    `\n` +
    `### Statistic conventions\n\n` +
    `- **Frequency tables** list every option the question defines, including ` +
    `zero-count options.\n` +
    `- **Median** is the lower-middle response when N is even (no interpolation ` +
    `— rating scales are non-uniform 4–6-point ordinals).\n` +
    `- **Mode** lists every option tied for the highest count, joined by \` / \`.\n` +
    `- **Mean & SD** treat the option index (1-based) as an interval variable. ` +
    `This is conventional in validation reporting but ordinal-purists may prefer ` +
    `to quote the median and frequency table only.\n` +
    `- **Open-response** sections report only N + word/character counts. ` +
    `Verbatim text is never written to this report; pass \`--include-opens\` ` +
    `if you need the corpus as a side-file.\n` +
    `\n`
  );
}

/* ── Appendix: free-text corpus summary ──────────────────────────────── */

function analyzeAppendix(
  shortRows: SubmissionRow[],
  fullRows: SubmissionRow[],
): string {
  const allRows = [...shortRows, ...fullRows];
  let totalEntries = 0;
  let totalFilled = 0;
  let totalWords = 0;
  let totalChars = 0;

  for (const r of allRows) {
    for (const [, locked] of Object.entries(r.answers)) {
      for (const text of openTextsFromValue(locked.value)) {
        totalEntries++;
        const t = nonEmpty(text);
        if (t) {
          totalFilled++;
          totalWords += t.split(/\s+/).length;
          totalChars += t.length;
        }
      }
    }
  }
  return (
    `## Appendix — Free-text corpus summary\n\n` +
    `Aggregate roll-up across every open-response field on every submission ` +
    `(profile text fields, every open + composite, instrument synthesis opens, ` +
    `close-pair opens, interview contact). Verbatim text is not reported.\n\n` +
    `- Open-response slots eligible: ${totalEntries}.\n` +
    `- Slots filled: ${totalFilled} (${totalEntries === 0 ? 0 : ((totalFilled / totalEntries) * 100).toFixed(1)}%).\n` +
    `- Total words in the open corpus: **${totalWords}**.\n` +
    `- Total characters in the open corpus: ${totalChars}.\n\n`
  );
}

function openTextsFromValue(v: AnswerValue): string[] {
  switch (v.type) {
    case 'open':
      return [v.value];
    case 'rating-and-open':
      return v.open !== undefined ? [v.open] : [];
    case 'grid-and-composite':
      return [];
    case 'paired':
      return Object.values(v.subAnswers)
        .map((sub) => sub.open)
        .filter((s): s is string => typeof s === 'string');
    case 'instrument':
      return [v.sharedOpen ?? ''];
    case 'profile':
      return Object.values(v.data);
    case 'interview': {
      const out: string[] = [];
      for (const raw of Object.values(v.data)) {
        if (typeof raw === 'string') out.push(raw);
      }
      return out;
    }
    case 'rating':
      return [];
  }
}

/* ── Opens side-file ─────────────────────────────────────────────────── */

function buildOpensSideFile(
  shortRows: SubmissionRow[],
  fullRows: SubmissionRow[],
): string {
  const out: string[] = [];
  out.push('PV-ACF — verbatim open responses');
  out.push('================================');
  out.push('');
  out.push('Generated by `npm run analyze -- --include-opens`. Do not commit.');
  out.push('');

  const allRows = [...shortRows.map((r) => [r, 'short'] as const), ...fullRows.map((r) => [r, 'full'] as const)];
  for (const [r, variant] of allRows) {
    out.push(`--- ${variant} · ${r.docId} · ${r.submittedAt ?? ''}`);
    for (const [qid, locked] of Object.entries(r.answers)) {
      const texts = openTextsFromValue(locked.value).filter((t) => nonEmpty(t) !== null);
      if (texts.length === 0) continue;
      out.push(`  [${qid}]`);
      for (const t of texts) {
        out.push(`    ${t.replace(/\r?\n/g, '\n    ')}`);
      }
    }
    out.push('');
  }
  return out.join('\n');
}

/* ── Section dispatcher ──────────────────────────────────────────────── */

function analyzeScreen(
  screen: Screen,
  shortRows: SubmissionRow[],
  fullRows: SubmissionRow[],
): string | null {
  switch (screen.kind) {
    case 'question':
      return analyzeStandardQuestion(screen, shortRows, fullRows);
    case 'paired':
      return analyzePaired(screen, shortRows, fullRows);
    case 'close-pair':
      return analyzeClosePair(screen, shortRows, fullRows);
    case 'instrument':
      return analyzeInstrument(screen, shortRows, fullRows);
    default:
      return null;
  }
}

/* ── Report assembly ─────────────────────────────────────────────────── */

function renderReport(
  shortRows: SubmissionRow[],
  fullRows: SubmissionRow[],
  stamp: string,
  inputs: { shortPath: string | null; fullPath: string | null },
): string {
  const sections: string[] = [];
  sections.push(analyzeOverview(shortRows, fullRows, stamp, inputs));
  sections.push(analyzeProfile(shortRows, fullRows));

  // Chapter headers driven by the screen order, so the report mirrors the
  // questionnaire flow exactly.
  const chapterHeaders: Record<string, string> = {
    problem: '## Chapter 1 — Problem',
    framework: '## Chapter 2 — Framework',
    instruments: '## Chapter 3 — Instruments',
    close: '## Chapter 4 — Close',
  };
  const seenChapters = new Set<string>();

  for (const screen of SCREENS) {
    if (screen.id === 'interview' || screen.id === 'submit' || screen.id === 'thanks') {
      continue; // handled separately or has no data
    }
    if (screen.kind === 'welcome' || screen.kind === 'profile') continue;
    if (
      screen.kind === 'orient-1' ||
      screen.kind === 'orient-2' ||
      screen.kind === 'problem-setup-1' ||
      screen.kind === 'problem-setup-2' ||
      screen.kind === 'framework-setup-1' ||
      screen.kind === 'framework-setup-2' ||
      screen.kind === 'instruments-setup-1' ||
      screen.kind === 'instruments-setup-2'
    ) {
      continue;
    }

    const stepId = screen.stepId;
    if (stepId && chapterHeaders[stepId] && !seenChapters.has(stepId)) {
      sections.push(chapterHeaders[stepId]);
      sections.push('');
      seenChapters.add(stepId);
    }

    const out = analyzeScreen(screen, shortRows, fullRows);
    if (out) sections.push(out);
  }

  // Interview section (FULL only).
  const interviewScreen = SCREENS.find((s) => s.id === 'interview');
  if (interviewScreen) {
    sections.push(analyzeInterview(interviewScreen, fullRows));
  }

  sections.push(analyzeAppendix(shortRows, fullRows));

  return sections.join('\n');
}

/* ── Main ─────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const { shortPath, fullPath, stamp } = await resolveInputPair(opts);

  if (!shortPath && !fullPath) {
    throw new Error(
      `Could not resolve any input file for stamp "${stamp}". ` +
        `Expected ${defaultPath('short', stamp)} or ${defaultPath('full', stamp)}.`,
    );
  }

  const shortRows = await loadSubmissions(shortPath);
  const fullRows = await loadSubmissions(fullPath);

  process.stderr.write(
    `[analyze] stamp=${stamp}  short=${shortRows.length}  full=${fullRows.length}\n`,
  );
  if (!shortPath) process.stderr.write(`[analyze] (no SHORT file for this stamp)\n`);
  if (!fullPath) process.stderr.write(`[analyze] (no FULL file for this stamp)\n`);

  await fs.mkdir(ANALYSIS_DIR, { recursive: true });

  const md = renderReport(shortRows, fullRows, stamp, { shortPath, fullPath });
  const outPath = path.join(ANALYSIS_DIR, `report-${stamp}.md`);
  await fs.writeFile(outPath, md, 'utf8');
  process.stderr.write(`[analyze] wrote ${outPath}\n`);

  if (opts.includeOpens) {
    const opens = buildOpensSideFile(shortRows, fullRows);
    const opensPath = path.join(ANALYSIS_DIR, `opens-${stamp}.txt`);
    await fs.writeFile(opensPath, opens, 'utf8');
    process.stderr.write(`[analyze] wrote ${opensPath}\n`);
  }
}

main().catch((err) => {
  console.error('[analyze] failed', err);
  process.exit(1);
});
