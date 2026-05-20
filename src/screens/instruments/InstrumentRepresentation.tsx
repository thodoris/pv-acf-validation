/* Per-instrument structured representation. Faithful port of the prototype's
   InstrumentRepresentation — code-specific layouts (AST pool, CIW flow table,
   DMA authority table, CPD six-dimension table). The displayed mock data is
   illustrative, lifted verbatim from the prototype. */

import type { JSX } from 'react';
import type { Instrument } from '@/content';

const AST_POOL = [
  { n: 'A1', t: 'Full automation', s: 'eliminated', l: 'Eliminated' },
  { n: 'A2', t: 'Decision-support · binding recommendation', s: 'eliminated', l: 'Eliminated' },
  { n: 'A3', t: 'Decision-support · advisory only', s: 'alive', l: 'Survives' },
  { n: 'A4', t: 'Triage / prioritisation assistance', s: 'alive', l: 'Survives' },
  { n: 'A5', t: 'Generative draft + human sign-off', s: 'tollgate', l: 'GLG gate' },
];

const DMA_ROWS = [
  ['Eligibility verification', 'Caseworker', 'System + caseworker confirm', 'Caseworker, no time bar'],
  ['Risk-based prioritisation', 'Caseworker', 'System ranks; caseworker reviews', 'Within 5 working days'],
  ['Final benefit determination', 'Caseworker + supervisor', 'System recommends; supervisor signs', 'Supervisor only'],
];

const CPD_ROWS: Array<[string, string, string]> = [
  [
    'Notification',
    'Affected party informed of the decision and the right to challenge.',
    'Form, language, channel — and how receipt and understanding will be checked.',
  ],
  [
    'Explanation',
    'Reasons must be intelligible to a non-expert.',
    'Level of detail, format — and how usability will be checked.',
  ],
  [
    'Channel accessibility',
    'Multiple channels; no digital-only.',
    'Channels available to the served population — and how accessibility will be verified.',
  ],
  [
    'Human reviewer · substantive authority',
    'Reviewer can overturn, not only re-run.',
    'Reviewer role, independence, contextual information held — and how authority to overturn will be evidenced.',
  ],
  [
    'Timeline',
    'Decision within a reasonable window.',
    'Days, hours, urgency rules — and how timeliness will be monitored.',
  ],
  [
    'Feedback loop',
    'Outcomes feed back into review.',
    'How outcomes will be recorded and aggregated — and how systemic patterns will be surfaced for later evaluation.',
  ],
];

const VERDICT_CLASS: Record<string, string> = {
  ok: 'verdict--ok',
  warn: 'verdict--warn',
  no: 'verdict--no',
};

export type InstrumentRepresentationProps = {
  inst: Instrument;
};

export function InstrumentRepresentation({
  inst,
}: InstrumentRepresentationProps): JSX.Element | null {
  if (inst.code === 'AST') return <AstRepresentation />;
  if (inst.code === 'CIW') return <CiwRepresentation inst={inst} />;
  if (inst.code === 'DMA') return <DmaRepresentation />;
  if (inst.code === 'CPD') return <CpdRepresentation />;
  return null;
}

function AstRepresentation(): JSX.Element {
  return (
    <div className="inst-rep inst-rep--ast">
      <div className="ast__pool" style={{ padding: 0 }}>
        {AST_POOL.map((p, i) => (
          <div className={`arch arch--${p.s}`} key={i}>
            <span className="arch__num">{p.n}</span>
            <div>
              <div className="arch__title">{p.t}</div>
            </div>
            <span className="arch__status">{p.l}</span>
          </div>
        ))}
      </div>
      <p className="inst-rep__caption italic">
        Five candidate architectures evaluated against a deployment's governance
        requirements. The procedure returns one of three verdicts (select · escalate ·
        stop &amp; reframe). Surviving architectures appear in governability order.
      </p>
    </div>
  );
}

function CiwRepresentation({ inst }: { inst: Instrument }): JSX.Element {
  const flows = inst.flows ?? [];
  return (
    <div className="inst-rep">
      <table className="inst-rep__table inst-rep__table--ciw">
        <thead>
          <tr>
            <th className="ci-flow__col-key">Parameter</th>
            <th>Before AI</th>
            <th>After AI</th>
          </tr>
        </thead>
        {flows.map((f) => {
          const n = Math.max(f.before.length, f.after.length);
          return (
            <tbody key={f.id} className="ci-flow__tbody">
              <tr className="ci-flow__flow-head">
                <th colSpan={3}>
                  <span className="ci-flow__num mono">{f.id}</span>
                  <span className="ci-flow__desc">{f.description}</span>
                  <span className={`verdict ${VERDICT_CLASS[f.verdict] ?? ''}`}>
                    {f.verdictLabel}
                  </span>
                </th>
              </tr>
              {Array.from({ length: n }).map((_, i) => {
                const before = f.before[i] ?? ['', ''];
                const after = f.after[i] ?? ['', ''];
                return (
                  <tr key={i} className="ci-flow__param">
                    <td className="ci-flow__pkey mono">{before[0]}</td>
                    <td className="ci-flow__pval">{before[1]}</td>
                    <td className="ci-flow__pval">{after[1]}</td>
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>
      <p className="inst-rep__caption italic">
        Three illustrative flows, each described in five parameters before and after the
        AI system, then sorted into one of three verdicts. Deliberative attention
        concentrates on the middle category.
      </p>
    </div>
  );
}

function DmaRepresentation(): JSX.Element {
  return (
    <div className="inst-rep">
      <table className="inst-rep__table">
        <thead>
          <tr>
            <th>Decision class</th>
            <th>Authority — before</th>
            <th>Authority — after</th>
            <th>Override path</th>
          </tr>
        </thead>
        <tbody>
          {DMA_ROWS.map((row, i) => (
            <tr key={i}>
              {row.map((c, j) => (
                <td
                  key={j}
                  className={j === 0 ? '' : 'mono'}
                  style={j === 0 ? { fontWeight: 500 } : undefined}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="inst-rep__caption italic">
        Per decision class: where effective authority moves — including into automated
        workflows or vendor-controlled components — and the oversight response that
        calls for.
      </p>
    </div>
  );
}

function CpdRepresentation(): JSX.Element {
  return (
    <div className="inst-rep">
      <table className="inst-rep__table">
        <thead>
          <tr>
            <th>Dimension</th>
            <th>Framework specification</th>
            <th>Institution specifies and verifies</th>
          </tr>
        </thead>
        <tbody>
          {CPD_ROWS.map((row, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 500 }}>{row[0]}</td>
              <td style={{ fontSize: 13 }}>{row[1]}</td>
              <td style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="inst-rep__caption italic">
        The six dimensions are interlocking, not additive: notification without an
        accessible channel, review without authority, or feedback without timely
        contestation does not make contestation operational.
      </p>
    </div>
  );
}
