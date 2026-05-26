/* "What you will be asked" preview list — port of clusterPreview() from
   docs/reference-prototype/screens-templates.jsx. Hand-curated per cluster;
   the prototype keeps it in code rather than deriving from CONTENT.questions
   because the preview wording is short-form copy distinct from question stems.

   The `kind` string on each item is variant-aware: under SHORT the
   instrument screens hide Q2 and relax the shared open from required to
   optional (see variants.ts), so the preview line that names the answer
   pattern needs to reflect that. */

import { CONTENT, type ClusterId } from '@/content';
import type { VariantId } from '@/content/variants';

export type PreviewItem = {
  num: string;
  title: string;
  kind?: string;
};

export type ClusterPreview = {
  count: number;
  items: PreviewItem[];
};

export function clusterPreview(id: ClusterId, variant: VariantId): ClusterPreview | null {
  if (id === 'problem') {
    return {
      count: 8,
      items: [
        { num: '1.1', title: 'Solution-first adoption', kind: 'rating + optional open' },
        { num: '1.2', title: 'Institutional reshaping', kind: 'rating + optional open' },
        { num: '1.3', title: 'Who shapes the priorities', kind: 'rating + optional open · paired' },
        { num: '1.4', title: 'Was there ever a deliberation', kind: 'rating only · paired' },
        { num: '1.5', title: 'Are the layers connected', kind: 'rating + optional open' },
        { num: '1.6', title: 'What existing checks examine', kind: 'rating + optional open' },
        { num: '1.7', title: 'Is a recognise-and-name framework warranted', kind: 'rating + optional open' },
        { num: '1.8', title: 'Have generative AI tools changed the picture', kind: 'rating + optional open' },
      ],
    };
  }
  if (id === 'framework') {
    return {
      count: 6,
      items: [
        { num: '2.1', title: 'Is the two-layer structure useful', kind: 'rating + optional open' },
        { num: '2.2', title: 'AI governance as a recurring cycle', kind: 'open-only' },
        { num: '2.3', title: 'Are these the right four structural governance gaps', kind: 'rating + required open' },
        { num: '2.4', title: 'Recognising the four structural governance gaps in practice', kind: 'rating grid + single-select' },
        { num: '2.5', title: 'Bringing structural conditions back into view', kind: 'open-only' },
        { num: '2.6', title: 'The Generative LLM Gate — stopping condition', kind: 'rating + optional open' },
      ],
    };
  }
  if (id === 'instruments') {
    // SHORT hides Q2 on every instrument and relaxes the shared open from
    // required to optional (see variants.ts). The preview's `kind` string
    // mirrors that so c3-setup2 reads accurately under each variant.
    const kind =
      variant === 'short'
        ? '1 rating + shared optional open'
        : '2 ratings + shared required open';
    return {
      count: 4,
      items: CONTENT.instruments.map((inst, i) => ({
        num: `3.${i + 1}`,
        title: `${inst.code} — ${inst.title}`,
        kind,
      })),
    };
  }
  // 'close' has no preview — Cluster 4 has no setup screen since ADR 0011
  // (c4-setup was merged into c4-close).
  return null;
}

export function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
