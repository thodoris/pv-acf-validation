# C-9-Expert Questionnaire — Cluster 1: The Problem

*Drafted: Session 095 (2026-05-14). Restructured and locked: Session 098 (2026-05-14).*
*Status: Working draft. Cluster 1 of 4. Locked at cluster level; Clusters 2–4 consolidation pending.*
*Tracker item: C-9-expert*

---

## Orientation for the reviewer of this draft

This is the first of four claim-clusters. **Cluster grouping is not a part-count commitment** — whether the final platform has four parts, five, a video, or interleaved present-then-ask couplets is not decided here. The clusters are how the thesis's contestable claims group analytically.

**Cluster 1 covers the problem.** Its job: establish, from the practitioner's own working experience, whether the governance gap the framework addresses is real, whether it is structural rather than incidental, whether existing checks already cover it, and whether a framework whose purpose is to *recognise and name* that gap is warranted. The framework itself is not presented in Cluster 1 — the respondent judges the problem before being shown the proposed solution. This keeps the "is a framework needed" question honest.

**Cluster 1 is organised as a claim-dependency arc, not a production-chain walk.** The four movements follow the logical dependency of the thesis's argument: the gap is *real* (M1), it is *structural* — produced across connected layers, not committed by careless individuals (M2), existing mechanisms do not *close* it because they work at single levels while the gap runs across them (M3), and therefore a framework that makes the structure visible is *warranted* — with generative LLMs sharpening the whole picture (M4). Each movement's questions depend on the previous movement having been answered: the respondent cannot judge whether existing checks cover the gap before the gap has been established as a connected structure, and cannot judge whether a framework is warranted before existing checks have been found wanting.

**Each question below carries the following:**
- **The question** — practitioner-facing, plain, short. This is the primary element in the reading path.
- **Subtitle (scope note)** — a syntactically complete sentence or two, in the reading path immediately under the question, that bounds what the question means and what a good answer attends to. It is a *scope note* (UI spec P5), not a rationale: it does not argue the thesis's case, and it does not prompt the open response.
- **Type** — `open-only` / `rating-only` / `rating + optional open`.
- **Reaches for** — *recognition* (have you seen this in your work) or *judgment* (what is your verdict) or both.
- **Rating** — the response scale.
- **Field label + open prompt** — the short label on the open-response field, and the prompt text inside it. The open response is optional on every Cluster 1 question.
- **Supporting material (abstract)** — what the screen/panel before the question must establish beyond the subtitle. Where the question asks the respondent to judge a deliberate thesis position, the supporting material must carry the *rationale* for that position — flagged as **RATIONALE-DEPENDENT**.
- **Note** — design reasoning, risks, open decisions.

**Standing rule applied throughout:** a question that asks a practitioner to judge a deliberate thesis choice without the supporting material carrying the *why* does not test the choice — it tests whether the respondent can reconstruct the missing rationale. They mostly cannot, and they default to the obvious objection. Every RATIONALE-DEPENDENT question below names what its supporting material must establish. The subtitle does not carry rationale; the detailed-explanation panel does.

---

## Cluster 1 supporting material — the shared setup

Before the first question, Cluster 1 needs a presentation of the problem space in plain terms. This is shared setup that several questions then draw on, and it must establish the governance gap **as a layered, self-reinforcing structure** — not as a single deployment-level failure. If the setup flattens the gap to its innermost layer ("AI adopted before it was governed"), the cluster's claim-dependency arc has nothing to build toward and the M2 and M3 questions read as a digression rather than as the structure they probe.

In abstract terms the setup establishes:

- **The setting.** Public administrations across Europe are using AI systems in decisions about eligibility, entitlement, prioritisation, and how citizen complaints get routed. These are not pilots any more. The question has moved from *whether* to *how they should be governed*.
- **The settled critiques, in plain language.** Opacity; the quiet movement of decision-making away from front-line staff into system behaviour; the weakening of a citizen's ability to contest an outcome when the reasoning chain behind it gets too long to follow. These are well-documented and not in dispute — but they all look at the *deployed system*.
- **The gap as a layered structure.** The thesis's claim is that the consequential problem is not only at the deployment. By the time a specific administration is deciding how to run an AI system, most of the consequential choices have been made upstream: national strategy has settled that AI is the answer and to which problems; procurement has inherited that framing and turned it into a contract; the institution has been reshaped around the system — who decides what, which expertise it keeps in-house, whose problem definitions it works from. The deployment-level problems are the visible tip of a structure whose other layers sit above and behind them.
- **The two properties that make it a structure.** First, it is *layered*: the problems visible at the deployment level are produced and held in place by decisions taken above them, and an administration cannot fix at the deployment level something that was determined two levels up. Second, it *feeds itself*: each round of decisions narrows the next — a procurement choice deepens a vendor dependence that narrows the next procurement; staff cuts reduce the capacity to scrutinise the next system; data arrangements lock in choices no one revisits.
- **Why existing checks do not close it.** Audits, impact assessments, transparency rules, conformity assessments — these are not badly designed. They each work at *one level*, on the deployment in front of them, while the gap runs across all the levels at once. A practitioner can do everything the existing checks ask, correctly, and still be governing *inside* the gap rather than governing it.
- **What the framework claims to do — and not do.** It does not claim to close the gap; closing it would take political and economic change well beyond any single administration's tools. It claims to make the structure *visible and namable* to the practitioner working inside it, so that operational decisions can be taken with the upstream conditions in view rather than out of sight. This last point seeds the visibility-not-solutions idea that M4's warrant question (Q1.7) probes.

The setup deliberately keeps thesis vocabulary — *co-production*, *imaginaries*, *nested structure*, *structural absences*, *discretion migration* — out of the reading path. Those live in the reference layer as concept cards for the respondent who wants them. The setup needs the plain ideas: the gap is layered, it feeds itself, and the checks work one level at a time.

Every Cluster 1 question is anchored explicitly in the respondent's public-administration practice — the questions ask about AI in PA and governance work, not about AI in general.

**The claim-dependency arc.** M1 (Q1.1) establishes the gap is real at the deployment level. M2 (Q1.2–Q1.5) establishes it is structural: the institution is reshaped around the system (Q1.2), the priorities are set upstream by commercially interested parties (Q1.3) without deliberation (Q1.4), and these layers are *connected* — upstream decisions show up inside downstream problems (Q1.5). M3 (Q1.6) asks whether existing checks examine any of this. M4 (Q1.7, Q1.8) asks whether a framework that names the gap is warranted, and whether generative LLMs change the picture. By the time the respondent reaches Q1.7, they have judged a connected multi-layer structure — which is what gives the "is a framework warranted" question its weight.

---

# Movement 1 — Is the gap real?

## Q1.1 — Solution-first adoption, as recognition

**Question.**
> Have you seen cases where AI was adopted first, and the justification for using it came afterwards?

**Subtitle (scope note).**
> *This asks about cases in your public-administration experience where AI adoption came before a clear definition of the public problem it was meant to address.*

**Type:** `rating + optional open`
**Reaches for:** recognition. This question establishes that the gap is real *out there*, in the respondent's experience — not a verdict on the framework.

**Rating:** a frequency scale — *never seen this · seen it once or twice · seen it occasionally · seen it often · it is the norm*.

**Field label:** Your experience
**Open prompt (optional):** *If you have seen this, briefly describe what it looked like — and what tended to be driving it.*

**Supporting material (abstract):** the shared Cluster 1 setup is sufficient; no additional panel needed. The subtitle bounds the question to the respondent's *direct* experience in public administration, not their general impression of the sector. "AI adoption" is meant broadly — any system assisting or replacing an administrative decision.

**Note.** This is the questionnaire's opening question and it is deliberately the easiest thing in the instrument: a recognition question answerable from memory, with the open part optional. It carries the thesis's solution-first claim — the technology chosen, the justification assembled afterwards — which is the recognition form of the Layer-3 "deliberation about purpose before solution selection" absence. Across the sample this produces the single most important descriptive finding for Cluster 1: *do practitioners recognise the gap the framework is built to address.* If the sample broadly does not, that is itself a finding the thesis must report honestly. The two-sided open prompt also collects the *driver* texture — what was actually pushing adoption — without a forced-choice scale: the respondent names whatever was driving it (ministerial directive, funding, vendor initiative, modernisation pressure, several at once) in their own words. No rationale dependence — this is pure recognition of a pattern, not a judgment on a deliberate thesis choice. No "cannot judge" option on the frequency scale: see the cluster discussion notes on the non-verdict-option sweep.

---

# Movement 2 — Is it structural?

## Q1.2 — Institutional reshaping, as recognition

**Question.**
> When AI systems are introduced in public administration, have you seen the organisation adapt itself around the system rather than the system adapting to the organisation?

**Subtitle (scope note).**
> *This one pattern can show up as decision-making shifting from experienced staff toward the system, as the internal expertise to question the system weakening, or as problem definitions increasingly following the system rather than the institution.*

**Type:** `rating + optional open`
**Reaches for:** recognition. The respondent reports whether they have seen institutional reshaping in their own working experience.

**Rating:** a frequency scale — *never seen this · seen it once or twice · seen it occasionally · seen it often · it is the norm*.

**Field label:** In what ways
**Open prompt (optional):** *If yes, briefly describe what you have seen.*

**Supporting material (abstract):** the shared setup is sufficient; the subtitle carries the bounding. No rationale unit — this is a recognition question, not a choice-judging one. The scope note's three forms are presented as faces of *one pattern*, not as three separate things to rate; the supporting panel, if used, must preserve that — the question collects one frequency reading on institutional reshaping, with the open response carrying which forms the respondent has seen.

**Note.** This is the Layer-2 recognition question — institutional reshaping — and it restores the middle tier of the gap's three-layer structure to Cluster 1, which a deployment-and-strategy-only sequence would skip. Layer 2 is the transmission mechanism in the thesis's nested model: it is how the upstream structural conditions get *into* the downstream operational decisions. Without it, the cluster builds a two-tier problem and the M3 coverage question and M4 warrant question lose weight. The question was held as a single item rather than split into separate authority-migration and capacity-loss questions: the thesis's Layer 2 is *one layer* with three faces, splitting it into two questionnaire items would re-assert that they are two phenomena, and the instrument is an 8–15-respondent open-response validation instrument, not a survey powered for statistical decomposition — "does the practitioner recognise the pattern" is the bar, and one question with a tight subtitle meets it. The subtitle phrasing deliberately avoids the more normatively loaded earlier wording ("the sense of what the problem even is," "the vendor rather than the institution") which risked triggering defensiveness without adding analytical precision.

---

## Q1.3 — Who shapes the priorities? *(same screen as Q1.4)*

**Question.**
> In your judgement, to what extent are national AI priorities for public administration influenced by technology companies and consulting firms involved in AI strategy or implementation?

**Subtitle (scope note).**
> *The question is about firms with a commercial stake in AI being adopted. It is not asking about lobbying or external influence in general.*

**Type:** `rating + optional open`
**Reaches for:** judgment. The respondent assesses a power dynamic — who has influence over the agenda — not their own direct experience of a deployment.

**Rating:** an influence scale — *strongly influenced · somewhat influenced · slightly influenced · not influenced · cannot judge*.

**Field label:** Your reasoning
**Open prompt (optional):** *If you think they are influenced, in what way? If you disagree, what makes you confident the priorities are set independently?*

**Supporting material (abstract):** **RATIONALE-DEPENDENT.** The shared setup (which already establishes that the framings come from upstream), plus a **detailed-explanation** panel that establishes, in plain terms, the thesis's critical-political-economy position: that the visions driving public-sector AI are not arrived at neutrally but are co-produced with commercial interests — through industry participation in strategy consultation, through consultancies that advise government on AI strategy while also selling implementation services, and through the framing of AI adoption as a competitiveness imperative. The panel must establish *why this matters for governance* — that if the priorities themselves are shaped by interests, a deployment can be perfectly compliant with strategy and still be carrying those interests forward — so the respondent judges the thesis's structural claim about how agendas are produced, not an invitation to general cynicism about lobbying. The subtitle carries the *commercial-stake* specificity into the reading path; the panel carries the rationale.

**Note.** This is the first of the two strategy-level questions and it carries real validation weight: it tests the thesis's critical-political-economy claim directly, against practitioner judgment. The earlier "industry and other vested interests" phrasing was replaced because it flattened two distinct, theorised mechanisms — consultancy capture (the advise-and-sell conflict of interest) and vendor power — into a vague catch-all that could mean lobbying in general; "technology companies and consulting firms involved in AI strategy or implementation" names the actual pathway in plain language while keeping the consultocracy mechanism (the implementation half) intact. The subtitle holds the line that this is about *commercial* stake specifically. The "cannot judge" option matters here: a deployment-level practitioner may legitimately have no sightline into national strategy-setting, and that is itself worth recording.

---

## Q1.4 — Was there ever a deliberation about it? *(same screen as Q1.3)*

**Question.**
> Are you aware of any open discussion or consultation process about what the priorities for AI in public administration should be?

**Subtitle (scope note).**
> *This asks specifically about a process concerned with what the priorities should be — open to public-sector staff, civil society, or the public. It does not include consultation that gathers input on a plan or agenda already settled.*

**Type:** `rating + optional open`
**Reaches for:** recognition. This is close to a fact-recall question: did such a process happen, that you know of. The expected near-uniform "no" is itself the finding.

**Rating:** an awareness scale — *yes, I took part in or followed one · yes, I am aware one took place · I am not aware of any · I am fairly sure none took place*.

**Field label:** What you know of
**Open prompt (optional):** *If you are aware of one, what was it? If not, would such a process be worth having?*

**Supporting material (abstract):** the shared setup is sufficient — it has already established that the priorities are set upstream. The subtitle does the single most important bounding work in this question: it holds the distinction between *deliberation about what the priorities should be* and *consultation on an already-settled plan*. Without that line held, a respondent who recalls a public consultation answers "yes" to a question that was not asked. This subtitle is load-bearing and is not cut for length — removing it lets the respondent answer a different question.

**Note.** This is the empirical underside of Q1.3. Where Q1.3 asks the respondent to *judge* whether interests shape the priorities, Q1.4 asks them to *recall* whether democratic deliberation ever shaped them — and across the sample, a near-uniform "not aware of any" is a quietly powerful finding precisely because it is so concrete and so answerable. The deliberation-versus-consultation distinction is the constraint the question rests on. The optional open's second prompt ("would such a process be worth having?") converts a near-uniform "no" into something more than an absence — it surfaces whether practitioners think the absence matters. Shares a screen with Q1.3: one analytical unit (strategy-level priority-setting), two probes of it — a judgment question and its recognition counterpart — with two separate response inputs (the scales differ; a shared scale would muddle judgment and recognition) and two separate open prompts.

---

## Q1.5 — Are the layers connected?

**Question.**
> Do problems in individual AI deployments often reflect decisions or priorities set at higher policy levels?

**Subtitle (scope note).**
> *If so: can these problems usually be solved within the individual deployment itself, or do their causes often come from higher-level decisions such as procurement choices, institutional arrangements, or national strategy?*

**Type:** `rating + optional open`
**Reaches for:** judgment. The respondent assesses whether the layers are wired together — which is the nesting claim itself.

**Rating:** a connection scale — *clearly so · mostly · sometimes · rarely · not at all · cannot judge*.

**Field label:** An example
**Open prompt (optional):** *If you see them as connected, can you give an example of one feeding another? If you see them as mostly separate, what makes you confident they are?*

**Supporting material (abstract):** **RATIONALE-DEPENDENT.** The shared setup plus a **detailed-explanation** panel that establishes, plainly, what the thesis means by *connected*: not that the layers co-occur, but that the upstream layer *produces and constrains* the downstream one and the downstream feeds back. Without that, a practitioner judging the question cold may default to a shallow "well, they are all AI problems, so connected" — a yes that is not the nesting claim. The panel must establish the directional, generative sense of connection so the respondent judges the actual structural claim. The subtitle carries the *can-it-be-fixed-downstream* consequence into the reading path; the panel carries what "connected" means.

**Note.** This is the question that does the connecting work between M2 and M3. Q1.1 establishes the deployment layer; Q1.2 the institutional layer; Q1.3/Q1.4 the strategy layer — but those three are presented as separate phenomena. Q1.5 asks the respondent to step back and judge whether the layers *feed each other*: whether the gap is one self-reinforcing structure or three separate problems. That judgment is what makes the M3 coverage question (Q1.6) land — a single-level check cannot catch a problem whose defining property is that it runs across and between levels. The question was added because without it the cluster tests every layer but not the claim that binds them, and Q1.6 would float without its setup. Placed last in M2, after the three layers are on the table, because the step-back judgment only works once the pieces are visible — it cannot move earlier. It is the cluster's most cognitively demanding question even in this simplified form: it asks the respondent to see *across* layers, which is genuinely harder from any single vantage point than recognising a phenomenon within one. The "cannot judge" option matters more here than anywhere else in the cluster, and the example-seeking open prompt is what separates a real judgment from a shallow yes; Chapter 9's reading of these responses must attend to that distinction. The stem was simplified from an earlier two-clause version — "what produced it sits a layer up" was thesis-internal spatial language and was replaced with the concrete naming of the three levels (procurement, institutional arrangements, national strategy).

---

# Movement 3 — Do existing mechanisms address it?

## Q1.6 — Do existing checks examine it?

**Question.**
> Thinking about existing AI governance checks in your administration — audits, impact assessments, procurement rules, data-protection reviews — do they examine these broader organisational or policy issues, or mainly technical and legal compliance?

**Subtitle (scope note).**
> *The "broader issues" are the ones the previous questions raised: whether the problem was defined before the solution, whether the institution is being reshaped, where the priorities came from, and whether these connect.*

**Type:** `rating + optional open`
**Reaches for:** judgment, grounded in recognition. The respondent assesses the coverage of governance arrangements they actually work within.

**Rating:** a coverage scale — *examine them well · examine them partly · barely · mainly compliance only · these checks are not yet in place in my administration · not familiar enough to say*.

**Field label:** Closest process
**Open prompt (optional):** *Which process comes closest, and where are its limits?*

**Supporting material (abstract):** the shared setup, plus a brief **source** panel that lists common existing governance arrangements in plain terms and states, neutrally, what each is *for* — internal audits and model documentation check the system's properties; data-protection assessments check how personal information is handled; AI Act conformity checks examine the system against regulatory risk classes; procurement rules check the purchasing process. The panel describes their remit; it does **not** argue that they fall short — stating their remit neutrally is what makes the respondent's "mainly compliance only" answer meaningful rather than led. The subtitle anchors "broader issues" to the prior questions so the question is concrete rather than abstract.

**Note.** This is the question that earns the framework its right to exist — if practitioners say existing arrangements already examine the broader issues, the thesis's motivating claim is in trouble, and Chapter 9 should say so. It tests the thesis's §7.3 claim specifically: that existing mechanisms fail *not in degree but in scope* — they work at single levels, on technical and legal compliance, while the gap operates across all three levels. The panel's neutrality is the single most important drafting constraint in the cluster: if it editorialises about the existing arrangements' shortcomings, the question becomes leading and the finding becomes worthless. The rating scale carries **two distinct non-verdict options** — "not yet in place in my administration" and "not familiar enough to say." These are different findings: the first is a maturity-of-adoption signal, the second an awareness gap, and collapsing them would lose information Chapter 9 can use. The stem was rewritten from an earlier abstract version ("do they catch the layered gap") to the concrete compliance-versus-structural-scrutiny distinction, which is both clearer for the respondent and a sharper operationalisation of the thesis's claim.

---

# Movement 4 — What follows?

## Q1.7 — Is a recognise-and-name framework warranted?

**Question.**
> Would a framework that helps practitioners recognise and discuss these broader AI governance issues be useful in your work?

**Subtitle (scope note).**
> *The framework's purpose would be to give practitioners a structured way to recognise and discuss these issues — not necessarily to resolve them, which would take change beyond any single administration's reach.*

**Type:** `rating + optional open`
**Reaches for:** judgment.

**Rating:** a usefulness scale — *clearly useful · probably useful · unsure · probably not useful · clearly not useful*.

**Field label:** Your view
**Open prompt (optional):** *What would make it useful, or what makes you doubt it would be?*

**Supporting material (abstract):** **RATIONALE-DEPENDENT.** The shared setup plus a **detailed-explanation** panel that establishes the thesis's position on *why recognising and naming is itself a contribution*. This panel must do real work, because the obvious practitioner reaction to "a framework that only names a problem" is "that is not enough — I need something that fixes it." The panel must establish, in plain terms: that the thesis treats *revealing the gap* as the necessary first step; that a practitioner cannot contest or refuse what they cannot name; that the framework deliberately does not claim to *close* the gap because closing it requires political and structural change beyond any single deployment-level tool; and that a framework which *claimed* to close the gap would become the very kind of overpromising the thesis is critical of. The subtitle states the framework's purpose plainly but does not argue this case — the rationale stays in the panel, per the standing rule.

**Note.** This is the first full application of the "recognise-and-name, not resolve" lesson, and the M4 payoff: by here the respondent has judged a real gap (M1), that is structural and connected (M2), that existing checks do not examine (M3) — so "is a framework that names it warranted" lands with full weight. The earlier "visible and namable" phrasing was replaced with "recognise and discuss" in both stem and subtitle, as the more practitioner-natural register; the underlying point (you cannot contest what you cannot name) is preserved in the rationale panel. Risk: even with the panel, some respondents will mark "not useful" because they want a fix. That is a legitimate finding — but the panel ensures it is a finding about the *thesis's position*, not about the question's framing.

---

## Q1.8 — Have generative AI tools changed the picture?

**Question.**
> Have generative AI tools — chatbots, text-generation systems — changed the nature of AI governance challenges in public administration, or mainly increased their scale?

**Subtitle (scope note).**
> *The question is whether the governance problem these tools pose is a different kind of problem from earlier rule-based or more narrowly scoped systems, or the same kind of problem at a larger scale.*

**Type:** `rating + optional open`
**Reaches for:** both — recognition (have you seen change) and judgment (kind vs. degree).

**Rating:** *fundamentally changed the challenges · mostly changed them · mainly increased existing challenges · made little difference · cannot judge*.

**Field label:** The change you've seen
**Open prompt (optional):** *If they have changed things, what is the most important change you have seen?*

**Supporting material (abstract):** the shared setup, plus a short **detailed-explanation** panel giving the plain-language version of why the thesis treats generative LLMs as a qualitative shift and not just a bigger version of the same thing: their behaviour is not fully predictable in advance; the institution typically does not control or even see the model; and they substitute for communicative work — drafting, explaining, advising — in a way earlier systems did not. The panel explains the *kind vs. degree* distinction so the rating's middle options are meaningful. Mild RATIONALE-DEPENDENCE — the kind/degree distinction is the thesis's, and the panel must establish it or the respondent has no framework for the middle of the scale.

**Note.** This tests the thesis's RQ2 claim — the LLM qualitative-reconfiguration argument — against practitioner experience in public administration, and carries the RQ2 thread forward to Cluster 2. It is placed last in Cluster 1 because it is the most demanding recognition question: it asks the respondent to compare two eras of technology in their own PA work. The "cannot judge" option is important; a respondent whose work predates significant LLM adoption should not be forced to a verdict. The phrasing "earlier rule-based or more narrowly scoped systems" replaced an earlier "earlier, more predictable systems" — the latter risked implying that older systems actually were predictable or unproblematic, which contradicts the thesis's commitments; the revised phrasing is analytically safer.

---

## Cluster 1 — summary table

| Q | Movement | Asks about | Type | Reaches for | Rationale-dependent |
|---|---|---|---|---|---|
| Q1.1 | M1 — is it real | Solution-first adoption recognised in practice | rating + optional open | recognition | no |
| Q1.2 | M2 — is it structural | Institutional reshaping recognised in practice | rating + optional open | recognition | no |
| Q1.3 | M2 — is it structural | Priorities shaped by commercially interested firms | rating + optional open | judgment | **yes — full** |
| Q1.4 | M2 — is it structural | Awareness of any deliberation on the priorities | rating + optional open | recognition | no — subtitle must hold the deliberation/consultation line |
| Q1.5 | M2 — is it structural | Whether the layers are connected — upstream feeding downstream | rating + optional open | judgment | **yes — full** |
| Q1.6 | M3 — do checks address it | Whether existing checks examine the broader issues or only compliance | rating + optional open | judgment (grounded) | no — panel must stay neutral |
| Q1.7 | M4 — what follows | Whether a recognise-and-name framework is warranted | rating + optional open | judgment | **yes — full** |
| Q1.8 | M4 — what follows | Whether LLMs are a qualitative shift, not just scale | rating + optional open | both | mild |

## Cluster 1 — notes for the discussion

- **The cluster is a claim-dependency arc, not a production-chain walk.** The four movements follow the logical dependency of the thesis's argument: real (M1) → structural (M2) → uncovered by existing checks (M3) → therefore a framework is warranted (M4). Each movement depends on the previous one having been answered. This replaced the earlier "walks up the production chain" framing, which was both inaccurate (the production chain runs strategy → procurement → deployment, the opposite direction) and a weaker organising principle, since the thesis's gap is a nested structure, not a linear chain.
- **Eight questions, seven screens.** Q1.3 and Q1.4 share a screen as a judgment/recognition pair on one analytical unit (strategy-level priority-setting), with two separate response inputs and two separate open prompts. The other six questions are one screen each. Cluster 1 is the longest pre-framework stretch the respondent crosses; this is a deliberate accepted cost — the cluster's job is to build the connected multi-layer structure the rest of the instrument depends on, and each question carries a distinct claim. The respondent-time budget across the whole instrument is flagged at cluster-set level (see the cross-cluster consolidation), and if piloting shows the opening cluster runs heavy, the first trim candidate is the Q1.3/Q1.4 screen, not the validation core.
- **Every Cluster 1 question is `rating + optional open`.** Deliberate for the calibrating front cluster: it keeps the entry into the questionnaire light and fast, gives a countable spine, and never *obliges* a written answer while always inviting one. The obligatory `open-only` weight is concentrated in Clusters 2 and 3, where the respondent assesses the designed framework and its instruments — that is where written content carries the validation weight. Cluster 1's job is calibration plus the motivating findings. This is the generic-uptake ratings layer (ADR §8) doing its work as the texture of the problem cluster, not as a separable warm-up module.
- **Recognition and judgment alternate deliberately.** Q1.1 recognition, Q1.2 recognition, Q1.3 judgment, Q1.4 recognition, Q1.5 judgment, Q1.6 judgment-grounded, Q1.8 both. Two judgment/recognition pairs: Q1.3/Q1.4 (do interests *shape* the priorities / was there ever *deliberation*) and, more loosely, the M2 sequence as a whole moves from recognising the layers (Q1.2, and the recognition underside of Q1.3/Q1.4) to judging their connection (Q1.5).
- **Subtitles are scope notes, not rationale and not open prompts.** Each question carries a subtitle in the reading path — a syntactically complete sentence or two that bounds what the question means and what a good answer attends to (UI spec P5). The subtitle does not argue the thesis's case (that is the detailed-explanation panel's job, per the standing rule and P8) and it does not prompt the open response (that is the field-level open prompt). The test applied in trimming subtitles for length: does removing the sentence let a respondent answer a different question than the one intended? If yes, it stays even if it is longer than the stem — this is why Q1.4's deliberation-versus-consultation line and Q1.3's commercial-stake line were kept while Q1.1's redundant contrast clause and Q1.5's spatial metaphor were cut.
- **Three questions carry full rationale dependence:** Q1.3 (the critical-political-economy claim), Q1.5 (the nesting / connected-structure claim), and Q1.7 (the recognise-and-name-as-contribution rationale). Q1.6 carries a neutrality constraint rather than a rationale one — its panel must describe existing arrangements' remit without editorialising. Q1.8 carries mild rationale dependence (the kind/degree distinction). These four panels are the cluster's most important supporting-material drafting work.
- **Q1.6 is the load-bearing motivating question** — if practitioners say existing arrangements already examine the broader issues, the thesis's motivating claim is in trouble. Its panel's neutrality is the single most important drafting constraint in the cluster.
- **Q1.5 is the structural hinge** — it carries the nesting claim and is what makes Q1.6 land. It is also the cluster's hardest question; its "cannot judge" option and example-seeking open prompt are doing real work, and Chapter 9's reading of its responses must attend to the difference between a real cross-layer judgment and a shallow yes.
- **Q1.7 carries the recognise-and-name rationale** in M4 — it is the cluster's payoff question, landing with the weight of everything M1–M3 established. Its detailed-explanation panel is RATIONALE-DEPENDENT and must carry the *why naming-without-resolving is a contribution* argument; the subtitle states the framework's purpose plainly but does not argue it.
- **Open at cluster level (not blocking; carried to the cross-cluster consolidation):** (1) the non-verdict-option consistency sweep — Q1.1 and Q1.2 frequency scales have no "cannot judge" / non-verdict option while Q1.3–Q1.8 do; this is probably correct (a frequency question about one's own experience is answerable by anyone) but it should be a confirmed decision rather than an inconsistency; (2) the exact wording of Q1.1's and Q1.2's frequency scales; (3) Q1.7's detailed-explanation panel rationale content is specified in abstract but not drafted.
- **Decisions taken during the restructure:** the original Q1.1 and Q1.2 (which both probed solution-first framing at different levels and turned out to be one claim) were merged into the single solution-first recognition question now at Q1.1; the institutional-reshaping question (now Q1.2) was added to restore the gap's middle layer; the connection question (now Q1.5) was added to carry the nesting claim and set up Q1.6; the AI-washing concept is carried as a respondent-facing handle in Q1.1's supporting material rather than as its own question. The *distributional* pattern — AI concentrating in the state's coercive and control functions rather than its deliberative or service-enhancing ones — remains **deferred to interview**, not drafted as a Cluster 1 question.
