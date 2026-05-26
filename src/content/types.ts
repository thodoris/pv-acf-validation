// Branded ids for content entities. String at runtime; nominal at compile time.
export type QuestionId = string;
export type ClusterId = 'problem' | 'framework' | 'instruments' | 'close';
export type StepId = 'profile' | 'grounding' | 'problem' | 'framework' | 'instruments' | 'close';
export type InstrumentId = 'c3-ciw' | 'c3-ast' | 'c3-dma' | 'c3-cpd';
export type GroundingId = 'g1' | 'g2';

// ---------------------------------------------------------------------------
// Rail affordances (declared per-screen in CONTENT or computed by helpers)
// ---------------------------------------------------------------------------

export type AffordanceKind =
  | 'scope'
  | 'source'
  | 'explanation'
  | 'example'
  | 'maturity'
  | 'operable'
  | 'video';

export type AffordanceChip = {
  num?: string;
  label: string;
};

export type AffordanceVideo = {
  title: string;
  duration: string;
  url?: string;
};

export type AffordanceDecl = {
  kind: AffordanceKind;
  title?: string;
  body?: string; // HTML
  items?: string[]; // HTML allowed in items
  footer?: string; // HTML
  chips?: AffordanceChip[];
  video?: AffordanceVideo;
  labelOverride?: string;
};

// ---------------------------------------------------------------------------
// Rating kinds the prototype uses (from `CONTENT.questions[*].rating.kind`).
// ---------------------------------------------------------------------------

export type RatingKind =
  | 'frequency'
  | 'soundness'
  | 'usefulness'
  | 'kind-vs-degree'
  | 'verdict'
  | 'connection'
  | 'coverage'
  | 'awareness'
  | 'influence'
  | 'quality'
  | 'applicability'
  | 'grid';

export type StandardRating = {
  kind: Exclude<RatingKind, 'grid'>;
  required: boolean;
  options: string[];
};

export type GridRating = {
  kind: 'grid';
  required: boolean;
  rows: string[];
  options: string[];
};

export type Rating = StandardRating | GridRating;

export type OpenField = {
  required: boolean;
  label: string;
  prompt: string;
};

export type CompositeSelect = {
  chip: string;
  required: boolean;
  subStem: string;
  options: string[];
};

export type SourceNote = {
  title: string;
  items: string[];
  footer?: string;
};

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export type QuestionType =
  | 'rating + optional open'
  | 'rating + required open'
  | 'open-only'
  | 'rating grid + single-select';

/**
 * Cognitive register the question reaches for. Display label is the
 * Title-Cased form (`'judgment'` → `'Judgment'`); canonical storage is
 * lowercase so equality checks are case-stable. A question may carry
 * multiple registers (c1-q8 and c2-q4 are both judgment + recognition).
 */
export type Register = 'judgment' | 'recognition';

/**
 * The question's position within its cluster on the **FULL** spine.
 * `ordinal` is 1-based; `totalInFull` is the count of question screens
 * in this cluster under FULL. Both are authored, not derived — the
 * renderer recomputes the *visible* position by counting non-hidden
 * cluster members from `effectiveScreens()` at render time, so SHORT
 * automatically reports the corrected "X of N". These authored numbers
 * are the source of truth for FULL and a stability anchor across
 * variant changes.
 */
export type ClusterPosition = {
  ordinal: number;
  totalInFull: number;
};

export type StandardQuestion = {
  cluster: ClusterId;
  kicker: string;
  chapter: string;
  tagline: string;
  clusterPosition: ClusterPosition;
  registers: Register[];
  question: string;
  subtitle: string;
  type: QuestionType;
  rating?: Rating;
  open?: OpenField;
  composite?: CompositeSelect;
  scopeNote?: string[];
  customAffs?: AffordanceDecl[];
  sourceNote?: SourceNote;
  noScope?: boolean;
  rationaleDependent?: boolean;
  rationaleBody?: string;
};

export type PairedSubQuestion = {
  slot: string; // e.g. "Q1.3"
  tag: string;
  clusterPosition: ClusterPosition;
  registers: Register[];
  question: string;
  subtitle: string;
  rating?: Rating;
  open?: OpenField;
  rationaleDependent?: boolean;
  rationaleBody?: string;
};

export type PairedQuestion = {
  cluster: ClusterId;
  kind: 'paired';
  kicker: string;
  chapter: string;
  tagline: string;
  questions: PairedSubQuestion[];
  customAffs?: AffordanceDecl[];
};

export type Question = StandardQuestion | PairedQuestion;

export function isPairedQuestion(q: Question): q is PairedQuestion {
  return 'kind' in q && q.kind === 'paired';
}

// ---------------------------------------------------------------------------
// Top-bar steps
// ---------------------------------------------------------------------------

export type Step = {
  id: StepId;
  label: string;
  short: string;
};

// ---------------------------------------------------------------------------
// Profile screen
// ---------------------------------------------------------------------------

export type ProfileFieldKind = 'text' | 'select' | 'radio';

export type ProfileField = {
  key: string;
  kind: ProfileFieldKind;
  label: string;
  required: boolean;
  placeholder?: string;
  helper?: string;
  options?: string[];
};

export type ProfileScreen = {
  title: string;
  tagline: string;
  fields: ProfileField[];
  languageNote: string;
};

// ---------------------------------------------------------------------------
// Grounding screens
// ---------------------------------------------------------------------------

export type GroundingScreen = {
  id: GroundingId;
  title: string;
  tagline: string;
};

// ---------------------------------------------------------------------------
// Cluster setup
// ---------------------------------------------------------------------------

export type ClusterSetupSection = {
  label: string;
  body: string; // HTML
};

export type ClusterSetup = {
  title: string;
  sections: ClusterSetupSection[];
  footer: string | null;
};

export type Cluster = {
  id: ClusterId;
  label: string;
  ordinal: string;
  tagline: string;
  intro: string;
  setup: ClusterSetup;
};

// ---------------------------------------------------------------------------
// Instruments (Cluster 3)
// ---------------------------------------------------------------------------

export type Maturity = {
  level: string;
  body: string;
};

export type InstrumentGlance = {
  label: string;
  body: string;
};

export type FlowVerdict = 'ok' | 'warn' | 'no';

export type FlowParameter = [string, string]; // [key, value]

export type InstrumentFlow = {
  id: string;
  description: string;
  before: FlowParameter[];
  after: FlowParameter[];
  verdict: FlowVerdict;
  verdictLabel: string;
};

export type InstrumentSubQuestion = {
  question: string;
  subtitle: string;
  rating: StandardRating;
};

export type Instrument = {
  id: InstrumentId;
  slot: number;
  total: number;
  code: 'CIW' | 'AST' | 'DMA' | 'CPD';
  title: string;
  stage: string;
  tagline: string;
  operable?: boolean;
  maturity: Maturity;
  claimed: string;
  glance: InstrumentGlance[];
  flows?: InstrumentFlow[];
  sharedOpen: OpenField;
  q1: InstrumentSubQuestion;
  q2: InstrumentSubQuestion;
};

// ---------------------------------------------------------------------------
// Interview (post-spine)
// ---------------------------------------------------------------------------

export type InterviewFieldKind = 'text' | 'radio' | 'checkbox-list';

export type InterviewField = {
  key: string;
  kind: InterviewFieldKind;
  label: string;
  required: boolean;
  placeholder?: string;
  helper?: string;
  options?: string[];
};

export type InterviewSection = {
  title: string;
  tagline: string;
  intro: string;
  fields: InterviewField[];
};

// ---------------------------------------------------------------------------
// Reference overlay concept cards
//   Pool + per-screen mapping live in src/content/conceptCards.ts.
//   Shape (key/tier/title/subtitle/body/tags) is fixed here; the renderer
//   in src/overlays/ReferenceOverlay.tsx reads through these types.
// ---------------------------------------------------------------------------

export type ConceptTier = 'core' | 'framework';

export type ConceptCard = {
  /** Stable, content-independent identifier. Kebab-case, immutable. */
  key: string;
  /** 'core' (Tier A) or 'framework' (Tier B) — drives ordering in the
   *  "See all concepts" expansion view. No visual variant in v1. */
  tier: ConceptTier;
  title: string;
  /** Short italic register tag, right-aligned in the card head. */
  subtitle: string;
  /** Trusted HTML, sanitised at render time to <strong>, <em>,
   *  <span class>. Other tags / attributes are stripped. */
  body: string;
  /** Exactly two short tag strings. Tuple type so a typo (one tag,
   *  three tags) surfaces as a TS error. */
  tags: readonly [string, string];
};

// ---------------------------------------------------------------------------
// Thesis metadata
// ---------------------------------------------------------------------------

export type ThesisMeta = {
  short: string;
  long: string;
  chapter: string;
};

// ---------------------------------------------------------------------------
// Root CONTENT shape
// ---------------------------------------------------------------------------

export type ContentRoot = {
  thesis: ThesisMeta;
  steps: Step[];
  profile: ProfileScreen;
  grounding: GroundingScreen[];
  clusters: Record<ClusterId, Cluster>;
  questions: Record<QuestionId, Question>;
  instruments: Instrument[];
  interview: InterviewSection;
};
