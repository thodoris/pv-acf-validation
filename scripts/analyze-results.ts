/* analyze-results — offline aggregation of a SHORT-variant JSON export.

   Reads `results/short-pvacf-submissions-<stamp>.json` (the JSON payload
   produced by `npm run export:firestore`) and writes a single markdown
   report to `analysis/report-<stamp>.md`.

   The script does not call Firestore. It only consumes files already on
   disk. Submissions whose `submittedAt` is null, or whose `submittedAt`
   predates the permanent cut-off (see below), are excluded.

   SHORT-only. The platform ships the SHORT variant exclusively (the FULL
   variant is not in use), so this report covers the SHORT instrument and
   nothing else. Fields SHORT never collects — the `c1-q7` warrant question,
   each instrument's Q2 applicability rating, and the follow-up `interview`
   screen — are omitted entirely rather than reported as empty.

   Usage:
     npm run analyze
     npm run analyze -- --stamp=2026-05-26T14-30-00
     npm run analyze -- --short=results/foo.json
     npm run analyze -- --include-opens     # also writes analysis/opens-<stamp>.txt
*/

import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import { SCREENS, type Screen } from '../src/routing/screens';
import { VARIANTS, effectiveFieldHidden } from '../src/content/variants';
import { CONTENT, isPairedQuestion } from '../src/content/index';
import type { AnswerValue } from '../src/state/answerStore';
import type {
  Instrument,
  PairedSubQuestion,
  ProfileField,
  Rating,
  StandardQuestion,
} from '../src/content/types';
import {
  type SubmissionRow,
  SUBMISSION_CUTOFF_ISO,
  resolveShortInput,
  loadShortSubmissions,
  analysisDirFor,
} from './lib/submissions';
import {
  isNonSubstantiveOption,
  enumerateShortVariables,
  extractRaw,
  respondentCodes,
} from './lib/codebook';

/* ── Types ────────────────────────────────────────────────────────────── */

type CliOptions = {
  shortPath: string | null;
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

/* ── Constants ────────────────────────────────────────────────────────── */

/* Screens the SHORT variant hides outright. Skipped wholesale in the report
 * — they bear no SHORT data (the seal payload stubs them to null only to
 * keep the export schema variant-invariant). */
const SHORT_HIDDEN_SCREENS = new Set(VARIANTS.short.hiddenScreens ?? []);

/* ── CLI ──────────────────────────────────────────────────────────────── */

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    shortPath: null,
    stamp: null,
    includeOpens: false,
  };
  for (const arg of argv) {
    if (arg === '--include-opens') {
      opts.includeOpens = true;
    } else if (arg.startsWith('--short=')) {
      opts.shortPath = arg.slice('--short='.length);
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
    'analyze-results — produce a SHORT-only markdown stats report from a JSON export.\n' +
      '\n' +
      'Usage:\n' +
      '  npm run analyze\n' +
      '  npm run analyze -- --stamp=<timestamp>\n' +
      '  npm run analyze -- --short=<path>\n' +
      '  npm run analyze -- --include-opens\n' +
      '\n' +
      'Defaults: picks the newest SHORT JSON export under results/.\n',
  );
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
  // Transparency line: how many of the responses chose a non-substantive
  // option ("Cannot judge" / "Not familiar" / "not in place"). Only shown
  // when the scale actually defines one. The count stays in the figures
  // above (per the analysis decision); this surfaces it for the reader.
  const nonSub = stats.frequencies.filter((f) => isNonSubstantiveOption(f.label));
  if (nonSub.length > 0) {
    const nNonSub = nonSub.reduce((a, f) => a + f.count, 0);
    const pct = stats.nResponded > 0 ? (nNonSub / stats.nResponded) * 100 : 0;
    lines.push(
      `- No-opinion / not-applicable: ${nNonSub} of ${stats.nResponded} responded ` +
        `(${pct.toFixed(1)}%) — ${nonSub.map((f) => `"${f.label}"`).join(', ')}. ` +
        `*Kept in the figures above; recode to missing for interval stats.*`,
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

/* SHORT-only. Every analyzer consumes the single pool of SHORT submission
 * rows. Screens SHORT hides (c1-q7, interview) never reach these functions —
 * they are skipped in renderReport. Each instrument's Q2 rating is hidden in
 * SHORT and skipped inside analyzeInstrument.
 */

function analyzeProfile(rows: SubmissionRow[]): string {
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

function analyzeStandardQuestion(screen: Screen, rows: SubmissionRow[]): string {
  const q = CONTENT.questions[screen.id];
  if (!q || isPairedQuestion(q)) return '';
  const stdQ = q as StandardQuestion;
  const lines: string[] = [];
  lines.push(`### ${screen.location}`);
  lines.push('');
  lines.push(`*${stdQ.question}*`);
  lines.push('');

  // c2-q4 is rating-grid + composite; handle separately.
  if (stdQ.rating?.kind === 'grid') {
    lines.push(renderGridBlock(screen.id, stdQ.rating, rows));
    if (stdQ.composite) {
      const compositeResponses = pool(rows, (r) =>
        extractByKind(r, screen.id, 'grid-and-composite', (v) => v.composite ?? null),
      );
      const stats = computeRatingStats(
        compositeResponses.values,
        stdQ.composite.options,
        compositeResponses.nTotal,
      );
      lines.push(renderRatingBlock(stdQ.composite.subStem, stats));
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
    lines.push(renderRatingBlock('Rating', stats));
  }

  if (stdQ.open) {
    const openResponses = pool(rows, (r) =>
      extractByKind(r, screen.id, 'rating-and-open', (v) => v.open ?? null),
    );
    const stats = computeOpenStats(openResponses.values, openResponses.nTotal);
    lines.push(renderOpenBlock(`Open — ${stdQ.open.label}`, stats));
  }

  return lines.join('\n');
}

function renderGridBlock(
  screenId: string,
  rating: Extract<Rating, { kind: 'grid' }>,
  rows: SubmissionRow[],
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
    lines.push(renderRatingBlock(`Row · ${rowText}`, stats));
  }
  return lines.join('\n');
}

function analyzePaired(screen: Screen, rows: SubmissionRow[]): string {
  const q = CONTENT.questions[screen.id];
  if (!q || !isPairedQuestion(q)) return '';
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
      lines.push(renderRatingBlock(`Rating · ${sub.slot}`, stats));
    }
    if (sub.open) {
      const pulled = pool(rows, (r) =>
        extractByKind(r, screen.id, 'paired', (v) => v.subAnswers[sub.slot]?.open ?? null),
      );
      const stats = computeOpenStats(pulled.values, pulled.nTotal);
      lines.push(renderOpenBlock(`Open · ${sub.slot} — ${sub.open.label}`, stats));
    }
  }
  return lines.join('\n');
}

function analyzeClosePair(screen: Screen, rows: SubmissionRow[]): string {
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

function analyzeInstrument(screen: Screen, rows: SubmissionRow[]): string {
  const inst = CONTENT.instruments.find((i) => i.id === screen.id) as Instrument | undefined;
  if (!inst) return '';
  const lines: string[] = [];
  lines.push(`### ${screen.location}`);
  lines.push('');

  // Q1 (quality rating) is collected in SHORT; Q2 (applicability) is hidden
  // and therefore skipped. Driven by the variant config so a future
  // instrument that keeps Q2 would report it without a code change.
  for (const field of ['q1', 'q2'] as const) {
    if (effectiveFieldHidden(screen.id, field, VARIANTS.short)) continue;
    const sub = field === 'q1' ? inst.q1 : inst.q2;
    const pulled = pool(rows, (r) =>
      extractByKind(r, screen.id, 'instrument', (v) =>
        field === 'q1' ? v.q1Rating : v.q2Rating,
      ),
    );
    const stats = computeRatingStats(pulled.values, sub.rating.options, pulled.nTotal);
    lines.push(`*${field.toUpperCase()} — ${sub.question}*`);
    lines.push('');
    lines.push(renderRatingBlock(`Rating · ${field.toUpperCase()}`, stats));
  }

  // sharedOpen: optional in SHORT (relaxed from required via requiredOverrides).
  const pulled = pool(rows, (r) =>
    extractByKind(r, screen.id, 'instrument', (v) => v.sharedOpen ?? null),
  );
  const stats = computeOpenStats(pulled.values, pulled.nTotal);
  lines.push(`*Shared open — ${inst.sharedOpen.label}*`);
  lines.push('');
  lines.push(renderOpenBlock('Synthesis', stats, 'optional in SHORT'));
  return lines.join('\n');
}

/* ── Overview section ────────────────────────────────────────────────── */

function analyzeOverview(
  rows: SubmissionRow[],
  stamp: string,
  inputPath: string | null,
): string {
  const submittedAt = rows
    .map((r) => r.submittedAt)
    .filter((v): v is string => v !== null && v.length > 0)
    .sort();
  const earliest = submittedAt[0] ?? '—';
  const latest = submittedAt[submittedAt.length - 1] ?? '—';
  return (
    `# PV-ACF validation analysis — ${stamp}\n\n` +
    `## Overview\n\n` +
    `- Submissions (SHORT): **${rows.length}**.\n` +
    `- Submission window: ${earliest} → ${latest}.\n` +
    `- **Cut-off filter (permanent):** only submissions sealed on or after ` +
    `\`${SUBMISSION_CUTOFF_ISO}\` (27 May 2026, midnight UTC) are included. ` +
    `Earlier submissions are excluded from every count, table, and appendix.\n` +
    `- **Variant: SHORT only.** This report covers the SHORT instrument exclusively ` +
    `(the FULL variant is not in use). Fields SHORT never collects — the \`c1-q7\` ` +
    `warrant question, each instrument's Q2 applicability rating, and the follow-up ` +
    `\`interview\` screen — are omitted entirely.\n` +
    `- Input: \`${inputPath ?? '(none)'}\`.\n` +
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
    `- **Non-substantive options** ("Cannot judge", "Not familiar enough to say", ` +
    `"…not yet in place") are kept at their scale position in the figures; their ` +
    `combined rate is reported per item as a no-opinion / not-applicable line so ` +
    `the reader can judge each item's interpretability.\n` +
    `- **Open-response** sections report only N + word/character counts. ` +
    `Verbatim text is never written to this report; pass \`--include-opens\` ` +
    `if you need the corpus as a side-file.\n` +
    `\n`
  );
}

/* ── Appendix: free-text corpus summary ──────────────────────────────── */

function analyzeAppendix(rows: SubmissionRow[]): string {
  let totalEntries = 0;
  let totalFilled = 0;
  let totalWords = 0;
  let totalChars = 0;

  for (const r of rows) {
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
    `close-pair opens). Verbatim text is not reported.\n\n` +
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

function buildOpensSideFile(rows: SubmissionRow[]): string {
  // Grouped by question (for qualitative coding / quoting), under anonymised
  // respondent codes that match the dataset from `npm run dataset`.
  const codes = respondentCodes(rows);
  const openVars = enumerateShortVariables().filter((v) => v.role === 'open');

  const out: string[] = [];
  out.push('PV-ACF — verbatim open responses (SHORT), grouped by question');
  out.push('=============================================================');
  out.push('');
  out.push(
    'Generated by `npm run analyze -- --include-opens`. RESTRICTED — contains ' +
      'verbatim responses; do not commit or share without an identifiability review.',
  );
  out.push('Respondent codes (R…) match the dataset from `npm run dataset`.');
  out.push('');

  for (const v of openVars) {
    const entries: { code: string; text: string }[] = [];
    for (const r of rows) {
      const t = nonEmpty(extractRaw(r.answers, v.source));
      if (t) entries.push({ code: codes.get(r.docId) ?? r.docId, text: t });
    }
    entries.sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));

    out.push(`### ${v.name} — ${v.location}`);
    if (v.openPrompt) out.push(`Prompt: ${v.openPrompt}`);
    out.push(`Filled: ${entries.length} of ${rows.length}.`);
    out.push('');
    for (const e of entries) {
      out.push(`[${e.code}] ${e.text.replace(/\r?\n/g, '\n      ')}`);
      out.push('');
    }
    out.push('');
  }
  return out.join('\n');
}

/* ── Section dispatcher ──────────────────────────────────────────────── */

function analyzeScreen(screen: Screen, rows: SubmissionRow[]): string | null {
  switch (screen.kind) {
    case 'question':
      return analyzeStandardQuestion(screen, rows);
    case 'paired':
      return analyzePaired(screen, rows);
    case 'close-pair':
      return analyzeClosePair(screen, rows);
    case 'instrument':
      return analyzeInstrument(screen, rows);
    default:
      return null;
  }
}

/* ── Report assembly ─────────────────────────────────────────────────── */

function renderReport(
  rows: SubmissionRow[],
  stamp: string,
  inputPath: string | null,
): string {
  const sections: string[] = [];
  sections.push(analyzeOverview(rows, stamp, inputPath));
  sections.push(analyzeProfile(rows));

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
    if (screen.id === 'submit' || screen.id === 'thanks') {
      continue; // no answer data
    }
    // Skip screens SHORT hides outright (c1-q7, interview).
    if (SHORT_HIDDEN_SCREENS.has(screen.id)) continue;
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

    const out = analyzeScreen(screen, rows);
    if (out) sections.push(out);
  }

  sections.push(analyzeAppendix(rows));

  return sections.join('\n');
}

/* ── Main ─────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const { shortPath, stamp } = await resolveShortInput(opts);

  if (!shortPath) {
    throw new Error(
      `Could not resolve a SHORT input file for stamp "${stamp}". ` +
        `Run \`npm run export:firestore\` first, or pass --short / --stamp.`,
    );
  }

  const rows = await loadShortSubmissions(shortPath);

  process.stderr.write(
    `[analyze] stamp=${stamp}  short=${rows.length}  (SHORT-only, post-cut-off)\n`,
  );

  const outDir = analysisDirFor(stamp);
  await fs.mkdir(outDir, { recursive: true });

  const md = renderReport(rows, stamp, shortPath);
  const outPath = path.join(outDir, 'report.md');
  await fs.writeFile(outPath, md, 'utf8');
  process.stderr.write(`[analyze] wrote ${outPath}\n`);

  if (opts.includeOpens) {
    const opens = buildOpensSideFile(rows);
    const opensPath = path.join(outDir, 'opens.txt');
    await fs.writeFile(opensPath, opens, 'utf8');
    process.stderr.write(`[analyze] wrote ${opensPath}\n`);
  }
}

main().catch((err) => {
  console.error('[analyze] failed', err);
  process.exit(1);
});
