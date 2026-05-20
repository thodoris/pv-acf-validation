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
  | 'rationale'
  | 'explanation'
  | 'widget-trigger'
  | 'example'
  | 'maturity';

export type AffordanceDecl = {
  kind: AffordanceKind;
  title?: string;
  body?: string; // HTML
  items?: string[]; // HTML allowed in items
  footer?: string; // HTML
  chips?: string[];
  video?: string;
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

export type StandardQuestion = {
  cluster: ClusterId;
  kicker: string;
  chapter: string;
  tagline: string;
  meta: string;
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
  meta: string;
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
  meta: string;
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
// ---------------------------------------------------------------------------

export type Concept = {
  featured?: boolean;
  title: string;
  gr: string;
  body: string;
  rels: string[];
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
  concepts: Concept[];
};
