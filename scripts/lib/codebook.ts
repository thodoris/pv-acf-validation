/* Shared codebook / variable model for the SHORT-variant analysis pipeline.

   This module is the single source of truth for:
     · the set of analysis variables the SHORT instrument produces
       (`enumerateShortVariables`) — one entry per atomic answer field;
     · how a stored answer maps to a raw cell value (`extractRaw`);
     · which response options are non-substantive — "Cannot judge",
       "Not familiar enough to say", "These checks are not yet in place …"
       (`isNonSubstantiveOption`);
     · stable, anonymised respondent codes (`respondentCodes`).

   build-codebook.ts, build-dataset.ts, and analyze-results.ts all import
   from here so the codebook, the dataset, and the report can never disagree
   about variable names, option codes, or NA tagging.

   Everything is derived from CONTENT (the questionnaire) + variants.ts (the
   SHORT trim). Nothing is hand-maintained. */

import { CONTENT, isPairedQuestion } from '../../src/content/index';
import { VARIANTS, effectiveScreens } from '../../src/content/variants';
import { SCREENS } from '../../src/routing/screens';
import type {
  Instrument,
  PairedSubQuestion,
  ProfileField,
  StandardQuestion,
} from '../../src/content/types';
import type { AnswerValue, LockedAnswer } from '../../src/state/answerStore';

/* ── Non-substantive options ──────────────────────────────────────────── */

/** Response options that are NOT points on the substantive scale — they
 *  signal "no opinion" or "not applicable". Curated from CONTENT (verified
 *  exhaustive: a grep for cannot-judge / not-familiar / not-applicable /
 *  no-opinion patterns returns exactly these three strings). They are kept
 *  at their scale position in the dataset (per the analysis decision) but
 *  are tagged here so the report can surface their rate and a later recode
 *  to missing is one step. */
export const NON_SUBSTANTIVE_LABELS: ReadonlySet<string> = new Set([
  'Cannot judge',
  'Not familiar enough to say',
  'These checks are not yet in place in my administration',
]);

export function isNonSubstantiveOption(label: string): boolean {
  return NON_SUBSTANTIVE_LABELS.has(label.trim());
}

/* ── Variable model ───────────────────────────────────────────────────── */

export type VarRole =
  | 'profile-text'
  | 'profile-coded'
  | 'rating'
  | 'grid'
  | 'composite'
  | 'open';

export type VarMeasure = 'nominal' | 'ordinal' | 'text';

export type OptionCode = { code: number; label: string; substantive: boolean };

/** A resolved pointer from a variable to where its value sits in a stored
 *  AnswerValue. `extractRaw` switches on this. */
export type Source =
  | { t: 'profile-data'; screenId: string; key: string }
  | { t: 'std-rating'; screenId: string }
  | { t: 'std-open'; screenId: string }
  | { t: 'grid'; screenId: string; rowKey: string }
  | { t: 'composite'; screenId: string }
  | { t: 'paired-rating'; screenId: string; slot: string }
  | { t: 'paired-open'; screenId: string; slot: string }
  | { t: 'inst-rating'; screenId: string; field: 'q1' | 'q2' }
  | { t: 'inst-open'; screenId: string };

export type Variable = {
  /** Column name — SPSS-safe (lowercase, alnum + underscore, starts alpha). */
  name: string;
  screenId: string;
  /** 'Profile' | 'Chapter 1 — Problem' | … */
  chapter: string;
  /** screen.location — human-readable position string. */
  location: string;
  /** Full question / grid-row / composite-stem / profile-field text. */
  stem: string;
  subtitle?: string;
  role: VarRole;
  measure: VarMeasure;
  /** Rating scale kind (frequency / soundness / quality / grid / …). */
  scaleKind?: string;
  /** Ordered option set with 1-based codes; absent for text fields. */
  options?: OptionCode[];
  required: boolean;
  /** Excluded from the anonymised dataset (free-text PII or open response). */
  restricted: boolean;
  openLabel?: string;
  openPrompt?: string;
  source: Source;
};

/* ── Helpers ──────────────────────────────────────────────────────────── */

const CHAPTER_BY_STEP: Record<string, string> = {
  profile: 'Profile',
  problem: 'Chapter 1 — Problem',
  framework: 'Chapter 2 — Framework',
  instruments: 'Chapter 3 — Instruments',
  close: 'Chapter 4 — Close',
};

export function chapterFor(stepId: string | null): string {
  return (stepId && CHAPTER_BY_STEP[stepId]) || 'Other';
}

/** Build an SPSS-safe variable name from path parts. */
function vname(...parts: string[]): string {
  return parts
    .join('_')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

function toOptionCodes(options: string[]): OptionCode[] {
  return options.map((label, i) => ({
    code: i + 1,
    label,
    substantive: !isNonSubstantiveOption(label),
  }));
}

/* ── Enumeration ──────────────────────────────────────────────────────── */

/** Walk the SHORT-effective spine and emit one Variable per atomic answer
 *  field, in spine order. Screens SHORT hides (c1-q7, interview) are absent
 *  from `effectiveScreens`; each instrument's hidden Q2 is skipped below. */
export function enumerateShortVariables(): Variable[] {
  const variant = VARIANTS.short;
  const visible = effectiveScreens(SCREENS, variant);
  const out: Variable[] = [];

  for (const screen of visible) {
    const chapter = chapterFor(screen.stepId);

    if (screen.kind === 'profile') {
      for (const field of CONTENT.profile.fields as ProfileField[]) {
        const isText = field.kind === 'text';
        out.push({
          name: vname('profile', field.key),
          screenId: 'profile',
          chapter,
          location: screen.location,
          stem: field.label,
          role: isText ? 'profile-text' : 'profile-coded',
          measure: isText ? 'text' : field.key === 'years' ? 'ordinal' : 'nominal',
          options: isText ? undefined : toOptionCodes(field.options ?? []),
          required: field.required,
          restricted: isText,
          source: { t: 'profile-data', screenId: 'profile', key: field.key },
        });
      }
      continue;
    }

    if (screen.kind === 'instrument') {
      const inst = CONTENT.instruments.find((i) => i.id === screen.id) as
        | Instrument
        | undefined;
      if (!inst) continue;
      // Q1 retained in SHORT; Q2 hidden. Driven by the variant config.
      for (const field of ['q1', 'q2'] as const) {
        if ((variant.hiddenFields?.[screen.id] ?? []).includes(field)) continue;
        const sub = field === 'q1' ? inst.q1 : inst.q2;
        out.push({
          name: vname(screen.id, field),
          screenId: screen.id,
          chapter,
          location: screen.location,
          stem: sub.question,
          subtitle: sub.subtitle,
          role: 'rating',
          measure: 'ordinal',
          scaleKind: sub.rating.kind,
          options: toOptionCodes(sub.rating.options),
          required: sub.rating.required,
          restricted: false,
          source: { t: 'inst-rating', screenId: screen.id, field },
        });
      }
      // sharedOpen — optional in SHORT (relaxed via requiredOverrides).
      const openRequired =
        variant.requiredOverrides?.[screen.id]?.open ?? inst.sharedOpen.required;
      out.push({
        name: vname(screen.id, 'open'),
        screenId: screen.id,
        chapter,
        location: screen.location,
        stem: inst.sharedOpen.label,
        role: 'open',
        measure: 'text',
        required: openRequired,
        restricted: true,
        openLabel: inst.sharedOpen.label,
        openPrompt: inst.sharedOpen.prompt,
        source: { t: 'inst-open', screenId: screen.id },
      });
      continue;
    }

    if (screen.kind === 'paired') {
      const q = CONTENT.questions[screen.id];
      if (!q || !isPairedQuestion(q)) continue;
      for (const sub of q.questions as PairedSubQuestion[]) {
        pushStandardFields(out, {
          screenId: screen.id,
          chapter,
          location: screen.location,
          slot: sub.slot,
          stem: sub.question,
          subtitle: sub.subtitle,
          rating: sub.rating,
          open: sub.open,
        });
      }
      continue;
    }

    if (screen.kind === 'close-pair') {
      // c4-close stores its two open-only catch-alls under subAnswers keyed
      // by 'c4-q1' / 'c4-q2'.
      for (const subId of ['c4-q1', 'c4-q2']) {
        const q = CONTENT.questions[subId];
        if (!q || isPairedQuestion(q) || !q.open) continue;
        out.push({
          name: vname(subId, 'open'),
          screenId: screen.id,
          chapter,
          location: screen.location,
          stem: q.question,
          subtitle: q.subtitle,
          role: 'open',
          measure: 'text',
          required: q.open.required,
          restricted: true,
          openLabel: q.open.label,
          openPrompt: q.open.prompt,
          source: { t: 'paired-open', screenId: screen.id, slot: subId },
        });
      }
      continue;
    }

    if (screen.kind === 'question') {
      const q = CONTENT.questions[screen.id];
      if (!q || isPairedQuestion(q)) continue;
      const stdQ = q as StandardQuestion;

      if (stdQ.rating?.kind === 'grid') {
        const grid = stdQ.rating;
        grid.rows.forEach((rowText, i) => {
          out.push({
            name: vname(screen.id, `row${i}`),
            screenId: screen.id,
            chapter,
            location: screen.location,
            stem: `${stdQ.question} — ${rowText}`,
            role: 'grid',
            measure: 'ordinal',
            scaleKind: 'grid',
            options: toOptionCodes(grid.options),
            required: grid.required,
            restricted: false,
            source: { t: 'grid', screenId: screen.id, rowKey: `row${i}` },
          });
        });
        if (stdQ.composite) {
          out.push({
            name: vname(screen.id, 'composite'),
            screenId: screen.id,
            chapter,
            location: screen.location,
            stem: stdQ.composite.subStem,
            role: 'composite',
            measure: 'nominal',
            scaleKind: 'single-select',
            options: toOptionCodes(stdQ.composite.options),
            required: stdQ.composite.required,
            restricted: false,
            source: { t: 'composite', screenId: screen.id },
          });
        }
        continue;
      }

      pushStandardFields(out, {
        screenId: screen.id,
        chapter,
        location: screen.location,
        stem: stdQ.question,
        subtitle: stdQ.subtitle,
        rating: stdQ.rating,
        open: stdQ.open,
      });
    }
    // welcome / orient-* / *-setup-* / submit / thanks contribute no variables.
  }

  return out;
}

/** Emit a rating var and/or an open var for a standard (or paired-sub)
 *  question. `slot` present → paired sources; absent → standard sources. */
function pushStandardFields(
  out: Variable[],
  args: {
    screenId: string;
    chapter: string;
    location: string;
    slot?: string;
    stem: string;
    subtitle?: string;
    rating?: StandardQuestion['rating'];
    open?: StandardQuestion['open'];
  },
): void {
  const { screenId, chapter, location, slot, stem, subtitle, rating, open } = args;
  const namePrefix = slot ? [screenId, slot] : [screenId];

  if (rating && rating.kind !== 'grid') {
    out.push({
      name: vname(...namePrefix, 'rating'),
      screenId,
      chapter,
      location,
      stem,
      subtitle,
      role: 'rating',
      measure: 'ordinal',
      scaleKind: rating.kind,
      options: toOptionCodes(rating.options),
      required: rating.required,
      restricted: false,
      source: slot
        ? { t: 'paired-rating', screenId, slot }
        : { t: 'std-rating', screenId },
    });
  }

  if (open) {
    out.push({
      name: vname(...namePrefix, 'open'),
      screenId,
      chapter,
      location,
      stem,
      subtitle,
      role: 'open',
      measure: 'text',
      required: open.required,
      restricted: true,
      openLabel: open.label,
      openPrompt: open.prompt,
      source: slot
        ? { t: 'paired-open', screenId, slot }
        : { t: 'std-open', screenId },
    });
  }
}

/* ── Value extraction ─────────────────────────────────────────────────── */

/** Pull the raw stored cell for a source from a submission's answers map.
 *  Ratings come back as 0-based numeric index strings; profile coded fields
 *  as the option label; opens as free text. Returns null when absent. */
export function extractRaw(
  answers: Record<string, LockedAnswer>,
  src: Source,
): string | null {
  const locked = answers[src.screenId];
  if (!locked) return null;
  const v: AnswerValue = locked.value;
  switch (src.t) {
    case 'profile-data':
      return v.type === 'profile' ? v.data[src.key] ?? null : null;
    case 'std-rating':
      return v.type === 'rating-and-open' ? v.rating ?? null : null;
    case 'std-open':
      return v.type === 'rating-and-open' ? v.open ?? null : null;
    case 'grid':
      return v.type === 'grid-and-composite' ? v.grid[src.rowKey] ?? null : null;
    case 'composite':
      return v.type === 'grid-and-composite' ? v.composite ?? null : null;
    case 'paired-rating':
      return v.type === 'paired' ? v.subAnswers[src.slot]?.rating ?? null : null;
    case 'paired-open':
      return v.type === 'paired' ? v.subAnswers[src.slot]?.open ?? null : null;
    case 'inst-rating':
      return v.type === 'instrument'
        ? (src.field === 'q1' ? v.q1Rating : v.q2Rating) ?? null
        : null;
    case 'inst-open':
      return v.type === 'instrument' ? v.sharedOpen ?? null : null;
  }
}

/** Decode a raw cell into its analysis value:
 *   · text vars → the trimmed string (or '' when blank);
 *   · profile coded → 1-based position of the matched option (or '' );
 *   · rating / grid / composite → 1-based code from the 0-based index
 *     (or '' for blank / out-of-range).
 *  Non-substantive options keep their scale position (per the analysis
 *  decision); they are NOT recoded to missing here. */
export function decodeCell(v: Variable, raw: string | null): number | string {
  if (raw === null) return '';
  if (v.role === 'open' || v.role === 'profile-text') return raw;

  if (v.role === 'profile-coded') {
    const t = raw.trim();
    const i = (v.options ?? []).findIndex((o) => o.label === t);
    return i >= 0 ? i + 1 : '';
  }

  // Index-stored rating / grid / composite.
  const t = raw.trim();
  if (t.length === 0) return '';
  const idx = Number(t);
  if (!Number.isInteger(idx) || idx < 0 || !v.options || idx >= v.options.length) {
    return '';
  }
  return idx + 1;
}

/* ── Respondent codes ─────────────────────────────────────────────────── */

/** Assign stable anonymised codes (R01, R02, …) ordered by submission time
 *  (ties broken by docId). Earlier submissions keep their code as later ones
 *  are appended, so the mapping is stable across re-exports. */
export function respondentCodes(
  rows: { docId: string; submittedAt: string | null }[],
): Map<string, string> {
  const sorted = [...rows].sort((a, b) => {
    const ta = a.submittedAt ?? '';
    const tb = b.submittedAt ?? '';
    if (ta !== tb) return ta < tb ? -1 : 1;
    return a.docId < b.docId ? -1 : a.docId > b.docId ? 1 : 0;
  });
  const width = Math.max(2, String(sorted.length).length);
  const map = new Map<string, string>();
  sorted.forEach((r, i) => {
    map.set(r.docId, `R${String(i + 1).padStart(width, '0')}`);
  });
  return map;
}
