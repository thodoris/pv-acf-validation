/* dump-short-questions — one-off tsx utility that walks a variant's
   effective spine and prints a JSON dictionary keyed by screen id with
   an array of question stems per screen.

   Despite the historical name, it now accepts a positional variant arg:
     npx tsx scripts/dump-short-questions.ts          # defaults to short
     npx tsx scripts/dump-short-questions.ts short
     npx tsx scripts/dump-short-questions.ts full

   Unknown / missing args fall back to SHORT and print a one-line warning
   to stderr so the stdout JSON stays clean for redirection.

   Per-screen rules (variant-aware via the variants.ts helpers):
   · paired wrappers contribute one stem per sub-question;
   · instrument screens contribute Q1 and/or Q2 depending on
     `hiddenFields` for the active variant;
   · c2-q4 emits both the grid stem and the composite subStem;
   · open prompts are excluded — only rating / composite stems land in
     the dump;
   · setup / orientation / welcome / submit / thanks map to empty arrays. */

import { CONTENT, isPairedQuestion } from '../src/content/index';
import {
  VARIANTS,
  effectiveScreens,
  effectiveFieldHidden,
  type VariantId,
} from '../src/content/variants';
import { SCREENS } from '../src/routing/screens';

function parseVariantArg(raw: string | undefined): VariantId {
  if (raw === 'short' || raw === 'full') return raw;
  if (raw !== undefined) {
    process.stderr.write(
      `[dump-questions] unknown variant "${raw}" — falling back to "short". ` +
        `Valid values: short | full.\n`,
    );
  }
  return 'short';
}

const variantId = parseVariantArg(process.argv[2]);
const v = VARIANTS[variantId];
process.stderr.write(`[dump-questions] variant=${variantId}\n`);
const visible = effectiveScreens(SCREENS, v);
const out: Record<string, string[]> = {};

for (const s of visible) {
  const stems: string[] = [];

  if (s.id === 'c4-close') {
    const q1 = CONTENT.questions['c4-q1'];
    const q2 = CONTENT.questions['c4-q2'];
    if (q1 && !isPairedQuestion(q1)) stems.push(q1.question);
    if (q2 && !isPairedQuestion(q2)) stems.push(q2.question);
  } else if (s.kind === 'instrument') {
    const inst = CONTENT.instruments.find((i) => i.id === s.id);
    if (inst) {
      if (!effectiveFieldHidden(s.id, 'q1', v)) stems.push(inst.q1.question);
      if (!effectiveFieldHidden(s.id, 'q2', v)) stems.push(inst.q2.question);
    }
  } else {
    const q = CONTENT.questions[s.id];
    if (q) {
      if (isPairedQuestion(q)) {
        for (const sub of q.questions) stems.push(sub.question);
      } else {
        stems.push(q.question);
        if (q.composite) stems.push(q.composite.subStem);
      }
    }
    // Screens with no question entry (welcome / profile / grounding /
    // setup-* / submit / thanks) fall through with an empty stems array.
  }

  out[s.id] = stems;
}

process.stdout.write(JSON.stringify(out, null, 2) + '\n');
