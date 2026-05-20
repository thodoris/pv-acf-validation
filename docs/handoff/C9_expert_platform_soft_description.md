# Expert Validation Platform — Soft System Description

*A rough orienting brief for the wireframe and design work. Not a locked specification — the detailed structure lives in the UI specification and the ADR. This is the "what are we making and why" overview to design against.*

---

## What it is

A small, purpose-built web application that a group of invited experts use, once each, to review and give structured feedback on an academic framework. It is not a generic survey — it is closer to a guided review environment: it first teaches the reviewer enough about the framework to judge it well, then asks them to judge it.

## Why it exists

The framework being reviewed is the central contribution of a doctoral thesis. Its validation depends on expert judgment being *well-grounded* — an expert who has only skimmed a long, dense document gives shallow feedback. The platform's whole reason for being is to raise the quality of that judgment: orient the reviewer properly, let them keep the framework's concepts within reach while they answer, and let them actually operate one of the framework's tools rather than just read about it.

## Who uses it

Invited domain experts — academics, civil-society researchers, regulator-adjacent practitioners — recruited individually. They are knowledgeable but busy, will use the platform remotely and unsupervised, and will give it a single session of roughly 75–90 minutes. They are not the general public and not trained on the tool; the interface has to be self-explanatory and respectful of their time.

## How it is used

One sitting, start to finish, though it must tolerate interruption and resumption. The reviewer moves through an **orientation stage** that builds their understanding of the framework, then a **structured questionnaire stage** where they give their feedback. Throughout, a persistent frame keeps them oriented and lets them pull up reference material on demand without losing their place.

## The shape of it

Three parts work together:

- **An orientation stage** — a short, linear, wide-to-narrow walkthrough: the broad subject, the framework's foundations, what the framework is and does, a visual presentation of its main concepts, and a bridge into the questionnaire itself.

- **A questionnaire stage** — a structured, sequential set of feedback questions in three groups: questions about the framework as a whole, questions about four specific tools within it, and a final open-feedback group. Progression is ordered; it must be completed.

- **A reference layer** — concept/terminology cards and a whole-framework presentation, available at any time as overlays the reviewer can open, read, and close without leaving their current screen. Its content is the same material the orientation stage walks through — built once, reachable two ways.

## Supportive functions the frame should provide

A consistent surrounding frame, present on every screen, that:

- shows the reviewer where they are, what they have completed, a percent-complete figure, and an honest estimate of time remaining;
- always offers the two reference triggers (concept cards; whole-framework presentation) in the same place;
- *adaptively offers* extra help where a given screen has it — a deeper explanation card here, a short instructional video there, an interactive tool on one screen — without ever rearranging itself. The frame is stable; what it offers varies.

## Notable sub-components

- **The interactive tool.** One of the four reviewed tools is genuinely operable — the reviewer can run it against a scenario and watch its logic resolve, not just read its description. Its free use is for understanding only; it is kept separate from the actual feedback questions about it. The other three tools are presented as rich, well-structured static panels.

- **The video viewer tool.** Overlay video boxes may need to pop-up from different screens. Modal, dismissible, context-aware.

- **Overlay reference cards.** Modal, dismissible, context-aware (they surface what is relevant to the current screen first), and they never disturb the screen underneath.

- **The question screens themselves.** Questions are kept short and fully visible; the longer context, scope notes, and source material sit in side panels and expanders, not in the reading path. The aim is one screen, one coherent unit — a reviewer should never hunt through prose to find the question.

- **Response capture.** The reviewer's deliberate answers are saved; their exploration and reference-consulting are not. Answers settle once a screen is completed.

## The feel to aim for

Calm, credible, unhurried, academic but not austere. It should feel like a well-made review instrument that respects the reviewer's expertise and time — guiding without nagging, informative without overwhelming, and stable enough that it is learned once and then simply used.

## What is still soft

The exact questions, the visual style, and the precise data handling are being worked out separately and are not needed to begin wireframing. What the design work needs from this brief is the *shape*: three parts, a stable adaptive frame, an overlay reference layer, one operable tool among static panels, and a calm guided-review character throughout.
