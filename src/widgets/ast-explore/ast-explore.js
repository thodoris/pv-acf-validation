/**
 * <ast-explore> — Architecture Selection Tool, Explore mode.
 *
 * Single-file vanilla web component embedded inside the C-9 Expert Validation
 * Platform's questionnaire (screen 24). A simplified taster of the canonical
 * AST: respondent answers binary YES/NO governance questions against a fixed
 * citizen-service-chatbot scenario; the five-architecture spectrum strip
 * visualises elimination state live; flow ends in Select Architecture or
 * Stop and Reframe.
 *
 * Firewalled: no persistence, no network, no analytics. The host only learns
 * the final verdict via the ast:verdict CustomEvent (or postMessage in iframe
 * mode) for flow-completion confirmation, not to populate evaluation answers.
 *
 * Spec: C9_AST_explore_build_spec_v1.md (sibling file).
 */
(() => {
  'use strict';

  if (customElements.get('ast-explore')) return;

  // ─────────────────────────────────────────────────────────────────────────
  // Architecture metadata (governability-ordered, spec §2.6)
  // ─────────────────────────────────────────────────────────────────────────

  const ARCHITECTURES = [
    { key: 'rule-based',      name: 'Rule-Based',                hue: 'sage'    },
    { key: 'retrieval-based', name: 'Retrieval-Based',           hue: 'teal'    },
    { key: 'classical-ml',    name: 'Classical Machine Learning',hue: 'cobalt'  },
    { key: 'hybrid',          name: 'Hybrid retrieval-augmented',hue: 'saffron' },
    { key: 'generative-llm',  name: 'Generative LLM',            hue: 'coral'   },
  ];

  // Short labels for the spectrum strip (full names appear on Screen 4 cards)
  const ARCHITECTURE_SHORT = {
    'rule-based':      'Rule-Based',
    'retrieval-based': 'Retrieval-Based',
    'classical-ml':    'Classical ML',
    'hybrid':          'Hybrid',
    'generative-llm':  'Generative LLM',
  };

  // Inline SVG icons per architecture — 24×24 viewBox, currentColor strokes.
  // Kept abstract/geometric to read at 18–24 px without legibility loss.
  const ICONS = {
    'rule-based': `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3.5" y="4" width="17" height="3.5" rx="0.5"/>
        <rect x="3.5" y="10.25" width="17" height="3.5" rx="0.5"/>
        <rect x="3.5" y="16.5" width="17" height="3.5" rx="0.5"/>
      </svg>`,
    'retrieval-based': `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="5.5"/>
        <path d="M14.7 14.7 L20 20"/>
      </svg>`,
    'classical-ml': `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3.5 20 L3.5 4"/>
        <path d="M3.5 20 L20 20"/>
        <path d="M5.5 16 Q9 14 11.5 11 T19 5.5"/>
        <circle cx="6" cy="15.5" r="1"/>
        <circle cx="11" cy="11.5" r="1"/>
        <circle cx="16" cy="8" r="1"/>
      </svg>`,
    'hybrid': `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="12" r="5"/>
        <circle cx="15" cy="12" r="5"/>
      </svg>`,
    'generative-llm': `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3 L13.8 9.5 L20.5 10.4 L15.4 14.2 L17.2 20.7 L12 17 L6.8 20.7 L8.6 14.2 L3.5 10.4 L10.2 9.5 Z"/>
      </svg>`,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Question content (spec §4.2–§4.4)
  // ─────────────────────────────────────────────────────────────────────────

  const SCREENS = {
    1: {
      heading: 'Governance requirements: rights and information',
      subtitle: 'Mark each requirement the deployment activates.',
      questions: [
        { id: 'Q1.1', stem: 'Does this deployment require verifiable, auditable outputs?' },
        { id: 'Q1.2', stem: 'Does this deployment involve individual rights determinations?' },
        { id: 'Q1.3', stem: 'Does this deployment process sensitive personal data?' },
        { id: 'Q1.4', stem: 'Does this deployment require contestability — affected citizens being able to challenge specific outputs?' },
      ],
    },
    2: {
      heading: 'Governance requirements: operations and access',
      subtitle: 'Mark each requirement the deployment activates.',
      questions: [
        { id: 'Q2.1', stem: 'Does this deployment require minimal vendor dependency?' },
        { id: 'Q2.2', stem: 'Does this deployment require high conversational or interpretive flexibility?' },
        { id: 'Q2.3', stem: 'Does an alternative, equal-priority service pathway exist for citizens not served by the AI deployment?' },
      ],
    },
    3: {
      heading: 'Generative-specific conditions',
      subtitle: 'Generative-capable architectures remain in play. Two procurement conditions decide whether they can be selected.',
      questions: [
        { id: 'Q3.1', stem: 'Is human review of every consequential output operationally feasible?' },
        { id: 'Q3.2', stem: 'Can generative outputs be constrained to retrieved, institution-controlled sources?' },
      ],
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // State derivation (spec §5.3). Pure functions over the current answer set.
  // Unanswered (null) contributes nothing to either clause.
  // ─────────────────────────────────────────────────────────────────────────

  const YES = (v) => v === true;
  const NO  = (v) => v === false;

  function deriveArchitectureStates(a) {
    const s = {};

    // Rule-Based
    if (YES(a['Q2.2']) || NO(a['Q2.3'])) s['rule-based'] = 'eliminated';
    else                                 s['rule-based'] = 'active';

    // Retrieval-Based
    if (YES(a['Q2.2']) || NO(a['Q2.3'])) s['retrieval-based'] = 'eliminated';
    else                                 s['retrieval-based'] = 'active';

    // Classical ML
    if (YES(a['Q2.2']) || NO(a['Q2.3'])) {
      s['classical-ml'] = 'eliminated';
    } else if (
      YES(a['Q1.1']) || YES(a['Q1.2']) || YES(a['Q1.3']) ||
      YES(a['Q1.4']) || YES(a['Q2.1'])
    ) {
      s['classical-ml'] = 'conditional';
    } else {
      s['classical-ml'] = 'active';
    }

    // Hybrid
    if (NO(a['Q2.3']) || NO(a['Q3.1']) || NO(a['Q3.2'])) {
      s['hybrid'] = 'eliminated';
    } else if (
      YES(a['Q1.1']) || YES(a['Q1.2']) || YES(a['Q1.3']) ||
      YES(a['Q1.4']) || YES(a['Q2.1'])
    ) {
      s['hybrid'] = 'conditional';
    } else {
      s['hybrid'] = 'active';
    }

    // Generative LLM
    if (
      YES(a['Q1.1']) || YES(a['Q1.2']) || YES(a['Q1.4']) ||
      NO(a['Q2.3']) || NO(a['Q3.1']) || NO(a['Q3.2'])
    ) {
      s['generative-llm'] = 'eliminated';
    } else if (YES(a['Q1.3']) || YES(a['Q2.1'])) {
      s['generative-llm'] = 'conditional';
    } else {
      s['generative-llm'] = 'active';
    }

    return s;
  }

  function deriveVerdict(states, answers) {
    const allEliminated = ARCHITECTURES.every(arch => states[arch.key] === 'eliminated');
    if (!allEliminated) {
      return { verdict: 'select-architecture', stopReason: null };
    }
    const stopReason = NO(answers['Q2.3']) ? 'distributional' : 'no-survivors';
    return { verdict: 'stop-and-reframe', stopReason };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Card copy (spec §4.5)
  // ─────────────────────────────────────────────────────────────────────────

  const CARD_COPY = {
    'rule-based': {
      active: 'Appropriate. Outputs traceable to explicit rules; structural safety and immediate institutional control of the rule base.',
      conditional: 'Conditionally appropriate.',
    },
    'retrieval-based': {
      active: 'Appropriate. Outputs traceable to specific sources; institutional control of the knowledge base.',
      conditional: 'Conditionally appropriate.',
    },
    'classical-ml': {
      active: 'Appropriate. Suited to efficient prediction; feature-level interpretability supports contestability.',
      conditional: 'Conditionally appropriate. Suited to efficient prediction where probabilistic outputs are acceptable, with feature-level interpretability required to support contestability.',
    },
    'hybrid': {
      active: 'Appropriate. Fluency combined with factual grounding.',
      conditional: 'Conditionally appropriate. Fluency combined with factual grounding, on the condition that retrieval remains primary and generative output is constrained to retrieved sources.',
    },
    'generative-llm': {
      active: 'Appropriate. Suited to high conversational flexibility.',
      conditional: 'Conditionally appropriate. Suited to high conversational flexibility; requires strict procurement conditions (human oversight, grounding mechanisms, on-premises deployment for sensitive-data contexts) to be met.',
    },
  };

  const RESULT_COPY = {
    'select-architecture':
      "The deployment survives the framework's governance requirements. Surviving architectures are presented in governability order — the framework's analytical claim that more governable architectures sit at the head of the list, with selection below the head requiring documented deviation reasoning.",
    'stop-distributional':
      'No equal-priority alternative service pathway exists for citizens not served by the AI deployment. The framework treats this as a Stop and Reframe verdict — the deployment as currently scoped does not survive the framework\'s distributional safeguard. Reconsider whether the deployment can proceed without such a pathway, or revise its scope.',
    'stop-no-survivors':
      "The governance requirements this deployment activates leave no architectural family that the framework can recommend. The framework treats this as a Stop and Reframe verdict — reconsider the deployment's scope, or revise the conditions under which it would be acceptable.",
    deviation:
      'In a full application, the practitioner would select from the surviving architectures and record the chosen architecture in an architectural decision record. Selection below the head of the governability ordering requires documented deviation reasoning.',
  };

  const SCENARIO = 'Citizen-service chatbot — answers benefits enquiries and provides preliminary eligibility assessments.';

  // ─────────────────────────────────────────────────────────────────────────
  // Styles — token fallbacks (§1.3) + layout + state machinery
  // ─────────────────────────────────────────────────────────────────────────

  const STYLES = /* css */ `
    :host {
      /* Host-overridable palette — fallbacks from spec §1.3 */
      --page: var(--ast-page, #FBF8F1);
      --surface: var(--ast-surface, #FFFFFF);
      --surface-deep: var(--ast-surface-deep, #F8F4EA);
      --ink-strong: var(--ast-ink-strong, #1A1816);
      --ink: var(--ast-ink, #2C2A26);
      --ink-soft: var(--ast-ink-soft, #5F5C54);
      --ink-mute: var(--ast-ink-mute, #8A867C);
      --coral: var(--ast-coral, #B8472E);
      --coral-deep: var(--ast-coral-deep, #712B13);
      --coral-tint: var(--ast-coral-tint, #FAECE7);
      --sage: var(--ast-sage, #4F7A66);
      --sage-deep: var(--ast-sage-deep, #2A4D3D);
      --sage-tint: var(--ast-sage-tint, #E7F0EB);
      --saffron: var(--ast-saffron, #E0A030);
      --saffron-deep: var(--ast-saffron-deep, #A56F12);
      --saffron-tint: var(--ast-saffron-tint, #FCF1D7);
      --cobalt: var(--ast-cobalt, #2B5BD9);
      --cobalt-deep: var(--ast-cobalt-deep, #1E3FA0);
      --cobalt-tint: var(--ast-cobalt-tint, #E3EBFC);
      --border: var(--ast-border, #E5E0D2);
      --border-soft: var(--ast-border-soft, #EDE8DA);
      --border-strong: var(--ast-border-strong, #B4B0A2);
      --radius-md: var(--ast-radius-md, 8px);
      --radius-lg: var(--ast-radius-lg, 12px);
      --radius-pill: var(--ast-radius-pill, 999px);

      /* Component-internal tokens (spec §1.3) */
      --teal: #0F6E56;
      --teal-deep: #084538;
      --teal-tint: #D9EBE5;
      --page-subtle: #F4EFE3;
      --ink-faint: #BFBBB0;
      --focus-ring: rgba(184, 71, 46, 0.55);

      display: block;
      width: 100%;
      height: 100%;
      font-family: 'IBM Plex Sans', 'Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    *, *::before, *::after { box-sizing: border-box; }

    .root {
      width: 100%;
      height: 100%;
      min-width: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .panel {
      width: min(1080px, 100%);
      height: min(720px, 100%);
      min-height: 540px;
      background: var(--surface-deep);
      border-radius: var(--radius-lg);
      box-shadow: 0 12px 32px rgba(28, 26, 22, 0.18);
      padding: 24px 32px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transform-origin: center;
      animation: ast-mount 220ms ease-out;
    }

    @keyframes ast-mount {
      from { opacity: 0; transform: scale(0.96); }
      to   { opacity: 1; transform: scale(1); }
    }

    /* Title strip ---------------------------------------------------------- */
    .title-strip {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
      min-height: 40px;
    }

    .title-left { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }

    .title {
      font-weight: 500;
      font-size: 20px;
      color: var(--ink-strong);
      letter-spacing: -0.01em;
      margin: 0;
    }

    .explore-tag {
      font-style: italic;
      font-size: 14px;
      color: var(--saffron-deep);
      font-weight: 400;
    }

    .close-link {
      background: none;
      border: none;
      padding: 6px 8px;
      font: inherit;
      font-size: 14px;
      color: var(--ink-soft);
      cursor: pointer;
      text-decoration: none;
    }
    .close-link:hover { text-decoration: underline; }
    .close-link:focus-visible {
      outline: 3px solid var(--focus-ring);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* Firewall tagline ----------------------------------------------------- */
    .firewall {
      text-align: center;
      font-style: italic;
      font-size: 15px;
      color: var(--ink);
      margin: 0;
      min-height: 24px;
    }

    /* Scenario chip -------------------------------------------------------- */
    .scenario {
      background: var(--surface);
      border: 0.5px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      display: flex;
      align-items: baseline;
      gap: 14px;
    }
    .scenario-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.15em;
      color: var(--ink-mute);
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .scenario-text {
      font-size: 15px;
      color: var(--ink-strong);
    }

    /* Spectrum strip ------------------------------------------------------- */
    .spectrum {
      display: flex;
      width: 100%;
      height: 96px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 0.5px solid var(--border);
    }
    .spectrum.final { height: 120px; }

    .segment {
      flex: 1 1 0;
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-width: 0;
      border-right: 1px solid var(--border);
      transition:
        background-color 240ms ease-in-out,
        color 240ms ease-in-out,
        border-color 240ms ease-in-out;
      text-align: center;
    }
    .segment:last-child { border-right: none; }

    .segment-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 240ms ease-in-out;
    }
    .segment-name {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.15;
      transition: text-decoration-color 240ms ease-in-out;
    }
    .segment-caption {
      font-size: 11px;
      font-style: italic;
      line-height: 1.1;
      opacity: 0;
      transition: opacity 240ms ease-in-out;
    }

    /* Architecture hue families */
    .segment[data-arch="rule-based"][data-state="active"]      { background: var(--sage);    color: #fff; border-color: var(--sage); }
    .segment[data-arch="rule-based"][data-state="conditional"] { background: var(--sage-tint);    color: var(--sage-deep);    border: 1px solid var(--sage-deep); }
    .segment[data-arch="retrieval-based"][data-state="active"] { background: var(--teal);    color: #fff; border-color: var(--teal); }
    .segment[data-arch="retrieval-based"][data-state="conditional"] { background: var(--teal-tint); color: var(--teal-deep); border: 1px solid var(--teal-deep); }
    .segment[data-arch="classical-ml"][data-state="active"]    { background: var(--cobalt);  color: #fff; border-color: var(--cobalt); }
    .segment[data-arch="classical-ml"][data-state="conditional"] { background: var(--cobalt-tint); color: var(--cobalt-deep); border: 1px solid var(--cobalt-deep); }
    .segment[data-arch="hybrid"][data-state="active"]          { background: var(--saffron); color: #fff; border-color: var(--saffron); }
    .segment[data-arch="hybrid"][data-state="conditional"]     { background: var(--saffron-tint); color: var(--saffron-deep); border: 1px solid var(--saffron-deep); }
    .segment[data-arch="generative-llm"][data-state="active"]  { background: var(--coral);   color: #fff; border-color: var(--coral); }
    .segment[data-arch="generative-llm"][data-state="conditional"] { background: var(--coral-tint);   color: var(--coral-deep);   border: 1px solid var(--coral-deep); }

    .segment[data-state="conditional"] .segment-caption { opacity: 1; }

    .segment[data-state="eliminated"] {
      background: var(--page-subtle);
      color: var(--ink-faint);
      border: 0.5px solid var(--border-soft);
    }
    .segment[data-state="eliminated"] .segment-name {
      text-decoration: line-through;
      text-decoration-color: var(--ink-faint);
    }
    .segment[data-state="eliminated"] .segment-icon { opacity: 0.3; }

    /* Question card area --------------------------------------------------- */
    .card-area {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .card {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      padding: 4px 2px 4px 2px;
      animation: ast-card-in 200ms ease-out;
    }
    @keyframes ast-card-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .card-heading {
      font-size: 18px;
      font-weight: 500;
      color: var(--ink-strong);
      margin: 0 0 4px 0;
    }
    .card-subtitle {
      font-size: 14px;
      color: var(--ink-soft);
      margin: 0 0 16px 0;
    }

    .question {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
      padding: 12px 0;
      border-top: 0.5px solid var(--border-soft);
    }
    .question:first-of-type { border-top: none; }
    .question-stem {
      font-size: 15px;
      color: var(--ink);
      line-height: 1.4;
      flex: 1 1 auto;
      margin: 6px 0 0 0;
    }
    .yn-group {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .yn-btn {
      min-width: 56px;
      min-height: 44px;
      padding: 0 18px;
      border-radius: var(--radius-pill);
      border: 0.5px solid var(--border);
      background: var(--surface);
      color: var(--ink);
      font: inherit;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease, opacity 120ms ease;
    }
    .yn-btn:hover:not([data-selected="true"]):not(:disabled) {
      border-color: var(--border-strong);
    }
    .yn-btn[data-selected="true"] {
      background: var(--ink-strong);
      color: var(--page);
      border-color: var(--ink-strong);
    }
    .yn-btn:focus-visible {
      outline: 3px solid var(--focus-ring);
      outline-offset: 2px;
    }
    .yn-btn:disabled {
      cursor: default;
    }
    .yn-btn:disabled[data-selected="true"] {
      /* Locked selected: full opacity ink */
      opacity: 1;
    }
    .yn-btn:disabled:not([data-selected="true"]) {
      opacity: 0.4;
      color: var(--ink-faint);
      border-color: var(--border-soft);
    }

    /* Footer --------------------------------------------------------------- */
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-height: 48px;
      padding-top: 6px;
    }
    .step-indicator {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.15em;
      color: var(--ink-mute);
      text-transform: uppercase;
    }

    .continue, .secondary-btn, .primary-btn {
      min-height: 44px;
      padding: 0 22px;
      border-radius: var(--radius-pill);
      font: inherit;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease, opacity 120ms ease;
    }

    .continue {
      background: var(--surface);
      color: var(--saffron-deep);
      border: 1.5px solid var(--saffron);
    }
    .continue:hover:not([aria-disabled="true"]) {
      background: var(--saffron-tint);
    }
    .continue:active:not([aria-disabled="true"]) {
      background: var(--saffron-tint);
      border-color: var(--saffron-deep);
    }
    .continue[aria-disabled="true"] {
      opacity: 0.4;
      cursor: default;
    }
    .continue:focus-visible {
      outline: 3px solid var(--focus-ring);
      outline-offset: 2px;
    }

    /* Result screen -------------------------------------------------------- */
    .result-heading-label {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.15em;
      color: var(--ink-mute);
      text-transform: uppercase;
      margin: 0 0 6px 0;
    }
    .result-heading {
      font-size: 28px;
      font-weight: 600;
      color: var(--ink-strong);
      margin: 0 0 12px 0;
      letter-spacing: -0.01em;
    }
    .result-lead {
      font-size: 15px;
      color: var(--ink);
      line-height: 1.45;
      margin: 0 0 16px 0;
    }
    .deviation-note {
      font-style: italic;
      font-size: 13px;
      color: var(--ink-soft);
      margin: 14px 0 0 0;
      line-height: 1.4;
    }

    .arch-cards {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 14px;
    }
    .arch-card {
      width: 100%;
      text-align: left;
      background: var(--surface);
      border: 0.5px solid var(--border);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      font: inherit;
      cursor: pointer;
      color: var(--ink);
      transition: background-color 120ms ease;
    }
    .arch-card:hover { background: var(--page); }
    .arch-card:focus-visible {
      outline: 3px solid var(--focus-ring);
      outline-offset: 2px;
    }
    .arch-card-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .arch-chevron {
      transition: transform 160ms ease;
      color: var(--ink-soft);
      flex-shrink: 0;
    }
    .arch-card[aria-expanded="true"] .arch-chevron { transform: rotate(90deg); }
    .arch-hue-chip {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .arch-hue-chip[data-hue="sage"]    { background: var(--sage); }
    .arch-hue-chip[data-hue="teal"]    { background: var(--teal); }
    .arch-hue-chip[data-hue="cobalt"]  { background: var(--cobalt); }
    .arch-hue-chip[data-hue="saffron"] { background: var(--saffron); }
    .arch-hue-chip[data-hue="coral"]   { background: var(--coral); }
    .arch-card-name {
      font-weight: 500;
      color: var(--ink-strong);
      font-size: 15px;
    }
    .arch-card-desc {
      display: none;
      margin: 8px 0 0 24px;
      font-size: 14px;
      color: var(--ink);
      line-height: 1.45;
    }
    .arch-card[aria-expanded="true"] .arch-card-desc { display: block; }

    /* Screen-reader-only live region for spectrum announcements */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      white-space: nowrap;
      border: 0;
    }

    /* Responsive compression (spec §9.2) ----------------------------------- */
    @container ast (max-width: 900px) {
      .panel { padding: 18px 22px; gap: 10px; }
      .explore-tag { display: none; }
      .firewall { font-size: 13px; }
      .scenario { padding: 8px 14px; }
      .scenario-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .spectrum { height: 86px; }
      .segment-name { font-size: 12px; }
      .segment-icon svg { width: 18px; height: 18px; }
      .question-stem { font-size: 14px; }
      .footer { min-height: 44px; }
      .continue, .secondary-btn, .primary-btn { padding: 0 18px; }
    }

    /* Fallback for browsers without container queries */
    @media (max-width: 900px) {
      .panel { padding: 18px 22px; gap: 10px; }
      .explore-tag { display: none; }
      .firewall { font-size: 13px; }
      .scenario { padding: 8px 14px; }
      .scenario-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .spectrum { height: 86px; }
      .segment-name { font-size: 12px; }
      .segment-icon svg { width: 18px; height: 18px; }
      .question-stem { font-size: 14px; }
    }

    /* Reduced motion (spec §8.6) ------------------------------------------- */
    @media (prefers-reduced-motion: reduce) {
      .panel { animation: ast-mount-rm 100ms ease-out; }
      @keyframes ast-mount-rm {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .segment,
      .segment-icon,
      .segment-caption,
      .segment-name,
      .arch-chevron,
      .yn-btn,
      .continue,
      .secondary-btn,
      .primary-btn,
      .arch-card { transition: none; }
      .card { animation: none; }
    }
  `;

  // ─────────────────────────────────────────────────────────────────────────
  // Custom element class
  // ─────────────────────────────────────────────────────────────────────────

  class AstExplore extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.state = this._initialState();
      this._reachedResult = false;
      this._verdictFiredForThisRun = false;
      this._iframeMode = this._detectIframeMode();
      this._onKeydown = this._onKeydown.bind(this);
    }

    _initialState() {
      return {
        currentScreen: 1,
        answers: {
          'Q1.1': null, 'Q1.2': null, 'Q1.3': null, 'Q1.4': null,
          'Q2.1': null, 'Q2.2': null, 'Q2.3': null,
          'Q3.1': null, 'Q3.2': null,
        },
        screensLocked: { 1: false, 2: false, 3: false },
      };
    }

    _detectIframeMode() {
      const hint = this.getAttribute('mode');
      if (hint === 'iframe') return true;
      if (hint === 'component') return false;
      try { return window.parent !== window; } catch (_) { return true; }
    }

    // ─── Lifecycle ─────────────────────────────────────────────────────────
    connectedCallback() {
      this.shadowRoot.innerHTML = `<style>${STYLES}</style><div class="root" part="root"></div>`;
      this._rootEl = this.shadowRoot.querySelector('.root');
      this.setAttribute('role', 'dialog');
      this.setAttribute('aria-modal', 'true');
      this.setAttribute('aria-labelledby', 'ast-title');
      this.setAttribute('lang', 'en');
      this._buildPanel();
      document.addEventListener('keydown', this._onKeydown);
      this._emit('ast:open', { timestamp: Date.now() });
    }

    disconnectedCallback() {
      document.removeEventListener('keydown', this._onKeydown);
    }

    _onKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this._close();
      }
    }

    // ─── Event emission ────────────────────────────────────────────────────
    _emit(type, detail) {
      this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
      if (this._iframeMode) {
        try { window.parent.postMessage({ type, detail }, '*'); } catch (_) { /* sandboxed */ }
      }
    }

    // ─── State helpers ─────────────────────────────────────────────────────
    _states() { return deriveArchitectureStates(this.state.answers); }

    _allAnswered(screen) {
      const qs = SCREENS[screen].questions;
      return qs.every(q => this.state.answers[q.id] !== null);
    }

    _setAnswer(qid, value) {
      const screen = this.state.currentScreen;
      if (this.state.screensLocked[screen]) return;
      const before = this._states();
      this.state.answers[qid] = value;
      const after = this._states();
      // In-place DOM updates — no panel re-render, so no flicker.
      this._updateAnswerButtons(qid);
      this._updateSpectrumStates(after);
      this._updateContinueEnabled();
      this._announceDiff(before, after);
    }

    _announceDiff(before, after) {
      const live = this.shadowRoot.querySelector('.sr-only');
      if (!live) return;
      const messages = [];
      for (const arch of ARCHITECTURES) {
        if (before[arch.key] !== after[arch.key]) {
          const now = after[arch.key];
          if (now === 'eliminated')      messages.push(`${arch.name} eliminated`);
          else if (now === 'conditional') messages.push(`${arch.name} is now conditionally appropriate`);
          else                            messages.push(`${arch.name} is now active`);
        }
      }
      if (messages.length) live.textContent = messages.join('. ') + '.';
    }

    // ─── Continue & screen transitions ─────────────────────────────────────
    _onContinue() {
      const cur = this.state.currentScreen;
      if (!this._allAnswered(cur)) return;
      this.state.screensLocked[cur] = true;

      if (cur === 1) {
        this.state.currentScreen = 2;
      } else if (cur === 2) {
        const s = this._states();
        const gencap = s['hybrid'] !== 'eliminated' || s['generative-llm'] !== 'eliminated';
        this.state.currentScreen = gencap ? 3 : 4;
      } else if (cur === 3) {
        this.state.currentScreen = 4;
      }

      this._swapCard();

      if (this.state.currentScreen === 4) {
        this._onReachResult();
      }
    }

    _onReachResult() {
      this._reachedResult = true;
      const states = this._states();
      const { verdict, stopReason } = deriveVerdict(states, this.state.answers);
      const surviving   = ARCHITECTURES.filter(a => states[a.key] !== 'eliminated').map(a => a.key);
      const active      = ARCHITECTURES.filter(a => states[a.key] === 'active').map(a => a.key);
      const conditional = ARCHITECTURES.filter(a => states[a.key] === 'conditional').map(a => a.key);
      const eliminated  = ARCHITECTURES.filter(a => states[a.key] === 'eliminated').map(a => a.key);
      this._emit('ast:verdict', { verdict, surviving, active, conditional, eliminated, stopReason });
    }

    _onTryAgain() {
      this.state = this._initialState();
      this._verdictFiredForThisRun = false;
      this._reachedResult = false;
      this._updateSpectrumStates(this._states());
      this._swapCard();
    }

    _close() {
      this._emit('ast:close', { timestamp: Date.now(), reachedResult: this._reachedResult });
      // Unmount: remove from DOM if still parented
      if (this.parentNode) this.parentNode.removeChild(this);
    }

    // ─── Rendering ─────────────────────────────────────────────────────────
    //
    // The panel scaffold (chrome + spectrum + empty card-area + footer) is
    // built ONCE at mount time. After that, three kinds of update happen:
    //
    //   1. Answer click  → in-place attribute mutation only (button data-selected,
    //      segment data-state, Continue aria-disabled). No HTML rebuilds, so
    //      no animation re-runs, no focus loss, no flicker.
    //   2. Screen transition (Continue) → swap card-area + footer innerHTML,
    //      toggle .final on the spectrum. Chrome stays put.
    //   3. Try again → reset state, swap card back to Screen 1.

    _buildPanel() {
      const states = this._states();
      this._rootEl.innerHTML = `
        <div class="panel" part="panel">
          <div class="title-strip">
            <div class="title-left">
              <h2 class="title" id="ast-title">Architecture Selection Tool</h2>
              <span class="explore-tag">— Explore mode</span>
            </div>
            <button class="close-link" type="button" data-action="close" aria-label="Close and return to evaluation">Close and return to evaluation</button>
          </div>
          <p class="firewall">A taster of the Tool's analytical work — your answers here are not recorded.</p>
          <div class="scenario" role="note" aria-label="Scenario">
            <span class="scenario-label">SCENARIO</span>
            <span class="scenario-text">${SCENARIO}</span>
          </div>
          ${this._renderSpectrum(states)}
          <span class="sr-only" role="status" aria-live="polite"></span>
          <div class="card-area"></div>
          <div class="footer"></div>
        </div>
      `;
      this._attachDelegatedHandlers();
      this._swapCard();
    }

    _attachDelegatedHandlers() {
      // Single delegated click handler on the root, dispatched by attributes.
      // No need to rebind on every render.
      this._rootEl.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action], [data-q]');
        if (!target) return;

        if (target.matches('.yn-btn')) {
          if (target.disabled) return;
          const qid = target.getAttribute('data-q');
          const value = target.getAttribute('data-v') === 'yes';
          this._setAnswer(qid, value);
          return;
        }

        const action = target.getAttribute('data-action');
        switch (action) {
          case 'continue':
            if (target.getAttribute('aria-disabled') === 'true') return;
            this._onContinue();
            break;
          case 'close':
          case 'close-from-result':
            this._close();
            break;
          case 'try-again':
            this._onTryAgain();
            break;
          case 'toggle-card': {
            const open = target.getAttribute('aria-expanded') === 'true';
            target.setAttribute('aria-expanded', open ? 'false' : 'true');
            break;
          }
        }
      });

      // Enter/Space on architecture cards (delegated keydown).
      this._rootEl.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('[data-action="toggle-card"]');
        if (!card) return;
        e.preventDefault();
        card.click();
      });
    }

    _renderSpectrum(states) {
      const segments = ARCHITECTURES.map(arch => {
        const st = states[arch.key];
        const shortName = ARCHITECTURE_SHORT[arch.key];
        return `
          <div class="segment" data-arch="${arch.key}" data-state="${st}" aria-label="${arch.name}: ${st}">
            <span class="segment-icon">${ICONS[arch.key]}</span>
            <span class="segment-name">${shortName}</span>
            <span class="segment-caption">with conditions</span>
          </div>`;
      }).join('');
      return `<div class="spectrum" role="status" aria-live="polite" aria-label="Architecture pool">${segments}</div>`;
    }

    // Swap the card-area + footer to match this.state.currentScreen, and
    // toggle .final on the spectrum if entering the result screen.
    _swapCard() {
      const cur = this.state.currentScreen;
      const states = this._states();
      const cardArea = this._rootEl.querySelector('.card-area');
      const footer = this._rootEl.querySelector('.footer');
      const spectrum = this._rootEl.querySelector('.spectrum');
      if (!cardArea || !footer || !spectrum) return;

      const stepLabel = cur === 4 ? 'RESULT' : `STEP ${cur}`;
      const cardHtml = cur === 4 ? this._renderResultCard(states) : this._renderQuestionCard(cur);
      const footerInnerHtml = cur === 4 ? this._renderResultFooter() : this._renderQuestionFooter(cur);

      cardArea.innerHTML = cardHtml;
      footer.innerHTML = `<span class="step-indicator">${stepLabel}</span>${footerInnerHtml}`;
      spectrum.classList.toggle('final', cur === 4);
    }

    // In-place: flip data-selected/aria-checked on the two buttons for qid.
    _updateAnswerButtons(qid) {
      const ans = this.state.answers[qid];
      const btns = this._rootEl.querySelectorAll(`.yn-btn[data-q="${qid}"]`);
      btns.forEach(btn => {
        const isYes = btn.getAttribute('data-v') === 'yes';
        const selected = (isYes && ans === true) || (!isYes && ans === false);
        btn.setAttribute('data-selected', String(selected));
        btn.setAttribute('aria-checked', String(selected));
      });
    }

    // In-place: update data-state on each spectrum segment. The CSS transition
    // handles the 240ms ease-in-out animation between states.
    _updateSpectrumStates(states) {
      for (const arch of ARCHITECTURES) {
        const seg = this._rootEl.querySelector(`.segment[data-arch="${arch.key}"]`);
        if (!seg) continue;
        const st = states[arch.key];
        if (seg.getAttribute('data-state') !== st) {
          seg.setAttribute('data-state', st);
          seg.setAttribute('aria-label', `${arch.name}: ${st}`);
        }
      }
    }

    // In-place: toggle the Continue button's aria-disabled based on whether
    // all current-screen questions are answered.
    _updateContinueEnabled() {
      const cont = this._rootEl.querySelector('[data-action="continue"]');
      if (!cont) return;
      const ready = this._allAnswered(this.state.currentScreen);
      cont.setAttribute('aria-disabled', String(!ready));
      if (ready) cont.removeAttribute('tabindex'); else cont.setAttribute('tabindex', '-1');
    }

    _renderQuestionCard(screen) {
      const s = SCREENS[screen];
      const locked = this.state.screensLocked[screen];
      const questions = s.questions.map((q, i) => {
        const ans = this.state.answers[q.id];
        const stemId = `stem-${q.id.replace('.', '-')}`;
        return `
          <div class="question">
            <p class="question-stem" id="${stemId}">${q.stem}</p>
            <div class="yn-group" role="radiogroup" aria-labelledby="${stemId}">
              <button class="yn-btn" type="button"
                role="radio" aria-checked="${ans === true}"
                data-q="${q.id}" data-v="yes"
                data-selected="${ans === true}"
                ${locked ? 'disabled' : ''}>Yes</button>
              <button class="yn-btn" type="button"
                role="radio" aria-checked="${ans === false}"
                data-q="${q.id}" data-v="no"
                data-selected="${ans === false}"
                ${locked ? 'disabled' : ''}>No</button>
            </div>
          </div>`;
      }).join('');
      return `
        <div class="card">
          <h3 class="card-heading">${s.heading}</h3>
          <p class="card-subtitle">${s.subtitle}</p>
          ${questions}
        </div>`;
    }

    _renderQuestionFooter(screen) {
      const ready = this._allAnswered(screen);
      return `<button class="continue" type="button" data-action="continue" aria-disabled="${!ready}" ${ready ? '' : 'tabindex="-1"'}>Continue</button>`;
    }

    _renderResultCard(states) {
      const { verdict, stopReason } = deriveVerdict(states, this.state.answers);
      let lead;
      if (verdict === 'select-architecture') {
        lead = RESULT_COPY['select-architecture'];
      } else if (stopReason === 'distributional') {
        lead = RESULT_COPY['stop-distributional'];
      } else {
        lead = RESULT_COPY['stop-no-survivors'];
      }

      const heading = verdict === 'select-architecture' ? 'Select Architecture' : 'Stop and Reframe';

      let cardsHtml = '';
      let deviationHtml = '';
      if (verdict === 'select-architecture') {
        const survivors = ARCHITECTURES.filter(a => states[a.key] !== 'eliminated');
        cardsHtml = `
          <div class="arch-cards">
            ${survivors.map(a => {
              const st = states[a.key];
              const desc = CARD_COPY[a.key][st] || '';
              return `
                <button class="arch-card" type="button" data-action="toggle-card" data-arch="${a.key}" aria-expanded="false">
                  <div class="arch-card-row">
                    <svg class="arch-chevron" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>
                    <span class="arch-hue-chip" data-hue="${a.hue}" aria-hidden="true"></span>
                    <span class="arch-card-name">${a.name}</span>
                  </div>
                  <p class="arch-card-desc">${desc}</p>
                </button>`;
            }).join('')}
          </div>`;
        deviationHtml = `<p class="deviation-note">${RESULT_COPY.deviation}</p>`;
      }

      return `
        <div class="card">
          <p class="result-heading-label">VERDICT</p>
          <h3 class="result-heading">${heading}</h3>
          <p class="result-lead">${lead}</p>
          ${cardsHtml}
          ${deviationHtml}
        </div>`;
    }

    _renderResultFooter() {
      return `
        <div style="display:flex; gap:12px;">
          <button class="secondary-btn" type="button" data-action="try-again"
            style="background: var(--surface); color: var(--ink); border: 0.5px solid var(--border);">Try again</button>
          <button class="primary-btn continue" type="button" data-action="close-from-result">Close</button>
        </div>`;
    }

  }

  customElements.define('ast-explore', AstExplore);
})();
