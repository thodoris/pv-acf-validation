import { CONTENT } from './content';
import type {
  ClusterId,
  GroundingId,
  Instrument,
  InstrumentId,
  PairedQuestion,
  Question,
  QuestionId,
  StandardQuestion,
} from './types';
import { isPairedQuestion } from './types';

export { CONTENT } from './content';
export type * from './types';
export { isPairedQuestion } from './types';

// ---------------------------------------------------------------------------
// Typed accessors. Throwing variants are for code paths that know the id is
// valid (router-managed); .get variants return undefined for defensive code.
// ---------------------------------------------------------------------------

export function getQuestion(id: QuestionId): Question | undefined {
  return CONTENT.questions[id];
}

export function requireQuestion(id: QuestionId): Question {
  const q = CONTENT.questions[id];
  if (!q) throw new Error(`Unknown question id: ${id}`);
  return q;
}

export function requireStandardQuestion(id: QuestionId): StandardQuestion {
  const q = requireQuestion(id);
  if (isPairedQuestion(q)) {
    throw new Error(`Question ${id} is paired, not standard`);
  }
  return q;
}

export function requirePairedQuestion(id: QuestionId): PairedQuestion {
  const q = requireQuestion(id);
  if (!isPairedQuestion(q)) {
    throw new Error(`Question ${id} is not paired`);
  }
  return q;
}

export function getCluster(id: ClusterId) {
  return CONTENT.clusters[id];
}

export function getInstrument(id: InstrumentId): Instrument | undefined {
  return CONTENT.instruments.find((i) => i.id === id);
}

export function requireInstrument(id: InstrumentId): Instrument {
  const i = getInstrument(id);
  if (!i) throw new Error(`Unknown instrument id: ${id}`);
  return i;
}

export function getGrounding(id: GroundingId) {
  return CONTENT.grounding.find((g) => g.id === id);
}

// Concept cards moved to src/content/conceptCards.ts — import from there
// directly rather than via the CONTENT root.
