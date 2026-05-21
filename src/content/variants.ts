/* Questionnaire variants — FULL is implemented, SHORT is architecturally
   supported but not populated. See plan §"Variant-readiness".

   A variant may:
   - hide whole screens (atomic — paired screens go together);
   - relax a question's `required` attribute on rating or open.

   A variant must never add questions or change question types. */

import type { PairedSubQuestion, Question, StandardQuestion } from './types';
import { isPairedQuestion } from './types';
import { CONTENT } from './content';
import { ALWAYS_ON_SCREENS, type Screen, type ScreenId } from '@/routing/screens';

export type VariantId = 'full' | 'short';

export type VariantConfig = {
  id: VariantId;
  label: string;
  /** Screen ids hidden under this variant. Paired screens (`c1-q3q4`,
   *  `c4-close`) are atomic — they vanish or appear as a unit. ALWAYS_ON
   *  screens cannot be hidden; `assertVariantInvariants` rejects misconfigs. */
  hiddenScreens?: ScreenId[];
  /** Per-question relaxation of the `required` attribute on `rating` or `open`.
   *  Keys are question ids — `c2-q5` for standard questions, `c4-q1` / `c4-q2`
   *  for the close-pair catch-alls, and the *slot* string (e.g. `"Q1.3"`)
   *  for paired sub-questions. `composite.required` is intentionally not
   *  overridable: c2-q4 is the only composite, and its grid + composite are
   *  analytically bound — relaxing one without the other would be incoherent. */
  requiredOverrides?: Partial<
    Record<
      string,
      {
        rating?: boolean;
        open?: boolean;
      }
    >
  >;
};

export const VARIANTS: Record<VariantId, VariantConfig> = {
  full: {
    id: 'full',
    label: 'Full review',
    // The whole questionnaire as drafted. No hidden screens, no overrides.
  },
  // short: populated by the user in a future session. Architecture is ready.
  short: {
    id: 'short',
    label: 'Short review (not yet populated)',
  },
};

const DEFAULT_VARIANT_ID: VariantId = 'full';

export function parseVariantId(raw: string | null | undefined): VariantId {
  if (raw === 'short' || raw === 'full') return raw;
  return DEFAULT_VARIANT_ID;
}

export function getVariant(id: VariantId): VariantConfig {
  return VARIANTS[id];
}

/** Returns the subset of SCREENS the variant exposes. ALWAYS_ON_SCREENS are
 *  preserved even if a misconfigured variant tries to hide them. */
export function effectiveScreens(allScreens: Screen[], variant: VariantConfig): Screen[] {
  const hidden = new Set(variant.hiddenScreens ?? []);
  return allScreens.filter((s) => !hidden.has(s.id) || ALWAYS_ON_SCREENS.has(s.id));
}

/** Resolve the effective `required` attribute for a question's field
 *  (rating or open) under the active variant. Accepts a `StandardQuestion`,
 *  a `PairedQuestion` wrapper (always returns false — wrappers carry no
 *  top-level rating/open), or a `PairedSubQuestion`. For paired-sub
 *  overrides, pass the sub's slot string (e.g. `"Q1.3"`) as `questionId`. */
export function effectiveRequired(
  question: Question | PairedSubQuestion,
  questionId: string,
  field: 'rating' | 'open',
  variant: VariantConfig,
): boolean {
  const override = variant.requiredOverrides?.[questionId]?.[field];
  if (override !== undefined) return override;

  // PairedQuestion wrapper itself has no top-level rating/open — only its
  // sub-questions do, and they're resolved by passing the sub directly.
  if ('kind' in question && question.kind === 'paired') return false;

  const baseField = (question as StandardQuestion | PairedSubQuestion)[field];
  return baseField?.required ?? false;
}

/** Dev-time invariant checks for a variant:
 *  - must not hide ALWAYS_ON screens (welcome / profile / submit / thanks);
 *  - every key in `requiredOverrides` must resolve to a known StandardQuestion
 *    id or a known PairedSubQuestion slot. Catches typos cheaply.
 *  Throws if invalid; safe to call at module load in dev. */
export function assertVariantInvariants(variant: VariantConfig): void {
  const hidden = new Set(variant.hiddenScreens ?? []);
  for (const id of hidden) {
    if (ALWAYS_ON_SCREENS.has(id)) {
      throw new Error(
        `Variant "${variant.id}" tries to hide always-on screen "${id}". ` +
          `welcome/profile/submit/thanks cannot be hidden by any variant.`,
      );
    }
  }

  const overrideKeys = Object.keys(variant.requiredOverrides ?? {});
  if (overrideKeys.length === 0) return;

  const knownIds = new Set<string>();
  for (const [qid, q] of Object.entries(CONTENT.questions)) {
    knownIds.add(qid);
    if (isPairedQuestion(q)) {
      for (const sub of q.questions) knownIds.add(sub.slot);
    }
  }

  for (const key of overrideKeys) {
    if (!knownIds.has(key)) {
      throw new Error(
        `Variant "${variant.id}" has a requiredOverrides key "${key}" that ` +
          `does not match any known question id or paired-sub slot. ` +
          `Standard questions: c1-q1 etc. Paired subs: Q1.3, Q1.4.`,
      );
    }
  }
}
