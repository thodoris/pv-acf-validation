/* Concept cards — pool + per-screen mapping.

   Two exports live here together so the relationship between a card key
   and the screens that surface it stays visible in a single file:

   - CONCEPT_CARDS — keyed by stable `key` (kebab-case, immutable).
     Content edits to a card never touch the key, so the mapping stays
     intact through copy edits.

   - CONCEPT_CARDS_FOR_SCREEN — keyed by ScreenId. The array's ORDER is
     the display order in the drawer. Empty array means the concept-cards
     trigger is hidden in the TopBar on that screen (see §4.2 of the
     concept-cards spec).

   `assertConceptCardsInvariants` is called once at app boot from
   `src/main.tsx`; misconfigurations (key/value mismatch in the pool, a
   card with the wrong number of tags, a mapping that names an unknown
   key) throw loudly rather than silently degrading at render time. */

import type { ConceptCard } from './types';
import type { ScreenId } from '@/routing/screens';

// ---------------------------------------------------------------------------
// Pool
// ---------------------------------------------------------------------------

/** Source of truth for the concept cards.  24 entries: 13 core (Tier A
 *  vocabulary) + 11 framework (Tier B framework/instrument cards). */
export const CONCEPT_CARDS: Record<string, ConceptCard> = {
  // ─────────────────────────────────────────────────────────────
  // Tier A — Core vocabulary
  // ─────────────────────────────────────────────────────────────

  'co-production': {
    key: 'co-production',
    tier: 'core',
    title: 'Co-production',
    subtitle: 'AI and institutions shape each other',
    body: 'AI systems do not enter stable institutions unchanged. Public priorities, procurement routines, and working practices shape what the system becomes; the system can then reshape routines, evidence, authority, and accountability. <strong>Co-production</strong> names this two-way relation.',
    tags: ['sociotechnical', 'institutional change'],
  },

  'soc-imaginaries': {
    key: 'soc-imaginaries',
    tier: 'core',
    title: 'Sociotechnical imaginaries',
    subtitle: 'Visions that make AI seem necessary',
    body: 'Shared visions of desirable futures embedded in strategies, policy documents, and institutional agendas. They make some AI projects appear obvious or modern, while making non-AI alternatives harder to see.',
    tags: ['strategy framing', 'Jasanoff & Kim'],
  },

  'solutionism': {
    key: 'solutionism',
    tier: 'core',
    title: 'Solutionism',
    subtitle: 'Treating public problems as technical fixes',
    body: '<strong>Solutionism</strong> frames complex public problems as if they can be solved mainly by technology. In AI governance, it can make adoption appear necessary before the problem, alternatives, and democratic trade-offs have been openly examined.',
    tags: ['problem-framing', 'Morozov'],
  },

  'critical-deliberative': {
    key: 'critical-deliberative',
    tier: 'core',
    title: 'Critical-deliberative stance',
    subtitle: "The framework's posture",
    body: 'PV-ACF is <strong>critical</strong> because it treats AI systems as institutional and political arrangements, not neutral tools. It is <strong>deliberative</strong> because it treats reasoning, contestation, and accountability as part of legitimate governance.',
    tags: ['framework stance', 'foundations'],
  },

  'public-value': {
    key: 'public-value',
    tier: 'core',
    title: 'Public value',
    subtitle: 'What public institutions must protect',
    body: '<strong>Public value</strong> refers to the democratic and social commitments public administration exists to serve: equity, accountability, legitimacy, due process, and substantive service quality. PV-ACF asks whether AI deployments protect or erode these commitments.',
    tags: ['normative anchor', 'public service'],
  },

  'contextual-integrity': {
    key: 'contextual-integrity',
    tier: 'core',
    title: 'Contextual integrity',
    subtitle: 'Privacy as appropriate information flow',
    body: 'Privacy is not only about whether data are protected. It also depends on whether information flows are <strong>appropriate to the context</strong> in which the information was given: who sends what, to whom, under what rule, and for what purpose.',
    tags: ['privacy', 'Nissenbaum'],
  },

  'vendor-dependency': {
    key: 'vendor-dependency',
    tier: 'core',
    title: 'Vendor dependency',
    subtitle: 'When public capacity depends on providers',
    body: '<strong>Vendor dependency</strong> occurs when a public institution relies on external providers for infrastructure, updates, expertise, model access, or operational continuity. The dependency may become <strong>epistemic</strong>: the institution may struggle to understand or govern the system without the vendor.',
    tags: ['procurement', 'political economy'],
  },

  'discretion-migration': {
    key: 'discretion-migration',
    tier: 'core',
    title: 'Discretion migration',
    subtitle: 'Where judgement moves',
    body: '<strong>Discretion migration</strong> is the movement of effective decision authority from identifiable officials toward systems, workflows, vendors, or infrastructures. Formal human authority may remain, while the practical weight of the decision shifts elsewhere.',
    tags: ['discretion', 'oversight'],
  },

  'contestation': {
    key: 'contestation',
    tier: 'core',
    title: 'Contestation',
    subtitle: 'The practical ability to challenge',
    body: '<strong>Contestation</strong> is more than an appeal right on paper. Affected people must know a decision has been made, understand enough to challenge it, reach an accessible channel, and encounter someone with authority to change the outcome.',
    tags: ['due process', 'contestability'],
  },

  'nested-governance-gap': {
    key: 'nested-governance-gap',
    tier: 'core',
    title: 'Nested governance gap',
    subtitle: 'Problems across levels',
    body: "The governance gap is not only inside a deployed system. It can run across <strong>strategic framings, institutional routines, procurement choices, vendor dependencies, and operational decisions</strong>. The review's trace-back logic rests on this nested view.",
    tags: ['three levels', 'trace-back'],
  },

  'upward-visibility': {
    key: 'upward-visibility',
    tier: 'core',
    title: 'Upward visibility',
    subtitle: 'Structural conditions held present',
    body: 'Operational decisions do not stay confined to the immediate system. They are read back against the wider conditions that shaped the deployment: inherited problem framing, institutional history, procurement constraints, vendor dependency, and prior governance choices. <strong>Upward visibility</strong> keeps those conditions present at decision points throughout the lifecycle.',
    tags: ['structural conditions', 'lifecycle'],
  },

  'generative-ai-shift': {
    key: 'generative-ai-shift',
    tier: 'core',
    title: 'Generative AI shift',
    subtitle: 'New kind, larger scale, or both',
    body: 'Generative AI tools can amplify familiar governance problems, such as opacity and vendor dependency, while also changing their character through open-ended outputs, conversational authority, and dependence on foundation-model infrastructures. The review asks whether respondents see this as a new kind of challenge, a larger scale of familiar challenge, or both.',
    tags: ['generative AI', 'governance challenge'],
  },

  'expert-judgement': {
    key: 'expert-judgement',
    tier: 'core',
    title: 'Expert judgement',
    subtitle: 'What your response contributes',
    body: "The review treats responses as <strong>expert judgements</strong>, not satisfaction ratings. Agreement is not assumed. Disagreement, uncertainty, examples, and named limits are all useful because they test the framework's claims and boundaries.",
    tags: ['validation register', 'respondent role'],
  },

  // ─────────────────────────────────────────────────────────────
  // Tier B — Framework and instrument
  // ─────────────────────────────────────────────────────────────

  'four-structural-absences': {
    key: 'four-structural-absences',
    tier: 'framework',
    title: 'Four structural absences',
    subtitle: "The framework's diagnostic set",
    body: 'PV-ACF names four conditions often weak or missing at deployment level: <strong>deliberation about purpose</strong>, <strong>participation by affected people</strong>, <strong>accountability that survives into operation</strong>, and <strong>constraint on vendor power</strong>. Cluster 2 tests whether this set is convincing.',
    tags: ['Cluster 2', 'diagnostic'],
  },

  'trace-back': {
    key: 'trace-back',
    tier: 'framework',
    title: 'Trace-back operation',
    subtitle: 'Reading deployments backwards',
    body: 'Start from a visible AI deployment, then trace back to the institution and strategy that made it possible. Problems visible at deployment level may have been shaped earlier by routines, procurement paths, or policy priorities.',
    tags: ['Cluster 1', 'three levels'],
  },

  'recognise-and-name': {
    key: 'recognise-and-name',
    tier: 'framework',
    title: 'Recognise-and-name function',
    subtitle: 'Making problems discussable',
    body: 'PV-ACF gives practitioners vocabulary for governance problems they may already partly recognise. It does not produce a compliance verdict. It helps <strong>name conditions</strong> so they can become objects of institutional deliberation.',
    tags: ['framework register', 'Q1.7'],
  },

  'lifecycle-stages': {
    key: 'lifecycle-stages',
    tier: 'framework',
    title: 'Lifecycle stages',
    subtitle: 'Where the framework intervenes',
    body: 'PV-ACF works across five lifecycle stages: <strong>problem framing and purpose</strong>; <strong>design and procurement</strong>; <strong>oversight and accountability</strong>; <strong>public value evaluation</strong>; <strong>democratic authorisation and recursive review</strong>. The reviewed instruments sit mainly in Stages 2 and 3.',
    tags: ['stages', 'framework architecture'],
  },

  'glg': {
    key: 'glg',
    tier: 'framework',
    title: 'Generative LLM Gate',
    subtitle: 'Stage 2 checkpoint',
    body: 'The <strong>Generative LLM Gate</strong> applies when a deployment uses a generative model. It asks about model inspectability, data and infrastructure control, grounding, evaluation evidence, and drift monitoring. If both inspectability and institutional control are absent, the framework treats the deployment as one to stop and reconsider.',
    tags: ['Stage 2', 'generative AI'],
  },

  'ciw': {
    key: 'ciw',
    tier: 'framework',
    title: 'Contextual Integrity Worksheet (CIW)',
    subtitle: 'Stage 2 · information flows',
    body: 'The <strong>CIW</strong> maps information flows before and after an AI system is introduced. It asks whether each flow is appropriate, requires justification, or should be refused. Its specification is the most fully developed of the four reviewed instruments.',
    tags: ['Stage 2', 'CIW'],
  },

  'ast': {
    key: 'ast',
    tier: 'framework',
    title: 'Architecture Selection Tool (AST)',
    subtitle: 'Stage 2 · architecture as governance',
    body: 'The <strong>AST</strong> treats architecture choice as a governance decision. It compares possible architectures and returns one of three outcomes: <strong>select</strong>, <strong>escalate</strong>, or <strong>stop and reframe</strong>. Surviving options are ordered by governability.',
    tags: ['Stage 2', 'AST'],
  },

  'dma': {
    key: 'dma',
    tier: 'framework',
    title: 'Discretion Migration Analysis (DMA)',
    subtitle: 'Stage 3 · discretion and oversight',
    body: '<strong>DMA</strong> maps where decision authority sits before deployment and where it moves when AI is introduced. It identifies who loses and who acquires effective authority, then specifies oversight: who can override, on what timeline, with what information, and with what safeguards against automation bias.',
    tags: ['Stage 3', 'DMA'],
  },

  'cpd': {
    key: 'cpd',
    tier: 'framework',
    title: 'Contestation Pathway Design (CPD)',
    subtitle: 'Stage 3 · challenge as design',
    body: '<strong>CPD</strong> specifies the conditions under which affected people can challenge AI-influenced decisions: <strong>notification</strong>, <strong>explanation</strong>, <strong>accessible channel</strong>, <strong>authorised human reviewer</strong>, <strong>timeline</strong>, and <strong>feedback loop</strong>. It turns contestation from a formal right into an operational arrangement.',
    tags: ['Stage 3', 'CPD'],
  },

  'specification-vs-setup-work': {
    key: 'specification-vs-setup-work',
    tier: 'framework',
    title: 'Specification vs. set-up work',
    subtitle: 'Reading instrument maturity',
    body: 'Each instrument has a <strong>framework specification</strong> and local <strong>set-up work</strong>. PV-ACF supplies the first: structure, concepts, and questions. Institutions must supply the second: roles, procedures, documents, and integration into existing governance workflows. An instrument that needs set-up work is a described property, not a fault.',
    tags: ['Cluster 3', 'maturity'],
  },

  'self-limitation': {
    key: 'self-limitation',
    tier: 'framework',
    title: 'Self-limitation',
    subtitle: 'What the framework does not claim',
    body: 'PV-ACF does not claim to solve the structural conditions it surfaces. It makes them visible so practitioners can deliberate, document, challenge, or refuse where possible. <strong>Self-limitation</strong> prevents the framework from becoming another procedural reassurance.',
    tags: ['framework limit', 'maturity'],
  },
};

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

/** Per-screen ordered list of card keys.  Order = display order.  Where
 *  five or more cards are listed, the first three appear above a soft
 *  visual divider in the drawer (concept-cards spec §4.4); the mapping
 *  is therefore tuned so the most-relevant cards sit in positions 1–3.
 *
 *  Every screen id in `SCREENS` is listed explicitly (empty arrays for
 *  procedural screens) so the file documents the full spine. */
export const CONCEPT_CARDS_FOR_SCREEN: Partial<Record<ScreenId, readonly string[]>> = {
  // ─────────────────────────────────────────────────────────────
  // Procedural and orientation screens
  // ─────────────────────────────────────────────────────────────
  welcome: ['expert-judgement'],
  profile: [],

  // ─────────────────────────────────────────────────────────────
  // Grounding
  // ─────────────────────────────────────────────────────────────
  g1: [
    'co-production',
    'soc-imaginaries',
    'solutionism',
    'vendor-dependency',
    'nested-governance-gap',
  ],
  g2: [
    'critical-deliberative',
    'expert-judgement',
    'co-production',
    'public-value',
    'soc-imaginaries',
    'solutionism',
    'contextual-integrity',
    'vendor-dependency',
    'discretion-migration',
    'contestation',
  ],

  // ─────────────────────────────────────────────────────────────
  // Cluster 1 — Problem
  // ─────────────────────────────────────────────────────────────
  'c1-setup1': [
    'trace-back',
    'nested-governance-gap',
    'co-production',
    'soc-imaginaries',
    'solutionism',
    'vendor-dependency',
  ],
  'c1-setup2': [
    'trace-back',
    'solutionism',
    'vendor-dependency',
    'soc-imaginaries',
    'nested-governance-gap',
  ],
  'c1-q1': ['solutionism', 'trace-back'],
  'c1-q2': ['co-production', 'discretion-migration'],
  'c1-q3q4': ['soc-imaginaries', 'vendor-dependency', 'solutionism'],
  'c1-q5': ['nested-governance-gap', 'trace-back', 'co-production'],
  'c1-q6': [
    'co-production',
    'vendor-dependency',
    'discretion-migration',
    'upward-visibility',
  ],
  'c1-q7': ['recognise-and-name', 'critical-deliberative'],
  'c1-q8': [
    'generative-ai-shift',
    'solutionism',
    'discretion-migration',
    'vendor-dependency',
  ],

  // ─────────────────────────────────────────────────────────────
  // Cluster 2 — Framework
  // ─────────────────────────────────────────────────────────────
  'c2-setup1': [
    'four-structural-absences',
    'lifecycle-stages',
    'critical-deliberative',
  ],
  'c2-setup2': [
    'four-structural-absences',
    'critical-deliberative',
    'nested-governance-gap',
  ],
  'c2-q1': [
    'lifecycle-stages',
    'four-structural-absences',
    'critical-deliberative',
  ],
  'c2-q2': ['lifecycle-stages', 'critical-deliberative', 'self-limitation'],
  'c2-q3': [
    'four-structural-absences',
    'vendor-dependency',
    'contestation',
    'discretion-migration',
    'upward-visibility',
  ],
  'c2-q4': [
    'four-structural-absences',
    'vendor-dependency',
    'discretion-migration',
    'contestation',
    'upward-visibility',
  ],
  'c2-q5': [
    'upward-visibility',
    'four-structural-absences',
    'nested-governance-gap',
  ],
  'c2-q6': ['glg', 'vendor-dependency', 'generative-ai-shift', 'self-limitation'],

  // ─────────────────────────────────────────────────────────────
  // Cluster 3 — Instruments
  // ─────────────────────────────────────────────────────────────
  'c3-setup1': ['specification-vs-setup-work', 'self-limitation', 'lifecycle-stages'],
  'c3-setup2': ['ciw', 'ast', 'dma', 'cpd', 'specification-vs-setup-work'],
  'c3-ciw': ['ciw', 'contextual-integrity', 'specification-vs-setup-work'],
  'c3-ast': ['ast', 'glg', 'specification-vs-setup-work', 'vendor-dependency'],
  'c3-dma': [
    'dma',
    'discretion-migration',
    'upward-visibility',
    'specification-vs-setup-work',
  ],
  'c3-cpd': ['cpd', 'contestation', 'specification-vs-setup-work'],

  // ─────────────────────────────────────────────────────────────
  // Cluster 4 — Close
  // ─────────────────────────────────────────────────────────────
  'c4-close': ['expert-judgement', 'self-limitation'],

  // ─────────────────────────────────────────────────────────────
  // Final procedural screens
  //   `interview` is in the FULL spine but hidden under SHORT; with no
  //   cards mapped, the trigger stays hidden on both variants.
  // ─────────────────────────────────────────────────────────────
  interview: [],
  submit: [],
  thanks: [],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Ordered list of card keys for a screen. Returns `[]` for screens with
 *  no entry (none today, but defensive against future spine growth). */
export function conceptKeysFor(screenId: ScreenId): readonly string[] {
  return CONCEPT_CARDS_FOR_SCREEN[screenId] ?? [];
}

/** Resolved, ordered list of cards to display on a screen.  Missing keys
 *  (a stale reference in the mapping after a card has been deleted from
 *  the pool) are skipped with a one-time dev warning so a partial cleanup
 *  doesn't crash the drawer.  The boot-time invariant below catches the
 *  same class of bug at dev time before it can ever ship. */
export function conceptCardsFor(screenId: ScreenId): ConceptCard[] {
  const keys = conceptKeysFor(screenId);
  const out: ConceptCard[] = [];
  for (const key of keys) {
    const card = CONCEPT_CARDS[key];
    if (!card) {
      if (import.meta.env?.DEV) {
        // eslint-disable-next-line no-console
        console.warn(
          `[conceptCards] mapping for "${screenId}" references unknown key "${key}"; skipping.`,
        );
      }
      continue;
    }
    out.push(card);
  }
  return out;
}

/** Returns every card, sorted by tier (core first, then framework) and
 *  alphabetised by title within each tier.  Backs the "See all concepts"
 *  expansion view. */
export function allCardsByTier(): ConceptCard[] {
  const all = Object.values(CONCEPT_CARDS);
  const core = all.filter((c) => c.tier === 'core');
  const framework = all.filter((c) => c.tier === 'framework');
  const byTitle = (a: ConceptCard, b: ConceptCard) => a.title.localeCompare(b.title);
  return [...core.sort(byTitle), ...framework.sort(byTitle)];
}

// ---------------------------------------------------------------------------
// Boot-time invariant
// ---------------------------------------------------------------------------

export function assertConceptCardsInvariants(): void {
  for (const [poolKey, card] of Object.entries(CONCEPT_CARDS)) {
    if (poolKey !== card.key) {
      throw new Error(
        `[conceptCards] pool key "${poolKey}" does not match card.key "${card.key}". ` +
          `Pool keys are immutable and must equal the card.key field.`,
      );
    }
    if (!Array.isArray(card.tags) || card.tags.length !== 2) {
      throw new Error(
        `[conceptCards] card "${poolKey}" must have exactly 2 tags; got ${card.tags?.length ?? 0}.`,
      );
    }
    if (card.tier !== 'core' && card.tier !== 'framework') {
      throw new Error(
        `[conceptCards] card "${poolKey}" has invalid tier "${card.tier}"; expected "core" or "framework".`,
      );
    }
  }
  for (const [screenId, keys] of Object.entries(CONCEPT_CARDS_FOR_SCREEN)) {
    for (const key of keys ?? []) {
      if (!CONCEPT_CARDS[key]) {
        throw new Error(
          `[conceptCards] mapping for "${screenId}" references unknown card key "${key}". ` +
            `Add the card to CONCEPT_CARDS or remove the reference.`,
        );
      }
    }
  }
}

// Self-assert at module load in dev so misconfigurations surface
// immediately during local work. Production silently tolerates (the
// drawer renderer skips unknown keys); the unit test pins the invariant
// in CI so a broken mapping never reaches the deployed bundle.
if (import.meta.env?.DEV) {
  assertConceptCardsInvariants();
}
