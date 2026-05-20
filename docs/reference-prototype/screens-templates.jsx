// Generic screen templates for the cluster-based spine.
// All take data from CONTENT and render uniformly.

const { useState: useState_t, useRef: useRef_t, useEffect: useEffect_t } = React;

/* ============================================================
   QuestionCard — primary visual unit
   ============================================================ */
function QuestionCard({ tag, meta, question, subtitle, children, slot }) {
  return (
    <section className="q-card" aria-labelledby={slot ? `q-text-${slot}` : "q-text"}>
      <div className="q-card__head">
        {tag && <span className="q-card__tag">{tag}</span>}
        {meta && <span className="q-card__meta">{meta}</span>}
      </div>
      <h2 id={slot ? `q-text-${slot}` : "q-text"} className="q-card__text">{question}</h2>
      {subtitle && <p className="q-card__descriptor">{subtitle}</p>}
      <div className="q-card__body">{children}</div>
    </section>
  );
}
window.QuestionCard = QuestionCard;

/* ============================================================
   Likert / rating renderer
   ============================================================ */
function RatingControl({ rating, value, onChange, namespace }) {
  if (!rating) return null;

  if (rating.kind === "grid") {
    const cols = rating.options.length;
    const gridStyle = { "--rating-grid-cols": `1.8fr repeat(${cols}, 1fr)` };
    return (
      <div className="rating-grid" style={gridStyle}>
        <div className="rating-grid__head" style={gridStyle}>
          <div></div>
          {rating.options.map((o, i) => (
            <div className="rating-grid__col-label" key={i}>{o}</div>
          ))}
        </div>
        {rating.rows.map((row, ri) => (
          <div className="rating-grid__row" key={ri} style={gridStyle}>
            <div className="rating-grid__row-label">{row}</div>
            {rating.options.map((o, ci) => {
              const cellValue = (value && value[ri]) || null;
              return (
                <button
                  key={ci}
                  className={`rating-grid__cell ${cellValue === ci ? "is-selected" : ""}`}
                  onClick={() => {
                    const next = Array.isArray(value) ? [...value] : Array(rating.rows.length).fill(null);
                    next[ri] = ci;
                    onChange(next);
                  }}
                  aria-pressed={cellValue === ci}
                  aria-label={`${row} — ${o}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // standard horizontal pill row
  return (
    <div className="rating-row">
      <div className="rating-row__pills">
        {rating.options.map((o, i) => (
          <button
            key={i}
            className={`rating-pill ${value === i ? "is-selected" : ""}`}
            onClick={() => onChange(i)}
            aria-pressed={value === i}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
window.RatingControl = RatingControl;

/* ============================================================
   OpenResponse — textarea + label + footer
   ============================================================ */
function OpenResponse({ open, value, onChange, id, maxLength = 4000, minHeight = 180 }) {
  if (!open) return null;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {open.label} {open.required && <span className="field__req">required</span>}
        {!open.required && <span className="field__opt">optional</span>}
      </label>
      <textarea
        id={id}
        className="textarea"
        placeholder={open.prompt}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ minHeight }}
      />
      <div className="textarea__footer">
        <span style={{ fontStyle: "italic", color: "var(--ink-mute)" }}>
          English or Greek
        </span>
        <span>{(value || "").length} / {maxLength}</span>
      </div>
    </div>
  );
}
window.OpenResponse = OpenResponse;

/* ============================================================
   CompositeSelect — secondary single-select that sits below a primary
   control (currently a rating grid). Used for composite-response
   questions like Q2.4: "rate each of the four; then pick the one that
   mattered most." Visually distinct from the rating + open default —
   numbered options stacked vertically, coral fill on selection.
   ============================================================ */
function CompositeSelect({ composite, value, onChange, id }) {
  if (!composite) return null;
  return (
    <div className="compsel" role="group" aria-labelledby={`${id}-substem`}>
      <div className="compsel__head">
        <span className="compsel__chip">
          {composite.chip || "Pick one"}
          {composite.required && <span className="field__req" style={{ marginLeft: 8 }}>required</span>}
        </span>
      </div>
      <p className="compsel__sub-stem" id={`${id}-substem`}>{composite.subStem}</p>
      <div className="compsel__opts" role="radiogroup" aria-labelledby={`${id}-substem`}>
        {composite.options.map((opt, i) => {
          const num = String(i + 1).padStart(2, "0");
          const selected = value === i;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`compsel__opt ${selected ? "is-selected" : ""}`}
              onClick={() => onChange(i)}
            >
              <span className="compsel__num" aria-hidden="true">{num}</span>
              <span className="compsel__label">{opt}</span>
              <span className="compsel__check" aria-hidden="true">
                <Icon name="check" size={16}/>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
window.CompositeSelect = CompositeSelect;

/* ============================================================
   QuestionScreen — single question with rating + open
   ============================================================ */
function QuestionScreen({ screenId }) {
  const q = CONTENT.questions[screenId];
  if (!q) return <div className="main"><div className="main__inner"><p>No data for {screenId}</p></div></div>;

  const [rating, setRating] = useState_t(null);
  const [openVal, setOpenVal] = useState_t("");
  const [compositeVal, setCompositeVal] = useState_t(null);

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">{q.kicker}</div>
        <h1 className="h-chapter">{q.chapter}</h1>
        {q.tagline && <p className="tagline tagline--mute">{q.tagline}</p>}

        <QuestionCard
          tag={q.meta.split(" · ")[0]}
          meta={q.meta.split(" · ").slice(1).join(" · ")}
          question={q.question}
          subtitle={q.subtitle}
        >
          {q.rating && (
            <div className="field">
              <RatingControl rating={q.rating} value={rating} onChange={setRating}/>
            </div>
          )}
          {q.composite && (
            <CompositeSelect
              composite={q.composite}
              value={compositeVal}
              onChange={setCompositeVal}
              id={`compsel-${screenId}`}
            />
          )}
          {q.open && (
            <OpenResponse
              open={q.open}
              value={openVal}
              onChange={setOpenVal}
              id={`open-${screenId}`}
              minHeight={q.type === "open-only" ? 240 : 130}
            />
          )}
        </QuestionCard>
      </div>
    </div>
  );
}
window.QuestionScreen = QuestionScreen;

/* ============================================================
   PairedQuestionScreen — two questions on one analytical unit (Q1.3/Q1.4)
   ============================================================ */
function PairedQuestionScreen({ screenId }) {
  const data = CONTENT.questions[screenId];
  if (!data || data.kind !== "paired") return null;

  const [ratings, setRatings] = useState_t({});
  const [opens, setOpens] = useState_t({});

  const set = (slot, kind, val) => {
    if (kind === "rating") setRatings(r => ({ ...r, [slot]: val }));
    else setOpens(o => ({ ...o, [slot]: val }));
  };

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">{data.kicker}</div>
        <h1 className="h-chapter">{data.chapter}</h1>
        <p className="tagline tagline--mute">{data.tagline}</p>

        {data.questions.map((q, i) => (
          <QuestionCard
            key={q.slot}
            slot={q.slot}
            tag={q.tag}
            meta={q.meta}
            question={q.question}
            subtitle={q.subtitle}
          >
            {q.rating && (
              <div className="field">
                <RatingControl
                  rating={q.rating}
                  value={ratings[q.slot]}
                  onChange={(v) => set(q.slot, "rating", v)}
                  namespace={q.slot}
                />
              </div>
            )}
            <OpenResponse
              open={q.open}
              value={opens[q.slot]}
              onChange={(v) => set(q.slot, "open", v)}
              id={`open-${q.slot}`}
              minHeight={120}
            />
          </QuestionCard>
        ))}
      </div>
    </div>
  );
}
window.PairedQuestionScreen = PairedQuestionScreen;

/* ============================================================
   ClosePairScreen — Cluster 4's single screen with stacked Q4.1 + Q4.2
   Q4.1 required, Q4.2 optional. The visual contrast between them is
   load-bearing per the brief, since they sit directly next to each other.
   ============================================================ */
function ClosePairScreen() {
  const q1 = CONTENT.questions["c4-q1"];
  const q2 = CONTENT.questions["c4-q2"];
  const [open1, setOpen1] = useState_t("");
  const [open2, setOpen2] = useState_t("");
  if (!q1 || !q2) return null;

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">Close · Cluster 4 of 4</div>
        <h1 className="h-chapter">Final two questions</h1>
        <p className="tagline tagline--mute">
          One required catch-all on the framework, one optional flag on the exercise itself.
        </p>

        {/* Q4.1 — required */}
        <QuestionCard
          slot="q41"
          tag={q1.meta.split(" · ")[0]}
          meta={q1.meta.split(" · ").slice(1).join(" · ")}
          question={q1.question}
          subtitle={q1.subtitle}
        >
          <OpenResponse
            open={q1.open}
            value={open1}
            onChange={setOpen1}
            id="open-c4-q1"
            minHeight={220}
          />
        </QuestionCard>

        {/* Q4.2 — optional, with a softer visual treatment */}
        <div className="q-card--optional-wrap">
          <QuestionCard
            slot="q42"
            tag={q2.meta.split(" · ")[0]}
            meta={q2.meta.split(" · ").slice(1).join(" · ")}
            question={q2.question}
            subtitle={q2.subtitle}
          >
            <OpenResponse
              open={q2.open}
              value={open2}
              onChange={setOpen2}
              id="open-c4-q2"
              minHeight={160}
            />
          </QuestionCard>
        </div>
      </div>
    </div>
  );
}
window.ClosePairScreen = ClosePairScreen;

/* ============================================================
   ClusterSetupScreen — gated content screen, no question
   ============================================================ */
function ClusterSetupScreen({ clusterId }) {
  const c = CONTENT.clusters[clusterId];
  if (!c) return null;

  // Build a question-preview list from CONTENT.questions / CONTENT.instruments
  const preview = clusterPreview(clusterId);

  // Derive a short cluster name + 2-digit number for the cluster badge
  // from the cluster's ordinal/label. e.g. "Cluster 4 of 4" → "04" + label.
  const badgeNum  = (c.ordinal && c.ordinal.match(/\d+/)) ? c.ordinal.match(/\d+/)[0].padStart(2, "0") : "00";
  const badgeName = (c.label || "").replace(/^the\s+/i, "");

  return (
    <div className="main">
      <div className="main__inner">
        <div className="setup-header">
          <div className="cluster-badge">
            <span className="cluster-badge__num">{badgeNum}</span>
            <span className="cluster-badge__name">{badgeName}</span>
            <span className="cluster-badge__step">Introductory setup</span>
          </div>
          <h1 className="h-display setup-header__title">{titleCase(c.label)}</h1>
          <p className="tagline">{c.tagline}</p>
        </div>

        <aside className="lede-panel">
          <p>{c.intro}</p>
        </aside>

        <section className="setup">
          <div className="setup__title-row">
            <h2 className="h-chapter setup__title">{c.setup.title}</h2>
            <span className="setup__count mono">{c.setup.sections.length} sections</span>
          </div>

          <div className="setup__sections">
            {c.setup.sections.map((s, i) => (
              <article className="setup__section" key={i}>
                <div className="setup__num">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div className="setup__label">{s.label}</div>
                  <div className="setup__body" dangerouslySetInnerHTML={{ __html: s.body }}/>
                </div>
              </article>
            ))}
          </div>

          {c.setup.footer && (
            <div className="setup__pullquote">
              <span className="setup__pullquote-mark">“</span>
              <p>{c.setup.footer}</p>
            </div>
          )}
        </section>

        {preview && (
          <section className="setup-preview">
            <div className="setup-preview__head">
              <span className="kicker kicker--mute">What you will be asked</span>
              <span className="mono setup-preview__count">{preview.count} item{preview.count !== 1 ? "s" : ""}</span>
            </div>
            <ol className="setup-preview__list">
              {preview.items.map((it, i) => (
                <li key={i} className="setup-preview__item">
                  <span className="setup-preview__num mono">{it.num}</span>
                  <div>
                    <div className="setup-preview__title">{it.title}</div>
                    {it.kind && <div className="setup-preview__kind mono">{it.kind}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
window.ClusterSetupScreen = ClusterSetupScreen;
window.clusterPreview = clusterPreview;

function titleCase(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function clusterPreview(id) {
  if (id === "problem") {
    return {
      count: 8,
      items: [
        { num: "1.1", title: "Solution-first adoption",                      kind: "rating + optional open" },
        { num: "1.2", title: "Institutional reshaping",                      kind: "rating + optional open" },
        { num: "1.3", title: "Who shapes the priorities",                    kind: "rating + optional open · paired" },
        { num: "1.4", title: "Was there ever a deliberation",                kind: "rating + optional open · paired" },
        { num: "1.5", title: "Are the layers connected",                     kind: "rating + optional open" },
        { num: "1.6", title: "What existing checks examine",                 kind: "rating + optional open" },
        { num: "1.7", title: "Is a recognise-and-name framework warranted",  kind: "rating + optional open" },
        { num: "1.8", title: "Have generative AI tools changed the picture", kind: "rating + optional open" },
      ],
    };
  }
  if (id === "framework") {
    return {
      count: 6,
      items: [
        { num: "2.1", title: "Is the two-layer structure useful",                  kind: "rating + optional open" },
        { num: "2.2", title: "AI governance as a recurring cycle",                 kind: "open-only" },
        { num: "2.3", title: "Are these the right four structural governance gaps", kind: "rating + required open" },
        { num: "2.4", title: "Recognising the four structural governance gaps in practice", kind: "rating grid + single-select" },
        { num: "2.5", title: "Bringing structural conditions back into view",      kind: "open-only" },
        { num: "2.6", title: "The Generative LLM Gate — stopping condition",       kind: "rating + optional open" },
      ],
    };
  }
  if (id === "instruments") {
    return {
      count: 4,
      items: CONTENT.instruments.map((inst, i) => ({
        num: `3.${i + 1}`,
        title: `${inst.code} — ${inst.title}`,
        kind: `${inst.stage} · 2 questions per instrument`,
      })),
    };
  }
  if (id === "close") {
    return {
      count: 2,
      items: [
        { num: "4.1", title: "Anything important the questions haven't reached", kind: "open-only · required" },
        { num: "4.2", title: "Feedback on the validation exercise itself",      kind: "open-only · optional" },
      ],
    };
  }
  return null;
}

/* ============================================================
   InstrumentScreen — Cluster 3 layout
   Top panel (persistent) + bottom panel with Q.1 and Q.2
   ============================================================ */
function InstrumentScreen({ screenId }) {
  const inst = CONTENT.instruments.find(i => i.id === screenId);
  if (!inst) return null;

  const [q1Rating, setQ1Rating] = useState_t(null);
  const [q2Rating, setQ2Rating] = useState_t(null);
  const [sharedOpenVal, setSharedOpenVal] = useState_t("");
  const [exploreOpen, setExploreOpen] = useState_t(false);
  const [runs, setRuns] = useState_t(0);

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">Instruments · {inst.slot} of {inst.total} &nbsp;·&nbsp; {inst.stage}</div>
        <h1 className="h-chapter">{inst.title} <span className="mono" style={{ color: "var(--ink-mute)", fontSize: 14, marginLeft: 8 }}>{inst.code}</span></h1>
        <p className="tagline tagline--mute">{inst.tagline}</p>

        {/* Instrument at a glance — concise four-field card (CIW only for now) */}
        {inst.glance && (
          <section className="inst-glance" aria-label="The instrument at a glance">
            <header className="inst-glance__head">
              <div className="inst-glance__kicker">The instrument at a glance</div>
            </header>
            <dl className="inst-glance__grid">
              {inst.glance.map((row, i) => (
                <div className="inst-glance__row" key={i}>
                  <dt className="inst-glance__label">{row.label}</dt>
                  <dd className="inst-glance__body">{row.body}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Top panel: how the instrument works (persistent) */}
        <section className="inst-panel">
          <header className="inst-panel__head">
            <div>
              <div className="inst-panel__kicker">
                {inst.glance ? "How the instrument works" : "Instrument as an object"}
              </div>
              {!inst.glance && (
                <div className="inst-panel__claim"><strong>Claimed contribution.</strong> {inst.claimed}</div>
              )}
            </div>
            {inst.operable && (
              <button className="btn btn--secondary" onClick={() => setExploreOpen(true)}>
                <Icon name="explore" size={14}/> Explore it
              </button>
            )}
          </header>

          {/* Representation placeholder */}
          <div className="inst-panel__body">
            <InstrumentRepresentation code={inst.code} inst={inst}/>
          </div>

          {/* Maturity note — when `glance` is set, maturity lives in the right-rail MATURITY card only */}
          {!inst.glance && (
            <div className="maturity" role="note" aria-label="Maturity statement">
              <div className="maturity__icon">P7</div>
              <div>
                <div className="maturity__level">{inst.maturity.level}</div>
                <div className="maturity__body" dangerouslySetInnerHTML={{ __html: inst.maturity.body }}/>
              </div>
            </div>
          )}
        </section>

        <div className="firewall">
          <span className="firewall__line"/>
          <span className="firewall__label"><Icon name="lock" size={12}/> &nbsp; Evaluation questions</span>
          <span className="firewall__line"/>
        </div>

        {/* Q.1 — rating only */}
        <QuestionCard
          slot="q1"
          tag="Q.1 · Quality"
          question={inst.q1.question}
          subtitle={inst.q1.subtitle}
        >
          <div className="field">
            <RatingControl rating={inst.q1.rating} value={q1Rating} onChange={setQ1Rating}/>
          </div>
        </QuestionCard>

        {/* Q.2 — rating only */}
        <QuestionCard
          slot="q2"
          tag="Q.2 · Applicability"
          question={inst.q2.question}
          subtitle={inst.q2.subtitle}
        >
          <div className="field">
            <RatingControl rating={inst.q2.rating} value={q2Rating} onChange={setQ2Rating}/>
          </div>
        </QuestionCard>

        {/* Shared required open — synthesis prompt below both ratings */}
        <section className="shared-open" aria-labelledby={`shared-open-${inst.id}`}>
          <header className="shared-open__head">
            <span className="shared-open__chip">Q.1 + Q.2 · Shared open</span>
            <span className="shared-open__hint">One synthesis response covers both ratings above.</span>
          </header>
          <OpenResponse
            open={inst.sharedOpen}
            value={sharedOpenVal}
            onChange={setSharedOpenVal}
            id={`shared-open-${inst.id}`}
            minHeight={200}
          />
        </section>
      </div>

      {exploreOpen && (
        <ExploreOverlay
          onClose={() => setExploreOpen(false)}
          onRun={() => setRuns(r => r + 1)}
        />
      )}
    </div>
  );
}
window.InstrumentScreen = InstrumentScreen;

/* ---- AST Explore overlay ----
   Thin React wrapper around the <ast-explore> web component (ast-explore.js).
   The component renders its own panel chrome, title strip, close button,
   firewall tagline, footer, and handles Escape internally. Our job is to:
     • render the overlay backdrop (with click-outside-to-close),
     • mount <ast-explore> inside it,
     • bridge the component's CustomEvents back to React state:
         - ast:verdict → bump the runs counter
         - ast:close   → close the overlay
   The component will also self-remove from the DOM on close. That happens
   synchronously inside the same event tick; React's setState here just
   schedules an unmount of the wrapper, which then no-ops its already-detached
   child. No conflict. */
function ExploreOverlay({ onClose, onRun }) {
  const hostRef = useRef_t(null);
  // Refs let the effect call the latest callbacks without re-running when
  // the parent recreates them (which it does every render — they're inline
  // arrows). Re-running the effect would tear down and remount <ast-explore>,
  // wiping its internal state and bouncing the user back to screen 1.
  const onCloseRef = useRef_t(onClose);
  const onRunRef = useRef_t(onRun);
  onCloseRef.current = onClose;
  onRunRef.current = onRun;

  useEffect_t(() => {
    const host = hostRef.current;
    if (!host) return;
    // The <ast-explore> element is appended imperatively so React never tries
    // to reconcile the element's children — the component owns its subtree.
    const el = document.createElement("ast-explore");
    const onVerdict = () => onRunRef.current && onRunRef.current();
    const onAstClose = () => onCloseRef.current && onCloseRef.current();
    el.addEventListener("ast:verdict", onVerdict);
    el.addEventListener("ast:close", onAstClose);
    host.appendChild(el);
    return () => {
      el.removeEventListener("ast:verdict", onVerdict);
      el.removeEventListener("ast:close", onAstClose);
      if (el.parentNode === host) host.removeChild(el);
    };
  }, []);

  return (
    <div
      className="overlay overlay--fullscreen overlay--ast-explore"
      role="presentation"
      onClick={onClose}>
      <div
        ref={hostRef}
        className="ast-explore-host"
        onClick={(e) => e.stopPropagation()}/>
    </div>
  );
}

/* ---- placeholder structured representations for each instrument ---- */
function InstrumentRepresentation({ code, inst }) {
  if (code === "AST") {
    // reuse a compact version of the AST mock that already worked
    return (
      <div className="inst-rep inst-rep--ast">
        <div className="ast__pool" style={{ padding: 0 }}>
          {[
            { n: "A1", t: "Full automation",                            s: "eliminated", l: "Eliminated" },
            { n: "A2", t: "Decision-support · binding recommendation",  s: "eliminated", l: "Eliminated" },
            { n: "A3", t: "Decision-support · advisory only",           s: "alive",      l: "Survives" },
            { n: "A4", t: "Triage / prioritisation assistance",         s: "alive",      l: "Survives" },
            { n: "A5", t: "Generative draft + human sign-off",          s: "tollgate",   l: "GLG gate" },
          ].map((p, i) => (
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
          Five candidate architectures evaluated against a deployment’s governance requirements. The procedure returns one of three verdicts (select · escalate · stop &amp; reframe). Surviving architectures appear in governability order.
        </p>
      </div>
    );
  }

  if (code === "CIW") {
    const flows = (inst && inst.flows) || [];
    const verdictClass = { ok: "verdict--ok", warn: "verdict--warn", no: "verdict--no" };

    // Per-flow body — one row per CI parameter, so Before/After read
    // horizontally and stay aligned across rows. Falls back gracefully
    // when before/after arrays differ in length (F3 placeholder case).
    const renderFlowRows = (f) => {
      const before = f.before || [];
      const after  = f.after  || [];
      const n = Math.max(before.length, after.length);
      return Array.from({ length: n }).map((_, i) => {
        const [bKey, bVal] = before[i] || ["", ""];
        const [, aVal]     = after[i]  || ["", ""];
        return (
          <tr key={i} className="ci-flow__param">
            <td className="ci-flow__pkey mono">{bKey}</td>
            <td className="ci-flow__pval">{bVal}</td>
            <td className="ci-flow__pval">{aVal}</td>
          </tr>
        );
      });
    };

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
          {flows.map((f) => (
            <tbody key={f.id} className="ci-flow__tbody">
              <tr className="ci-flow__flow-head">
                <th colSpan={3}>
                  <span className="ci-flow__num mono">{f.id}</span>
                  <span className="ci-flow__desc">{f.description}</span>
                  <span className={`verdict ${verdictClass[f.verdict] || ""}`}>{f.verdictLabel}</span>
                </th>
              </tr>
              {renderFlowRows(f)}
            </tbody>
          ))}
        </table>
        <p className="inst-rep__caption italic">
          Three illustrative flows, each described in five parameters before and after the AI system, then sorted into one of three verdicts. Deliberative attention concentrates on the middle category.
        </p>
      </div>
    );
  }

  if (code === "DMA") {
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
            {[
              ["Eligibility verification", "Caseworker", "System + caseworker confirm", "Caseworker, no time bar"],
              ["Risk-based prioritisation", "Caseworker", "System ranks; caseworker reviews", "Within 5 working days"],
              ["Final benefit determination", "Caseworker + supervisor", "System recommends; supervisor signs", "Supervisor only"],
            ].map((row, i) => (
              <tr key={i}>
                {row.map((c, j) => (
                  <td key={j} className={j === 0 ? "" : "mono"} style={j === 0 ? { fontWeight: 500 } : {}}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="inst-rep__caption italic">
          Per decision class: where effective authority moves — including into automated workflows or vendor-controlled components — and the oversight response that calls for.
        </p>
      </div>
    );
  }

  if (code === "CPD") {
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
            {[
              ["Notification", "Affected party informed of the decision and the right to challenge.", "Form, language, channel — and how receipt and understanding will be checked."],
              ["Explanation", "Reasons must be intelligible to a non-expert.", "Level of detail, format — and how usability will be checked."],
              ["Channel accessibility", "Multiple channels; no digital-only.", "Channels available to the served population — and how accessibility will be verified."],
              ["Human reviewer · substantive authority", "Reviewer can overturn, not only re-run.", "Reviewer role, independence, contextual information held — and how authority to overturn will be evidenced."],
              ["Timeline", "Decision within a reasonable window.", "Days, hours, urgency rules — and how timeliness will be monitored."],
              ["Feedback loop", "Outcomes feed back into review.", "How outcomes will be recorded and aggregated — and how systemic patterns will be surfaced for later evaluation."],
            ].map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{row[0]}</td>
                <td style={{ fontSize: 13 }}>{row[1]}</td>
                <td style={{ fontSize: 13, color: "var(--ink-soft)" }}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="inst-rep__caption italic">
          The six dimensions are interlocking, not additive: notification without an accessible channel, review without authority, or feedback without timely contestation does not make contestation operational.
        </p>
      </div>
    );
  }

  return null;
}

/* ============================================================
   ProfileScreen — first capture screen
   ============================================================ */
function ProfileScreen() {
  const p = CONTENT.profile;
  const [values, setValues] = useState_t({});
  const set = (k, v) => setValues(s => ({ ...s, [k]: v }));

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">Profile · A few details</div>
        <h1 className="h-chapter">{p.title}</h1>
        <p className="tagline tagline--mute">{p.tagline}</p>

        <section className="profile-form">
          {p.fields.map((f) => (
            <div className="field" key={f.key}>
              <label className="field__label" htmlFor={`pf-${f.key}`}>
                {f.label}{" "}
                {f.required
                  ? <span className="field__req">required</span>
                  : <span className="field__opt">optional</span>}
              </label>
              {f.kind === "text" && (
                <input
                  id={`pf-${f.key}`}
                  className="input"
                  type="text"
                  placeholder={f.placeholder || ""}
                  value={values[f.key] || ""}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
              {f.kind === "select" && (
                <div className="radio-group">
                  {f.options.map((o, i) => (
                    <label key={i} className="radio">
                      <input
                        type="radio"
                        name={f.key}
                        checked={values[f.key] === o}
                        onChange={() => set(f.key, o)}
                      />
                      <span className="radio__dot" aria-hidden="true"/>
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              )}
              {f.helper && <div className="field__hint">{f.helper}</div>}
            </div>
          ))}

          <div className="profile-note">
            <Icon name="info" size={14}/>
            <span>{p.languageNote}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
window.ProfileScreen = ProfileScreen;

/* ============================================================
   InterviewScreen — post-spine capture
   ============================================================ */
function InterviewScreen() {
  const i = CONTENT.interview;
  const [values, setValues] = useState_t({ window: [] });
  const set = (k, v) => setValues(s => ({ ...s, [k]: v }));
  const toggle = (k, v) => setValues(s => {
    const arr = s[k] || [];
    return { ...s, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] };
  });

  return (
    <div className="main">
      <div className="main__inner">
        <div className="kicker">Close · Optional follow-up</div>
        <h1 className="h-chapter">{i.title}</h1>
        <p className="tagline tagline--mute">{i.tagline}</p>
        <p className="lede" style={{ maxWidth: 680 }}>{i.intro}</p>

        <section className="profile-form">
          {i.fields.map((f) => (
            <div className="field" key={f.key}>
              <label className="field__label">
                {f.label}{" "}
                {f.required
                  ? <span className="field__req">required</span>
                  : <span className="field__opt">optional</span>}
              </label>
              {f.kind === "radio" && (
                <div className="radio-group">
                  {f.options.map((o, j) => (
                    <label key={j} className="radio">
                      <input
                        type="radio"
                        name={f.key}
                        checked={values[f.key] === o}
                        onChange={() => set(f.key, o)}
                      />
                      <span className="radio__dot" aria-hidden="true"/>
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              )}
              {f.kind === "checkbox-list" && (
                <div className="check-group">
                  {f.options.map((o, j) => (
                    <label key={j} className="check">
                      <input
                        type="checkbox"
                        checked={(values[f.key] || []).includes(o)}
                        onChange={() => toggle(f.key, o)}
                      />
                      <span className="check__box" aria-hidden="true"/>
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              )}
              {f.kind === "text" && (
                <input
                  type="text"
                  className="input"
                  placeholder={f.placeholder || ""}
                  value={values[f.key] || ""}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
              {f.helper && <div className="field__hint">{f.helper}</div>}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
window.InterviewScreen = InterviewScreen;
