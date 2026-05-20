# C-9-Expert Questionnaire — Cluster 2: The Framework

*Drafted: Session 096 (2026-05-14). Consolidated to the locked Cluster 1 eight-element template; reading-path register pass applied and stems and subtitles locked: Session 099 (2026-05-15).*
*Status: Working draft, reading path locked. Cluster 2 of 4. Eight-element per-question template, consistent with locked Cluster 1 and Cluster 3.*
*Tracker item: C-9-expert*

---

## Orientation for the reviewer of this draft

This is the second of four claim-clusters. Cluster 1 established **the problem** — the governance gap, where it sits, whether existing arrangements cover it, whether generative LLMs change it. Cluster 2 turns to **the framework** as the proposed response and puts its central design claims to the respondent one at a time. The cluster grouping is not a part-count commitment; Cluster 1's orientation states the standing position and it is not relitigated here.

**Cluster 2 covers the framework.** Its job: establish whether the framework's architecture holds together, whether its diagnostic set — four governance gaps (the construct memo's structural absences, C2′) — is the right one and one a practitioner recognises, whether its distinctive structural move (returning to the diagnostic conditions during the operational lifecycle) earns its place, and whether two of its most deliberate and most counter-intuitive design choices (the recursive cycle, the Generative LLM Gate's stopping condition) are well-grounded. The respondent met the framework once in the platform-wide comprehension grounding, as wide orientation; Cluster 2's own introductory grounding (specified below) re-presents it as the object of evaluation, in the slices the questions probe.

**The shift from Cluster 1: this is where open-only questions begin.** Cluster 1 ran entirely on rating-with-optional-open items — a smooth, calibrating entry that also collected the motivating findings. Cluster 2 is where the respondent assesses a designed object, and that is where the open-response layer that carries the validation weight does its work. Three of the seven Cluster 2 questions are `open-only`; the other four are `rating + optional open`, used where a countable spine is genuinely informative (an architectural-soundness reading, a per-gap recognition grid, a broad structural-coherence check, a verdict on a counter-intuitive design choice) and where a hard cut from Cluster 1's seven light items to a blank box would be a needless cliff.

**Cluster 2 is rationale-heavy by nature.** Every question here asks the respondent to judge a deliberate design choice, so the standing rule — a choice-judging question must carry that choice's rationale in its supporting material — applies to almost the whole cluster. This is expected, not a flaw: Cluster 2 is the cluster where the content store's rationale units (UI spec §5) get used most. Where a question is **RATIONALE-DEPENDENT** the supporting material names what its rationale unit must establish.

**Each question carries the eight-element template locked with Cluster 1:**
- **The question** — practitioner-facing, plain, short. The primary element in the reading path.
- **Subtitle (scope note)** — a syntactically complete sentence or two, in the reading path immediately under the question, that bounds what the question means and what a good answer attends to (UI spec P5). It carries scope — the meaning of the question, the object being judged, what is *not* in scope on this screen — not rationale, and it does not double as the open prompt.
- **Type** — `open-only` / `rating-only` / `rating + optional open`.
- **Reaches for** — *recognition* (have you seen this in your work) or *judgment* (what is your verdict on this designed object) or both.
- **Rating** — the response scale (`rating + optional open` items only).
- **Field label + open prompt** — the short label on the open-response field, and the prompt text inside it. On `rating + optional open` items the open response is optional; on `open-only` items it is obligatory and carries the question's validation weight.
- **Supporting material (abstract)** — what the screen's panels must establish beyond the subtitle, named by affordance: a *source-material panel*, a *detailed-explanation card*, a *scope panel*. Per the UI spec these are summonable overlays, not reading-path elements (§4.2–4.3); only the question, the subtitle, and the open-response field stand in the reading path. Where a question judges a deliberate thesis choice, the detailed-explanation card carries that choice's rationale — flagged **RATIONALE-DEPENDENT**.
- **Note** — design reasoning, risks, pairings, open decisions.

**Standing rule applied throughout** (carried from Cluster 1): a question that asks a practitioner to judge a deliberate thesis choice without the supporting material carrying the *why* does not test the choice — it tests whether the respondent can reconstruct the missing rationale. They mostly cannot, and they default to the obvious objection. Every RATIONALE-DEPENDENT question below names what its detailed-explanation card must establish. The subtitle does not carry rationale; the detailed-explanation card does.

---

## Cluster 2 supporting material — the introductory grounding

Cluster 1's questions were answerable off the platform-wide comprehension grounding plus Cluster 1's own shared setup: the grounding does the wide orientation, and the setup built the problem space the Cluster 1 questions probe. Cluster 2 needs the same two-part support, and the second part — **Cluster 2's own introductory grounding** — is specified here. It is smaller than Cluster 1's setup, because the platform-wide grounding has already given the respondent a first pass over what the framework is. It is not, however, a transition note. It is a genuine comprehension unit, parallel in function to Cluster 1's setup: it presents the framework *as the object the cluster is about to evaluate*, in the specific slices Q2.1–Q2.7 draw on, immediately before the questions. This is what P8 requires — the material a question needs is established on or before that question's screen — and it is what keeps Cluster 2 symmetrical with Cluster 1 rather than outsourcing its setup work to a generic, screens-ago orientation. It is a gated spine screen (F1, F2), not an overlay.

The platform-wide grounding presented the framework once, as wide orientation. Cluster 2's introductory grounding does something different with the same material: it pulls the framework from *what it is* into *the thing you are now going to stress-test*, and presents it at the grain the questions need.

**What the Cluster 2 introductory grounding must present** — described in abstract, not drafted as final copy:

- **The two-stage architecture, walked through properly.** An initial diagnostic stage the practitioner works through once, before a deployment, to surface the structural and institutional conditions already shaping the decision; feeding a five-stage operational lifecycle that runs across the deployment's life. Not one sentence of recall — an actual plain walk-through of the two stages and how the first feeds the second, because Q2.1 judges the approach directly and every other question sits inside this shape.
- **The four governance gaps, stated plainly and at the deployment level.** The four things the framework says are structurally missing at the point where a specific AI deployment is decided on and run: no real deliberation about what the system is for; no participation by affected people in design; no accountability arrangement that survives into operation; no constraint on vendor power. This is the same four-gap presentation Q2.3 and Q2.4 work from — built once here, re-summonable at those questions.
- **The lifecycle as recursive, with default-discontinuation.** The lifecycle runs and re-runs across the deployment's life, and the framework's presumption is that a deployment stops unless it is positively re-justified at each cycle. Presented here as a *described property of the framework* — what it does — not argued for. The rationale for why the framework is built this way is carried on Q2.2's own screen.
- **The move back to the diagnostic conditions.** At several points in the operational lifecycle, the framework asks the practitioner to return to the structural conditions surfaced in the diagnostic stage, so an operational decision is taken with those conditions in view. Presented here as a feature of the design; the rationale for why it is the framework's central structural commitment is carried on Q2.6's screen.
- **The instruments and the gap-to-instrument-to-stage mapping, at a glance.** Each gap is paired with instruments meant to address it, and each instrument has a place in the lifecycle. A single legible overview of that mapping — not the instrument specifications, which are Cluster 3's object. This is the same at-a-glance mapping view Q2.5 works from.
- **The Stage 2 design-and-procurement moment, including the Generative LLM Gate as an object.** Within the lifecycle, Stage 2 treats architectural and procurement choices as governance decisions. The Architecture Selection Tool carries the architectural choice; the Generative LLM Gate is its conditional sibling, running only when a generative-LLM architecture has been selected — a five-question procurement checkpoint, two of whose questions (is the model open enough to inspect; does the institution keep the data within its control) form a paired stopping condition. The Gate is presented here as an *object* — what it is, what it does — so that the respondent has seen the instrument before Q2.7 asks them to judge one of its design choices. The rationale for the stopping condition is carried on Q2.7's screen.

**This setup deliberately presents** the framework's structure and components — the two-stage shape (judged in Q2.1), the recursive lifecycle and default-discontinuation (judged in Q2.2), the four gaps (judged in Q2.3, recognised in Q2.4), the gap-to-instrument mapping (checked in Q2.5), the move back to the diagnostic conditions (judged in Q2.6), and the Stage 2 moment with the Generative LLM Gate as an object (its stopping-condition choice judged in Q2.7). All are presented here because the Cluster 2 questions are not answerable without them — exactly the way Cluster 1's setup seeded solution-first framing, the upstream production of priorities, and the governance-versus-compliance distinction for its own questions.

**The neutral-presentation constraint.** The introductory grounding presents the framework as a *described object* — what it is, what it does, how it is shaped. It does **not** carry the *rationale* for the framework's deliberate or counter-intuitive choices: why two stages rather than one, why a recursive cycle, why a stopping condition rather than a graduated score. Those rationales stay on the per-question screens, behind the detailed-explanation cards, because that is where the standing rule places them and because a respondent who meets the rationale in the shared setup has been argued at before they reach the question. This mirrors Cluster 1 exactly: Cluster 1's setup presented the problem space plainly, and the per-question RATIONALE-DEPENDENT panels carried the thesis's positions. Cluster 2 keeps the same division — object in the shared grounding, rationale on the question screen.

**Relationship to per-question supporting material.** The introductory grounding is the shared comprehension unit; per-question supporting material then does the focused work, including the rationale cards. Several per-question source-material panels are the *same content* as slices of this grounding, surfaced a second time at the question that needs them: the four-gap panel for Q2.3 and Q2.4, the at-a-glance mapping view for Q2.5, and the Generative LLM Gate as an object for Q2.7. This is the build-once-surface-twice principle (UI spec §5) — the grounding walks through the content linearly; the per-question panels re-surface the relevant slice on demand. No content is authored twice.

One carried-over point from Cluster 1 belongs here as the frame for the whole cluster: **what the framework is for.** The framework is built to make a governance gap *visible and namable* to public-administration practitioners, not to resolve it — Cluster 1 Q1.6 already put this claim to the respondent, and Cluster 2 takes it as the established purpose against which the framework's design choices are judged. A design choice can only be assessed against what the design is trying to do.

---

# Q2.1 — Is the two-stage structure useful?

**Question.**
> In your judgement, is it useful to separate the framework into an initial diagnostic stage before deployment, and an operational process that continues through the system's lifecycle?

**Subtitle (scope note).**
> *The framework separates an initial diagnostic stage from the operational stages that follow. The question is whether that overall structure is useful and workable — not whether the diagnostic stage connects to the operational stages in the right way.*

**Type:** `rating + optional open`
**Reaches for:** judgment. The respondent assesses a designed structure at the level they can actually see it — the two-stage *approach* — not the internal mechanics of a feed they have not yet been shown.

**Rating:** a soundness scale — *a sound approach · broadly reasonable · uncertain · a questionable approach · not a sound approach*.

**Field label:** Your view
**Open prompt (optional):** *If you wish, say what makes the approach reasonable, or where you would question it.*

**Supporting material (abstract):** **RATIONALE-DEPENDENT (mild).** A *source-material panel* re-surfaces the two-stage image from the cluster's introductory grounding. A *detailed-explanation card* carries the rationale for why the framework is built in two stages rather than one: that the structural and institutional conditions shaping a deployment are not themselves operational decisions and cannot be surfaced by the same instruments that structure operational choices; that the diagnostic stage is run once because those conditions are relatively stable across a deployment's life while the operational decisions recur; and that the two are connected — the diagnostic work is not a preface to be filed and forgotten but is reached back into at specific points in the lifecycle (the move Q2.6 probes directly). Without that rationale the respondent's obvious question is "why two stages, why not one workflow," and they judge the separation rather than the design.

**Note.** This is Cluster 2's re-entry question. The question is deliberately pitched at the *approach* level, not the mechanism level: at this point the respondent has seen the two-stage shape in the comprehension grounding but not the diagnostic stage's instruments, so a question asking whether the diagnostic work "feeds the lifecycle in a way that makes sense" would ask for a verdict on a mechanism they cannot yet see. The instruments and their handoffs are Cluster 3's object — which is why the subtitle's scope exclusion stops at "not whether the diagnostic stage connects to the operational stages in the right way" without naming where that question is handled; Q2.1 asks only whether the two-stage design is a reasonable way to build the framework. It is rating-with-optional-open rather than open-only: it eases the transition from Cluster 1's seven light items, it produces a countable architectural-soundness reading Chapter 9 can report across the sample, and the optional open still collects the texture. It is the *holistic* approach question; the two structural commitments that are most contestable individually (the recursive cycle, the move back to the diagnostic conditions) are isolated into their own questions (Q2.2, Q2.6) rather than folded in here, because a single holistic rating cannot carry a verdict on a specific structural claim. C1′ in the construct memo also names the stage-to-stage handoffs within the lifecycle; those are left to the instruments cluster, where the respondent sees the stages in operational detail.

---

# Q2.2 — The framework treats AI governance as a recurring cycle

**Question.**
> What would a recurring governance cycle like this need in order to work in public administration — and what would make it difficult in practice?

**Subtitle (scope note).**
> *The framework treats AI governance as an ongoing review cycle rather than a one-time approval: a deployment is expected to be re-justified over time rather than continuing automatically. The question asks what that design would need and what would obstruct it — not whether it adds to review workload.*

**Type:** `open-only`
**Reaches for:** judgment, grounded in recognition. The respondent judges a structural commitment against what they know of how AI oversight actually runs.

**Rating:** none — `open-only` item.

**Field label:** What it would need
**Open prompt:** *Write about what a model like this would need to work in public administration, and where it would run into trouble.*

**Supporting material (abstract):** **RATIONALE-DEPENDENT (full).** A *source-material panel* re-surfaces the recursive-lifecycle slice from the introductory grounding. A *detailed-explanation card* carries the rationale for why the framework insists on recursion and on default-discontinuation: that each governance cycle's outputs become the next cycle's constraints, so a deployment's conditions narrow over time in ways a one-time approval never sees; that the framework makes that narrowing legible at each cycle boundary precisely so it can be named; and that the default-discontinuation presumption — a deployment stops unless re-justified — is there to put the burden of proof on continuation rather than letting a deployment persist by inertia. Without that rationale the obvious reading is "this is the same approval, repeated more often," which is the opposite of the point.

**Note.** This is `open-only` and it is a single question — what the model would need, and what would obstruct it. A rating (*realistic ↔ idealised*) would flatten exactly the judgment worth collecting: a practitioner who thinks the model is right *in principle* but defeated *in practice* by resourcing or political will has said something Chapter 9 needs in their own words, and a scale would lose it. The recursive cycle is the framework's signature structural move and one of its most contestable single claims — it is the architectural expression of the co-production gap — so it earns its own question rather than sitting inside Q2.1's holistic rating. Risk: a respondent reads "recurring cycle" as a complaint about workload and answers about review fatigue rather than about the structural claim; the subtitle's closing clause heads this off in the reading path, and the rationale card must land the *why* clearly enough that the question is understood as a design judgment. A rating-with-optional-open variant is held in reserve as a piloting fallback if the open-only item runs heavy this early in the cluster.

---

# Q2.3 — Are these the right four governance gaps?

**Question.**
> In your judgement, do these four governance gaps capture the main issues a framework like this should address — or is something important missing?

**Subtitle (scope note).**
> *The four gaps relate to how individual AI deployments are designed, introduced, and governed within public administration.*

**Type:** `open-only`
**Reaches for:** judgment. The respondent assesses the framework's diagnostic set against their own sense of what matters.

**Rating:** none — `open-only` item.

**Field label:** What you would change
**Open prompt:** *Name anything you would add — and anything here you would not include.*

**Supporting material (abstract):** a *source-material panel* presents each of the four governance gaps in one practitioner-legible sentence and establishes the level they operate at: the deployment level — the operational decisions a public administration takes around a specific AI deployment of its own, not national strategy, not law, not the internals of a model. The stem and subtitle keep the reading path short; the panel carries the fuller "not strategy, not law, not model internals" clarification, so the precision still lands. The panel's drafting constraint is a *neutrality* constraint, not a rationale one: it must present the four clearly and at the right level of abstraction, but it must **not** stack the case for them. The completeness judgment is the validation finding; a panel that argues hard for why these four are the right four leads the "is anything missing" answer and the finding becomes worthless. The shared setup has already given the respondent the framework's purpose; that is the frame they judge completeness against. No rationale unit — this is the one Cluster 2 question whose panel carries a neutrality constraint instead.

**Note.** This is the core C2′ validation question and it is `open-only` because the validation weight is entirely in the open response: "is anything missing" has no meaningful rating, and a closed item on "these are the right four — agree/disagree" would be exactly the satisfaction-style framework-quality rating the whole instrument is designed to avoid (the DGSB / Durkiewicz comparator lesson). The four gaps are deployment-level — the respondent judges completeness against the wrong frame if that is unclear, which is why the source-material panel carries the level anchor explicitly. The four gaps are also probed for *recognition* in Q2.4 — Q2.3 and Q2.4 form a judgment/recognition pair the way Q1.1/Q1.2 and Q1.3/Q1.4 did in Cluster 1: Q2.3 asks whether the set is *right*, Q2.4 asks whether each one is *recognised*. The open prompt deliberately invites both addition and removal ("anything you would add… anything here you would not include"); the stem's headline names only the "missing" half, and the slightly fuller prompt is allowed to invite a touch more than the stem announces. The cross-cutting distributional pattern (AI concentrating in the state's coercive functions) is deliberately not presented here as a fifth gap — the framework itself carries it as a cross-cutting condition rather than a Layer-3 gap, and Cluster 1's notes already record it as deferred to interview; if a respondent raises it unprompted in the open response, that is a substantive finding, not noise.

---

# Q2.4 — Recognising the four governance gaps in practice

**Question.**
> Thinking about AI deployments you have seen in public administration: how often have you seen each of these missing in practice?

**Subtitle (scope note).**
> *This question asks about your direct experience with AI deployments rather than your general view of the sector. Each gap is rated separately.*

**Type:** `rating + optional open`
**Reaches for:** recognition, with the optional open reaching for a light judgment (which matters most).

**Rating:** a per-gap grid, each row on a frequency scale — *never seen it missing · missing once or twice · missing occasionally · missing often · it is always missing*. The four rows: *deliberation about purpose · participation by affected people in design · accountability that survives into operation · vendor power left unconstrained — in procurement and beyond*.

**Field label:** The one that mattered most
**Open prompt (optional):** *Of the four, which is the one you have seen matter most — and what did it cost when it was missing?*

**Supporting material (abstract):** the same four-gap *source-material panel* as Q2.3 — the respondent does not need it re-presented if Q2.3 and Q2.4 sit on adjacent screens, but the panel must be summonable. The panel does one extra piece of work for this question's fourth row: it makes plain that vendor power is not only a procurement matter — it operates through procurement terms, but also through advisory and consultancy influence on what counts as a problem, and through infrastructural dependency that persists long past the procurement moment. A *scope panel* carries the direct-experience framing — the question asks about the respondent's *direct* experience of deployments, the same framing Cluster 1 Q1.1 used, not their general impression of the sector. No rationale unit: this is a recognition question, not a choice-judging one.

**Note.** This is the recognition underside of Q2.3, and the per-gap grid is what makes it work: a single "do you recognise these" rating would collapse four different findings into one, and Chapter 9 wants to know *which* gaps practitioners recognise readily and which they do not — a gap the sample does not recognise is a different finding from one it recognises constantly. The fourth row is labelled "vendor power left unconstrained — in procurement and beyond" rather than a bare "constraint on vendor power" because that gap, unlike the diffuse other three, has a concrete institutional home (procurement) and the bare label would narrow recognition to the procurement moment alone — the framework's claim is broader, taking in advisory capture and infrastructural lock-in, and the row label plus the panel together carry that breadth. The optional open folds in the "which matters most" judgment without obliging it. An *allow-all-that-apply* response format — select the gaps you have seen — was considered as the lighter alternative to the frequency grid; the grid is kept because it preserves the frequency information, but allow-all is the recorded piloting fallback if the grid runs heavy. Placed immediately after Q2.3 so the judgment/recognition pair reads as a pair; the rating here also gives Cluster 2 a countable spine on the diagnostic set, which the `open-only` Q2.3 cannot.

---

# Q2.5 — Does the framework's structure work together?

**Question.**
> Looking at the framework as a whole, do the different parts appear to work together clearly, or do you see gaps, overlaps, or unnecessary elements?

**Subtitle (scope note).**
> *The framework links each governance gap to specific tools and stages. The question is whether that overall structure appears coherent and complete — not whether any individual tool is well-built.*

**Type:** `rating + optional open`
**Reaches for:** judgment, at a deliberately broad level.

**Rating:** *the mapping broadly holds · mostly holds, with gaps · uncertain · the mapping is loose · I cannot judge this from the overview*.

**Field label:** A gap you see
**Open prompt (optional):** *If you see one — a governance gap without a tool addressing it, or a part that overlaps or duplicates another — name it.*

**Supporting material (abstract):** **RATIONALE-DEPENDENT (mild).** A *source-material panel* shows the gap-to-instrument-to-stage mapping *at a glance* — a single legible overview, not the instrument specifications. A *detailed-explanation card* establishes the light rationale the question needs: that the framework's claim is that each gap is *met* somewhere and each part has *an analytical job*, and that the question is whether that claim holds at the overview level, not whether each instrument is well-built. Without that, the respondent does not know whether they are being asked an architecture question or an instrument-quality question — and the instrument-quality question is Cluster 3's.

**Note.** This is C3′, and the construct memo and the tracker both specify it is **handled lightly** in this cluster — the question is scoped to a glance-level check (every gap has something; the structure works together) precisely so it does not pre-empt the instruments cluster, where the four selected instruments are evaluated as operational objects. The subtitle's scope exclusion ("not whether any individual tool is well-built") holds that boundary in the reading path; for the implementer, the instrument-quality question is Cluster 3's object and Q2.5's screen should not invite a verdict on it. The "I cannot judge this from the overview" option is load-bearing: a respondent who genuinely cannot assess structural coherence without seeing the instruments should say so rather than be pushed to a verdict, and that non-verdict is itself a finding about whether the framework's structure reads clearly from an overview. `rating + optional open` rather than `open-only` because the broad "does it work together" check is exactly what a rating does well, and the cluster's open-only weight is better spent on Q2.6. The stem asks about coverage and structural non-redundancy — gaps, overlaps, and unnecessary elements — rather than the quality of any one part, which keeps it clear of Cluster 3's per-instrument question.

---

# Q2.6 — Returning to the diagnostic conditions: does it earn its place?

**Question.**
> In your judgement, is it useful for the framework to keep returning to the broader conditions identified in the diagnostic stage? And does that stay meaningful across the lifecycle, or risk becoming a formality?

**Subtitle (scope note).**
> *At several stages, the framework asks practitioners to revisit the broader organisational and structural conditions identified in the diagnostic stage. The question is whether that revisiting does real work and stays consistent across the lifecycle.*

**Type:** `open-only`
**Reaches for:** judgment. The respondent assesses a designed feature — whether it does real work, and whether it is evenly built.

**Rating:** none — `open-only` item.

**Field label:** Where it works, where it thins
**Open prompt:** *Where would this be most valuable in practice — and where, if anywhere, does it look like it would thin out or become a formality?*

**Supporting material (abstract):** **RATIONALE-DEPENDENT (full).** A *source-material panel* re-surfaces the move-back-to-the-diagnostic-conditions slice from the introductory grounding. A *detailed-explanation card* carries the rationale for *why this move is the framework's central structural commitment*: that the whole difference the framework is trying to make — governance *of* the gap rather than *within* it — depends on operational decisions being taken with documented awareness of the structural conditions shaping them; that without the move back, the diagnostic work would be a preface that is filed and forgotten; and that the framework places the move at the lifecycle moments where the structural memory is most needed. The card must also state plainly where the move is built in (early problem-framing, the oversight stage, the continuation decision, and an embedded form at the design-and-procurement stage) and where it is deliberately *not* (the public-value evaluation stage, which looks forward to the continuation decision rather than back) — because the question asks specifically about *consistency across stages*, and the respondent cannot judge consistency without knowing the actual distribution.

**Note.** This is C7′, and it is `open-only` because the construct's real question — does the commitment thin anywhere — is inherently an open one: "where does it fade" cannot be a rating. It is also one of the two most rationale-dependent questions in the cluster, because "stop and return to structural conditions" read cold sounds like a reflective detour a busy practitioner would skip, and only the rationale makes it legible as the framework's load-bearing move. The question deliberately asks two things on one screen — does it earn its place, and is it consistent — which sits at the edge of the one-screen-one-analytical-unit principle (P4); they are kept together because the second is meaningless without the first, but if piloting shows the two-part question splits respondents' attention, the consistency half is the one to spin out into its own screen. Pairs loosely with Q2.1: Q2.1 judged whether the two stages fit together, Q2.6 judges whether the specific connective move between them does real work.

---

# Q2.7 — The Generative LLM Gate: a stopping condition rather than a score

**Question.**
> In your judgement, is it reasonable for the framework to treat a closed generative-AI model running on vendor infrastructure as a reason to stop or reconsider a deployment — regardless of what other safeguards are in place?

**Subtitle (scope note).**
> *When a deployment uses a generative-AI model, the framework runs a separate check. A model that is both closed and run on the vendor's infrastructure is not scored against other factors — it is treated on its own as a reason to halt or reconsider the deployment.*

**Type:** `rating + optional open`
**Reaches for:** judgment. The respondent assesses a deliberate, counter-intuitive design choice.

**Rating:** *yes, clearly reasonable · probably reasonable · unsure · a graduated assessment would be better · clearly the wrong design*.

**Field label:** Your reasoning
**Open prompt (optional):** *What makes treating this as a stopping condition defensible — or what makes a graduated, scored assessment the better design?*

**Supporting material (abstract):** **RATIONALE-DEPENDENT (full).** The Generative LLM Gate has already been presented as an *object* in the Cluster 2 introductory grounding's Stage 2 slice — what it is, the five-question checkpoint, the paired stopping condition — so the respondent reaches Q2.7 having seen the instrument, not meeting it cold. A *source-material panel* re-surfaces that Gate-as-object slice for recall. A *detailed-explanation card* carries the full *rationale* for the stopping-condition choice: that the framework treats generative LLMs as posing procurement questions different *in kind* from other architectures, not merely larger ones (the Cluster 1 Q1.8 claim, now operationalised); that of the checkpoint's five questions, two — is the model open enough to inspect, and does the institution keep the data within its control — are treated as a paired stopping condition; that the framework's substantive position is that a closed-weight model running on vendor infrastructure is the categorically least-governable configuration for public administration, and that this cannot be repaired by grounding, evaluation evidence, or drift monitoring bolted on around it; and that a graduated score would let exactly that configuration accumulate enough partial credit elsewhere to pass — which is the outcome the stopping condition exists to prevent. The card must also be honest that this is a *strong* claim and a deliberately blunt instrument; the question is genuinely asking whether the respondent thinks the bluntness is warranted.

**Note.** This is the framework-level probe of the Generative LLM Gate. The construct memo is explicit that the Gate is surfaced for expert assessment *at the framework-construct level, not the operational-instrument level* — which is why it sits in the framework cluster and not the instruments cluster, even though it is a Stage 2 instrument: the four instruments evaluated operationally in Cluster 3 are the Contextual Integrity Worksheet, the Architecture Selection Tool, the Discretion Migration Analysis, and the Contestation Pathway Design, and the Gate is deliberately not among them. It is the most rationale-dependent question in the cluster: judged cold, "a condition that overrides other safeguards" invites the immediate objection that blanket rules are crude and context should decide — and that objection is *exactly* the thesis position the rationale card must put in front of the respondent, so they judge the framework's actual reasoning rather than the strawman. It is `rating + optional open` rather than open-only: the design choice has a genuine yes/no spine, and a countable verdict across the sample — how many experts think the blunt instrument is warranted — is a clean, reportable Chapter 9 finding, while the optional open still collects the reasoning from the respondent who wants to give it. It is placed last in Cluster 2 because it is the most demanding judgment — a counter-intuitive design choice assessed on its grounds — and because it carries Cluster 1's RQ2 thread (LLMs as a qualitative shift) forward into the framework's design, setting up the instruments cluster.

---

## Cluster 2 — summary table

| Q | Asks about | Construct | Type | Reaches for | Rationale-dependent |
|---|---|---|---|---|---|
| Q2.1 | Whether the two-stage approach is reasonable and useful | C1′ | rating + optional open | judgment | mild |
| Q2.2 | The recursive cycle and default-discontinuation as a structural commitment | C1′ | open-only | judgment (grounded) | **yes — full** |
| Q2.3 | Whether the four governance gaps are the right diagnostic set | C2′ | open-only | judgment | no — neutrality constraint on the panel |
| Q2.4 | Per-gap recognition in practice, plus which matters most | C2′ | rating + optional open | recognition (+ light judgment) | no |
| Q2.5 | Whether the framework's structure works together — coverage complete, parts non-redundant | C3′ | rating + optional open | judgment (broad) | mild |
| Q2.6 | Whether the move back to the diagnostic conditions earns its place and is consistent across stages | C7′ | open-only | judgment | **yes — full** |
| Q2.7 | Whether the Generative LLM Gate's stopping condition is well-founded | GLG (framework-level) | rating + optional open | judgment | **yes — full** |

## Cluster 2 — notes for the discussion

- **This is where open-only begins.** Three of seven questions (Q2.2, Q2.3, Q2.6) are `open-only`; four (Q2.1, Q2.4, Q2.5, Q2.7) are `rating + optional open`. The split is principled, not arbitrary: rating-with-optional-open is kept where a countable spine is genuinely informative — a holistic reading of whether the two-stage approach is sound, a per-gap recognition grid, a broad structural-coherence check, a verdict on the Generative LLM Gate's design choice — and where a hard cut from Cluster 1's seven light items to a blank box would be a needless cliff. Open-only is used where a rating would either flatten the judgment (Q2.2's principle-versus-practice verdict) or reproduce the satisfaction-style framework-quality item the whole instrument is built to avoid (Q2.3's completeness judgment, Q2.6's consistency judgment). All four rating items remain rating-*with-optional-open*, so the open-response layer is present on every question in the cluster — the distinction is only whether the open response is obligatory. This is consistent with the construct memo's "Block 1 = open-response items" specification read through the refined three-format model (ADR §8): the memo governs *which constructs* the cluster carries; the compositional model governs *what format* each question takes.
- **The cluster has a deliberate arc.** Re-entry at the architecture-approach level (Q2.1), then the single most contestable structural commitment isolated (Q2.2), then the diagnostic set judged and recognised as a pair (Q2.3 / Q2.4), then the structure checked lightly (Q2.5), then the two distinctive design choices that most need their rationale carried (Q2.6, Q2.7). The respondent moves from the whole shape inward to the specific load-bearing choices. The cluster closes on Q2.7, the most demanding judgment, which is rating-with-optional-open: it ends the cluster on a countable verdict rather than an obligatory open response, which is the lighter close, while still inviting the reasoning.
- **Two judgment/recognition pairs carry over the Cluster 1 device.** Q2.3 / Q2.4 are a pair the way Q1.1 / Q1.2 and Q1.3 / Q1.4 were: Q2.3 asks whether the four-gap set is *right* (judgment, open-only), Q2.4 asks whether each gap is *recognised* (recognition, rating-with-optional-open). Keeping them separate rather than merging is the same call made for Q1.3 / Q1.4 — one is judgment and one is recognition, and a shared response format would muddle them.
- **Cluster 2 is rationale-heavy by nature, and that is correct.** Every question judges a deliberate design choice, so the standing rule binds almost the whole cluster. Three questions carry *full* rationale dependence (Q2.2, Q2.6, Q2.7); two carry *mild* dependence (Q2.1, Q2.5); Q2.3 carries a neutrality constraint instead — its panel must present the four gaps clearly but must not stack the case for them. Q2.4 is the only question with no rationale unit, because it is the only pure recognition question. This is the cluster where the content store's rationale units (UI spec §5) are most heavily drawn on; if the rationale units are thin, Cluster 2 is where the instrument fails.
- **Cluster 2 has its own introductory grounding, parallel to Cluster 1's setup.** The division of labour: the platform-wide comprehension grounding does the wide orientation and made Cluster 1's questions answerable; each cluster then also carries its own shared setup that builds the specific ground its questions probe. Cluster 1's setup built the problem space; Cluster 2's introductory grounding presents the framework as the object of evaluation, in the slices Q2.1–Q2.7 draw on. It is smaller than Cluster 1's setup because the platform-wide grounding already gave a first pass over the framework — but it is a genuine comprehension unit, not a transition note, because P8 requires the material a question needs to be established on or before that question's screen, and because symmetry with Cluster 1 requires the cluster to do its own setup rather than lean on a generic, screens-ago orientation. The load-bearing division inside it: the introductory grounding presents the framework as a *described object*; the *rationale* for each deliberate design choice stays on the per-question screen.
- **The Generative LLM Gate is seen before it is judged.** Q2.7 asks the respondent to judge one of the Gate's design choices, but the Gate is deliberately excluded from Cluster 3's four operational instruments, and the platform-wide grounding does not go instrument by instrument. The Cluster 2 introductory grounding's Stage 2 slice therefore presents the Gate as an object (what it is, the five-question checkpoint, the paired stopping condition), and Q2.7's screen carries only the *rationale* for the stopping condition plus a source-material panel re-surfacing the object. This is the correct division — instrument seen in the shared grounding, choice-specific rationale on the question screen — and it mirrors how every other Cluster 2 question works. This does not move the Gate into Cluster 3: the construct memo specifies the Gate is probed *at the framework-construct level*, and Cluster 3's four operational instruments deliberately do not include it.
- **Q2.5 is held deliberately light.** C3′ could support a detailed instrument-to-gap audit; it is scoped here to a glance-level check so it does not pre-empt Cluster 3. The "I cannot judge this from the overview" option is part of that scoping — it lets a respondent decline the verdict honestly, and the decline is itself a finding about whether the framework's structure reads clearly from an overview.
- **One question sits at the edge of the one-screen-one-unit principle and is flagged for piloting.** Q2.6 asks two things on one screen (does the move earn its place; is it consistent across stages) and, as an open-only item, runs heavier than anything in Cluster 1. It has a named fallback: the consistency half can spin out into its own screen. Q2.2, also open-only, has a rating-with-optional-open variant held in reserve if the open-only item runs heavy this early in the cluster. Neither fallback is taken pre-emptively — they are piloting contingencies.
- **What Cluster 2 deliberately does not cover.** The framework-level self-limitation construct (C5′ in the memo) is held back for interview probing and is not drafted as a Cluster 2 question; the closing cluster (Cluster 4) carries the lighter scope-and-limits material, and Cluster 1 Q1.6 already put the visibility-not-solutions rationale to the respondent once. The minimum/full application-configuration distinction is a genuine framework-level design commitment but is not among the memo's four framework-level constructs and is not probed here; if it warrants a question, the closing cluster is its home. The within-lifecycle stage-to-stage handoffs named under C1′ are touched at the holistic level in Q2.1 and otherwise left to Cluster 3, where the respondent sees the stages in operational detail.
- **Question count and structure.** Seven questions, matching Cluster 1's count. C1′ is given two questions (Q2.1 holistic, Q2.2 the recursion isolated) because it is the lead framework construct and has two genuinely distinct sub-parts. The four-gap treatment is split into a completeness judgment (Q2.3) and a per-gap recognition grid (Q2.4), with "which matters most" folded into Q2.4's optional open and the "allow-all-that-apply" response format recorded as Q2.4's piloting fallback. The summary table's organising column is **Construct** rather than Cluster 1's **Level**, because the framework cluster's natural axis is the construct memo's framework-level constructs, not the production-chain tiers.
- **Reading-path register.** Stems, subtitles, rating options, and open prompts use plain practitioner language; the framework's diagnostic set appears in the reading path as "governance gaps" and in construct references as the structural absences (C2′). The framework's distinctive lifecycle move is named in the reading path as "returning to the broader conditions identified in the diagnostic stage" rather than by a coined term. Thesis vocabulary is carried in the supporting-material panels, not the reading path (UI spec P5, P8) — the same register Cluster 1 holds. Cluster 3 still carries thesis-internal phrasing in its Q.1 stems ("distinctive analytical work," "operational maturity") and needs the equivalent pass.
