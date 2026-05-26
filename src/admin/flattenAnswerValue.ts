/* Flatten an AnswerValue into a record of *atomic* scalar columns, keyed by
   dotted paths under the question id (e.g. `c3-ast.q1`, `c3-ast.open`,
   `c4-close.q41.rating`, `c4-close.q41.open`).

   This is the analysis-friendly counterpart to `renderAnswerValue` (which
   collapses everything to one cell). Every value here is a primitive
   string/number, so the resulting xlsx is directly consumable by Excel pivot
   tables and `pandas.read_excel`. The dotted key convention also keeps
   pandas' `DataFrame.columns.str.split('.', expand=True)` round-trippable
   if a multi-index is preferred.

   Schema invariance for variant-hide-able fields: instrument and interview
   answers ALWAYS emit their canonical column set (q1/q2/open for
   instruments; willingness/window/contact for interview). Missing values
   become `""` so a SHORT row and a FULL row produce the same set of
   columns. See sealPayload.ts and ADR 0010. */

import type { AnswerValue } from '@/state/answerStore';

export type FlatRow = Record<string, string | number>;

export function flattenAnswerValue(qid: string, value: AnswerValue): FlatRow {
  switch (value.type) {
    case 'rating':
      return { [qid]: value.value };

    case 'open':
      return { [qid]: value.value };

    case 'rating-and-open': {
      // `rating` is null on the c1-q7 SHORT stub (variant hides the
      // screen). Coerce to '' so the column is always emitted, matching
      // the instrument / interview schema-invariance pattern.
      const out: FlatRow = { [`${qid}.rating`]: value.rating ?? '' };
      if (value.open !== undefined) out[`${qid}.open`] = value.open;
      return out;
    }

    case 'grid-and-composite': {
      const out: FlatRow = {};
      for (const [row, v] of Object.entries(value.grid)) {
        out[`${qid}.${row}`] = v;
      }
      if (value.composite !== undefined) out[`${qid}.composite`] = value.composite;
      return out;
    }

    case 'paired': {
      const out: FlatRow = {};
      for (const [subId, sub] of Object.entries(value.subAnswers)) {
        if (sub.rating !== undefined) out[`${qid}.${subId}.rating`] = sub.rating;
        if (sub.open !== undefined) out[`${qid}.${subId}.open`] = sub.open;
      }
      return out;
    }

    case 'instrument': {
      // Canonical column set — `""` for missing/hidden values so a SHORT
      // row matches a FULL row.
      return {
        [`${qid}.q1`]: value.q1Rating ?? '',
        [`${qid}.q2`]: value.q2Rating ?? '',
        [`${qid}.open`]: value.sharedOpen ?? '',
      };
    }

    case 'profile': {
      const out: FlatRow = {};
      for (const [k, v] of Object.entries(value.data)) {
        out[`${qid}.${k}`] = v;
      }
      return out;
    }

    case 'interview': {
      // Canonical column set for interview — willingness, window, contact —
      // always emitted, with `""` for hidden / undeclared values.
      const w = value.data.window;
      return {
        [`${qid}.willingness`]: stringOrEmpty(value.data.willingness),
        [`${qid}.window`]: Array.isArray(w) ? w.join('; ') : stringOrEmpty(w),
        [`${qid}.contact`]: stringOrEmpty(value.data.contact),
      };
    }
  }
}

function stringOrEmpty(v: string | string[] | null | undefined): string {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) return v.join('; ');
  return v;
}
