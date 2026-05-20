# C-9-Expert Questionnaire — Cluster 3: The Instruments

*Status: Working draft, reading path locked. Cluster 3 of 4. Eight-element per-question template, consistent with locked Cluster 1 and Cluster 2.*
*Tracker item: C-9-expert*

---

## Orientation for the reviewer of this draft

This is the third of four claim-clusters. Cluster 1 established **the problem** — the governance gap, where it sits, whether existing arrangements cover it, whether generative LLMs change it. Cluster 2 turned to **the framework** as the proposed response. Cluster 3 goes down one level: from the framework as a whole to **its four selected instruments as operational objects**. The cluster grouping is not a part-count commitment; Cluster 1's orientation states the standing position and it is not relitigated here.

**Cluster 3 covers the instruments.** Its job: take the four instruments the construct memo selects for operational-level evaluation (`memo_C9_expert_component_v1.md` §3.2) and put each one in front of the respondent as a working object — a procedure to judge for its operational purchase, not a design claim to assess. The four, in lifecycle-application order: the **Contextual Integrity Worksheet** and the **Architecture Selection Tool** at Stage 2 (design and procurement), then the **Discretion Migration Analysis** and the **Contestation Pathway Design** at Stage 3 (oversight and accountability).

**One screen per instrument.** Each instrument has a single screen: a **top panel** carrying the instrument as an object plus its maturity note, and a **bottom panel** carrying that instrument's two questions. There is no separate presentation screen — the instrument is persistently in view while the respondent answers. Four instrument screens, eight questions.

**Eight questions, two per instrument.** Q.1 is a quality judgment (does the instrument do distinctive, coherently structured analytical work — with design gaps folded into its open part) and carries a required open response; Q.2 is an applicability judgment (could a practitioner put it to work) and carries an optional open response. Between them they cover the construct memo's four Block-2 dimensions: Q.1 carries operational coherence, distinctive contribution, and identified gaps; Q.2 carries prompt-level applicability. The four required Q.1 open responses carry the cluster's validation weight.

**Cluster 3 is source-material-driven, not rationale-driven.** Cluster 2 was rationale-heavy because every question judged a deliberate design *choice*. Cluster 3 evaluates *operational objects*, so the supporting material each question needs is dominated by the **top panel** (the instrument as an object, plus its maturity note) and a **scope panel**, not by rationale cards. The one exception is the Contestation Pathway Design sub-block, which carries a mild rationale element — see its notes.

**Each question carries the eight-element template locked with Cluster 1:**
- **The question** — practitioner-facing, plain, short. The primary element in the reading path.
- **Subtitle (scope note)** — a syntactically complete sentence or two, in the reading path immediately under the question, that bounds what the question means and what a good answer attends to (UI spec P5). It carries scope — the meaning of the question, the object being judged, what is *not* in scope on this screen — not rationale, and it does not double as the open prompt.
- **Type** — `open-only` / `rating-only` / `rating + required open` / `rating + optional open`.
- **Reaches for** — *recognition* / *judgment* / both.
- **Rating** — the response scale.
- **Field label + open prompt** — the short label on the open-response field, and the prompt text inside it. On Q.1 the open response is required; on Q.2 it is optional.
- **Supporting material (abstract)** — what the screen's panels must establish, named by affordance: the *top panel* (persistent), a *scope panel*, a *detailed-explanation card*. The scope panel and detailed-explanation card are summonable overlays (UI spec §4.2–4.3); the top panel is persistently in view. Described, not drafted as final copy.
- **Note** — design reasoning, risks, instrument-specific analytical interest.

**Standing rule** (carried from Clusters 1 and 2): a question that asks a practitioner to judge a deliberate design choice without the supporting material carrying the *why* does not test the choice — it tests whether the respondent can reconstruct the missing rationale. In Cluster 3 only the Contestation Pathway Design sub-block carries a rationale element; the rest is carried by the instrument-as-object and the scope panels.

---

## Cluster 3 supporting material — the introductory grounding

Like Clusters 1 and 2, Cluster 3 opens with its own introductory grounding before the first instrument screen (F1, P8). It is **orientation only**: each instrument is presented as an object on its own screen's top panel, not from the cluster-level grounding — asking the respondent to hold all four instruments in mind from a single setup, across eight questions, would not satisfy P8 for the later instruments.

**What the introductory grounding must establish** — described in abstract:

- **What operational-level evaluation is.** Cluster 2 asked whether the framework's design is sound; Cluster 3 zooms in to four specific instruments judged as working objects. Name the shift of grain plainly.
- **The specification-versus-implementation distinction — in plain language, with a one-line example, and with no coined terms.** Each instrument has the form the framework specifies (its structure, prompts, the analytical questions it makes a practitioner ask) and the set-up work an institution needs to make it deployable (who fills which role, connection to existing records and systems, sector calibration). The framework specifies the first and leaves the second to the institution. The consequence to state: an instrument needing a lot of set-up work is a described property, not a fault. This is established **as comprehension, not probed as a construct** — the construct memo excludes C6'. It is load-bearing: every maturity note and every Q.2 rating depends on the respondent holding it.
- **What the per-instrument maturity notes are.** Each instrument's top panel opens with an honest statement of how mature its instrument is, because the four are not uniform (P7). Frame as engineered honesty, not a disclaimer. Tell the respondent the maturity note is the thing to read Q.1's "missing or concerning" against — a gap is a design fault, not the set-up work already named.
- **The four instruments and the lifecycle reading order.** CIW and AST at Stage 2, DMA and CPD at Stage 3 — the order a practitioner meets them across a deployment's life.
- **The Generative LLM Gate is not among the four.** One plain line: the GLG was judged at framework level in Cluster 2; it is a Stage 2 instrument too, but is not examined operationally here.
- **The "paperwork is not sacred" frame.** The judgment is about analytical work, not whether the template is well-formed as a document (ADR §2a).
- **The AST has an optional Explore overlay.** The AST's top panel is a screenshot / simplified application like the other three; an "Explore it" button summons an overlay for running the tool. State the firewall plainly: exploration is optional and not recorded — only the evaluation answers are.
- **The uniform question pattern.** Two questions per instrument, same order each time. Stating this up front means the respondent learns the form once.

**Neutral-presentation constraint.** The introductory grounding and each instrument's top panel present the instrument as a *described object* — what it is, what it does, how mature it is. They do not argue the case *for* it.

**Per-instrument screen layout.** One screen per instrument. The **top panel** carries the instrument as an object (a structured representation, or — for the AST — a screenshot / simplified application with the Explore button) plus its maturity note, and stays in view for both questions. The **bottom panel** carries the instrument's two questions. The top panel is gated like any spine screen (F2).

Carried-over frame for the whole cluster: **what the framework is for.** It makes a governance gap visible and namable, not resolved (Cluster 1 Q1.6) — so "distinctive analytical work" means useful for surfacing the gap, not useful as a fix.

---

# Sub-block A — Contextual Integrity Worksheet (Stage 2)

**Top panel.** The Contextual Integrity Worksheet as an object — a structured representation of the worksheet (its columns, the pre/post dual specification, the three-valued verdict scheme) in whatever form best communicates its logic — plus the maturity note. Persistent for both questions on the screen.

**Maturity note (abstract).** The P7 maturity statement, rendered practitioner-legibly. Substance from `memo_C8_instrument_maturity_vFinal.md` §8.1. Conveys: *high operational maturity, light set-up work to follow.* The instrument is essentially complete as a structure — its columns map directly onto a well-established privacy framework (Nissenbaum's contextual integrity and its five parameters), and it transfers across settings without structural change. It makes a deployment's information flows visible before and after the AI system, side by side in one row, and sorts each flow into three verdicts (appropriate / requires justification / refused), with deliberative attention concentrated on the middle. Set-up work is light and mostly procedural. The most operationally mature of the four — the reference point the other three are read against.

---

## Q3.1 — CIW: distinctive analytical work and coherence

**Question.**
> Does this instrument do distinctive analytical work, coherently structured?

**Subtitle (scope note).**
> *The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its parts fit together without overlapping. Anything "missing or concerning" means a fault in the instrument's own design — not the set-up work an institution would still need to do, which the maturity note above has already covered.*

**Type:** `rating + required open`
**Reaches for:** judgment.

**Rating:** *yes, clearly · broadly yes · uncertain · not really · no*.

**Field label:** What stands out, what's missing
**Open prompt (required):** *What does it do that's distinctive — and is anything about its design missing or concerning?*

**Supporting material (abstract):** the **top panel** (Worksheet-as-object plus maturity note, persistent on the screen). A **scope panel** doing three things: establishing that "distinctive analytical work" means whether the instrument makes a practitioner see and reason about something they would otherwise miss; establishing that "coherently structured" reaches for whether the parts do coherent, non-overlapping work; and holding the line that "missing or concerning" means a *design* fault, not the set-up work the maturity note already names. Carries the "paperwork is not sacred" frame. No rationale unit.

**Note.** The first instrument question, and the CIW is deliberately first: it is the maturity baseline. Expert agreement that the framework's most mature instrument does distinctive, coherent work is the **calibration anchor** for reading the other three sub-blocks. The "coherently structured" half quietly probes whether the five-parameter decomposition does real work or whether some columns collapse into others in practice. The "missing or concerning" half folds the design-gap question into Q.1's open part; the scope panel's design-not-completeness line keeps it from collecting set-up work. Candidate the respondent may surface: the worked-application coverage is thin (no filled illustrative row in the appendix template) — naming that is a substantive signal.

---

## Q3.2 — CIW: applicability in practice

**Question.**
> Could a practitioner put this instrument to work?

**Subtitle (scope note).**
> *This draws on your direct experience, not your general impression of the sector. The rating's middle option describes how much set-up work the instrument would still need before deployment — not a criticism of it.*

**Type:** `rating + optional open`
**Reaches for:** both — recognition and judgment.

**Rating:** *usable as it stands · usable, but only after substantial set-up work by the institution · not usable in its current form · cannot judge*.

**Field label:** Where it works, where it's hard
**Open prompt (optional):** *Where would it be usable, and where would it be hard to apply?*

**Supporting material (abstract):** the same **top panel**. A **scope panel** establishing the *direct*-working-experience framing (as Cluster 1 Q1.1 and Cluster 2 Q2.4 used), and clarifying that the rating's middle option is a reading of where the instrument sits on the specification-versus-implementation gradient, not a criticism.

**Note.** The rating is a **maturity-readiness scale**, not a satisfaction scale — it asks how much set-up work stands between specification and deployable tool, the deliberate distinction from the satisfaction-style framework-quality rating the instrument is built to avoid. For the CIW the answer is expected to cluster at "usable as it stands"; the predictability is not a wasted question — confirmed convergence at the top of the gradient is the calibration finding, and a *failure* to converge is a finding the question exists to catch. The rating is **uniform across all four instruments**: uniformity gives Chapter 9 a comparable cross-instrument reading and keeps the maturity claim in the openly-stated maturity note rather than leaked through a format difference.

---

# Sub-block B — Architecture Selection Tool (Stage 2)

**Top panel.** The Architecture Selection Tool as an object — a screenshot / simplified application of the Tool, showing enough of its logic to communicate what it does — plus the maturity note, and an **"Explore it" button** that summons an overlay for running the Tool against a deployment scenario. Free operation is *explore mode*, firewalled from the evaluation questions (F5, P6): exploration is optional and not recorded; only the evaluation answers are. Persistent for both questions on the screen.

**Maturity note (abstract).** The P7 maturity statement, rendered practitioner-legibly. Substance from `memo_C8_instrument_maturity_vFinal.md` §8.2. Conveys: *high operational maturity, modest set-up work to follow.* The AST runs the Stage 2 architectural decision as a five-phase procedure — describe the deployment; identify the governance requirements it activates; read which architectures are compatible; apply per-architecture conditions and a deployment-wide distributional safeguard; record the decision. It does not merely rank — it returns three verdicts (select an architecture / escalate for governance decision / stop and reframe). Surviving architectures are presented in order of how governable they are, a relationship the thesis argues in Chapter 7; departing from that order requires a documented reason. Set-up work is modest. If the procedure selects a generative-LLM architecture, the Tool hands off to a separate check, the Generative LLM Gate — visible in the Tool, but not evaluated here.

---

## Q3.3 — AST: distinctive analytical work and coherence

**Question.**
> Does this instrument do distinctive analytical work, coherently structured?

**Subtitle (scope note).**
> *The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its parts fit together without overlapping — judged on the analytical procedure the tool runs, not on how the widget looks or feels to operate. Anything "missing or concerning" means a fault in the instrument's own design — not the set-up work an institution would still need to do, which the maturity note above describes.*

**Type:** `rating + required open`
**Reaches for:** judgment.

**Rating:** *yes, clearly · broadly yes · uncertain · not really · no*.

**Field label:** What stands out, what's missing
**Open prompt (required):** *What does it do that's distinctive — and is anything about its design missing or concerning?*

**Supporting material (abstract):** the **top panel** (the AST as a screenshot / simplified application plus maturity note, with the Explore button). A **scope panel** establishing that the AST's claimed contribution is treating the choice of architecture as a *governance* decision rather than a technical-procurement one; and that the judgment is about the AST's *analytical procedure*, not how the optional Explore overlay looks or feels to operate (construct-contamination risk). Carries the "design gap" line and "paperwork is not sacred." No rationale unit.

**Note.** The AST is probed in its unified Session-091 form (construct memo §3.2 note): five-phase structure, embedded Compatibility Table read not filled, three-verdict typology, governability ordering carrying §7.4's inverse capability-governability principle, conditional GLG handoff. The optional Explore overlay lets a respondent run the Tool; exploration is firewalled from the evaluation answers (F5) — free runs are not recorded. The AST is the operationally richest of the four, and whether two uniform questions under-probe it is an open decision (see discussion).

---

## Q3.4 — AST: applicability in practice

**Question.**
> Could a practitioner put this instrument to work?

**Subtitle (scope note).**
> *This draws on your direct experience. The question is whether the instrument could be used in practice — the rating's middle option describes the set-up work still needed, not a criticism.*

**Type:** `rating + optional open`
**Reaches for:** both — recognition and judgment.

**Rating:** *usable as it stands · usable, but only after substantial set-up work by the institution · not usable in its current form · cannot judge*.

**Field label:** Where it works, where it's hard
**Open prompt (optional):** *Where would it be usable, and where would it be hard to apply?*

**Supporting material (abstract):** the same **top panel**. A **scope panel** carrying the direct-experience framing and the maturity-readiness clarification (as Q3.2).

**Note.** The AST follows the same two-question shape as the other three; the optional Explore overlay sits outside what the questions ask about, so nothing in Q3.3 or Q3.4 depends on the respondent having run the Tool. The interesting open responses will be about whether the procedure maps onto how an architectural decision is actually taken in the respondent's institution — or whether it is taken at all, or by someone with no governance remit. Same uniform maturity-readiness rating as the other three.

---

# Sub-block C — Discretion Migration Analysis (Stage 3)

**Top panel.** The Discretion Migration Analysis as an object — a structured representation of the template (the migration-mapping columns and the oversight-response columns) — plus the maturity note. Persistent for both questions on the screen.

**Maturity note (abstract).** The P7 maturity statement, rendered practitioner-legibly. Substance from `memo_C8_instrument_maturity_vFinal.md` §8.3. Conveys: *medium operational maturity, with more set-up work to follow than the first two instruments.* The DMA maps, for each class of administrative decision, how decision-making authority moves when an AI system is introduced — who loses it, who acquires it — then specifies the oversight response: who can override the system, on what timeline, with what information, with what safeguards against staff over-trusting it. The analytical machinery is general-purpose; the theoretical grounding traces cleanly into the column structure. One known structural gap, named honestly: the framework establishes a four-level scheme for *where* discretion sits in an earlier instrument, but the migration template does not carry it through. Set-up work is more substantial — identifying the institution's own decision classes, mapping override authority onto real governance roles, calibrating review timelines to sector.

---

## Q3.5 — DMA: distinctive analytical work and coherence

**Question.**
> Does this instrument do distinctive analytical work, coherently structured?

**Subtitle (scope note).**
> *The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its parts fit together without overlapping. Anything "missing or concerning" means a fault in the instrument's own design — not the set-up work an institution would still need to do, which the maturity note above has already covered.*

**Type:** `rating + required open`
**Reaches for:** judgment.

**Rating:** *yes, clearly · broadly yes · uncertain · not really · no*.

**Field label:** What stands out, what's missing
**Open prompt (required):** *What does it do that's distinctive — and is anything about its design missing or concerning?*

**Supporting material (abstract):** the **top panel** (DMA-as-object plus maturity note). A **scope panel** establishing that the DMA's claimed contribution is making visible something that otherwise happens silently — the migration of decision-making authority away from front-line staff into system behaviour, and what oversight that calls for — plus the design-gap line and "paperwork is not sacred." No rationale unit.

**Note.** The respondent's first step below high maturity; the maturity note has prepared them. The "coherently structured" half has specific bite here: the maturity memo records the "override authority" column packs three sub-fields into one cell, and the template asks for automation-bias safeguards with no taxonomy supplied — both coherence-of-structure issues an expert might surface. This sub-block carries the **clearest single convergent-signal opportunity** in the cluster: the maturity note names a concrete design gap (the four-level discretion typology not carried through), and the value is in whether an expert, told the framework knows of one gap, confirms it or finds more.

---

## Q3.6 — DMA: applicability in practice

**Question.**
> Could a practitioner put this instrument to work?

**Subtitle (scope note).**
> *This draws on your direct experience, not your general impression of the sector. "Hard to apply" means difficulty in the instrument's own design — not the set-up work an institution would still need to do, which is what the rating's middle option records.*

**Type:** `rating + optional open`
**Reaches for:** both — recognition and judgment.

**Rating:** *usable as it stands · usable, but only after substantial set-up work by the institution · not usable in its current form · cannot judge*.

**Field label:** Where it works, where it's hard
**Open prompt (optional):** *Where would it be usable, and where would it be hard to apply?*

**Supporting material (abstract):** the same **top panel**. A **scope panel** carrying the direct-experience framing and the maturity-readiness clarification; the optional open's "hard to apply" must reach for *design* difficulty, not re-collect the set-up work — the rating is where the set-up work registers.

**Note.** The DMA is where the maturity-readiness rating's middle option starts doing real work — for the CIW and AST the rating is largely a calibration confirmation, but for the DMA "usable after substantial work" is a live and expected verdict, and the spread across the scale is a genuine finding. The interesting open responses will be about whether a practitioner can identify their institution's decision classes well enough to use the template at all.

---

# Sub-block D — Contestation Pathway Design (Stage 3)

**Top panel.** The Contestation Pathway Design as an object — a structured representation of the six-dimension specification table (Notification, Explanation, Channel accessibility, Human reviewer with substantive authority, Timeline, Feedback loop), showing which parts the framework pre-fills and which are left open for the institution — plus the maturity note. This sub-block's top panel and scope panels carry the cluster's only **mild rationale element**. Persistent for both questions on the screen.

**Maturity note (abstract).** The P7 maturity statement, rendered practitioner-legibly. Substance from `memo_C8_instrument_maturity_vFinal.md` §8.4. Conveys: *lower-medium operational maturity, the most set-up work of the four, and the one instrument that formally needs full institutional configuration to give honest output.* The CPD specifies six interlocking dimensions of how an affected person can challenge an algorithmic decision. The framework pre-fills the general specification for each dimension; the deployment-specific specification and the verification methods are left open for the institution. **This openness is deliberate, and the maturity note must say so as a described property, not a shortfall:** whether a pathway is genuinely usable can only be assessed against the populations it serves, so the framework cannot honestly pre-fill it. It anchors the lower-maturity end of the gradient by design.

---

## Q3.7 — CPD: distinctive analytical work and coherence

**Question.**
> Does this instrument do distinctive analytical work, coherently structured?

**Subtitle (scope note).**
> *The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its six dimensions fit together as the right interlocking set. Most of those dimensions are deliberately left for the institution to fill in — and that openness is how the instrument is meant to work, not a sign it is unfinished.*

**Type:** `rating + required open`
**Reaches for:** judgment.

**Rating:** *yes, clearly · broadly yes · uncertain · not really · no*.

**Field label:** What stands out, what's missing
**Open prompt (required):** *What does it do that's distinctive — and is anything about its design missing or concerning?*

**Supporting material (abstract):** the **top panel** (CPD-as-object plus maturity note). A **scope panel** establishing that the CPD's claimed contribution is structuring the difference between contestation rights that are *formally specified* and contestation that is *operationally reachable*. **Mild rationale element:** because the six dimensions are mostly left open for the institution, the respondent could read "coherently structured / anything missing" as "the table is half-empty, so no" — the scope panel must establish, as a described property, that the framework's claim is that the six dimensions are the *right interlocking set* and the openness is honesty about what cannot be pre-filled, not the instrument being unfinished. Carries "paperwork is not sacred."

**Note.** The CPD is the lowest-maturity of the four, and its sub-block carries the cluster's only genuine rationale work. Without the scope panel's deliberate-openness point, this question collects "it's incomplete" — true at the template-fill level, beside the point at the analytical level. The "coherently structured" half is genuinely live: the maturity memo records the six dimensions' grounding "operates across the dimensions rather than mapping onto specific columns" — a looser structure than the CIW's one-to-one mapping. Known candidate: the verification-mechanism dimension asks the practitioner to design verification methods with no taxonomy supplied — an arguable design gap distinct from the deliberate openness, and an expert distinguishing the two is a strong signal the rationale element landed.

---

## Q3.8 — CPD: applicability in practice

**Question.**
> Could a practitioner put this instrument to work?

**Subtitle (scope note).**
> *This draws on your direct experience. Because the instrument is mostly left for the institution to fill in, the question is not whether its table can be completed — it is whether its six-dimension structure is one a practitioner could take up and reason with.*

**Type:** `rating + optional open`
**Reaches for:** both — recognition and judgment.

**Rating:** *usable as it stands · usable, but only after substantial set-up work by the institution · not usable in its current form · cannot judge*.

**Field label:** Where it works, where it's hard
**Open prompt (optional):** *Where would it be usable, and where would it be hard to apply?*

**Supporting material (abstract):** the same **top panel**. A **scope panel** carrying the direct-experience framing and the maturity-readiness clarification, working harder than any other in the cluster: the maturity note has told the respondent this instrument needs the most set-up work and formally requires full configuration, so "could you put it to work" risks a flat "no, not until the institution does the work" — true but uninformative. The scope panel must redirect the open response to whether the *six-dimension analytical structure* is one a practitioner could take up and reason with. The rating is where the high set-up dependency registers.

**Note.** The CPD's design makes the applicability rating almost foregone — but, as with the CIW at the other end of the gradient, the foregone answer confirmed across the sample is the calibration finding, and a departure from it is a finding the question exists to catch. The open response carries the real value here; the scope panel's redirect — from "is the table fillable" to "is the six-dimension structure a usable way of reasoning" — is the single most important drafting constraint in the sub-block. Most likely question in the cluster to need a piloting rewrite; the named contingency is to move the redirect into the stem itself — make the stem ask whether the six-dimension structure is a usable way of reasoning about whether contestation is genuinely reachable. Cluster 3 closes here and hands forward to Cluster 4.

---

## Cluster 3 — summary table

| Instrument | Q | Asks | Maturity | Type | Reaches for | Rationale-dependent |
|---|---|---|---|---|---|---|
| Contextual Integrity Worksheet | Q3.1 | distinctive analytical work + coherence (+ design gaps in open part) | high / light set-up work | rating + required open | judgment | no |
| Contextual Integrity Worksheet | Q3.2 | applicability | high / light set-up work | rating + optional open | both | no |
| Architecture Selection Tool | Q3.3 | distinctive analytical work + coherence (+ design gaps in open part) | high / modest set-up work | rating + required open | judgment | no |
| Architecture Selection Tool | Q3.4 | applicability | high / modest set-up work | rating + optional open | both | no |
| Discretion Migration Analysis | Q3.5 | distinctive analytical work + coherence (+ design gaps in open part) | medium / medium-high set-up work | rating + required open | judgment | no |
| Discretion Migration Analysis | Q3.6 | applicability | medium / medium-high set-up work | rating + optional open | both | no |
| Contestation Pathway Design | Q3.7 | distinctive analytical work + coherence (+ design gaps in open part) | lower-medium / high set-up work; full-config-required | rating + required open | judgment | **mild** |
| Contestation Pathway Design | Q3.8 | applicability | lower-medium / high set-up work; full-config-required | rating + optional open | both | **mild** |

## Cluster 3 — notes for the discussion

- **Uniform two-question template, eight questions total.** Q.1 quality judgment, Q.2 applicability judgment, per instrument. Covers the construct memo's four Block-2 dimensions (Q.1 carries three, Q.2 carries applicability). Uniformity buys cross-instrument comparability — the respondent learns the question form once; the cognitive work is in the four different objects. The Q.1 and Q.2 titles are identical across all four instruments.
- **One screen per instrument.** Top panel: the instrument as an object plus its maturity note, persistent for both questions. Bottom panel: the instrument's two questions. No separate presentation screen. This is a structural variation from Clusters 1 and 2 (one analytical unit per screen) but consistent with the Cluster 1 precedent of Q1.3/Q1.4 sharing a screen as a judgment/recognition pair on one analytical unit — Cluster 3's Q.1/Q.2 are a quality/applicability pair on one analytical unit, the instrument. The cost: the instrument screen is the heaviest in the instrument set — top panel plus two questions, one with a required open — and is the respondent-time pressure point flagged for the cross-cluster consolidation.
- **The cluster runs on a rating spine; Q.1's open response required, Q.2's optional.** An earlier pass made all eight questions open-only and produced a respondent-load cliff exactly where the validation weight sits. The rating spine with a required Q.1 open places four obligatory open items in the cluster — enough to carry the construct memo's open-response-heavy Block 2 intent without the cliff. The four required Q.1 open responses are where the cluster's validation weight sits.
- **No coined terminology in any stem, subtitle, or rating label.** The specification-versus-implementation distinction is established in the introductory grounding in plain language; the reading path uses "set-up work" and "the maturity note above," not Pass-1/Pass-2 vocabulary or "institution-side work." Thesis vocabulary stays in the supporting-material panels (P5, P8) — the register Clusters 1 and 2 hold.
- **The Q.2 rating is a maturity-readiness scale, uniform across all four.** It asks how much set-up work stands between specification and deployable tool — recognition-grounded, deliberately not a satisfaction scale (the DGSB / Durkiewicz comparator lesson). Uniform rather than selective for three reasons: a confirmed convergence at a predictable point is itself the calibration finding; selective formatting would leak the maturity assessment into the instrument design; and uniformity gives Chapter 9 a comparable cross-instrument reading. Collapsing the rating for the high-maturity two is a piloting fallback, not a launch design.
- **Cluster arc: CIW → AST → DMA → CPD is both lifecycle order and maturity-descending.** The construct memo's lifecycle ordering happens to run down the maturity gradient. Opening with the most mature instrument calibrates the respondent before they step down, so the CPD's lower maturity reads as a position on a gradient they have a fixed point for, not as a weak instrument.
- **The AST has an optional Explore overlay.** The AST's top panel is a screenshot / simplified application like the other three; an "Explore it" button summons an overlay for running the Tool. Exploration is optional and firewalled from the evaluation answers (F5) — free runs are not recorded; only the locked evaluation answers are. The AST therefore follows the same two-question logic as the other three; nothing in Q3.3 or Q3.4 depends on the respondent having explored. Q3.4's title was de-tailored from an earlier "Having run the tool…" stem for exactly this reason — with Explore optional, a stem presuming the respondent has run the Tool would make exploration de facto mandatory.
- **Maturity-note rendering — flagged for author sign-off.** The construct memo (§3.2, §3.3) and UI spec (P7) say the maturity statements are "directly lifted" from `memo_C8_instrument_maturity_vFinal.md` §8.1–8.4. This draft treats those statements as the **source of truth for the maturity claim** but renders the claim in practitioner-legible plain language rather than reproducing the thesis register verbatim — consistent with ADR §2a's "paperwork is not sacred." This is a genuine deviation from the memo's "direct lifting" wording and should be confirmed, not absorbed silently.
- **What Cluster 3 does not cover.** The Generative LLM Gate is not evaluated operationally (probed at framework level in Cluster 2 Q2.7). Cross-instrument synthesis is not re-opened (C3', handled at overview level in Cluster 2 Q2.5). The §8.2 preparatory cluster and the remaining lifecycle instruments are not examined — the construct memo §3.2 selects exactly these four. The self-limitation construct (C5') is reserved for Cluster 4 and interview deepening.
- **Open decisions for the review round.** (1) **Does the AST warrant a third, AST-specific question?** It is the operationally richest of the four; the draft holds the uniform two-question template for comparability, but a third question on the three-verdict typology or the governability ordering is a live option. (2) **Q3.8 (CPD applicability) may need a piloting rewrite** if the scope panel cannot keep open responses off the template-fill answer; the named contingency is to move the redirect into the stem. (3) **Explore-mode capture on the AST** — whether to capture a lightweight engagement-fact signal as a validity control; deferred to a later UI-spec / data-schema pass.
