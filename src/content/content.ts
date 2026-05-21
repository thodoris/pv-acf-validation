/* C-9 Expert Validation Platform — content layer.
   UI in English. Open-text responses accept English or Greek.

   Data model: see ./types.ts (ContentRoot).

   Carry-forward from docs/reference-prototype/content.js (frozen).
   Only the IIFE wrapper and the C declaration were modified to make this a
   typed ES module export; the data body is identical to the prototype. */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ContentRoot } from './types';

export const CONTENT: ContentRoot = ((): ContentRoot => {
  const C: any = {};

  C.thesis = {
    short: "PV-ACF",
    long: "Public-Value AI Co-production Framework",
    chapter: "PV-ACF · Expert validation",
  };

  /* ============================================================
     The 6 top-bar steps
     ============================================================ */
  C.steps = [
    { id: "profile",     label: "Profile",     short: "Profile" },
    { id: "grounding",   label: "Grounding",   short: "Grounding" },
    { id: "problem",     label: "Problem",     short: "Problem" },
    { id: "framework",   label: "Framework",   short: "Framework" },
    { id: "instruments", label: "Instruments", short: "Instruments" },
    { id: "close",       label: "Close",       short: "Close" },
  ];

  /* ============================================================
     Profile screen
     ============================================================ */
  C.profile = {
    title: "Before we begin",
    tagline: "A few details about you. This takes under a minute.",
    fields: [
      {
        key: "name", kind: "text",
        label: "Your full name", required: false,
        placeholder: "Your full name (optional)",
        helper: "Optional. Give your full name, or leave this blank to respond anonymously — the choice is yours.",
      },
      {
        key: "institutionName", kind: "text",
        label: "Your institution", required: false,
        placeholder: "Your institution (optional)",
        helper: "Optional. Give the specific institution you work for, or leave blank.",
      },
      {
        key: "institution", kind: "select", required: true,
        label: "Type of institution",
        helper: "Pick the closest fit. If your work spans more than one, choose where most of your relevant experience sits.",
        options: [
          "National government or public administration body",
          "Regional or local government body",
          "Regulator or oversight body",
          "Academia or research institution",
          "Civil society organisation",
          "Other",
        ],
      },
      {
        key: "years", kind: "select", required: true,
        label: "Years working in public administration",
        helper: "If your work is not in public-administration practice — for example an academic or civil-society role — choose “none / not applicable.”",
        options: [
          "None / not applicable",
          "Under 5 years",
          "5–10 years",
          "11–20 years",
          "Over 20 years",
        ],
      },
    ],
    languageNote: "The platform is in English. When you reach the open-response questions, you can answer in English or Greek — use whichever language lets you answer most fully.",
  };

  /* ============================================================
     Platform-wide grounding (2 screens)
     G1 — subject orientation (AI in public administration).
     G2 — framework positioning (the framework you will evaluate).
     Cluster-specific setup screens carry framework architecture, instruments,
     and the cluster-specific problem terrain.
     ============================================================ */
  C.grounding = [
    {
      id: "g1", title: "AI in public administration",
      tagline: "Why governance concerns often extend beyond the system itself.",
    },
    {
      id: "g2", title: "The framework you will evaluate",
      tagline: "PV-ACF as a critical-deliberative framework, not another compliance checklist.",
    },
  ];

  /* ============================================================
     Cluster setup screens (the per-cluster introductory grounding)
     Phase A: abstract-described placeholder content; the cluster files
     specify the substance — full presentation copy is a Phase B+ task.
     ============================================================ */
  C.clusters = {
    problem: {
      id: "problem",
      label: "The problem",
      ordinal: "Cluster 1 of 4",
      tagline: "The governance gap, before the framework.",
      intro: "Before judging the framework, you will judge the problem it claims to address. This cluster runs lighter — short rating items with optional written responses — so the entry into the questionnaire is calibrating, not heavy.",
      setup: {
        title: "What this cluster is about",
        sections: [
          {
            label: "The setting",
            body: "Public administrations across Europe are using AI in decisions about eligibility, entitlement, prioritisation, and how citizen complaints get routed. These are not pilots any more. The question has moved from <em>whether</em> to <em>how they should be governed</em>.",
          },
          {
            label: "The settled critiques",
            body: "Opacity. The quiet movement of decision-making away from front-line staff into system behaviour. The weakening of a citizen’s ability to contest an outcome when the reasoning chain behind it grows too long to follow. Well-documented and not in dispute — but all of them look at the <em>deployed system</em>.",
          },
          {
            label: "The gap as a layered structure",
            body: "The thesis claims the consequential problem is not only at the deployment. By the time an administration is deciding how to run an AI system, most of the consequential choices have been made upstream: strategy has settled that AI is the answer; procurement has inherited that framing as a contract; the institution has been reshaped around the system. The deployment-level problems are the visible tip of a structure whose other layers sit above and behind them.",
          },
          {
            label: "Two properties that make it a structure",
            body: "<strong>Layered</strong> — the problems visible at the deployment level are produced and held in place by decisions taken above them, and an administration cannot fix at the deployment level something that was determined two levels up. <strong>Self-feeding</strong> — each round of decisions narrows the next: a procurement choice deepens a vendor dependence that narrows the next procurement; staff cuts reduce the capacity to scrutinise the next system.",
          },
          {
            label: "Why existing checks do not close it",
            body: "Audits, impact assessments, transparency rules, conformity assessments are not badly designed. They each work at <em>one level</em>, on the deployment in front of them, while the gap runs across all the levels at once. A practitioner can do everything the existing checks ask, correctly, and still be governing <em>inside</em> the gap rather than governing it.",
          },
          {
            label: "What the framework claims to do — and not do",
            body: "It does not claim to <em>close</em> the gap; closing it would take change well beyond any single administration’s tools. It claims to make the structure <em>visible and namable</em> to the practitioner working inside it, so that operational decisions can be taken with the upstream conditions in view rather than out of sight.",
          },
        ],
        footer: "Every Cluster 1 question is anchored explicitly in your public-administration practice — the questions ask about AI in PA and governance work, not about AI in general.",
      },
    },

    framework: {
      id: "framework",
      label: "The framework",
      ordinal: "Cluster 2 of 4",
      tagline: "From the proposed response, to its central design claims.",
      intro: "Cluster 1 established the problem. Cluster 2 puts the framework’s central design claims to you one at a time. You met the framework once in the platform-wide grounding; this introductory setup re-presents it as the object you are about to stress-test.",
      setup: {
        title: "The framework as the object of evaluation",
        sections: [
          {
            label: "The two-stage architecture",
            body: "An <strong>initial diagnostic stage</strong> the practitioner works through once, before a deployment, to surface the structural and institutional conditions already shaping the decision; feeding a <strong>five-stage operational lifecycle</strong> that runs across the deployment’s life. The diagnostic work is not a preface to be filed and forgotten — it is reached back into at specific points in the lifecycle.",
          },
          {
            label: "The four governance gaps",
            body: "The four things the framework says are structurally missing at the point where a specific AI deployment is decided on and run: no real <strong>deliberation about purpose</strong>; no <strong>participation by affected people</strong> in design; no <strong>accountability arrangement</strong> that survives into operation; no constraint on <strong>vendor power</strong>.",
          },
          {
            label: "The lifecycle as recursive",
            body: "The lifecycle runs and re-runs across the deployment’s life. The framework’s presumption is that a deployment <em>stops</em> unless it is positively re-justified at each cycle.",
          },
          {
            label: "Returning to the diagnostic conditions",
            body: "At several points in the operational lifecycle, the framework asks the practitioner to return to the structural conditions surfaced in the diagnostic stage, so an operational decision is taken with those conditions in view.",
          },
          {
            label: "Instruments and the gap-to-instrument map",
            body: "Each gap is paired with instruments meant to address it, and each instrument has a place in the lifecycle. The instruments themselves are Cluster 3’s object.",
          },
          {
            label: "Stage 2 and the Generative LLM Gate",
            body: "Within the lifecycle, Stage 2 treats architectural and procurement choices as governance decisions. The <strong>Architecture Selection Tool</strong> carries the architectural choice; the <strong>Generative LLM Gate</strong> is its conditional sibling — a five-question procurement checkpoint that runs only when a generative-LLM architecture has been selected.",
          },
        ],
        footer: "Each Cluster 2 question now puts one of these design choices to the test. The rationale behind each deliberate choice arrives on the question screen where you judge it — not here.",
      },
    },

    instruments: {
      id: "instruments",
      label: "The instruments",
      ordinal: "Cluster 3 of 4",
      tagline: "Down one level — from framework to four operational objects.",
      intro: "Cluster 2 asked whether the framework’s design is sound. Cluster 3 zooms in to four specific instruments judged as working objects. Each instrument is presented on its own screen with a top panel that stays in view while you answer its two questions.",
      setup: {
        title: "How operational-level evaluation works here",
        sections: [
          {
            label: "Specification vs. set-up work",
            body: "Each instrument has the <strong>form</strong> the framework specifies — its structure, prompts, the analytical questions it makes a practitioner ask — and the <strong>set-up work</strong> an institution needs to make it deployable: who fills which role, connection to existing systems, sector calibration. The framework specifies the first and leaves the second to the institution. An instrument that needs a lot of set-up work is a described property, not a fault.",
          },
          {
            label: "Per-instrument maturity notes",
            body: "Each instrument’s top panel opens with an honest statement of how mature it is — the four are deliberately not uniform. The maturity note is the thing to read “missing or concerning” against: a gap is a <em>design</em> fault, not the set-up work already named.",
          },
          {
            label: "The four instruments and their lifecycle order",
            body: "<strong>Contextual Integrity Worksheet</strong> and <strong>Architecture Selection Tool</strong> at Stage 2 (design and procurement); then <strong>Discretion Migration Analysis</strong> and <strong>Contestation Pathway Design</strong> at Stage 3 (oversight and accountability). You meet them in the order a practitioner meets them across a deployment’s life.",
          },
          {
            label: "The AST is operable; the others are described",
            body: "The AST has an optional “Explore it” overlay — you can run the tool against a scenario. Exploration is optional and <em>not recorded</em>; only your evaluation answers are. The other three instruments are presented as structured representations.",
          },
          {
            label: "The Generative LLM Gate is not among the four",
            body: "It was judged at framework level in Cluster 2. It is a Stage 2 instrument, but it is not examined operationally here.",
          },
          {
            label: "Two questions per instrument, same pattern each time",
            body: "<strong>Q.1</strong> — does the instrument do distinctive analytical work, coherently structured? (Required open response.) <strong>Q.2</strong> — could a practitioner put it to work? (Optional open response.) You learn the form once.",
          },
        ],
        footer: "“Distinctive analytical work” means useful for surfacing the gap — not useful as a fix.",
      },
    },

    close: {
      id: "close",
      label: "The close",
      ordinal: "Cluster 4 of 4",
      tagline: "One last open invitation. Set the agenda yourself.",
      intro: "You have now crossed the whole framework. One open question remains: anything the structured items did not reach. A second, fully optional question collects feedback on the validation exercise itself.",
      setup: {
        title: "One last invitation",
        sections: [
          {
            label: "The questionnaire is nearly complete",
            body: "The structured questions are behind you. One open question remains, with an optional second.",
          },
          {
            label: "What the final question is for",
            body: "It is deliberately unbounded — the one place where what gets raised is yours to set, not the questionnaire’s. There is no wrong thing to put there.",
          },
          {
            label: "“Everything you’ve seen”",
            body: "The problem the framework addresses (Cluster 1), the framework’s design (Cluster 2), its instruments (Cluster 3).",
          },
        ],
        footer: null,
      },
    },
  };

  /* ============================================================
     Question registry — keyed by screen id.
     Stems, subtitles, ratings, prompts: lifted from the cluster files.
     Affordances (rail content) are described in abstract; full rationale
     and source-material copy comes in Phase B.
     ============================================================ */

  // Shared source-card content. Built once, surfaced on multiple screens
  // (UI spec §5 build-once-surface-twice). Currently used by Q2.3 + Q2.4.
  const FOUR_GAPS_SOURCE_CARD = {
    kind: "source",
    title: "The four structural governance gaps",
    body:
      "<p>The framework names four conditions as structurally missing at the point a specific AI deployment is decided on and run:</p>" +
      "<ul>" +
        "<li><strong>No real deliberation about purpose</strong> — what the deployment is for is not opened to deliberation; the problem definition arrives already shaped by procurement framings, vendor offerings, or peer-institution example.</li>" +
        "<li><strong>No participation by affected people in design</strong> — the people the deployment will reach, the staff who will operate it, and independent voices able to challenge its framing have no place in the decisions that shape it.</li>" +
        "<li><strong>No accountability that survives into operation</strong> — responsibility, oversight, and contestation are not designed to remain meaningful after the system becomes operational.</li>" +
        "<li><strong>No constraint on vendor power, in procurement and beyond</strong> — vendor influence runs through contract terms, advisory and consultancy relationships, and infrastructural dependencies that persist long past the procurement decision.</li>" +
      "</ul>",
  };

  C.questions = {

    /* ---------- Cluster 1 — The Problem ---------- */

    "c1-q1": {
      cluster: "problem",
      kicker: "Problem · M1 — Is the gap real?",
      chapter: "Solution-first adoption",
      tagline: "A recognition question — answerable from memory.",
      meta: "Question 1.1 of 8 · Recognition",
      question: "Have you seen cases where AI was adopted first, and the justification for using it came afterwards?",
      subtitle: "This draws on your direct experience in public administration, not your general impression of the sector — cases where AI adoption came before a clear definition of the public problem it was meant to address.",
      type: "rating + optional open",
      rating: {
        kind: "frequency", required: true,
        options: ["Never seen this", "Seen it once or twice", "Seen it occasionally", "Seen it often", "It is the norm"],
      },
      open: {
        required: false,
        label: "Your experience",
        prompt: "If you have seen this, briefly describe what it looked like — and what tended to be driving it.",
      },
      scopeNote: [
        "“AI adoption” is meant broadly — any system assisting or replacing an administrative decision.",
        "This is the recognition form of the framework’s “deliberation about purpose” gap.",
      ],
    },

    "c1-q2": {
      cluster: "problem",
      kicker: "Problem · M2 — Is it structural?",
      chapter: "Institutional reshaping",
      tagline: "Layer 2 — how the upstream conditions get into the downstream decisions.",
      meta: "Question 1.2 of 8 · Recognition",
      question: "When AI systems are introduced in public administration, have you seen the organisation adapt itself around the system rather than the system adapting to the organisation?",
      subtitle: "This one pattern can show up as decision-making shifting from experienced staff toward the system, as the internal expertise to question the system weakening, or as problem definitions increasingly following the system rather than the institution.",
      type: "rating + optional open",
      rating: {
        kind: "frequency", required: true,
        options: ["Never seen this", "Seen it once or twice", "Seen it occasionally", "Seen it often", "It is the norm"],
      },
      open: {
        required: false,
        label: "In what ways",
        prompt: "If yes, briefly describe what you have seen.",
      },
      // Per-question affordances override the default scopeNote auto-build.
      // Order: SCOPE on top, EXAMPLE beneath (per Cluster 1 draft notes).
      customAffs: [
        {
          kind: "scope",
          title: "Scope · What this question is about",
          body: "<p>This question asks about broader organisational changes around AI systems, not only about technical performance. The three forms named in the subtitle are different ways the same pattern may appear:</p>",
          items: [
            "staff relying more heavily on system outputs",
            "reduced internal capacity to question the system",
            "organisational priorities increasingly shaped around the system itself",
          ],
          footer: "<p>Give one overall frequency judgment for the pattern as a whole. You do not need to have seen all three forms for the pattern to count as present.</p>",
        },
        {
          kind: "example",
          title: "An illustration of the pattern",
          body: "<p>Consider a public-administration office using an AI tool to help screen applications for benefits, permits, or grants. Over time, staff may begin treating the system’s classification as the default starting point for decisions rather than as one input among several. The number of people able or willing to challenge the system’s outputs may gradually shrink, while training, reporting, and performance targets increasingly adapt to the categories and priorities produced by the system. Underlying these shifts is a quiet asymmetry: verifying any single classification takes time and effort that working pressures rarely allow, while accepting it takes none.</p>",
        },
      ],
    },

    "c1-q3q4": {
      cluster: "problem",
      kind: "paired",
      kicker: "Problem · M2 — Is it structural?",
      chapter: "Strategy-level priority-setting",
      tagline: "Two probes of one analytical unit: a judgment and its recognition counterpart.",
      meta: "Questions 1.3 + 1.4 of 8",
      questions: [
        {
          slot: "Q1.3",
          tag: "Question 1.3 of 8",
          meta: "Judgment",
          question: "In your judgement, to what extent are the national AI priorities, as set out in AI strategies and vision documents, influenced by technology companies and consulting firms involved in AI strategy or implementation?",
          subtitle: "The question is about firms with a commercial stake in AI being adopted, in any form of involvement — consultation, advisory, drafting, or implementation. It is not asking about lobbying in general.",
          rating: {
            kind: "influence", required: true,
            options: ["Strongly influenced", "Somewhat influenced", "Slightly influenced", "Not influenced", "Cannot judge"],
          },
          open: {
            required: false,
            label: "Your reasoning",
            prompt: "If you think they are influenced, in what way? If you disagree, what makes you confident the priorities are set independently?",
          },
          rationaleDependent: true,
          rationaleBody: "<p>National AI priorities are co-produced with commercial interests through three pathways.</p><ul><li><strong>Industry participation in strategy consultation.</strong> Firms with a stake in AI being adopted help shape the strategy documents that decide AI <em>is</em> the answer.</li><li><strong>Consultancies that advise <em>and</em> sell.</strong> The same firms that advise governments on AI strategy also sell the implementation — a structural conflict of interest the thesis names <em>consultocracy</em>.</li><li><strong>Competitiveness framing.</strong> AI adoption is presented as a national-competitiveness imperative, foreclosing the prior question of whether the public problem requires it.</li></ul><p>The consequence for governance: a deployment can be perfectly compliant with national strategy and still be carrying forward those interests. The question asks whether you recognise this as the actual mechanism — not whether you are generally suspicious of lobbying.</p>",
        },
        {
          slot: "Q1.4",
          tag: "Question 1.4 of 8",
          meta: "Recognition",
          question: "Are you aware of any open discussion or consultation process about what the national AI priorities, as set out in AI strategies and vision documents, should be?",
          subtitle: "This asks about a process open to public-sector staff, civil society, or the public, concerned with what those priorities should be. It does not include consultation on a plan or agenda already settled.",
          rating: {
            kind: "awareness", required: true,
            options: ["Yes — I took part in or followed one", "Yes — I am aware one took place", "I am not aware of any", "I am fairly sure none took place"],
          },
          open: {
            required: false,
            label: "What you know of",
            prompt: "If you are aware of one, what was it? If not, would such a process be worth having?",
          },
        },
      ],
      // Override the auto-built affordances for paired questions:
      // - DETAILED EXPLANATION card only (SCOPE card removed per content brief)
      customAffs: [
        {
          kind: "explanation",
          title: "Three pathways shaping national AI priorities",
          body:
            "<p>National AI priorities are co-produced with commercial interests through three pathways.</p>" +
            "<ul>" +
              "<li><strong>Industry participation in strategy consultation.</strong> Firms with a stake in AI being adopted help shape the strategy documents that decide AI <em>is</em> the answer.</li>" +
              "<li><strong>Consultancies that advise <em>and</em> sell.</strong> The same firms that advise governments on AI strategy also sell the implementation — a structural conflict of interest the thesis names <em>consultocracy</em>.</li>" +
              "<li><strong>Competitiveness framing.</strong> AI adoption is presented as a national-competitiveness imperative, foreclosing the prior question of whether the public problem requires it.</li>" +
            "</ul>" +
            "<p>The consequence for governance: a deployment can be perfectly compliant with national strategy and still be carrying forward those interests. The question asks whether you recognise this as the actual mechanism — not whether you are generally suspicious of lobbying.</p>",
        },
      ],
    },

    "c1-q5": {
      cluster: "problem",
      kicker: "Problem · M2 — Is it structural?",
      chapter: "Are the layers connected?",
      tagline: "The structural hinge — and the cluster’s hardest question.",
      meta: "Question 1.5 of 8 · Judgment",
      question: "In your judgement, do problems in individual AI deployments often reflect decisions or priorities set at higher policy levels?",
      subtitle: "The question is whether problems in an AI deployment can usually be addressed within the deployment itself, or whether their causes often come from higher-level decisions — such as procurement choices, institutional arrangements, or national strategy.",
      type: "rating + optional open",
      rating: {
        kind: "connection", required: true,
        options: ["Clearly so", "Mostly", "Sometimes", "Rarely", "Not at all", "Cannot judge"],
      },
      open: {
        required: false,
        label: "An example",
        prompt: "If you see them as connected, can you give an example of one feeding another? If you see them as mostly separate, what makes you confident they are?",
      },
      scopeNote: [
        "The judgment is about the <strong>pattern</strong>: how often the connection holds in your experience, not whether it can ever happen.",
        "<strong>Cannot judge</strong> is appropriate where your vantage covers only one or two of the levels covered above — the deployment, the institution, the strategy.",
        "This is the question that asks whether the gap is one connected structure or three separate problems.",
      ],
      rationaleDependent: true,
      rationaleBody: "<p>By <em>connected</em> the framework does not mean that the three layers (the deployment, the institution, the strategy) co-occur. It means the upstream layer produces and constrains the downstream one, and the downstream feeds back: each round of deployment-level decisions narrows the space of upstream choices available next time.</p><p>If the layers were merely co-occurring, fixes at the deployment level could close the gap. The thesis claims they cannot. A deployment-level problem whose cause sits at procurement, institutional reshaping, or national strategy is not repairable inside the deployment alone, which is what makes the gap a structure rather than three separate problems.</p>",
    },

    "c1-q6": {
      cluster: "problem",
      kicker: "Problem · M3 — Do existing mechanisms address it?",
      chapter: "What existing checks examine",
      tagline: "Whether existing arrangements address the broader issues.",
      meta: "Question 1.6 of 8 · Judgment",
      question: "In your administration, do existing AI governance checks — audits, impact assessments, procurement rules, data-protection reviews — examine these broader organisational or policy issues, or mainly technical and legal compliance?",
      subtitle: "The “broader issues” are the ones the previous questions raised: whether the problem was defined before the solution, whether the institution is being reshaped, where the priorities came from, and whether these connect.",
      type: "rating + optional open",
      rating: {
        kind: "coverage", required: true,
        options: ["Examine them well", "Examine them partly", "Barely", "Mainly compliance only", "These checks are not yet in place in my administration", "Not familiar enough to say"],
      },
      open: {
        required: false,
        label: "Closest process",
        prompt: "Which process comes closest, and where are its limits?",
      },
      sourceNote: {
        title: "What existing checks are <em>for</em> — neutrally",
        items: [
          "<strong>Internal audits and model documentation</strong> — check the system’s properties.",
          "<strong>Data-protection assessments</strong> — check how personal information is handled.",
          "<strong>AI Act conformity checks</strong> — examine the system against regulatory risk classes.",
          "<strong>Procurement rules</strong> — check the purchasing process.",
        ],
        footer: "This panel states their <em>remit</em>; it does not argue that they fall short.",
      },
      // Drop the default SCOPE card from the right rail — the source-material
      // card alone does the work on this screen (the subtitle in the reading
      // path already bounds the question's scope).
      noScope: true,
    },

    "c1-q7": {
      cluster: "problem",
      kicker: "Problem · M4 — What follows?",
      chapter: "Is a recognise-and-name framework warranted?",
      tagline: "Judging the framework’s usefulness.",
      meta: "Question 1.7 of 8 · Judgment",
      question: "Would a framework that helps practitioners recognise and discuss these broader AI governance issues be useful in your work?",
      subtitle: "The framework’s purpose would be to give practitioners a structured way to recognise and discuss these issues — not necessarily to resolve them, which would take change beyond any single administration’s reach.",
      type: "rating + optional open",
      rating: {
        kind: "usefulness", required: true,
        options: ["Clearly useful", "Probably useful", "Unsure", "Probably not useful", "Clearly not useful"],
      },
      open: {
        required: false,
        label: "Your view",
        prompt: "What would make it useful, or what makes you doubt it would be?",
      },
      rationaleDependent: true,
      noScope: true,
      rationaleBody: "<p>A framework that names a problem without offering a fix can seem inadequate. The thesis takes a deliberate position here.</p><p><strong>Revealing the gap is itself the contribution.</strong> What cannot be named cannot be contested or refused; making the structure visible to those working inside it is the necessary first step, not a substitute for fixing it.</p><p>The framework deliberately does not claim to close the gap. Closing it would require political and economic change well beyond any single administration’s tools. A framework that claimed to close the gap would become exactly the kind of overpromising the thesis is critical of: it would reproduce the solution-first pattern at the level of governance methodology.</p>",
    },

    "c1-q8": {
      cluster: "problem",
      kicker: "Problem · M4 — What follows?",
      chapter: "Have generative AI tools changed the picture?",
      tagline: "A different kind of problem, or the same at greater scale.",
      meta: "Question 1.8 of 8 · Judgment · Recognition",
      question: "Have generative AI tools — chatbots, text-generation systems — changed the nature of AI governance challenges in public administration, or mainly increased their scale?",
      subtitle: "The question is whether the governance problem these tools pose is a different kind of problem from earlier rule-based or more narrowly scoped systems, or the same kind of problem at a larger scale.",
      type: "rating + optional open",
      rating: {
        kind: "kind-vs-degree", required: true,
        options: ["Fundamentally changed the challenges", "Mostly changed them", "Mainly increased existing challenges", "Made little difference", "Cannot judge"],
      },
      open: {
        required: false,
        label: "The change you’ve seen",
        prompt: "If they have changed things, what is the most important change you have seen?",
      },
      // SCOPE retitled + body replaced with two bullets;
      // DETAILED EXPLANATION final paragraph removed (moved to SCOPE bullet 2),
      // bullets 2 and 3 reworded per the screen-15 brief.
      customAffs: [
        {
          kind: "scope",
          title: "Scope · Using the rating scale",
          items: [
            "<strong>Cannot judge</strong> is appropriate if your work does not span both earlier and generative AI systems.",
            "The middle options are honest answers: <em>“mostly changed”</em> is appropriate where the difference seems real but contained; <em>“mainly increased existing challenges”</em> is appropriate where the existing playbook adapts.",
          ],
        },
        {
          kind: "explanation",
          title: "Why the framework takes this position",
          body:
            "<p>The thesis treats generative LLMs as a <strong>qualitative shift</strong> for governance, not a bigger version of the same problem. Three reasons:</p>" +
            "<ul>" +
              "<li><strong>Their behaviour is not fully predictable in advance.</strong> Earlier systems had bounded output spaces; generative LLMs do not, and governance built around predicting failure modes does not transfer cleanly.</li>" +
              "<li><strong>The institution typically does not control or even see the model.</strong> Most generative deployments in public administration use a vendor’s closed-weight model running on the vendor’s infrastructure, an institutional opacity earlier systems rarely had.</li>" +
              "<li><strong>They substitute for communicative work.</strong> The drafting, explaining, and advising that used to carry the institution’s reasoning is now produced by a model whose reasoning the institution cannot inspect.</li>" +
            "</ul>",
        },
      ],
    },

    /* ---------- Cluster 2 — The Framework ---------- */

    "c2-q1": {
      cluster: "framework",
      kicker: "Framework · Architecture",
      chapter: "Is the two-layer structure useful?",
      tagline: "A first judgement on the framework's overall design.",
      meta: "Question 2.1 of 6 · Judgment",
      question: "In your judgement, is organising the framework as a two-layer structure — a diagnostic layer followed by an operational lifecycle — a reasonable and useful way to govern AI deployments?",
      subtitle: "The framework separates an initial diagnostic layer from the operational lifecycle that follows. The question is whether that overall structure is useful and workable — not whether the diagnostic layer connects to the operational lifecycle in the right way.",
      type: "rating + optional open",
      rating: {
        kind: "soundness", required: true,
        options: ["A sound approach", "Broadly reasonable", "Uncertain", "A questionable approach", "Not a sound approach"],
      },
      open: {
        required: false,
        label: "What shapes your view",
        prompt: "If you wish, say what makes the approach reasonable, or where you would question it.",
      },
      // Rail overrides: SOURCES + DETAILED EXPLANATION only — SCOPE card removed
      // per Q2.1 content brief. The default qAffs() build is bypassed when
      // customAffs is present (see app.jsx).
      customAffs: [
        {
          kind: "source",
          title: "The framework's two-layer structure",
          body:
            "<p>The framework separates two connected layers.</p>" +
            "<p>The <em>diagnostic layer</em> is completed before deployment begins. Its purpose is to identify the structural conditions already shaping the decision to adopt AI — including how the problem was defined, where priorities came from, and what institutional dependencies already exist.</p>" +
            "<p>The <em>operational lifecycle</em> then governs the deployment across its stages: problem framing, design and procurement, oversight, public-value evaluation, and continuation or discontinuation.</p>" +
            "<p>At several points in the lifecycle, the framework brings those structural conditions back into view when operational decisions are being made.</p>",
        },
        {
          kind: "explanation",
          title: "Why the framework is built in two layers",
          body:
            "<p>The framework separates structural conditions from operational decisions because they are not the same kind of governance problem.</p>" +
            "<p>Some conditions shaping an AI deployment already exist before it begins: procurement arrangements, institutional pressures, national strategy, dependence on vendors, or assumptions about what counts as a problem worth solving. These conditions are relatively stable across a deployment's life.</p>" +
            "<p>Operational governance mechanisms — audits, reviews, oversight procedures, impact assessments — act later, once deployment decisions are already underway. The operational decisions they bear on recur as the deployment lives on.</p>" +
            "<p>The framework treats the two as connected layers so the structural conditions do not disappear from view once operational governance begins.</p>",
        },
      ],
    },

    "c2-q2": {
      cluster: "framework",
      kicker: "Framework · Recursive cycle",
      chapter: "AI governance as a recurring cycle",
      tagline: "The framework’s signature structural move, isolated.",
      meta: "Question 2.2 of 6 · Judgment",
      question: "In your judgement, is it a sound structural commitment to treat AI governance as an ongoing review cycle in which a deployment is re-justified at each cycle rather than continuing automatically?",
      subtitle: "The framework treats AI governance as an ongoing review cycle rather than a one-time approval: a deployment is expected to be re-justified over time rather than continuing automatically. The question asks whether this is a sound structural commitment — not whether it adds to review workload.",
      type: "rating + optional open",
      rating: {
        kind: "soundness", required: true,
        options: ["A sound commitment", "Broadly reasonable", "Uncertain", "A questionable commitment", "Not a sound commitment"],
      },
      open: {
        required: false,
        label: "Your view",
        prompt: "If you wish, say what such a model would need to work in public administration, or where it would run into trouble.",
      },
      // Rail overrides: SOURCES → EXAMPLE → DETAILED EXPLANATION.
      // Deliberate departure from the default order — the respondent reads
      // what the cycle is, then recognises what one-time approval misses,
      // then reads the framework's response.
      customAffs: [
        {
          kind: "source",
          title: "The framework's recurring cycle",
          body:
            "<p>The framework treats AI governance as a recurring cycle, not a one-time approval.</p>" +
            "<p>A deployment passes through the operational lifecycle's stages — problem framing, design and procurement, oversight, public-value evaluation, continuation or discontinuation. After the continuation decision, the cycle re-runs against the deployment as it then is.</p>" +
            "<p>Each cycle is expected to re-justify the deployment rather than let it continue automatically. The framework's presumption is that a deployment stops unless that re-justification is actively made.</p>",
        },
        {
          kind: "example",
          title: "Why one-time approval may not be enough",
          body:
            "<p>A public administration adopts an AI-supported screening system for benefits applications.</p>" +
            "<p>At the point of approval, the system appears limited in scope, and staff continue making final decisions independently.</p>" +
            "<p>Two years later:</p>" +
            "<ul>" +
              "<li>staff rely increasingly on the system's classifications;</li>" +
              "<li>the expertise needed to challenge its outputs exists in fewer people;</li>" +
              "<li>performance targets are reorganised around processing speed;</li>" +
              "<li>and changing vendors or discontinuing the system has become institutionally costly.</li>" +
            "</ul>" +
            "<p>The deployment may still appear technically compliant, while operating under substantially different institutional conditions from those originally approved.</p>",
        },
        {
          kind: "explanation",
          title: "Why the framework chooses a recurring cycle",
          body:
            "<p>The framework's response to the dynamic the example shows is two-fold: recursion, and the presumption that a deployment stops unless it is actively re-justified — <em>default-discontinuation</em> in the framework's vocabulary.</p>" +
            "<p>Each cycle's outputs become the next cycle's constraints. A one-time approval never sees that narrowing; a recurring cycle is built to make it legible at each cycle boundary, precisely so it can be named.</p>" +
            "<p>Default-discontinuation puts the burden of proof on continuation rather than letting inertia carry the day. \u201CIt is already running\u201D is the most common reason an AI system persists past its usefulness; the framework treats that as a failure mode to design against.</p>" +
            "<p>Worth flagging: a recurring cycle read cold can sound like \u201Cthe same approval, repeated more often.\u201D The framework's position is that this is backwards — the design exists because conditions change between cycles, not because they stay the same.</p>",
        },
      ],
    },

    "c2-q3": {
      cluster: "framework",
      kicker: "Framework · The four gaps",
      chapter: "Are these the right four structural governance gaps?",
      tagline: "Whether the framework's diagnostic set is the right one.",
      meta: "Question 2.3 of 6 · Judgment",
      question: "In your judgement, how well do these four structural governance gaps capture the main conditions a framework like this needs to make visible?",
      subtitle: "The question is whether this set of four captures the main governance conditions a framework like this should help practitioners make visible — not whether each gap is always present.",
      // Q2.3 is the cluster's first rating + required-open. The rating
      // carries the headline judgment; the required open carries what
      // specifically should be added, removed, reframed, or de-overlapped.
      type: "rating + required open",
      rating: {
        kind: "coverage", required: true,
        options: [
          "Captures them very well",
          "Broadly captures them",
          "Partly captures them",
          "Misses important conditions",
          "Cannot judge",
        ],
      },
      open: {
        required: true,
        label: "What feels missing, unnecessary, overlapping, or misplaced",
        prompt: "Name what feels missing, unnecessary, overlapping, or misplaced — and say why.",
      },
      // Rail overrides: SOURCES + SCOPE only — no DETAILED EXPLANATION on
      // this screen per Q2.3 content brief.
      customAffs: [
        FOUR_GAPS_SOURCE_CARD,
        {
          kind: "scope",
          title: "What this question is asking you to judge",
          body:
            "<p>This question asks how completely the set of four captures the main governance conditions a framework like this should help practitioners make visible — not whether each gap is always present in every deployment (Q2.4 takes up that question).</p>" +
            "<p>The rating signals the overall judgment; the open response is the place to name what specifically you would add, remove, or reframe.</p>",
        },
      ],
    },

    "c2-q4": {
      cluster: "framework",
      kicker: "Framework · The four gaps",
      chapter: "Recognising the four structural governance gaps in practice",
      tagline: "Recognition underside of Q2.3 — per-gap frequency grid.",
      meta: "Question 2.4 of 6 · recognition · judgment",
      question: "Thinking about AI deployments you have seen in public administration: how often was each of these conditions absent or weakened?",
      subtitle: "This question asks about your direct experience of AI deployments rather than your general impression of the sector. Each row concerns a different governance condition the framework expects to be frequently absent or weakened in practice; rate each separately.",
      type: "rating grid + single-select",
      rating: {
        kind: "grid", required: true,
        rows: [
          "Deliberation about purpose",
          "Participation by affected people in design",
          "Accountability that survives into operation",
          "Vendor power left unconstrained — in procurement and beyond",
        ],
        options: ["Almost never", "Rarely", "Sometimes", "Often", "Almost always"],
      },
      // Composite second response: single-select with option labels mirroring
      // the grid rows above. The respondent picks the one that mattered most.
      composite: {
        chip: "Of these four — pick one",
        required: true,
        subStem: "Of these four, which has mattered most in deployments you have seen?",
        options: [
          "Deliberation about purpose",
          "Participation by affected people in design",
          "Accountability that survives into operation",
          "Vendor power left unconstrained — in procurement and beyond",
        ],
      },
      // Rail overrides: SCOPE → SOURCES. SCOPE first because the direct-
      // experience framing is load-bearing on a recognition question.
      // SOURCES card is the shared four-gaps card from Q2.3.
      customAffs: [
        {
          kind: "scope",
          title: "What counts as direct experience",
          body:
            "<p>\u201CDirect experience\u201D means AI deployments you have worked on yourself, observed inside your institution, evaluated as part of your role, or seen unfold in institutions you know closely.</p>" +
            "<p>It does not include the general impression of the public sector you have built from reading, conferences, or commentary about other institutions' deployments.</p>" +
            "<p>If your direct experience covers only a small number of deployments, rate against what you have actually seen.</p>",
        },
        FOUR_GAPS_SOURCE_CARD,
      ],
    },

"c2-q6": {
      cluster: "framework",
      kicker: "Framework · Returning to the conditions",
      chapter: "Bringing structural conditions back into view",
      tagline: "Does the framework’s central structural commitment earn its place?",
      meta: "Question 2.5 of 6 · judgment",
      question: "In your judgement, does bringing structural conditions back into operational decisions meaningfully strengthen AI governance in practice? And does the mechanism appear consistently built into the framework across the lifecycle stages?",
      subtitle: "At several points in the operational lifecycle, the framework asks practitioners to revisit the broader organisational and structural conditions identified in the diagnostic layer. The question is whether that revisiting does real work and stays consistent across the lifecycle.",
      type: "open-only",
      open: {
        required: true,
        label: "Where it works, where it thins",
        prompt: "Where would this be most valuable in practice — and where, if anywhere, does it look like it would thin out or become a formality?",
      },
      // Rail overrides: SOURCES → EXAMPLE → DETAILED EXPLANATION. The
      // respondent reads where the move-back is built in, then what it
      // looks like in operation, then why the framework built it as
      // two distinct kinds.
      customAffs: [
        {
          kind: "source",
          title: "Where the framework returns to the diagnostic conditions",
          body:
            "<p>The framework builds the return to the diagnostic conditions in at four points in the operational lifecycle:</p>" +
            "<ul>" +
              "<li><strong>Stage 1 (problem framing)</strong> — early in the cycle, before the scope of the deployment is locked, the framework returns to the structural conditions to check what the framing the deployment has inherited carries with it.</li>" +
              "<li><strong>Stage 2 (design and procurement)</strong> — the Architecture Selection Tool and the Generative LLM Gate reference the upstream framing when an architectural choice is being made and when a procurement decision is being reviewed.</li>" +
              "<li><strong>Stage 3 (oversight)</strong> — the Discretion Migration Analysis instrument routes oversight design back to the institutional-reshaping condition surfaced at the diagnostic layer.</li>" +
              "<li><strong>Stage 5 (continuation decision)</strong> — each recursive cycle re-checks the deployment against the structural conditions before the decision to continue or discontinue is taken.</li>" +
            "</ul>",
        },
        {
          kind: "example",
          title: "Revisiting structural conditions during governance",
          body:
            "<p>A public administration adopts a vendor-operated AI system for eligibility screening.</p>" +
            "<p>During implementation, oversight reviews focus mainly on system accuracy and procedural compliance.</p>" +
            "<p>Later in the lifecycle, the institution considers expanding the system into additional administrative areas.</p>" +
            "<p>At this point, the framework would require the decision-makers to revisit structural conditions identified earlier:</p>" +
            "<ul>" +
              "<li>dependence on the vendor's infrastructure;</li>" +
              "<li>reduced internal technical capacity;</li>" +
              "<li>and procurement arrangements limiting institutional control.</li>" +
            "</ul>",
        },
        {
          kind: "explanation",
          title: "The framework's central structural mechanism",
          body:
            "<p>The framework takes the position that operational governance alone cannot adequately govern AI deployments if the structural conditions shaping those deployments disappear from view once implementation begins.</p>" +
            "<p>In many public-sector deployments, procurement constraints, institutional dependencies, externally defined priorities, and vendor influence continue shaping decisions long after adoption. Conventional governance mechanisms often assess systems <em>within</em> those conditions rather than questioning the conditions themselves.</p>" +
            "<p>The framework builds the move-back into the operational lifecycle in two kinds, matched to what each moment is doing. Where a <em>decision</em> is being taken, the move-back is a <strong>diagnostic refresh</strong>: the structural conditions are re-surfaced as the baseline for the decision. Where another judgment is being made under conditions the diagnostic layer has already framed, the move-back is an <strong>embedded interpretive reading</strong>: the diagnostic-layer entries are read against the judgment in hand, without resetting the baseline.</p>",
        },
      ],
    },

    "c2-q7": {
      cluster: "framework",
      kicker: "Framework · The Generative LLM Gate",
      chapter: "A stopping condition rather than a score",
      tagline: "Cluster 2’s closer — the most counter-intuitive design choice.",
      meta: "Question 2.6 of 6 · judgment",
      question: "In your judgement, is the framework justified in treating a closed generative model run on vendor-controlled infrastructure as a reason to stop or reconsider a deployment rather than a risk factor to be balanced against other safeguards?",
      subtitle: "When a deployment uses a generative LLM, the framework applies a dedicated governance checkpoint. Two conditions are treated as non-negotiable: whether the institution can meaningfully inspect the model, and whether it retains control over the infrastructure and data environment on which the system operates.",
      type: "rating + optional open",
      rating: {
        kind: "verdict", required: true,
        options: ["Yes — clearly reasonable", "Probably reasonable", "Unsure", "A graduated assessment would be better", "Clearly the wrong design"],
      },
      open: {
        required: false,
        label: "Your reasoning",
        prompt: "What makes a hard floor here defensible — or what makes a more flexible assessment preferable?",
      },
      // Rail overrides: SOURCES + DETAILED EXPLANATION only.
      customAffs: [
        {
          kind: "source",
          title: "The Generative LLM Gate",
          body:
            "<p>When a deployment uses a generative LLM architecture, the framework applies a dedicated governance checkpoint — the <strong>Generative LLM Gate</strong>.</p>" +
            "<p>The Gate asks five questions:</p>" +
            "<ul>" +
              "<li><strong>inspectability</strong> — whether the institution can meaningfully inspect the model at the level its governance requires;</li>" +
              "<li><strong>data control</strong> — whether the institution retains control over the infrastructure and data environment on which the system operates;</li>" +
              "<li><strong>output grounding</strong> — whether the system's outputs can be traced to verifiable sources;</li>" +
              "<li><strong>evaluation evidence</strong> — what evidence the institution has about the model's behaviour in its operating conditions;</li>" +
              "<li><strong>drift apparatus</strong> — what arrangements exist to detect and respond to changes in the model's behaviour over time.</li>" +
            "</ul>" +
            "<p>Two of these — <em>inspectability</em> and <em>data control</em> — form a <strong>hard threshold</strong>. If both conditions are absent, the framework treats the deployment as one to stop and reconsider, rather than one to approve through accumulated safeguards in the other three.</p>",
        },
        {
          kind: "explanation",
          title: "Why the framework treats this as a hard threshold",
          body:
            "<p>The framework takes the position that some generative AI deployments create governance conditions that cannot be adequately compensated for through additional oversight mechanisms alone.</p>" +
            "<p>A deployment that combines limited inspectability, dependence on vendor-controlled infrastructure, and reduced institutional control over data and operations may remain difficult to govern even when other safeguards are added.</p>" +
            "<p>The framework therefore treats this configuration differently from a standard risk factor balanced against positive scores elsewhere. The choice rests on a reading of where flexibility helps and where it backfires: the flexibility a graduated assessment offers — accumulating partial credit across multiple checkpoints — is precisely what would let the configuration the threshold targets pass through. The purpose of the threshold is to prevent deployments from appearing governable through procedural safeguards while the institution lacks meaningful structural control over the system itself.</p>",
        },
      ],
    },

    /* ---------- Cluster 3 — Instruments — see CONTENT.instruments below ---------- */

    /* ---------- Cluster 4 — The Close ---------- */

    "c4-q1": {
      cluster: "close",
      kicker: "Close · Coverage catch-all",
      chapter: "Anything important the questions haven’t reached?",
      tagline: "The required half of the closing pair — the one place the agenda is yours.",
      meta: "Question 4.1 of 2 · Required",
      question: "Is there anything important the questions haven’t reached?",
      subtitle: "Look back over the whole questionnaire — the problem the framework addresses, its design, and its four instruments. The question is deliberately unbounded.",
      type: "open-only",
      open: {
        required: true,
        label: "Anything to add",
        prompt: "Whatever you’d raise — a concern, a gap, a strength the earlier questions passed over, a question they should have asked. If they covered the ground for you, saying so is a complete answer.",
      },
      scopeNote: [
        "The question is <strong>genuinely unbounded</strong> — any concern, gap, strength, or question the structured items should have asked is in scope.",
        "<strong>A brief answer is a complete answer</strong>, including one that says the earlier questions covered the ground.",
        "The reference layer is still available if you want to revisit any part of the framework before answering.",
      ],
    },

    "c4-q2": {
      cluster: "close",
      kicker: "Close · Questionnaire-and-platform catch-all",
      chapter: "Anything about the questionnaire or platform itself?",
      tagline: "Optional. Feedback on the validation exercise as an artefact — positive or negative.",
      meta: "Question 4.2 of 2 · Optional",
      question: "Is there anything about the questionnaire or platform itself you’d want to flag?",
      subtitle: "This is about the questionnaire and platform themselves — the questions, the flow, the experience of taking it (this can be positive or negative). The framework and its instruments were the object of the earlier questions; here the object is the validation exercise itself. Entirely optional.",
      type: "open-only",
      open: {
        required: false,
        label: "Anything to flag",
        prompt: "If something stood out — confusing, well-judged, awkward, broken — note it. If nothing comes to mind, leave it blank.",
      },
      scopeNote: [
        "The object here is the <strong>validation exercise itself</strong> — not the framework or its instruments.",
        "<strong>Positive or negative feedback both welcome</strong>; the field invites either.",
        "<strong>Entirely optional.</strong> A blank field is a complete answer.",
        "Not analysed as validation data — feeds instrument-improvement reflection only.",
      ],
    },
  };

  /* ============================================================
     Cluster 3 — Instruments
     Each instrument: top-panel data (maturity, summary, structured representation),
     plus its two questions (Q.1 quality, Q.2 applicability).
     The Q.1 / Q.2 stems are identical across all four instruments by spec.
     ============================================================ */
  const Q1_STEM = "Does this instrument do distinctive analytical work, coherently structured?";
  const Q2_STEM = "Could a practitioner put this instrument to work?";
  const Q1_RATING = { kind: "quality", required: true,
    options: ["Yes, clearly", "Broadly yes", "Uncertain", "Not really", "No"] };
  const Q2_RATING = { kind: "applicability", required: true,
    options: ["Usable as it stands", "Usable, but only after substantial set-up work by the institution", "Not usable in its current form", "Cannot judge"] };

  // One shared required open response per instrument screen, sitting BELOW both ratings.
  // Identical label and prompt across all four instruments — the synthesis prompt the
  // respondent learns once. The pair-of-opens design has been retired.
  const SHARED_OPEN = {
    required: true,
    label: "What stands out, where it lands",
    prompt: "What is your overall view of this instrument? What it does that’s distinctive, anything missing or concerning in its design — and where it would work, where it would be hard to apply.",
  };

  C.instruments = [
    {
      id: "c3-ciw", slot: 1, total: 4,
      code: "CIW", title: "Contextual Integrity Worksheet", stage: "Stage 2 · Design & Procurement",
      tagline: "The reference point the others are read against.",
      maturity: {
        level: "High operational maturity · light set-up work",
        body: "Records each information flow a deployment introduces in five parameters — sender, recipient, subject, information type, transmission principle — and sorts each flow into one of three verdicts (appropriate / requires justification / refused), with deliberative work concentrated on the middle category. The five parameters map directly onto a well-established privacy framework (Nissenbaum’s contextual integrity) and transfer across settings without redesign. Recording each flow before and after the AI system in the same row makes contextual changes visible flow by flow. The vendor-API case is named explicitly: when an information flow is rerouted through commercial infrastructure, the recipient and the transmission principle change at once. Set-up work is light — designating who identifies the flows, integrating with existing data-protection records (e.g. GDPR DPIAs), specifying transmission principles per sector, and routing “refused” verdicts to the right escalation.",
      },
      claimed: "Make a deployment’s information flows visible before and after the system, and sort each into one of three verdicts.",
      glance: [
        { label: "What it is",         body: "A worksheet for tracing the information flows an AI deployment introduces and judging whether each remains appropriate to its public-service context." },
        { label: "Used when",          body: "A candidate architecture has been selected and procurement specification is being drafted." },
        { label: "What it asks",       body: "Whether each information flow remains appropriate to the service context — and where it does not, what justifies the change." },
        { label: "What it produces",   body: "A flow-by-flow assessment sorting each flow into one of three verdicts (appropriate / requires justification / refused), entered into the procurement specification." },
      ],
      flows: [
        {
          id: "F1",
          description: "Caseworker case-queue prioritisation",
          before: [
            ["sender", "caseworker"],
            ["recipient", "agency case-management system"],
            ["subject", "cases under review"],
            ["info type", "queue ordering"],
            ["principle", "agency operations policy"],
          ],
          after: [
            ["sender", "caseworker"],
            ["recipient", "agency case-management system (with on-premise AI ranker)"],
            ["subject", "cases under review"],
            ["info type", "queue ordering"],
            ["principle", "agency operations policy"],
          ],
          verdict: "ok",
          verdictLabel: "Appropriate",
        },
        {
          id: "F2",
          description: "Citizen service-query handling",
          before: [
            ["sender", "citizen"],
            ["recipient", "public agency"],
            ["subject", "citizen"],
            ["info type", "service query"],
            ["principle", "public service mandate"],
          ],
          after: [
            ["sender", "citizen"],
            ["recipient", "public agency + commercial vendor"],
            ["subject", "citizen"],
            ["info type", "service query"],
            ["principle", "public service mandate + commercial API terms"],
          ],
          verdict: "warn",
          verdictLabel: "Requires justification",
        },
        {
          id: "F3",
          description: "Severe contextual change",
          before: [["", "…"]],
          after: [["", "…"]],
          verdict: "no",
          verdictLabel: "Refused",
        },
      ],
      sharedOpen: SHARED_OPEN,
      q1: { question: Q1_STEM,
        subtitle: "The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its parts fit together without overlapping. Anything “missing or concerning” means a fault in the instrument’s own design — not the set-up work an institution would still need to do, which the MATURITY card names separately.",
        rating: Q1_RATING },
      q2: { question: Q2_STEM,
        subtitle: "This draws on your direct experience, not your general impression of the sector. The rating’s middle option describes how much institutional set-up work the instrument would still need before deployment — not a criticism of its design.",
        rating: Q2_RATING },
    },

    {
      id: "c3-ast", slot: 2, total: 4,
      code: "AST", title: "Architecture Selection Tool", stage: "Stage 2 · Design & Procurement",
      tagline: "Architecture choice as a governance decision.",
      operable: true,
      maturity: {
        level: "High operational maturity · modest set-up work",
        body: "Runs the architectural decision as a five-phase procedure: describing the deployment; identifying the governance requirements it activates; reading which of five candidate architectures are compatible; applying per-architecture conditions and a deployment-wide distributional safeguard; recording the decision. Returns one of three verdicts — select an architecture, escalate for governance decision, or stop and reframe. Surviving architectures appear in order of governability, most governable first; departing from that order requires a documented reason. When evidence for a per-architecture condition is uncertain, the Tool escalates rather than treating the uncertainty as clearance. Set-up work is modest — chiefly adapting the per-architecture condition list to existing procurement safeguards. If the procedure selects a generative-LLM architecture, the Tool hands off to a separate check (the Generative LLM Gate).",
      },
      claimed: "Treat the choice of architecture as a governance decision, not a technical-procurement one.",
      glance: [
        { label: "What it is",       body: "A procedure that selects an AI architecture against governance requirements, not technical capability alone." },
        { label: "Used when",        body: "Early in design and procurement, before the architecture choice is locked in." },
        { label: "What it asks",     body: "Which of five candidate architectures meet the deployment’s governance requirements — and whether any do." },
        { label: "What it produces", body: "One of three verdicts — select an architecture, escalate for governance decision, or stop and reframe — entered into procurement records." },
      ],
      sharedOpen: SHARED_OPEN,
      q1: { question: Q1_STEM,
        subtitle: "The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its parts fit together without overlapping — judged on the analytical procedure the tool runs, not on how the optional Explore overlay feels to operate. Anything “missing or concerning” means a fault in the instrument’s own design — not the set-up work an institution would still need to do, which the MATURITY card names separately.",
        rating: Q1_RATING },
      q2: { question: Q2_STEM,
        subtitle: "This draws on your direct experience, not your general impression of the sector. The rating’s middle option describes how much institutional set-up work the instrument would still need before deployment — not a criticism of its design.",
        rating: Q2_RATING },
    },

    {
      id: "c3-dma", slot: 3, total: 4,
      code: "DMA", title: "Discretion Migration Analysis", stage: "Stage 3 · Oversight & Accountability",
      tagline: "Maps where effective authority moves when an AI system is introduced.",
      maturity: {
        level: "Medium operational maturity · medium-high set-up work",
        body: "Maps, for each class of administrative decision, how effective authority moves when an AI system is introduced — who loses it, who acquires it — and specifies the oversight response: who can override the system, on what timeline, with what contextual information for the human reviewer, and with what safeguards against over-trust. The template covers migrations both within the institution and to actors outside it — algorithmic processes, automated workflows, vendor-controlled components whose internal logics the institution does not fully access. The analytical machinery is general-purpose; the column structure traces cleanly to its theoretical grounding. One known structural gap, named honestly: the framework establishes a four-level scheme for where discretion sits in an earlier instrument, but the migration template does not carry it through. Set-up work is substantial — identifying the institution’s own decision classes, mapping override authority onto real governance roles, calibrating review timelines to sector.",
      },
      claimed: "Make visible something that otherwise happens silently — the migration of decision-making authority away from front-line staff into system behaviour — and the oversight that calls for.",
      glance: [
        { label: "What it is",       body: "A template for specifying how an AI deployment will reallocate administrative discretion across human and automated actors." },
        { label: "Used when",        body: "Once the architecture has been selected and the deployment’s oversight and accountability arrangements are being designed." },
        { label: "What it asks",     body: "For each decision class the deployment affects, who loses effective authority, who acquires it, and what oversight keeps the new arrangement accountable." },
        { label: "What it produces", body: "A documented oversight specification — override authorities, review timelines, the contextual information reviewers need, and automation-bias safeguards — entering the deployment configuration." },
      ],
      sharedOpen: SHARED_OPEN,
      q1: { question: Q1_STEM,
        subtitle: "The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its parts fit together without overlapping. Anything “missing or concerning” means a fault in the instrument’s own design — not the set-up work an institution would still need to do, which the MATURITY card names separately.",
        rating: Q1_RATING },
      q2: { question: Q2_STEM,
        subtitle: "This draws on your direct experience, not your general impression of the sector. The rating’s middle option records how much institutional set-up work the instrument would still need; the shared open’s “hard to apply” reaches for design difficulty, not that work.",
        rating: Q2_RATING },
    },

    {
      id: "c3-cpd", slot: 4, total: 4,
      code: "CPD", title: "Contestation Pathway Design", stage: "Stage 3 · Oversight & Accountability",
      tagline: "Contestation as a separate requirement from transparency.",
      maturity: {
        level: "Lower-medium operational maturity · high set-up work; full configuration required",
        body: "Specifies six interlocking dimensions of how an affected person can challenge an algorithmic decision: notification, explanation, channel accessibility, a human reviewer with substantive authority, timeline, and a feedback loop. The framework pre-fills the general specification for each dimension; the deployment-specific specification and the verification mechanism are left open for the institution to supply. The instrument anchors the lower-maturity end of the gradient by design. Set-up work is substantial — identifying who holds substantive override authority, specifying channel accessibility grounded in the populations served, calibrating timelines to sector, integrating with existing complaint and appeal infrastructure, and designing verification mechanisms the governance record can hold the deployment to.",
      },
      claimed: "Structure the difference between contestation rights that are formally specified and contestation that is operationally reachable.",
      glance: [
        { label: "What it is",       body: "A specification table for the citizen-facing pathway through which affected people can contest an algorithmic decision." },
        { label: "Used when",        body: "Once the architecture has been selected and the deployment’s citizen-facing contestation arrangements are being configured." },
        { label: "What it asks",     body: "Whether the six dimensions of a contestation pathway — together — make a formal right practically reachable for the people affected." },
        { label: "What it produces", body: "A specification of what the institution will do for each of the six dimensions, and how each will be verified, entered into the deployment configuration as a binding requirement." },
      ],
      sharedOpen: SHARED_OPEN,
      q1: { question: Q1_STEM,
        subtitle: "The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its six dimensions fit together as the right interlocking set. Most of those dimensions are deliberately left for the institution to fill in — and that openness is how the instrument is meant to work, not a sign it is unfinished.",
        rating: Q1_RATING },
      q2: { question: Q2_STEM,
        subtitle: "This draws on your direct experience. Because the instrument is mostly left for the institution to fill in, the question is not whether its table can be completed — it is whether its six-dimension structure is one a practitioner could take up, reason with, and verify.",
        rating: Q2_RATING },
    },
  ];

  /* ============================================================
     Interview-willingness capture (post-spine, before submit)
     ============================================================ */
  C.interview = {
    title: "One last thing — a possible follow-up",
    tagline: "Optional. Your answers above are complete on their own.",
    intro: "The author may follow up with a short interview (about 25 minutes) where a particular response of yours would benefit from a deepening exchange. This is voluntary and entirely separate from the questionnaire’s validation analysis.",
    fields: [
      {
        key: "willingness", kind: "radio", required: true,
        label: "Would you be open to a short follow-up interview?",
        options: [
          "Yes — please contact me",
          "Maybe — depending on the topic",
          "No, thank you",
        ],
      },
      {
        key: "window", kind: "checkbox-list", required: false,
        label: "If yes or maybe: which windows would work between 13–25 June?",
        helper: "Pick any that work; we will coordinate exact times by email.",
        options: [
          "Weekday mornings (09:00–12:00 CET)",
          "Weekday afternoons (13:00–17:00 CET)",
          "Weekday evenings (17:00–19:00 CET)",
          "Weekends",
        ],
      },
      {
        key: "contact", kind: "text", required: false,
        label: "Email for follow-up (only if different from your invitation address)",
        placeholder: "name@institution.example",
      },
    ],
  };

  /* ============================================================
     Concept cards (refined in Phase B)
     ============================================================ */
  C.concepts = [
    {
      featured: true,
      title: "Four governance gaps",
      gr: "The framework’s diagnostic set",
      body: "The <strong>four structural absences</strong> the diagnostic stage screens for at the deployment level: deliberation about purpose; participation by affected people in design; accountability that survives into operation; constraint on vendor power.",
      rels: ["diagnostic stage", "deployment-level"],
    },
    {
      title: "Upward visibility",
      gr: "Accountability anchor",
      body: "Responsibility for the decision stays visible to hierarchically superior bodies — regardless of the degree of automation.",
      rels: ["accountability", "audit trail"],
    },
    {
      title: "Discretion locus",
      gr: "Where discretion sits",
      body: "The clearly identified point at which discretion is exercised by a natural person. <strong>Discretion migration</strong> — its silent transfer to a system — is what the DMA template is designed to surface.",
      rels: ["caseworker", "DMA"],
    },
    {
      title: "Contestation pathway",
      gr: "Right-to-challenge design",
      body: "The explicitly designed route through which an affected party can challenge an outcome. Designed at Stage 3 via the Contestation Pathway Design Specification Table.",
      rels: ["due process", "Stage 3"],
    },
    {
      title: "Generative LLM Gate",
      gr: "Stage 2 conditional check",
      body: "A five-question procurement checkpoint applied <em>only</em> when the deployment incorporates a generative model. Two of its questions — model openness and infrastructure control — form a paired <strong>stopping condition</strong>.",
      rels: ["framework-level"],
    },
    {
      title: "Critical-deliberative stance",
      gr: "Theoretical grounding",
      body: "<em>Critical</em> of the assumptions any deployment carries; <em>deliberative</em> in the procedural space where those assumptions are surfaced and negotiated.",
      rels: ["foundations"],
    },
    {
      title: "Specification vs. set-up work",
      gr: "How to read instrument maturity",
      body: "Every instrument has a <strong>specification</strong> (form, columns, the questions it makes a practitioner ask) and the <strong>set-up work</strong> an institution needs to make it deployable. The framework provides the first and leaves the second to the institution. An instrument that needs a lot of set-up work is a <em>described property</em>, not a fault.",
      rels: ["Cluster 3", "maturity"],
    },
    {
      title: "Contextual Integrity Worksheet (CIW)",
      gr: "Stage 2 · information flows",
      body: "A structured template that surfaces a deployment’s information flows before and after the AI system, sorting each into one of three verdicts: appropriate, requires justification, refused. The most operationally mature of the four instruments.",
      rels: ["contextual integrity", "Stage 2"],
    },
    {
      title: "Architecture Selection Tool (AST)",
      gr: "Stage 2 · architectural choice as governance",
      body: "A five-phase procedure that returns one of three verdicts — select an architecture, escalate, or stop and reframe. Surviving architectures are ordered by how governable they are. The framework’s one genuinely operable instrument.",
      rels: ["governability", "Stage 2", "GLG handoff"],
    },
    {
      title: "Discretion Migration Analysis (DMA)",
      gr: "Stage 3 · discretion + oversight",
      body: "Maps how decision-making authority moves when an AI system is introduced, and specifies the oversight response — who can override, on what timeline, with what information, with what safeguards against automation bias.",
      rels: ["override authority", "Stage 3"],
    },
    {
      title: "Contestation Pathway Design (CPD)",
      gr: "Stage 3 · contestation as design",
      body: "Specifies six interlocking dimensions of a contestation pathway: notification, explanation, channel accessibility, human reviewer with substantive authority, timeline, feedback loop. Most of the deployment-specific filling is deliberately left to the institution.",
      rels: ["due process", "Stage 3"],
    },
  ];

  return C;
})();
