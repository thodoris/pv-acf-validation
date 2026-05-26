/* Flatten an AnswerValue (discriminated union, 8 variants) into a single
   readable string for the xlsx export.

   Shared between the browser export and the Node CLI script so a row produced
   by either path has identical contents. Pure — no I/O, no env access — so
   the unit tests can exhaustively cover all eight variants. */

import type { AnswerValue } from '@/state/answerStore';

export function renderAnswerValue(value: AnswerValue | undefined): string {
  if (!value) return '';

  switch (value.type) {
    case 'rating':
      return value.value;

    case 'open':
      return value.value;

    case 'rating-and-open': {
      const rating = value.rating ?? '';
      const open = value.open ?? '';
      return open ? `${rating} | ${open}` : rating;
    }

    case 'grid-and-composite': {
      const gridPart = Object.entries(value.grid)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
      if (!value.composite) return gridPart;
      return gridPart ? `${gridPart} || composite: ${value.composite}` : `composite: ${value.composite}`;
    }

    case 'paired': {
      return Object.entries(value.subAnswers)
        .map(([subId, sub]) => {
          const rating = sub.rating ?? '';
          const open = sub.open ? ` (${sub.open})` : '';
          return `${subId}: ${rating}${open}`;
        })
        .join('; ');
    }

    case 'instrument': {
      const parts: string[] = [];
      if (value.q1Rating) parts.push(`Q1=${value.q1Rating}`);
      if (value.q2Rating) parts.push(`Q2=${value.q2Rating}`);
      if (value.sharedOpen) parts.push(`shared: ${value.sharedOpen}`);
      return parts.join('; ');
    }

    case 'profile':
      return JSON.stringify(value.data);

    case 'interview':
      return JSON.stringify(value.data);
  }
}
