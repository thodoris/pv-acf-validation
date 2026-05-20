/* Questionnaire variants — FULL is implemented, SHORT is architecturally
   supported but not populated. See plan §"Variant-readiness".

   A variant may:
   - hide whole screens (atomic — paired screens go together);
   - relax a question's `required` attribute on rating or open.

   A variant must never add questions or change question types. */

import type { Question } from './types';
import { isPairedQuestion } from './types';
import { ALWAYS_ON_SCREENS, type Screen, type ScreenId } from '@/routing/screens';

export type VariantId = 'full' | 'short';

export type VariantConfig = {
  id: VariantId;
  label: string;
  hiddenScreens?: ScreenId[];
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
 *  (rating or open) under the active variant. */
export function effectiveRequired(
  question: Question,
  questionId: string,
  field: 'rating' | 'open',
  variant: VariantConfig,
): boolean {
  const override = variant.requiredOverrides?.[questionId]?.[field];
  if (override !== undefined) return override;

  if (isPairedQuestion(question)) {
    // Paired questions don't have top-level rating/open; resolve per sub-question
    // via the explicit override path only.
    return false;
  }
  const baseField = question[field];
  return baseField?.required ?? false;
}

/** Dev-time invariant: a variant must not hide one half of a paired screen
 *  (the paired screen IS the atomic unit). And must not hide ALWAYS_ON.
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
}
