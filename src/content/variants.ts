/* Questionnaire variants — both FULL and SHORT now populated.

   A variant may:
   - hide whole screens (atomic — paired screens go together);
   - hide named fields *within* a screen (currently only the instrument
     screens, whose q1 / q2 / sharedOpen are renderable in isolation);
   - relax a question's `required` attribute on rating or open.

   A variant must never add questions or change question types.

   See ADR 0010 for the rationale on SHORT-as-default and the schema-
   invariance contract: the seal payload's column set is identical across
   variants; hidden fields appear as null/empty, not omitted. */

import type { PairedSubQuestion, Question, StandardQuestion } from './types';
import { isPairedQuestion } from './types';
import { CONTENT } from './content';
import { ALWAYS_ON_SCREENS, type Screen, type ScreenId } from '@/routing/screens';

export type VariantId = 'full' | 'short';

/** Field names hide-able within an instrument screen. Compile-time-typed so
 *  `'Q2'` or `'q2 '` (typo) is a TS error, not a silent miss. If more screen
 *  kinds gain per-field hiding later, extend this with a discriminated union
 *  keyed on screen kind. */
export type InstrumentFieldName = 'q1' | 'q2' | 'sharedOpen';

export type VariantConfig = {
  id: VariantId;
  label: string;
  /** Screen ids hidden under this variant. Paired screens (`c1-q3q4`,
   *  `c4-close`) are atomic — they vanish or appear as a unit. ALWAYS_ON
   *  screens cannot be hidden; `assertVariantInvariants` rejects misconfigs. */
  hiddenScreens?: ScreenId[];
  /** Per-screen list of named fields to hide. The screen's renderer is
   *  responsible for omitting the field's UI and answer state; the seal-
   *  payload normaliser coerces the persisted field to null/empty so the
   *  exported schema stays variant-invariant. Currently used only for
   *  instrument screens (c3-ciw / c3-ast / c3-dma / c3-cpd) — the field
   *  names are `InstrumentFieldName` values. */
  hiddenFields?: Partial<Record<ScreenId, readonly InstrumentFieldName[]>>;
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
  short: {
    id: 'short',
    label: 'Short review',
    // SHORT trim:
    // - c1-q7 (Problem · "Is a recognise-and-name framework warranted?") is
    //   dropped; the cluster renumbers from 8 to 7 in the visible spine and
    //   c1-q8 takes slot 1.7. A null/empty stub is still emitted to the
    //   seal payload so the export schema stays variant-invariant.
    // - The interview screen is dropped (no follow-up willingness asked).
    // - The four c3 instrument screens hide Q2 (applicability rating) — Q1
    //   (quality rating) and the shared open are retained.
    // - The shared open is relaxed from required to optional on every
    //   instrument so a reviewer with no synthesis to add can Continue.
    // Schema invariance is preserved automatically by sealPayload.ts:
    // c1-q7 / interview entries are stub-injected with null fields, and
    // q2Rating is coerced to null on each c3 screen's outbound payload.
    hiddenScreens: ['c1-q7', 'interview'],
    hiddenFields: {
      'c3-ciw': ['q2'],
      'c3-ast': ['q2'],
      'c3-dma': ['q2'],
      'c3-cpd': ['q2'],
    },
    requiredOverrides: {
      'c3-ciw': { open: false },
      'c3-ast': { open: false },
      'c3-dma': { open: false },
      'c3-cpd': { open: false },
    },
  },
};

// SHORT is the default at release (see ADR 0010). Bare URL delivers SHORT;
// `?v=full` is the elevated path. Keep this value in sync with the
// `variant:` initial in src/state/sessionStore.ts and with the
// `<html data-variant="…">` initial in index.html.
const DEFAULT_VARIANT_ID: VariantId = 'short';

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

/** True iff the variant hides `fieldName` on the given screen. Pure read
 *  of variant.hiddenFields; the renderer is responsible for short-circuiting
 *  the field's UI and the seal-payload normaliser coerces the persisted
 *  field to null/empty. */
export function effectiveFieldHidden(
  screenId: ScreenId,
  fieldName: InstrumentFieldName,
  variant: VariantConfig,
): boolean {
  const fields = variant.hiddenFields?.[screenId];
  if (!fields) return false;
  return fields.includes(fieldName);
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

/** Dev-time invariant checks for a variant. Throws on misconfiguration so
 *  the failure is loud at module load rather than mysterious at runtime.
 *
 *  Hidden screens:
 *  - cannot include ALWAYS_ON_SCREENS (welcome / profile / submit / thanks).
 *
 *  Required overrides:
 *  - every key must resolve to a known StandardQuestion id or PairedSub slot.
 *
 *  Hidden fields:
 *  - keys must resolve to known instrument screen ids (currently the only
 *    screen kind with field-level hiding);
 *  - cannot hide `sharedOpen` for any instrument — the synthesis answer is
 *    analytically load-bearing even when one rating is hidden;
 *  - cannot hide both `q1` and `q2` on the same screen — no instrument
 *    screen is meaningful with neither rating present.
 */
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
  if (overrideKeys.length > 0) {
    const knownIds = new Set<string>();
    for (const [qid, q] of Object.entries(CONTENT.questions)) {
      knownIds.add(qid);
      if (isPairedQuestion(q)) {
        for (const sub of q.questions) knownIds.add(sub.slot);
      }
    }
    // Instrument screens accept requiredOverrides too (consumed by
    // InstrumentScreen for the shared open's `required` flag).
    for (const inst of CONTENT.instruments) knownIds.add(inst.id);
    for (const key of overrideKeys) {
      if (!knownIds.has(key)) {
        throw new Error(
          `Variant "${variant.id}" has a requiredOverrides key "${key}" that ` +
            `does not match any known question id, paired-sub slot, or ` +
            `instrument screen id. Standard questions: c1-q1 etc. ` +
            `Paired subs: Q1.3, Q1.4. Instruments: c3-ciw / c3-ast / c3-dma / c3-cpd.`,
        );
      }
    }
  }

  const hiddenFieldsEntries = Object.entries(variant.hiddenFields ?? {});
  if (hiddenFieldsEntries.length > 0) {
    const instrumentIds = new Set(CONTENT.instruments.map((i) => i.id));
    for (const [screenId, fields] of hiddenFieldsEntries) {
      if (!instrumentIds.has(screenId as never)) {
        throw new Error(
          `Variant "${variant.id}" has a hiddenFields key "${screenId}" that ` +
            `is not a known instrument screen id (c3-ciw / c3-ast / c3-dma / c3-cpd).`,
        );
      }
      if (!fields || fields.length === 0) continue;
      if (fields.includes('sharedOpen')) {
        throw new Error(
          `Variant "${variant.id}" tries to hide "sharedOpen" on "${screenId}". ` +
            `The synthesis open answer is analytically load-bearing on every ` +
            `instrument screen — it can be made optional via requiredOverrides ` +
            `but cannot be hidden.`,
        );
      }
      if (fields.includes('q1') && fields.includes('q2')) {
        throw new Error(
          `Variant "${variant.id}" tries to hide both "q1" and "q2" on ` +
            `"${screenId}". An instrument screen with neither rating is ` +
            `analytically meaningless.`,
        );
      }
    }
  }
}
