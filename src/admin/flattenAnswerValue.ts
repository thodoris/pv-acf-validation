/* Flatten an AnswerValue into a record of *atomic* scalar columns, keyed by
   dotted paths under the question id (e.g. `c3-ast.q1`, `c3-ast.open`,
   `c4-close.q41.rating`, `c4-close.q41.open`).

   This is the analysis-friendly counterpart to `renderAnswerValue` (which
   collapses everything to one cell). Every value here is a primitive
   string/number, so the resulting xlsx is directly consumable by Excel pivot
   tables and `pandas.read_excel`. The dotted key convention also keeps
   pandas' `DataFrame.columns.str.split('.', expand=True)` round-trippable
   if a multi-index is preferred. */

import type { AnswerValue } from '@/state/answerStore';

export type FlatRow = Record<string, string | number>;

export function flattenAnswerValue(qid: string, value: AnswerValue): FlatRow {
  switch (value.type) {
    case 'rating':
      return { [qid]: value.value };

    case 'open':
      return { [qid]: value.value };

    case 'rating-and-open': {
      const out: FlatRow = { [`${qid}.rating`]: value.rating };
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
      const out: FlatRow = {};
      if (value.q1Rating !== undefined) out[`${qid}.q1`] = value.q1Rating;
      if (value.q2Rating !== undefined) out[`${qid}.q2`] = value.q2Rating;
      if (value.sharedOpen) out[`${qid}.open`] = value.sharedOpen;
      return out;
    }

    case 'profile': {
      const out: FlatRow = {};
      for (const [k, v] of Object.entries(value.data)) {
        out[`${qid}.${k}`] = v;
      }
      return out;
    }

    case 'interview': {
      const out: FlatRow = {};
      for (const [k, v] of Object.entries(value.data)) {
        if (v === undefined) continue;
        // Arrays (e.g. interview window slots) join with '; ' — same convention
        // pandas uses for multi-select cells. JSON-stringify would be valid
        // but harder to read in Excel.
        out[`${qid}.${k}`] = Array.isArray(v) ? v.join('; ') : v;
      }
      return out;
    }
  }
}
