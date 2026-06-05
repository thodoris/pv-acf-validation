/* build-codebook — generate the SHORT-variant data dictionary.

   Walks the SHORT instrument (via scripts/lib/codebook.ts) and writes two
   artifacts to docs/validation/ (a TRACKED path — this is a stable thesis
   reference, not ephemeral analysis output):

     · codebook.md   — human-readable data dictionary for the thesis appendix.
     · codebook.json — machine-readable variable list (same data) for your
                       own pandas/R use.

   Run ONCE. The questionnaire structure is frozen now that the app is live;
   regenerate only if CONTENT or the SHORT trim actually changes.

   Usage:
     npm run codebook
*/

import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import {
  enumerateShortVariables,
  type Variable,
} from './lib/codebook';

const OUT_DIR = path.join('docs', 'validation');

function escapePipes(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function renderVariable(v: Variable): string {
  const lines: string[] = [];
  const req = v.required ? 'required' : 'optional';
  const restricted = v.restricted ? ' · **restricted** (omitted from anonymised dataset)' : '';
  lines.push(`#### \`${v.name}\` — ${req}${restricted}`);
  lines.push('');
  lines.push(`- Location: ${v.location}`);
  lines.push(`- Question: ${escapePipes(v.stem)}`);
  if (v.subtitle) lines.push(`- Subtitle: ${escapePipes(v.subtitle)}`);
  const typeBits = [`role: ${v.role}`, `measure: ${v.measure}`];
  if (v.scaleKind) typeBits.push(`scale: ${v.scaleKind}`);
  lines.push(`- Type: ${typeBits.join(' · ')}`);
  if (v.openPrompt) lines.push(`- Prompt: ${escapePipes(v.openPrompt)}`);
  if (v.options && v.options.length > 0) {
    lines.push('');
    lines.push('| Code | Label | Substantive |');
    lines.push('| ---: | --- | :---: |');
    for (const o of v.options) {
      lines.push(`| ${o.code} | ${escapePipes(o.label)} | ${o.substantive ? 'yes' : '**no**'} |`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

function renderMarkdown(vars: Variable[]): string {
  const out: string[] = [];
  out.push('# PV-ACF validation — SHORT-variant codebook');
  out.push('');
  out.push(
    'Data dictionary for the SHORT instrument, generated from `CONTENT` + ' +
      '`variants.ts` by `npm run codebook`. One entry per analysis variable. ' +
      'Variable names match the columns in the dataset produced by ' +
      '`npm run dataset`.',
  );
  out.push('');
  out.push('## Coding conventions');
  out.push('');
  out.push(
    '- **Ratings** are coded as the **1-based position** of the chosen option ' +
      '(the `Code` column below). A blank cell means the item was not answered (NA).',
  );
  out.push(
    '- **Profile select fields** (institution type, years) are coded to the ' +
      '1-based position of the matched option label.',
  );
  out.push(
    '- **Open-text** and free-text profile fields (name, institution name) carry ' +
      'verbatim responses; they are **restricted** to the author dataset and never ' +
      'appear in the anonymised copy.',
  );
  out.push(
    '- **Non-substantive options** (`Substantive = no` — "Cannot judge", "Not ' +
      'familiar enough to say", "These checks are not yet in place …") are **kept ' +
      'at their scale position** in the dataset. The report counts them separately ' +
      'as a no-opinion / not-applicable rate. Recode them to missing before any ' +
      'interval treatment of the scale.',
  );
  out.push(
    '- **Measure**: `ordinal` scales support median / rank stats; `nominal` ' +
      '(institution type, the "which gap mattered most" composite) are categorical; ' +
      '`text` are free responses.',
  );
  out.push('');
  out.push(`Total variables: **${vars.length}**.`);
  out.push('');

  let currentChapter = '';
  for (const v of vars) {
    if (v.chapter !== currentChapter) {
      out.push(`## ${v.chapter}`);
      out.push('');
      currentChapter = v.chapter;
    }
    out.push(renderVariable(v));
  }
  return out.join('\n');
}

async function main(): Promise<void> {
  const vars = enumerateShortVariables();

  await fs.mkdir(OUT_DIR, { recursive: true });

  const mdPath = path.join(OUT_DIR, 'codebook.md');
  await fs.writeFile(mdPath, renderMarkdown(vars), 'utf8');
  process.stderr.write(`[codebook] wrote ${mdPath} (${vars.length} variables)\n`);

  // JSON: drop the internal `source` pointer — it's an implementation detail
  // of extraction, not part of the published dictionary.
  const jsonPath = path.join(OUT_DIR, 'codebook.json');
  const jsonVars = vars.map(({ source: _source, ...rest }) => rest);
  await fs.writeFile(jsonPath, JSON.stringify(jsonVars, null, 2), 'utf8');
  process.stderr.write(`[codebook] wrote ${jsonPath}\n`);
}

main().catch((err) => {
  console.error('[codebook] failed', err);
  process.exit(1);
});
