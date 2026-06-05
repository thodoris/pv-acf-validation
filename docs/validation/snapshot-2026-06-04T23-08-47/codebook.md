# PV-ACF validation — SHORT-variant codebook

Data dictionary for the SHORT instrument, generated from `CONTENT` + `variants.ts` by `npm run codebook`. One entry per analysis variable. Variable names match the columns in the dataset produced by `npm run dataset`.

## Coding conventions

- **Ratings** are coded as the **1-based position** of the chosen option (the `Code` column below). A blank cell means the item was not answered (NA).
- **Profile select fields** (institution type, years) are coded to the 1-based position of the matched option label.
- **Open-text** and free-text profile fields (name, institution name) carry verbatim responses; they are **restricted** to the author dataset and never appear in the anonymised copy.
- **Non-substantive options** (`Substantive = no` — "Cannot judge", "Not familiar enough to say", "These checks are not yet in place …") are **kept at their scale position** in the dataset. The report counts them separately as a no-opinion / not-applicable rate. Recode them to missing before any interval treatment of the scale.
- **Measure**: `ordinal` scales support median / rank stats; `nominal` (institution type, the "which gap mattered most" composite) are categorical; `text` are free responses.

Total variables: **43**.

## Profile

#### `profile_name` — optional · **restricted** (omitted from anonymised dataset)

- Location: Profile · A few details about you
- Question: Your full name
- Type: role: profile-text · measure: text

#### `profile_institutionname` — optional · **restricted** (omitted from anonymised dataset)

- Location: Profile · A few details about you
- Question: Your institution
- Type: role: profile-text · measure: text

#### `profile_institution` — required

- Location: Profile · A few details about you
- Question: Type of institution
- Type: role: profile-coded · measure: nominal

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | National government or public administration body | yes |
| 2 | Regional or local government body | yes |
| 3 | Regulator or oversight body | yes |
| 4 | Academia or research institution | yes |
| 5 | Civil society organisation | yes |
| 6 | Other | yes |

#### `profile_years` — required

- Location: Profile · A few details about you
- Question: Years working in public administration
- Type: role: profile-coded · measure: ordinal

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | None / not applicable | yes |
| 2 | Under 5 years | yes |
| 3 | 5–10 years | yes |
| 4 | 11–20 years | yes |
| 5 | Over 20 years | yes |

## Chapter 1 — Problem

#### `c1_q1_rating` — required

- Location: Problem · M1 — Is the gap real? · Solution-first adoption
- Question: Have you seen cases where AI was adopted first, and the justification for using it came afterwards?
- Subtitle: This draws on your direct experience in public administration, not your general impression of the sector — cases where AI adoption came before a clear definition of the public problem it was meant to address.
- Type: role: rating · measure: ordinal · scale: frequency

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Never seen this | yes |
| 2 | Seen it once or twice | yes |
| 3 | Seen it occasionally | yes |
| 4 | Seen it often | yes |
| 5 | It is the norm | yes |

#### `c1_q1_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Problem · M1 — Is the gap real? · Solution-first adoption
- Question: Have you seen cases where AI was adopted first, and the justification for using it came afterwards?
- Subtitle: This draws on your direct experience in public administration, not your general impression of the sector — cases where AI adoption came before a clear definition of the public problem it was meant to address.
- Type: role: open · measure: text
- Prompt: If you have seen this, briefly describe what it looked like — and what tended to be driving it.

#### `c1_q2_rating` — required

- Location: Problem · M2 — Is it structural? · Institutional reshaping
- Question: When AI systems are introduced in public administration, have you seen the organisation adapt itself around the system rather than the system adapting to the organisation?
- Subtitle: This one pattern can show up as decision-making shifting from experienced staff toward the system, as the internal expertise to question the system weakening, or as problem definitions increasingly following the system rather than the institution.
- Type: role: rating · measure: ordinal · scale: frequency

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Never seen this | yes |
| 2 | Seen it once or twice | yes |
| 3 | Seen it occasionally | yes |
| 4 | Seen it often | yes |
| 5 | It is the norm | yes |

#### `c1_q2_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Problem · M2 — Is it structural? · Institutional reshaping
- Question: When AI systems are introduced in public administration, have you seen the organisation adapt itself around the system rather than the system adapting to the organisation?
- Subtitle: This one pattern can show up as decision-making shifting from experienced staff toward the system, as the internal expertise to question the system weakening, or as problem definitions increasingly following the system rather than the institution.
- Type: role: open · measure: text
- Prompt: If yes, briefly describe what you have seen.

#### `c1_q3q4_q1_3_rating` — required

- Location: Problem · M2 — Is it structural? · Strategy-level priority-setting
- Question: In your judgement, to what extent are the national AI priorities, as set out in AI strategies and vision documents, influenced by technology companies and consulting firms involved in AI strategy or implementation?
- Subtitle: The question is about firms with a commercial stake in AI being adopted, in any form of involvement — consultation, advisory, drafting, or implementation. It is not asking about lobbying in general.
- Type: role: rating · measure: ordinal · scale: influence

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Strongly influenced | yes |
| 2 | Somewhat influenced | yes |
| 3 | Slightly influenced | yes |
| 4 | Not influenced | yes |
| 5 | Cannot judge | **no** |

#### `c1_q3q4_q1_3_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Problem · M2 — Is it structural? · Strategy-level priority-setting
- Question: In your judgement, to what extent are the national AI priorities, as set out in AI strategies and vision documents, influenced by technology companies and consulting firms involved in AI strategy or implementation?
- Subtitle: The question is about firms with a commercial stake in AI being adopted, in any form of involvement — consultation, advisory, drafting, or implementation. It is not asking about lobbying in general.
- Type: role: open · measure: text
- Prompt: If you think they are influenced, in what way? If you disagree, what makes you confident the priorities are set independently?

#### `c1_q3q4_q1_4_rating` — required

- Location: Problem · M2 — Is it structural? · Strategy-level priority-setting
- Question: Are you aware of any open discussion or consultation process about what the national AI priorities, as set out in AI strategies and vision documents, should be?
- Subtitle: This asks about a process open to public-sector staff, civil society, or the public, concerned with what those priorities should be. It does not include consultation on a plan or agenda already settled.
- Type: role: rating · measure: ordinal · scale: awareness

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Yes — I took part in or followed one | yes |
| 2 | Yes — I am aware one took place | yes |
| 3 | I am not aware of any | yes |
| 4 | I am fairly sure none took place | yes |

#### `c1_q3q4_q1_4_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Problem · M2 — Is it structural? · Strategy-level priority-setting
- Question: Are you aware of any open discussion or consultation process about what the national AI priorities, as set out in AI strategies and vision documents, should be?
- Subtitle: This asks about a process open to public-sector staff, civil society, or the public, concerned with what those priorities should be. It does not include consultation on a plan or agenda already settled.
- Type: role: open · measure: text
- Prompt: If you are aware of one, what was it? If not, would such a process be worth having?

#### `c1_q5_rating` — required

- Location: Problem · M2 — Is it structural? · Are the layers connected?
- Question: In your judgement, do problems in individual AI deployments often reflect decisions or priorities set at higher policy levels?
- Subtitle: The question is whether problems in an AI deployment can usually be addressed within the deployment itself, or whether their causes often come from higher-level decisions — such as procurement choices, institutional arrangements, or national strategy.
- Type: role: rating · measure: ordinal · scale: connection

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Clearly so | yes |
| 2 | Mostly | yes |
| 3 | Sometimes | yes |
| 4 | Rarely | yes |
| 5 | Not at all | yes |
| 6 | Cannot judge | **no** |

#### `c1_q5_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Problem · M2 — Is it structural? · Are the layers connected?
- Question: In your judgement, do problems in individual AI deployments often reflect decisions or priorities set at higher policy levels?
- Subtitle: The question is whether problems in an AI deployment can usually be addressed within the deployment itself, or whether their causes often come from higher-level decisions — such as procurement choices, institutional arrangements, or national strategy.
- Type: role: open · measure: text
- Prompt: If you see them as connected, can you give an example of one feeding another? If you see them as mostly separate, what makes you confident they are?

#### `c1_q6_rating` — required

- Location: Problem · M3 — Do existing mechanisms address it? · What existing checks examine
- Question: In your administration, do existing AI governance checks — audits, impact assessments, procurement rules, data-protection reviews — examine these broader organisational or policy issues, or mainly technical and legal compliance?
- Subtitle: The “broader issues” are the ones the previous questions raised: whether the problem was defined before the solution, whether the institution is being reshaped, where the priorities came from, and whether these connect.
- Type: role: rating · measure: ordinal · scale: coverage

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Examine them well | yes |
| 2 | Examine them partly | yes |
| 3 | Barely | yes |
| 4 | Mainly compliance only | yes |
| 5 | These checks are not yet in place in my administration | **no** |
| 6 | Not familiar enough to say | **no** |

#### `c1_q6_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Problem · M3 — Do existing mechanisms address it? · What existing checks examine
- Question: In your administration, do existing AI governance checks — audits, impact assessments, procurement rules, data-protection reviews — examine these broader organisational or policy issues, or mainly technical and legal compliance?
- Subtitle: The “broader issues” are the ones the previous questions raised: whether the problem was defined before the solution, whether the institution is being reshaped, where the priorities came from, and whether these connect.
- Type: role: open · measure: text
- Prompt: Which process comes closest, and where are its limits?

#### `c1_q8_rating` — required

- Location: Problem · M4 — What follows? · Have generative AI tools changed the picture?
- Question: Have generative AI tools — chatbots, text-generation systems — changed the nature of AI governance challenges in public administration, or mainly increased their scale?
- Subtitle: The question is whether generative AI creates qualitatively different governance problems, mainly amplifies familiar problems from earlier AI systems, or does both.
- Type: role: rating · measure: ordinal · scale: kind-vs-degree

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Changed the nature of the challenges | yes |
| 2 | Both changed their nature and increased their scale | yes |
| 3 | Mainly increased the scale of familiar challenges | yes |
| 4 | Neither the nature nor the scale has shifted much | yes |
| 5 | Cannot judge | **no** |

#### `c1_q8_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Problem · M4 — What follows? · Have generative AI tools changed the picture?
- Question: Have generative AI tools — chatbots, text-generation systems — changed the nature of AI governance challenges in public administration, or mainly increased their scale?
- Subtitle: The question is whether generative AI creates qualitatively different governance problems, mainly amplifies familiar problems from earlier AI systems, or does both.
- Type: role: open · measure: text
- Prompt: If they have changed things, what is the most important change you have seen?

## Chapter 2 — Framework

#### `c2_q1_rating` — required

- Location: Framework · Architecture · Is the two-layer structure useful?
- Question: In your judgement, is organising the framework as a two-layer structure — a diagnostic layer followed by an operational lifecycle — a reasonable and useful way to govern AI deployments?
- Subtitle: The framework separates an initial diagnostic layer from the operational lifecycle that follows. The question is whether that overall structure is useful and workable — not whether the diagnostic layer connects to the operational lifecycle in the right way.
- Type: role: rating · measure: ordinal · scale: soundness

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | A sound approach | yes |
| 2 | Broadly reasonable | yes |
| 3 | Uncertain | yes |
| 4 | A questionable approach | yes |
| 5 | Not a sound approach | yes |

#### `c2_q1_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Framework · Architecture · Is the two-layer structure useful?
- Question: In your judgement, is organising the framework as a two-layer structure — a diagnostic layer followed by an operational lifecycle — a reasonable and useful way to govern AI deployments?
- Subtitle: The framework separates an initial diagnostic layer from the operational lifecycle that follows. The question is whether that overall structure is useful and workable — not whether the diagnostic layer connects to the operational lifecycle in the right way.
- Type: role: open · measure: text
- Prompt: If you wish, say what makes the approach reasonable, or where you would question it.

#### `c2_q2_rating` — required

- Location: Framework · Recursive cycle · AI governance as a recurring cycle
- Question: In your judgement, is it a sound structural commitment to treat AI governance as an ongoing review cycle in which a deployment is re-justified at each cycle rather than continuing automatically?
- Subtitle: The framework treats AI governance as an ongoing review cycle rather than a one-time approval: a deployment is expected to be re-justified over time rather than continuing automatically. The question asks whether this is a sound structural commitment — not whether it adds to review workload.
- Type: role: rating · measure: ordinal · scale: soundness

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | A sound commitment | yes |
| 2 | Broadly reasonable | yes |
| 3 | Uncertain | yes |
| 4 | A questionable commitment | yes |
| 5 | Not a sound commitment | yes |

#### `c2_q2_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Framework · Recursive cycle · AI governance as a recurring cycle
- Question: In your judgement, is it a sound structural commitment to treat AI governance as an ongoing review cycle in which a deployment is re-justified at each cycle rather than continuing automatically?
- Subtitle: The framework treats AI governance as an ongoing review cycle rather than a one-time approval: a deployment is expected to be re-justified over time rather than continuing automatically. The question asks whether this is a sound structural commitment — not whether it adds to review workload.
- Type: role: open · measure: text
- Prompt: If you wish, say what such a model would need to work in public administration, or where it would run into trouble.

#### `c2_q3_rating` — required

- Location: Framework · The four gaps · Are these the right four structural governance gaps?
- Question: In your judgement, how well do these four structural governance gaps capture the main conditions a framework like this needs to make visible?
- Subtitle: The question is whether this set of four captures the main governance conditions a framework like this should help practitioners make visible — not whether each gap is always present.
- Type: role: rating · measure: ordinal · scale: coverage

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Captures them very well | yes |
| 2 | Broadly captures them | yes |
| 3 | Partly captures them | yes |
| 4 | Misses important conditions | yes |
| 5 | Cannot judge | **no** |

#### `c2_q3_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Framework · The four gaps · Are these the right four structural governance gaps?
- Question: In your judgement, how well do these four structural governance gaps capture the main conditions a framework like this needs to make visible?
- Subtitle: The question is whether this set of four captures the main governance conditions a framework like this should help practitioners make visible — not whether each gap is always present.
- Type: role: open · measure: text
- Prompt: If you wish, name what feels missing, unnecessary, overlapping, or misplaced — and say why.

#### `c2_q4_row0` — required

- Location: Framework · The four gaps · Recognising the four structural governance gaps in practice
- Question: Thinking about AI deployments you have seen in public administration: how often have you seen each of these governance gaps? — AI use decided without real deliberation about purpose
- Type: role: grid · measure: ordinal · scale: grid

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Almost never | yes |
| 2 | Rarely | yes |
| 3 | Sometimes | yes |
| 4 | Often | yes |
| 5 | Almost always | yes |
| 6 | Cannot judge | **no** |

#### `c2_q4_row1` — required

- Location: Framework · The four gaps · Recognising the four structural governance gaps in practice
- Question: Thinking about AI deployments you have seen in public administration: how often have you seen each of these governance gaps? — Affected people and front-line staff excluded from design
- Type: role: grid · measure: ordinal · scale: grid

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Almost never | yes |
| 2 | Rarely | yes |
| 3 | Sometimes | yes |
| 4 | Often | yes |
| 5 | Almost always | yes |
| 6 | Cannot judge | **no** |

#### `c2_q4_row2` — required

- Location: Framework · The four gaps · Recognising the four structural governance gaps in practice
- Question: Thinking about AI deployments you have seen in public administration: how often have you seen each of these governance gaps? — Accountability and contestation weakened once the system was operating
- Type: role: grid · measure: ordinal · scale: grid

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Almost never | yes |
| 2 | Rarely | yes |
| 3 | Sometimes | yes |
| 4 | Often | yes |
| 5 | Almost always | yes |
| 6 | Cannot judge | **no** |

#### `c2_q4_row3` — required

- Location: Framework · The four gaps · Recognising the four structural governance gaps in practice
- Question: Thinking about AI deployments you have seen in public administration: how often have you seen each of these governance gaps? — Vendor influence left unconstrained in procurement or operation
- Type: role: grid · measure: ordinal · scale: grid

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Almost never | yes |
| 2 | Rarely | yes |
| 3 | Sometimes | yes |
| 4 | Often | yes |
| 5 | Almost always | yes |
| 6 | Cannot judge | **no** |

#### `c2_q4_composite` — required

- Location: Framework · The four gaps · Recognising the four structural governance gaps in practice
- Question: Of these four gaps, which has mattered most in deployments you have seen?
- Type: role: composite · measure: nominal · scale: single-select

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | AI use decided without real deliberation about purpose | yes |
| 2 | Affected people and front-line staff excluded from design | yes |
| 3 | Accountability and contestation weakened once the system was operating | yes |
| 4 | Vendor influence left unconstrained in procurement or operation | yes |

#### `c2_q5_rating` — required

- Location: Framework · Returning to the conditions · Bringing structural conditions back into view
- Question: In your judgement, is bringing structural conditions back into operational decisions a sound design move that meaningfully strengthens AI governance in practice?
- Subtitle: At several points in the operational lifecycle, the framework asks practitioners to revisit the broader organisational and structural conditions identified in the diagnostic layer. The question is whether the connective move-back is a sound mechanism that does real work — not whether it is evenly built across stages.
- Type: role: rating · measure: ordinal · scale: soundness

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | A sound mechanism | yes |
| 2 | Broadly reasonable | yes |
| 3 | Uncertain | yes |
| 4 | A questionable mechanism | yes |
| 5 | Not a sound mechanism | yes |

#### `c2_q5_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Framework · Returning to the conditions · Bringing structural conditions back into view
- Question: In your judgement, is bringing structural conditions back into operational decisions a sound design move that meaningfully strengthens AI governance in practice?
- Subtitle: At several points in the operational lifecycle, the framework asks practitioners to revisit the broader organisational and structural conditions identified in the diagnostic layer. The question is whether the connective move-back is a sound mechanism that does real work — not whether it is evenly built across stages.
- Type: role: open · measure: text
- Prompt: If you wish, say where this would be most valuable in practice, or where it would thin out as a design move.

#### `c2_q6_rating` — required

- Location: Framework · The Generative LLM Gate · A stopping condition rather than a score
- Question: In your judgement, is the framework justified in treating a closed generative model run on vendor-controlled infrastructure as a reason to stop or reconsider a deployment rather than a risk factor to be balanced against other safeguards?
- Subtitle: When a deployment uses a generative LLM, the framework applies a dedicated governance checkpoint. Two conditions are treated as non-negotiable: whether the institution can meaningfully inspect the model, and whether it retains control over the infrastructure and data environment on which the system operates.
- Type: role: rating · measure: ordinal · scale: verdict

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Yes — clearly reasonable | yes |
| 2 | Probably reasonable | yes |
| 3 | Unsure | yes |
| 4 | A graduated assessment would be better | yes |
| 5 | Clearly the wrong design | yes |

#### `c2_q6_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Framework · The Generative LLM Gate · A stopping condition rather than a score
- Question: In your judgement, is the framework justified in treating a closed generative model run on vendor-controlled infrastructure as a reason to stop or reconsider a deployment rather than a risk factor to be balanced against other safeguards?
- Subtitle: When a deployment uses a generative LLM, the framework applies a dedicated governance checkpoint. Two conditions are treated as non-negotiable: whether the institution can meaningfully inspect the model, and whether it retains control over the infrastructure and data environment on which the system operates.
- Type: role: open · measure: text
- Prompt: What makes a hard floor here defensible — or what makes a more flexible assessment preferable?

## Chapter 3 — Instruments

#### `c3_ciw_q1` — required

- Location: Instruments · 1 of 4 · CIW Contextual Integrity Worksheet
- Question: Does this instrument do distinctive analytical work, coherently structured?
- Subtitle: The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its parts fit together without overlapping. Anything “missing or concerning” means a fault in the instrument’s own design — not the set-up work an institution would still need to do, which the MATURITY card names separately.
- Type: role: rating · measure: ordinal · scale: quality

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Yes, clearly | yes |
| 2 | Broadly yes | yes |
| 3 | Uncertain | yes |
| 4 | Not really | yes |
| 5 | No | yes |

#### `c3_ciw_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Instruments · 1 of 4 · CIW Contextual Integrity Worksheet
- Question: What stands out, where it lands
- Type: role: open · measure: text
- Prompt: What is your overall view of this instrument? What it does that’s distinctive, anything missing or concerning in its design — and where it would work, where it would be hard to apply.

#### `c3_ast_q1` — required

- Location: Instruments · 2 of 4 · AST Architecture Selection Tool
- Question: Does this instrument do distinctive analytical work, coherently structured?
- Subtitle: The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its parts fit together without overlapping — judged on the analytical procedure the tool runs, not on how the optional Explore overlay feels to operate. Anything “missing or concerning” means a fault in the instrument’s own design — not the set-up work an institution would still need to do, which the MATURITY card names separately.
- Type: role: rating · measure: ordinal · scale: quality

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Yes, clearly | yes |
| 2 | Broadly yes | yes |
| 3 | Uncertain | yes |
| 4 | Not really | yes |
| 5 | No | yes |

#### `c3_ast_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Instruments · 2 of 4 · AST Architecture Selection Tool
- Question: What stands out, where it lands
- Type: role: open · measure: text
- Prompt: What is your overall view of this instrument? What it does that’s distinctive, anything missing or concerning in its design — and where it would work, where it would be hard to apply.

#### `c3_dma_q1` — required

- Location: Instruments · 3 of 4 · DMA Discretion Migration Analysis
- Question: Does this instrument do distinctive analytical work, coherently structured?
- Subtitle: The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its parts fit together without overlapping. Anything “missing or concerning” means a fault in the instrument’s own design — not the set-up work an institution would still need to do, which the MATURITY card names separately.
- Type: role: rating · measure: ordinal · scale: quality

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Yes, clearly | yes |
| 2 | Broadly yes | yes |
| 3 | Uncertain | yes |
| 4 | Not really | yes |
| 5 | No | yes |

#### `c3_dma_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Instruments · 3 of 4 · DMA Discretion Migration Analysis
- Question: What stands out, where it lands
- Type: role: open · measure: text
- Prompt: What is your overall view of this instrument? What it does that’s distinctive, anything missing or concerning in its design — and where it would work, where it would be hard to apply.

#### `c3_cpd_q1` — required

- Location: Instruments · 4 of 4 · CPD Contestation Pathway Design
- Question: Does this instrument do distinctive analytical work, coherently structured?
- Subtitle: The question is whether the instrument makes a practitioner notice and reason about something they would otherwise miss, and whether its six dimensions fit together as the right interlocking set. Most of those dimensions are deliberately left for the institution to fill in — and that openness is how the instrument is meant to work, not a sign it is unfinished.
- Type: role: rating · measure: ordinal · scale: quality

| Code | Label | Substantive |
| ---: | --- | :---: |
| 1 | Yes, clearly | yes |
| 2 | Broadly yes | yes |
| 3 | Uncertain | yes |
| 4 | Not really | yes |
| 5 | No | yes |

#### `c3_cpd_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Instruments · 4 of 4 · CPD Contestation Pathway Design
- Question: What stands out, where it lands
- Type: role: open · measure: text
- Prompt: What is your overall view of this instrument? What it does that’s distinctive, anything missing or concerning in its design — and where it would work, where it would be hard to apply.

## Chapter 4 — Close

#### `c4_q1_open` — required · **restricted** (omitted from anonymised dataset)

- Location: Close · Q4.1 + Q4.2 · Catch-all
- Question: Is there anything important the questions haven’t reached?
- Subtitle: Look back over the whole questionnaire — the problem the framework addresses, its design, and its four instruments. The question is deliberately unbounded.
- Type: role: open · measure: text
- Prompt: Whatever you’d raise — a concern, a gap, a strength the earlier questions passed over, a question they should have asked. If they covered the ground for you, saying so is a complete answer.

#### `c4_q2_open` — optional · **restricted** (omitted from anonymised dataset)

- Location: Close · Q4.1 + Q4.2 · Catch-all
- Question: Is there anything about the questionnaire or platform itself you’d want to flag?
- Subtitle: This is about the questionnaire and platform themselves — the questions, the flow, the experience of taking it (this can be positive or negative). The framework and its instruments were the object of the earlier questions; here the object is the validation exercise itself. Entirely optional.
- Type: role: open · measure: text
- Prompt: If something stood out — confusing, well-judged, awkward, broken — note it. If nothing comes to mind, leave it blank.
