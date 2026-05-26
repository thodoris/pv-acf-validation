import { CONTENT, isPairedQuestion } from '../src/content/index';
import { VARIANTS, effectiveScreens, effectiveFieldHidden } from '../src/content/variants';
import { SCREENS } from '../src/routing/screens';

const v = VARIANTS.short;
const visible = effectiveScreens(SCREENS, v);
const out: Record<string, string[]> = {};

for (const s of visible) {
  const stems: string[] = [];

  if (s.id === 'c4-close') {
    const q1 = CONTENT.questions['c4-q1'];
    const q2 = CONTENT.questions['c4-q2'];
    if (q1 && !isPairedQuestion(q1)) stems.push(q1.question);
    if (q2 && !isPairedQuestion(q2)) stems.push(q2.question);
  } else if (s.kind === 'instrument') {
    const inst = CONTENT.instruments.find((i) => i.id === s.id);
    if (inst) {
      if (!effectiveFieldHidden(s.id, 'q1', v)) stems.push(inst.q1.question);
      if (!effectiveFieldHidden(s.id, 'q2', v)) stems.push(inst.q2.question);
    }
  } else {
    const q = CONTENT.questions[s.id];
    if (q) {
      if (isPairedQuestion(q)) {
        for (const sub of q.questions) stems.push(sub.question);
      } else {
        stems.push(q.question);
        if (q.composite) stems.push(q.composite.subStem);
      }
    }
    // Screens with no question entry (welcome / profile / grounding /
    // setup-* / submit / thanks) fall through with an empty stems array.
  }

  out[s.id] = stems;
}

process.stdout.write(JSON.stringify(out, null, 2) + '\n');
