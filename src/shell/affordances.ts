/* Per-screen affordance derivation. Carried over from helpers in
   docs/reference-prototype/app.jsx (qAffs, instrumentAffs, closeAffs,
   groundingAffs). Same outputs, typed. */

import {
  CONTENT,
  isPairedQuestion,
  requireQuestion,
  type AffordanceDecl,
  type Instrument,
  type PairedQuestion,
  type Question,
  type QuestionId,
  type StandardQuestion,
} from '@/content';
import { SCREENS, type ScreenId } from '@/routing/screens';

export function affordancesFor(screenId: ScreenId): AffordanceDecl[] {
  const screen = SCREENS.find((s) => s.id === screenId);
  if (!screen) return [];

  switch (screen.kind) {
    case 'question':
    case 'paired':
      return questionAffordances(screenId);
    case 'instrument': {
      const inst = CONTENT.instruments.find((i) => i.id === screenId);
      return inst ? instrumentAffordances(inst) : [];
    }
    case 'close-pair':
      return closePairAffordances();
    case 'profile':
      return profileAffordances();
    case 'interview':
      return interviewAffordances();
    case 'submit':
      return submitAffordances();
    default:
      return [];
  }
}

function questionAffordances(id: QuestionId): AffordanceDecl[] {
  const q = requireQuestion(id);

  // Explicit override — the question authored its own affs.
  if (q.customAffs) return q.customAffs;

  if (isPairedQuestion(q)) return pairedDefaultAffordances(q);
  return standardDefaultAffordances(q);
}

function standardDefaultAffordances(q: StandardQuestion): AffordanceDecl[] {
  const out: AffordanceDecl[] = [];

  if (!q.noScope) {
    out.push({
      kind: 'scope',
      title: 'Scope · What this question is about',
      body: `<p>${q.subtitle}</p>`,
      items: q.scopeNote,
    });
  }

  if (q.sourceNote) {
    out.push({
      kind: 'source',
      title: q.sourceNote.title || 'Source material',
      items: q.sourceNote.items,
      body: q.sourceNote.footer
        ? `<p class="italic" style="margin-top:8px;">${q.sourceNote.footer}</p>`
        : undefined,
    });
  }

  if (q.rationaleDependent) {
    out.push({
      kind: 'explanation',
      title: 'Why the framework takes this position',
      body:
        q.rationaleBody ||
        '<p><em>Rationale unit placeholder — full copy in Phase B+.</em></p>',
    });
  }
  return out;
}

function pairedDefaultAffordances(q: PairedQuestion): AffordanceDecl[] {
  const out: AffordanceDecl[] = [];
  q.questions.forEach((sq) => {
    out.push({
      kind: 'scope',
      title: `${sq.tag} · Scope`,
      body: `<p>${sq.subtitle}</p>`,
    });
    if (sq.rationaleDependent) {
      out.push({
        kind: 'explanation',
        title: `${sq.tag} · Why the framework takes this position`,
        body: sq.rationaleBody || '<p><em>Rationale unit placeholder.</em></p>',
      });
    }
  });
  return out;
}

function instrumentAffordances(inst: Instrument): AffordanceDecl[] {
  const out: AffordanceDecl[] = [
    {
      kind: 'scope',
      body:
        '<dl class="aff__qnotes">' +
        '<div><dt>Q.1 — Quality</dt>' +
        '<dd>Paperwork is not sacred: the judgment is about analytical work, not whether the template is well-formed as a document.</dd></div>' +
        '<div><dt>Q.2 — Applicability</dt>' +
        '<dd>“Hard to apply” in the open response reaches for <em>design</em> difficulty, not the set-up work the MATURITY card names.</dd></div>' +
        '</dl>',
    },
    inst.glance.length > 0
      ? {
          kind: 'maturity',
          labelOverride: 'Maturity',
          body: `<p><strong>${inst.maturity.level}</strong></p><p>${inst.maturity.body}</p>`,
        }
      : {
          kind: 'maturity',
          title: `${inst.code} maturity claim (P7)`,
          body: `<p>${inst.maturity.body}</p>`,
        },
  ];
  if (inst.code === 'AST') {
    out.push({
      kind: 'operable',
      title: 'Explore mode · firewalled',
      body:
        '<p>You can run the AST against scenarios via <strong>Explore it</strong> in the inspection panel above. Runs are <em>not</em> recorded; only your evaluation answers are.</p>',
      chips: [
        { num: '1', label: 'Select deployment characteristics' },
        { num: '2', label: 'Watch the elimination logic resolve' },
        { num: '3', label: 'Form a judgement' },
      ],
    });
  }
  if (inst.code === 'CPD') {
    out.push({
      kind: 'explanation',
      title: 'Why so much is deliberately left open',
      body:
        '<p>A contestation pathway is meaningful only if affected citizens can actually use it. That depends on language, literacy, disability access, digital access, urgency, trust, and whether the reviewer has real authority.</p>' +
        '<p>The framework therefore pre-fills the six dimensions, but not the setting-specific details. The institution must specify those details and name how each will be verified.</p>' +
        '<p>The openness is not unfinished paperwork. It is where the institution must show that contestation is operationally reachable, not only formally promised.</p>',
    });
  }
  return out;
}

function closePairAffordances(): AffordanceDecl[] {
  const out: AffordanceDecl[] = [];
  const q1 = CONTENT.questions['c4-q1'];
  const q2 = CONTENT.questions['c4-q2'];
  if (q1 && !isPairedQuestion(q1) && q1.scopeNote) {
    out.push({
      kind: 'scope',
      title: 'Q4.1 · Required · Coverage catch-all',
      body: `<p>${q1.subtitle}</p>`,
      items: q1.scopeNote,
    });
  }
  if (q2 && !isPairedQuestion(q2) && q2.scopeNote) {
    out.push({
      kind: 'scope',
      title: 'Q4.2 · Optional · Questionnaire & platform',
      body: `<p>${q2.subtitle}</p>`,
      items: q2.scopeNote,
    });
  }
  return out;
}

function profileAffordances(): AffordanceDecl[] {
  return [
    {
      kind: 'scope',
      title: 'Why we ask',
      items: [
        'Characterises the respondent pool for Chapter 9.',
        '<strong>Not</strong> used as validation evidence — kept separate in the data layer.',
        'All fields except <em>name</em> are required.',
      ],
    },
    {
      kind: 'explanation',
      title: 'Anonymity',
      body: '<p>The name field is optional. Leaving it blank lets you respond anonymously; anonymous responses count toward the sample but cannot be attributed to you in the thesis.</p>',
    },
  ];
}

function interviewAffordances(): AffordanceDecl[] {
  return [
    {
      kind: 'explanation',
      title: 'Optional and separate',
      body: '<p>Your answers to the questionnaire are complete on their own. A follow-up interview is a way for the author to pursue any particular response of yours in more depth — it is voluntary and separate from the validation analysis.</p>',
    },
  ];
}

function submitAffordances(): AffordanceDecl[] {
  return [
    {
      kind: 'explanation',
      title: 'What happens on submit',
      body: '<p>Your locked answers are sealed and added to the validation record. The form closes; you cannot reopen it. Withdrawal is possible by email for 30 days.</p>',
    },
  ];
}

// Re-export Question type to silence the "Question imported but unused" lint
// when extending this file later (it's part of the public derivation surface).
export type { Question };
