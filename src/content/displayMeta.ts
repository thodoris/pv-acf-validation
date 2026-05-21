/* Render-time composition of the question card's `tag` and `meta` strings
   from structured Question fields. Replaces the previous pattern of
   authoring "Question 2.5 of 6 · Judgment" and splitting on " · " in
   every consumer.

   Three entry points, one per shape:
   - displayMetaForStandard  — c1-q1…c1-q8 (non-paired), c2-q1…c2-q6, c4-q1, c4-q2
   - displayMetaForSub        — Q1.3 / Q1.4 inside the c1-q3q4 wrapper
   - displayMetaForWrapper    — the paired wrapper (synthesized for any
                                future consumer; not rendered today)

   Under FULL the output is identical to the authored `meta` strings
   modulo a Title-Case normalization on c2-q4's registers. Under any
   variant with hidden screens, the X-of-N portion is recomputed from
   the visible-cluster spine. Under any variant with requiredOverrides
   touching a cluster-4 catch-all, the Required/Optional descriptor
   tracks the *effective* required-ness automatically. */

import { CONTENT } from './content';
import { isPairedQuestion } from './types';
import type {
  ClusterId,
  PairedQuestion,
  PairedSubQuestion,
  Register,
  StandardQuestion,
} from './types';
import { effectiveRequired, effectiveScreens, type VariantConfig } from './variants';
import { SCREENS, type ScreenId } from '@/routing/screens';

export type DisplayMeta = { tag: string; meta: string };

/** Maps a question's cluster to the digit shown in "Question {digit}.{n}".
 *  Cluster 3 (instruments) is included for completeness even though
 *  instruments render their own scheme and never call into displayMeta. */
const CLUSTER_DIGIT: Record<ClusterId, number> = {
  problem: 1,
  framework: 2,
  instruments: 3,
  close: 4,
};

// ---------------------------------------------------------------------------
// Visible-cluster spine walk
// ---------------------------------------------------------------------------

type ClusterEntry =
  | { kind: 'standard'; questionId: string; q: StandardQuestion }
  | { kind: 'sub'; wrapperId: string; slot: string; sub: PairedSubQuestion };

/** Yields the question entries in this cluster that are visible under the
 *  active variant, in spine order. A paired wrapper contributes both subs.
 *  The c4-close screen is the one place a single ScreenId hosts two
 *  StandardQuestions (c4-q1 + c4-q2); both yield together. */
function visibleClusterEntries(
  cluster: ClusterId,
  variant: VariantConfig,
): ClusterEntry[] {
  const out: ClusterEntry[] = [];
  for (const screen of effectiveScreens(SCREENS, variant)) {
    // Close pair: one screen, two questions.
    if (screen.id === 'c4-close') {
      pushIfInCluster(out, 'c4-q1', cluster);
      pushIfInCluster(out, 'c4-q2', cluster);
      continue;
    }
    const q = CONTENT.questions[screen.id];
    if (!q || q.cluster !== cluster) continue;
    if (isPairedQuestion(q)) {
      for (const sub of q.questions) {
        out.push({ kind: 'sub', wrapperId: screen.id, slot: sub.slot, sub });
      }
    } else {
      out.push({ kind: 'standard', questionId: screen.id, q });
    }
  }
  return out;
}

function pushIfInCluster(out: ClusterEntry[], id: string, cluster: ClusterId): void {
  const q = CONTENT.questions[id];
  if (!q || isPairedQuestion(q) || q.cluster !== cluster) return;
  out.push({ kind: 'standard', questionId: id, q });
}

/** Count of questions in this cluster visible under the variant. Exposed
 *  as a public helper for tests and any caller that needs the bare count. */
export function visibleClusterCount(
  cluster: ClusterId,
  variant: VariantConfig,
): number {
  return visibleClusterEntries(cluster, variant).length;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function titleCase(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

function formatRegisters(registers: Register[]): string[] {
  return registers.map(titleCase);
}

/** Build the meta segments string for a question. For standard questions
 *  with no register descriptors and an `open` field (the cluster-4
 *  catch-alls), append "Required" / "Optional" derived from the variant-
 *  effective required-ness — so SHORT that relaxes c4-q1 automatically
 *  shows "Optional". Sub-questions always render their registers only. */
function composeMetaSegments(
  q: StandardQuestion | PairedSubQuestion,
  catchallCtx: { questionId: string; variant: VariantConfig } | null,
): string {
  const segments = formatRegisters(q.registers);
  if (segments.length === 0 && catchallCtx && 'open' in q && q.open) {
    const required = effectiveRequired(
      q as StandardQuestion,
      catchallCtx.questionId,
      'open',
      catchallCtx.variant,
    );
    segments.push(required ? 'Required' : 'Optional');
  }
  return segments.join(' · ');
}

// ---------------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------------

/** Compose display strings for a standalone question. `screenId` is the
 *  question's id (and screen id, for non-paired non-c4 questions); for
 *  c4-q1/c4-q2 pass each question's id even though both share the
 *  `c4-close` screen — the helper handles the lookup. */
export function displayMetaForStandard(
  q: StandardQuestion,
  screenId: ScreenId,
  variant: VariantConfig,
): DisplayMeta {
  const entries = visibleClusterEntries(q.cluster, variant);
  const ordinalIdx = entries.findIndex(
    (e) => e.kind === 'standard' && e.questionId === screenId,
  );
  // Defensive fallback: if the question isn't in the visible spine (shouldn't
  // happen — render shouldn't have been reached), fall back to authored
  // numbers so the card still renders coherently.
  const ordinal = ordinalIdx >= 0 ? ordinalIdx + 1 : q.clusterPosition.ordinal;
  const total = entries.length > 0 ? entries.length : q.clusterPosition.totalInFull;
  const digit = CLUSTER_DIGIT[q.cluster];
  const tag = `Question ${digit}.${ordinal} of ${total}`;
  const meta = composeMetaSegments(q, { questionId: screenId, variant });
  return { tag, meta };
}

/** Compose display strings for one leg of a paired wrapper. `wrapperId`
 *  is the wrapper's screen id (e.g. 'c1-q3q4'); `sub` is the
 *  PairedSubQuestion. */
export function displayMetaForSub(
  wrapperId: ScreenId,
  sub: PairedSubQuestion,
  variant: VariantConfig,
): DisplayMeta {
  const wrapper = CONTENT.questions[wrapperId];
  if (!wrapper || !isPairedQuestion(wrapper)) {
    throw new Error(
      `displayMetaForSub: "${wrapperId}" is not a known paired wrapper`,
    );
  }
  const entries = visibleClusterEntries(wrapper.cluster, variant);
  const ordinalIdx = entries.findIndex(
    (e) => e.kind === 'sub' && e.wrapperId === wrapperId && e.slot === sub.slot,
  );
  const ordinal = ordinalIdx >= 0 ? ordinalIdx + 1 : sub.clusterPosition.ordinal;
  const total = entries.length > 0 ? entries.length : sub.clusterPosition.totalInFull;
  const digit = CLUSTER_DIGIT[wrapper.cluster];
  const tag = `Question ${digit}.${ordinal} of ${total}`;
  // Sub-questions never carry the catch-all Required/Optional descriptor.
  const meta = composeMetaSegments(sub, null);
  return { tag, meta };
}

/** Compose display strings for a paired wrapper itself. Format:
 *  "Questions {digit}.{a} + {digit}.{b} of {total}". Not rendered by any
 *  current screen but synthesized for completeness and future use. */
export function displayMetaForWrapper(
  wrapperId: ScreenId,
  wrapper: PairedQuestion,
  variant: VariantConfig,
): DisplayMeta {
  const entries = visibleClusterEntries(wrapper.cluster, variant);
  const total = entries.length > 0 ? entries.length : wrapper.questions.length;
  const digit = CLUSTER_DIGIT[wrapper.cluster];
  const subOrdinals = wrapper.questions.map((s) => {
    const idx = entries.findIndex(
      (e) => e.kind === 'sub' && e.wrapperId === wrapperId && e.slot === s.slot,
    );
    return `${digit}.${idx >= 0 ? idx + 1 : s.clusterPosition.ordinal}`;
  });
  const tag =
    subOrdinals.length > 1
      ? `Questions ${subOrdinals.join(' + ')} of ${total}`
      : `Question ${subOrdinals[0]} of ${total}`;
  return { tag, meta: '' };
}
