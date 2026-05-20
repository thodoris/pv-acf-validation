# C-9-Expert Questionnaire — Respondent-Profile Screen

*Status: Working draft. The instrument's first screen, gated ahead of the comprehension grounding (UI spec §3.1, F1). A capture screen, not a claim-cluster — it does not use the eight-element question template.*
*Tracker item: C-9-expert*

---

## Orientation for the reviewer of this draft

The respondent-profile screen is the instrument's first screen. It captures a short profile of the respondent and gates the comprehension grounding behind it — a respondent cannot enter the grounding without completing it (F1). It is the leanest screen in the instrument by design (UI spec §3.1), and it sits first for the three reasons the spec gives: the profile is answered most reliably when the respondent is freshest; a respondent who later abandons the instrument partway is still characterised; and a short, low-friction capture is a gentler on-ramp than dropping the respondent straight into the comprehension work.

Everything captured here sits in the **non-validation data layer**. It is kept distinct in the data schema from both the generic-uptake ratings layer and the open-response layer (ADR §8), and it is never cited as validation evidence in Chapter 9 — it characterises the respondent pool, nothing more.

This is a capture screen, not a question screen. It does not carry the eight-element template the claim-cluster questions use, and nothing on it reaches for recognition or judgment. Read it as a form, specified field by field.

**Two items discussed and held back.** The expertise-criterion capture — which §3.5 criterion the respondent maps to — is removed from this draft for now; this leaves the draft out of step with UI spec §3.1, which is recorded in the notes as a deviation to reconcile. The interview-willingness and availability capture moves to the end of the questionnaire, after the claim-cluster spine, where willingness is a more meaningful thing to ask; this is also in the notes.

---

## Screen content

The screen carries a short intro line, three fields, and one on-screen note. The screen as a whole is required and gates the grounding (F1); within it, the name field is optional and the other two fields are required.

**Screen intro line (proposed).** *Before the questionnaire begins, a few details about you. This takes under a minute.*

### Field 1 — Name

- **Label:** Your name
- **Format:** Short free-text, single line.
- **Required:** Optional.
- **Helper text:** *Optional. Give your name, or leave this blank to respond anonymously — the choice is yours.*
- **Note.** The respondent decides whether to be identified or to respond anonymously. The construct memo frames the validation as engagement by named experts (§3.4), and Chapter 9 cites respondents as such where they are named; an anonymous response still counts toward the sample but cannot be attributed. That consequence belongs in the consent information, not in this field's helper text — see the placement note below, and the helper text is deliberately kept lean for that reason. One honest dependency: because recruitment is by personalised invitation, a blank name field delivers genuine anonymity only if the data path keeps the invitation token separable from the stored response. That is a data-path / ethics question, flagged in the notes.

### Field 2 — Institution type

- **Label:** Type of institution
- **Format:** Single-select.
- **Options (proposed):**
  - National government or public administration body
  - Regional or local government body
  - Regulator or oversight body
  - Academia or research institution
  - Civil society organisation
  - Other — *(short free-text)*
- **Required:** Required.
- **Helper text:** *Pick the closest fit. If your work spans more than one, choose where most of your relevant experience sits.*
- **Note.** The option set is drawn from the institutional-coverage language in construct memo §3.5 (academia, civil society, regulator-adjacent practitioners) plus the public-administration professional the ADR §2a names as the core respondent. It remains a proposal — see the notes.

### Field 3 — Years in public-administration practice

- **Label:** Years working in public administration
- **Format:** Single-select bands (proposed over a raw number — see the note).
- **Options (proposed):**
  - None / not applicable
  - Under 5 years
  - 5–10 years
  - 11–20 years
  - Over 20 years
- **Required:** Required.
- **Helper text:** *If your work is not in public-administration practice — for example an academic or civil-society role — choose "none / not applicable."*
- **Note.** Banded rather than a raw number for two reasons: a precise figure alongside institution type could be identifying in a small respondent pool, and bands are sufficient for the field's only job, which is characterising the practitioner depth of the pool. The "none / not applicable" option is load-bearing — §3.5 explicitly admits academics and civil-society respondents who may have no public-administration practice, and a "none" answer from such a respondent is itself informative rather than a gap. Easy to switch to a raw number if preferred.

## On-screen note — response language

A short informational line on the screen, not a captured field. It satisfies F9's requirement that the respondent be told "plainly at the outset" that they may answer in either language.

- **Text (proposed):** *The platform is in English. When you reach the open-response questions, you can answer in English or Greek — use whichever language lets you answer most fully.*
- **Placement:** visible on this screen before the respondent advances — below the fields, above the advance control.
- **Note.** This is the floor option from the field-list review — an informational line, not a captured preference. If a captured "which language do you expect to answer in" preference is wanted later (it would let the analyst anticipate Greek responses), that is a small addition; for now it is information only.

## Placement note — consent

Consent is not a field on this screen and is not designed here. It is ethics-gated (ADR Risk 2), and the data-path design that carries it must be settled before recruitment opens. The point for this draft: the profile screen is the first *capture* screen, but it is not necessarily the first thing the respondent sees — consent capture precedes or wraps it. The attribution consequence of the name field — named responses may be cited as named expert input, anonymous ones cannot — is part of the consent information, which is why the name field's helper text stays lean.

## Notes for the discussion

- **The expertise-criterion capture is removed for now — and that is a live deviation from UI spec §3.1.** §3.1 names three captures for this screen: institution type, the expertise criterion the respondent maps to, and years in public-administration practice. This draft carries two of the three. The deviation has to be reconciled before launch — either the criterion capture returns, or §3.1 is amended to drop it. Recorded here so it is not silently lost. If it returns, the open question from the field-list review still stands: single- versus multi-select, and self-assessment versus analyst-assigned-at-recruitment.
- **Interview willingness and availability move to the end of the questionnaire.** They are no longer on this screen. This gives the instrument a symmetrical shape: a non-validation capture screen before the comprehension grounding (this screen), and a non-validation capture screen after the claim-cluster spine (interview willingness plus availability in the 13–25 June window, memo §3.4). That post-spine capture screen still needs drafting — a small loose end. It sits after Cluster 4's Q4.1, which means Q4.1 is the final *question* but not the final *screen*; worth noting against the Cluster 4 draft's "the questionnaire's final item" language — final item, yes; final screen, no.
- **The institution-type option set is a proposal.** Six options drawn from §3.5 and ADR §2a. Amend the set or the granularity freely — nothing downstream is locked to it.
- **Years is proposed as bands, not a raw number.** Identification risk in a small pool, plus sufficiency for the field's job. Flagged as a proposal; switching to a raw number is trivial.
- **The name field's optionality depends on the data path to mean anything.** "Leave blank to respond anonymously" only delivers anonymity if the stored response can be separated from the personalised invitation token. This is the same data-path / ethics question the field-list review raised under identity capture, and it should be settled with the consent and data-path design, not here.
- **Field-level required/optional within a required screen.** The screen gates the grounding (F1), so it must be completed to proceed — but "completed" means the two required fields are answered. The name field is genuinely optional: leaving it blank is a valid completion, because a blank name field *is* the anonymity choice.
