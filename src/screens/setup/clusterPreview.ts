/* "What you will be asked" preview list — port of clusterPreview() from
   docs/reference-prototype/screens-templates.jsx. Hand-curated per cluster;
   the prototype keeps it in code rather than deriving from CONTENT.questions
   because the preview wording is short-form copy distinct from question stems.

   The preview is variant-aware in two ways:
   - Items whose `screenId` is in `variant.hiddenScreens` are filtered out
     and the remaining items are renumbered dense (e.g. c1-q8 takes slot
     1.7 of 7 when SHORT hides c1-q7).
   - The instrument `kind` string reflects SHORT hiding Q2 and relaxing the
     shared open from required to optional. */

import { CONTENT, type ClusterId } from '@/content';
import { getVariant, type VariantId } from '@/content/variants';
import type { ScreenId } from '@/routing/screens';

export type PreviewItem = {
  num: string;
  title: string;
  kind?: string;
  /** Screen this preview entry represents. Paired sub-questions share the
   *  paired wrapper's screen id (c1-q3q4) so the pair is hidden atomically. */
  screenId: ScreenId;
};

export type ClusterPreview = {
  count: number;
  items: PreviewItem[];
};

/** Cluster digit shown in `{digit}.{n}` preview numbers. Mirrors
 *  `CLUSTER_DIGIT` in displayMeta.ts. */
const CLUSTER_DIGIT: Record<ClusterId, number> = {
  problem: 1,
  framework: 2,
  instruments: 3,
  close: 4,
};

/** Pre-variant (FULL-canonical) item lists, keyed by cluster. Each item
 *  carries the screenId it represents; `clusterPreview` filters by the
 *  variant's `hiddenScreens` and renumbers the survivors. */
function fullItems(id: ClusterId, variant: VariantId): Omit<PreviewItem, 'num'>[] | null {
  if (id === 'problem') {
    return [
      { screenId: 'c1-q1', title: 'Solution-first adoption', kind: 'rating + optional open' },
      { screenId: 'c1-q2', title: 'Institutional reshaping', kind: 'rating + optional open' },
      { screenId: 'c1-q3q4', title: 'Who shapes the priorities', kind: 'rating + optional open · paired' },
      { screenId: 'c1-q3q4', title: 'Was there ever a deliberation', kind: 'rating only · paired' },
      { screenId: 'c1-q5', title: 'Are the layers connected', kind: 'rating + optional open' },
      { screenId: 'c1-q6', title: 'What existing checks examine', kind: 'rating + optional open' },
      { screenId: 'c1-q7', title: 'Is a recognise-and-name framework warranted', kind: 'rating + optional open' },
      { screenId: 'c1-q8', title: 'Have generative AI tools changed the picture', kind: 'rating + optional open' },
    ];
  }
  if (id === 'framework') {
    return [
      { screenId: 'c2-q1', title: 'Is the two-layer structure useful', kind: 'rating + optional open' },
      { screenId: 'c2-q2', title: 'AI governance as a recurring cycle', kind: 'open-only' },
      { screenId: 'c2-q3', title: 'Are these the right four structural governance gaps', kind: 'rating + required open' },
      { screenId: 'c2-q4', title: 'Recognising the four structural governance gaps in practice', kind: 'rating grid + single-select' },
      { screenId: 'c2-q5', title: 'Bringing structural conditions back into view', kind: 'open-only' },
      { screenId: 'c2-q6', title: 'The Generative LLM Gate — stopping condition', kind: 'rating + optional open' },
    ];
  }
  if (id === 'instruments') {
    // SHORT hides Q2 on every instrument and relaxes the shared open from
    // required to optional (see variants.ts). The preview's `kind` string
    // mirrors that so c3-setup2 reads accurately under each variant.
    const kind =
      variant === 'short'
        ? '1 rating + shared optional open'
        : '2 ratings + shared required open';
    return CONTENT.instruments.map((inst) => ({
      screenId: inst.id,
      title: `${inst.code} — ${inst.title}`,
      kind,
    }));
  }
  // 'close' has no preview — Cluster 4 has no setup screen since ADR 0011
  // (c4-setup was merged into c4-close).
  return null;
}

export function clusterPreview(id: ClusterId, variantId: VariantId): ClusterPreview | null {
  const base = fullItems(id, variantId);
  if (!base) return null;

  const hidden = new Set(getVariant(variantId).hiddenScreens ?? []);
  const visible = base.filter((it) => !hidden.has(it.screenId));
  const digit = CLUSTER_DIGIT[id];
  const items = visible.map((it, i) => ({ ...it, num: `${digit}.${i + 1}` }));
  return { count: items.length, items };
}

export function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
