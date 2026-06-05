/* build-dataset — respondent-level analysis dataset for the SHORT instrument.

   Reads the newest SHORT JSON export under results/ (post-cut-off), decodes
   every answer to its codebook value, and writes analysis-ready datasets to
   analysis/ in TWO privacy tiers and TWO formats each:

     · dataset-restricted-<stamp>.{xlsx,csv}  — full working copy: every
       variable incl. verbatim opens and free-text name / institution, plus
       doc_id. RESTRICTED to the author.
     · dataset-anonymised-<stamp>.{xlsx,csv}  — coded variables only, no
       free text, no doc_id. Shareable / thesis-appendix tier.
     · respondent-map-<stamp>.csv             — R-code ↔ doc_id ↔ submittedAt.
       RESTRICTED (the re-identification key).

   Column names + codes match docs/validation/codebook.md exactly (both are
   generated from scripts/lib/codebook.ts). Ratings are coded to the 1-based
   option position; blank = NA (empty cell). Non-substantive options keep
   their scale position (recode to missing downstream if desired).

   xlsx is the safe primary (no delimiter hazards); the CSV is RFC-4180
   quoted (UTF-8 + BOM, quotes doubled, fields with , ; " newline quoted,
   formula-injection guard) so special characters in open text can't corrupt
   the table.

   Usage:
     npm run dataset
     npm run dataset -- --stamp=<timestamp>
     npm run dataset -- --short=<path>
*/

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as XLSX from 'xlsx';

import {
  resolveShortInput,
  loadShortSubmissions,
  analysisDirFor,
  type SubmissionRow,
} from './lib/submissions';
import {
  enumerateShortVariables,
  extractRaw,
  decodeCell,
  respondentCodes,
  type Variable,
} from './lib/codebook';

type Cell = number | string;

/* ── CLI ──────────────────────────────────────────────────────────────── */

function parseArgs(argv: string[]): { shortPath: string | null; stamp: string | null } {
  let shortPath: string | null = null;
  let stamp: string | null = null;
  for (const arg of argv) {
    if (arg.startsWith('--short=')) shortPath = arg.slice('--short='.length);
    else if (arg.startsWith('--stamp=')) stamp = arg.slice('--stamp='.length);
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        'build-dataset — respondent-level SHORT dataset (restricted + anonymised).\n' +
          'Usage: npm run dataset [-- --stamp=<ts> | --short=<path>]\n',
      );
      process.exit(0);
    } else process.stderr.write(`[dataset] unknown arg "${arg}" — ignored\n`);
  }
  return { shortPath, stamp };
}

/* ── CSV serialization (RFC 4180 + BOM + injection guard) ─────────────── */

function csvField(val: Cell): string {
  if (typeof val === 'number') return String(val);
  let s = val;
  // Spreadsheet formula-injection guard: neutralise a leading =, +, -, @,
  // tab or CR by prefixing a single quote.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  // Quote when the field contains a delimiter, quote, or newline. Semicolon
  // included so semicolon-delimited locales stay safe too.
  if (/[",;\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(header: string[], rows: Cell[][]): string {
  const BOM = '﻿';
  const lines = [header.map(csvField).join(',')];
  for (const r of rows) lines.push(r.map(csvField).join(','));
  return BOM + lines.join('\r\n') + '\r\n';
}

/* ── xlsx serialization ───────────────────────────────────────────────── */

function writeXlsx(filePath: string, header: string[], rows: Cell[][]): void {
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'data');
  XLSX.writeFile(wb, filePath);
}

/* ── Matrix construction ──────────────────────────────────────────────── */

function rowCells(row: SubmissionRow, vars: Variable[]): Cell[] {
  return vars.map((v) => decodeCell(v, extractRaw(row.answers, v.source)));
}

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
  const codes = respondentCodes(rows);
  const ordered = [...rows].sort((a, b) => {
    const ca = codes.get(a.docId) ?? '';
    const cb = codes.get(b.docId) ?? '';
    return ca < cb ? -1 : ca > cb ? 1 : 0;
  });

  const allVars = enumerateShortVariables();
  const anonVars = allVars.filter((v) => !v.restricted);

  // Restricted tier — everything + doc_id.
  const restrictedHeader = ['respondent', 'doc_id', 'submitted_at', ...allVars.map((v) => v.name)];
  const restrictedRows: Cell[][] = ordered.map((r) => [
    codes.get(r.docId) ?? r.docId,
    r.docId,
    r.submittedAt ?? '',
    ...rowCells(r, allVars),
  ]);

  // Anonymised tier — coded variables only, no free text, no doc_id.
  const anonHeader = ['respondent', 'submitted_at', ...anonVars.map((v) => v.name)];
  const anonRows: Cell[][] = ordered.map((r) => [
    codes.get(r.docId) ?? r.docId,
    r.submittedAt ?? '',
    ...rowCells(r, anonVars),
  ]);

  // Re-identification key.
  const mapHeader = ['respondent', 'doc_id', 'submitted_at'];
  const mapRows: Cell[][] = ordered.map((r) => [
    codes.get(r.docId) ?? r.docId,
    r.docId,
    r.submittedAt ?? '',
  ]);

  const outDir = analysisDirFor(stamp);
  await fs.mkdir(outDir, { recursive: true });
  const p = (name: string) => path.join(outDir, name);

  writeXlsx(p('dataset-restricted.xlsx'), restrictedHeader, restrictedRows);
  await fs.writeFile(p('dataset-restricted.csv'), toCsv(restrictedHeader, restrictedRows), 'utf8');

  writeXlsx(p('dataset-anonymised.xlsx'), anonHeader, anonRows);
  await fs.writeFile(p('dataset-anonymised.csv'), toCsv(anonHeader, anonRows), 'utf8');

  await fs.writeFile(p('respondent-map.csv'), toCsv(mapHeader, mapRows), 'utf8');

  process.stderr.write(
    `[dataset] stamp=${stamp}  respondents=${ordered.length}  ` +
      `variables: ${allVars.length} restricted / ${anonVars.length} anonymised\n`,
  );
  process.stderr.write(`[dataset] wrote restricted + anonymised datasets + respondent-map in ${outDir}/\n`);
}

main().catch((err) => {
  console.error('[dataset] failed', err);
  process.exit(1);
});
