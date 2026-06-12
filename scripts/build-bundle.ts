/* build-bundle — assemble a single self-contained OFFLINE working bundle for
   one snapshot, pairing the shareable artifacts with the restricted ones so
   the full analysis (quantitative + qualitative) and the writing can be done
   from one folder.

   RESTRICTED. The bundle contains personal data and verbatim responses
   (names, institutions, open text). It is written to `bundle/<stamp>/`, which
   is gitignored — never commit or share it. The committed, PII-free
   counterpart is `docs/validation/snapshot-<stamp>/`.

   Gathers, for the resolved snapshot:
     · codebook.{md,json}              (from docs/validation/)
     · report.md                       (from analysis/<stamp>/)
     · dataset-anonymised.{xlsx,csv}   (from analysis/<stamp>/)
     · dataset-restricted.{xlsx,csv}   (from analysis/<stamp>/)
     · opens.txt                       (from analysis/<stamp>/)
     · respondent-map.csv              (from analysis/<stamp>/)
     · raw-submissions.json            (from results/<stamp>/submissions.json)
     · README.md                       (generated guide + privacy notice)

   Usage:
     npm run bundle                  # newest analysed snapshot
     npm run bundle -- --stamp=<ts>  # a specific snapshot

   Prereqs: run export:firestore, codebook, analyze -- --include-opens, and
   dataset for the snapshot first. The command tells you what's missing.
*/

import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import {
  resolveShortInput,
  analysisDirFor,
  resultsDirFor,
  SUBMISSIONS_FILE,
} from './lib/submissions';

const DOCS_VALIDATION_DIR = path.join('docs', 'validation');
const BUNDLE_DIR = 'bundle';

type Item = { src: string; dest: string; hint: string };

function parseArgs(argv: string[]): { stamp: string | null } {
  let stamp: string | null = null;
  for (const arg of argv) {
    if (arg.startsWith('--stamp=')) stamp = arg.slice('--stamp='.length);
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        'build-bundle — assemble an offline working bundle for a snapshot.\n' +
          'Usage: npm run bundle [-- --stamp=<ts>]\n',
      );
      process.exit(0);
    } else process.stderr.write(`[bundle] unknown arg "${arg}" — ignored\n`);
  }
  return { stamp };
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function csvDataRowCount(csvPath: string): Promise<number> {
  let s = await fs.readFile(csvPath, 'utf8');
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  return Math.max(0, s.split(/\r?\n/).filter((l) => l.length > 0).length - 1);
}

function readme(stamp: string, n: number): string {
  return (
    `# PV-ACF validation — OFFLINE working bundle (${stamp})\n\n` +
    `> **RESTRICTED — do not commit or share.** This folder contains personal\n` +
    `> data (reviewer names, institutions) and verbatim open responses. Keep it\n` +
    `> in secure offline storage. The committed, PII-free counterpart is\n` +
    `> \`docs/validation/snapshot-${stamp}/\`.\n\n` +
    `- Snapshot stamp: \`${stamp}\` · Respondents (SHORT, post-cut-off): **${n}**.\n` +
    `- Cut-off: submissions sealed on or after \`2026-05-27T00:00:00.000Z\` only.\n` +
    `- Variant: SHORT only. Fields SHORT never collects (\`c1-q7\`, each\n` +
    `  instrument's Q2, the interview) are absent throughout.\n\n` +
    `## Suggested workflow\n\n` +
    `1. Read \`codebook.md\` to learn the variables and codes.\n` +
    `2. Do the quantitative analysis on \`dataset-anonymised.*\` (frequencies,\n` +
    `   medians, cross-tabs), using \`report.md\` as a cross-check.\n` +
    `3. Do the qualitative analysis on \`opens.txt\`; use \`dataset-restricted.*\`\n` +
    `   + \`respondent-map.csv\` when you need to tie a quote to a respondent.\n` +
    `4. \`raw-submissions.json\` is the source of record if you need to recompute.\n\n` +
    `## Contents and roles\n\n` +
    `### \`codebook.md\` / \`codebook.json\` — data dictionary *(read first)*\n` +
    `One entry per analysis variable: the column name, the full question text,\n` +
    `the scale kind, and the ordered answer options with their numeric codes and\n` +
    `a substantive-vs-no-opinion flag. \`.md\` is for reading; \`.json\` is the same\n` +
    `data for programmatic use. This is the key that makes every coded value in\n` +
    `the datasets interpretable.\n\n` +
    `### \`report.md\` — descriptive results\n` +
    `The pre-computed statistical summary: overview + reviewer profile, then a\n` +
    `chapter per cluster with, for each item, N, frequency table, median, mode,\n` +
    `mean position, and the no-opinion / not-applicable rate. Use it to sanity-\n` +
    `check your own analysis and as a drafting scaffold for the results section.\n\n` +
    `### \`dataset-anonymised.xlsx\` / \`.csv\` — coded data for statistics\n` +
    `One row per respondent (${n} rows); columns are \`respondent\` (R-code),\n` +
    `\`submitted_at\`, then one column per coded variable (ratings as 1-based\n` +
    `option positions; blank = NA). **No free text, no name, no doc_id.** This is\n` +
    `the file you load into SPSS / R / pandas for the quantitative analysis.\n\n` +
    `### \`dataset-restricted.xlsx\` / \`.csv\` — full per-row data *(PII)*\n` +
    `Same one-row-per-respondent shape, but with everything: \`doc_id\`, the\n` +
    `free-text name and institution, and the verbatim open responses in their\n` +
    `own columns. Use it to link a specific answer to a respondent's profile, or\n` +
    `to compile the acknowledgements list. Never share as-is.\n\n` +
    `### \`opens.txt\` — verbatim open responses, grouped by question *(PII)*\n` +
    `Every open-text answer, organised question-by-question under the same\n` +
    `R-codes, with a fill count per question. This is the working file for\n` +
    `thematic coding and for pulling quotes into the chapter.\n\n` +
    `### \`respondent-map.csv\` — the re-identification key *(PII)*\n` +
    `Three columns: \`respondent\` (R-code) ↔ \`doc_id\` ↔ \`submitted_at\`. Lets you\n` +
    `cross-reference an R-code across the anonymised dataset, the opens, and the\n` +
    `raw export. Keep it separate if you ever hand the anonymised data to anyone.\n\n` +
    `### \`raw-submissions.json\` — source of record *(PII)*\n` +
    `The raw Firestore export: an array of sealed submission objects with the\n` +
    `full nested answer payload per respondent. The entire pipeline — codebook,\n` +
    `datasets, report, opens — is reproducible from this file alone.\n\n` +
    `## Coding notes\n\n` +
    `- Ratings are coded as the **1-based position** of the chosen option (see the\n` +
    `  codebook \`Code\` column). Blank = not answered (NA).\n` +
    `- **Non-substantive options** ("Cannot judge", "Not familiar…", "…not yet in\n` +
    `  place") are kept at their scale position. The report gives their rate per\n` +
    `  item; recode them to missing before any interval treatment of the scale.\n` +
    `- \`submitted_at\` is retained in the anonymised dataset as a faint quasi-\n` +
    `  identifier; drop it before any wider release if stricter de-identification\n` +
    `  is required.\n` +
    `- Before quoting any open response, **screen it for identifiability** —\n` +
    `  reviewers sometimes name their own institution mid-answer.\n\n` +
    `## Reproduce\n\n` +
    `Everything derives from \`raw-submissions.json\`: re-run \`npm run dataset\`\n` +
    `and \`npm run analyze -- --include-opens\` against this snapshot.\n`
  );
}

async function main(): Promise<void> {
  const { stamp: argStamp } = parseArgs(process.argv.slice(2));
  const { stamp } = await resolveShortInput({ stamp: argStamp });

  const analysisDir = analysisDirFor(stamp);
  const resultsDir = resultsDirFor(stamp);

  const items: Item[] = [
    { src: path.join(DOCS_VALIDATION_DIR, 'codebook.md'), dest: 'codebook.md', hint: 'npm run codebook' },
    { src: path.join(DOCS_VALIDATION_DIR, 'codebook.json'), dest: 'codebook.json', hint: 'npm run codebook' },
    { src: path.join(analysisDir, 'report.md'), dest: 'report.md', hint: 'npm run analyze' },
    { src: path.join(analysisDir, 'dataset-anonymised.xlsx'), dest: 'dataset-anonymised.xlsx', hint: 'npm run dataset' },
    { src: path.join(analysisDir, 'dataset-anonymised.csv'), dest: 'dataset-anonymised.csv', hint: 'npm run dataset' },
    { src: path.join(analysisDir, 'dataset-restricted.xlsx'), dest: 'dataset-restricted.xlsx', hint: 'npm run dataset' },
    { src: path.join(analysisDir, 'dataset-restricted.csv'), dest: 'dataset-restricted.csv', hint: 'npm run dataset' },
    { src: path.join(analysisDir, 'opens.txt'), dest: 'opens.txt', hint: 'npm run analyze -- --include-opens' },
    { src: path.join(analysisDir, 'respondent-map.csv'), dest: 'respondent-map.csv', hint: 'npm run dataset' },
    { src: path.join(resultsDir, SUBMISSIONS_FILE), dest: 'raw-submissions.json', hint: 'npm run export:firestore' },
  ];

  const missing: string[] = [];
  for (const it of items) {
    if (!(await exists(it.src))) missing.push(`  - ${it.src}  (run: ${it.hint})`);
  }
  if (missing.length > 0) {
    throw new Error(
      `[bundle] cannot assemble snapshot ${stamp} — missing inputs:\n${missing.join('\n')}`,
    );
  }

  const destDir = path.join(BUNDLE_DIR, stamp);
  await fs.mkdir(destDir, { recursive: true });
  for (const it of items) await fs.copyFile(it.src, path.join(destDir, it.dest));

  const n = await csvDataRowCount(path.join(destDir, 'dataset-anonymised.csv'));
  await fs.writeFile(path.join(destDir, 'README.md'), readme(stamp, n), 'utf8');

  process.stderr.write(`[bundle] assembled offline working bundle (N=${n}) → ${destDir}/\n`);
  process.stderr.write(
    `[bundle] ${items.length} files + README.md. RESTRICTED — gitignored, do not commit/share.\n`,
  );
}

main().catch((err) => {
  console.error('[bundle] failed', err);
  process.exit(1);
});
