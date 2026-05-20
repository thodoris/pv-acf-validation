// Main app — wires the cluster-based spine into screens, shell, overlays.

const { useState, useEffect, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "shellSide": "right",
  "affordanceMode": "rail",
  "overlayStyle": "drawer",
  "questionComp": "separated"
}/*EDITMODE-END*/;

/* ============================================================
   SCREENS — 34-entry spine
   Each entry: id, stepId (or null), location, hasShell?, affs[], kind?
   kind is used to dispatch to the right template component
   ============================================================ */
const SCREENS = [
  // ---------- Pre-instrument ----------
  { id: "welcome", stepId: null, location: "Welcome", hasShell: false, affs: [], kind: "welcome" },

  // ---------- Profile ----------
  { id: "profile", stepId: "profile",
    location: "Profile · A few details about you",
    kind: "profile",
    affs: [
      { kind: "scope", title: "Why we ask",
        items: [
          "Characterises the respondent pool for Chapter 9.",
          "<strong>Not</strong> used as validation evidence — kept separate in the data layer.",
          "All fields except <em>name</em> are required.",
        ] },
      { kind: "explanation", title: "Anonymity",
        body: "<p>The name field is optional. Leaving it blank lets you respond anonymously; anonymous responses count toward the sample but cannot be attributed to you in the thesis.</p>" },
    ] },

  // ---------- Grounding · 2 screens (subject + framework positioning) ----------
  ...["g1","g2"].map((id, i) => ({
    id, stepId: "grounding",
    location: `Grounding · ${i+1} of 2 · ${CONTENT.grounding[i].title}`,
    kind: `orient-${i+1}`,
    affs: groundingAffs(i),
  })),

  // ---------- Cluster 1 · Problem (2 setup screens + 7 question screens) ----------
  { id: "c1-setup1", stepId: "problem",
    location: "Problem · Introductory setup · 1 of 2",
    kind: "problem-setup-1",
    advanceLabel: "Continue",
    affs: [] },
  { id: "c1-setup2", stepId: "problem",
    location: "Problem · Introductory setup · 2 of 2",
    kind: "problem-setup-2",
    advanceLabel: "Begin the problem",
    affs: [] },
  ...["c1-q1","c1-q2","c1-q3q4","c1-q5","c1-q6","c1-q7","c1-q8"].map((id) => ({
    id, stepId: "problem",
    location: locationFromQ(id),
    kind: id === "c1-q3q4" ? "paired" : "question",
    affs: qAffs(id),
  })),

  // ---------- Cluster 2 · Framework (2 setup screens + 6 question screens) ----------
  { id: "c2-setup1", stepId: "framework",
    location: "Framework · Introductory setup · 1 of 2",
    kind: "framework-setup-1",
    advanceLabel: "Continue",
    affs: [] },
  { id: "c2-setup2", stepId: "framework",
    location: "Framework · Introductory setup · 2 of 2",
    kind: "framework-setup-2",
    advanceLabel: "Begin the framework",
    affs: [] },
  ...["c2-q1","c2-q2","c2-q3","c2-q4","c2-q6","c2-q7"].map((id) => ({
    id, stepId: "framework",
    location: locationFromQ(id),
    kind: "question",
    affs: qAffs(id),
  })),

  // ---------- Cluster 3 · Instruments (2 setup screens + 4 instrument screens) ----------
  { id: "c3-setup1", stepId: "instruments",
    location: "Instruments · Introductory setup · 1 of 2",
    kind: "instruments-setup-1",
    advanceLabel: "Continue",
    affs: [] },
  { id: "c3-setup2", stepId: "instruments",
    location: "Instruments · Introductory setup · 2 of 2",
    kind: "instruments-setup-2",
    advanceLabel: "Begin the instruments",
    affs: [] },
  ...CONTENT.instruments.map((inst) => ({
    id: inst.id, stepId: "instruments",
    location: `Instruments · ${inst.slot} of 4 · ${inst.code} ${inst.title}`,
    kind: "instrument",
    affs: instrumentAffs(inst),
  })),

  // ---------- Cluster 4 · Close (1 setup + 2 catch-alls) ----------
  { id: "c4-setup", stepId: "close",
    location: "Close · One last invitation",
    kind: "cluster-setup", clusterId: "close",
    affs: [
      { kind: "scope", title: "What this cluster does",
        items: [
          "Two final questions.",
          "<strong>Q4.1</strong> — the catch-all (required).",
          "<strong>Q4.2</strong> — feedback on the validation exercise itself (optional).",
        ] },
    ] },
  { id: "c4-close", stepId: "close", location: "Close · Q4.1 + Q4.2 · Catch-all",
    kind: "close-pair", affs: closeAffs() },

  // ---------- Post-spine ----------
  { id: "interview", stepId: "close",
    location: "Optional follow-up · Interview willingness",
    kind: "interview",
    affs: [
      { kind: "explanation", title: "Optional and separate",
        body: "<p>Your answers to the questionnaire are complete on their own. A follow-up interview is a way for the author to pursue any particular response of yours in more depth — it is voluntary and separate from the validation analysis.</p>" },
    ] },
  { id: "submit", stepId: "close",
    location: "Submit · Review and confirm",
    kind: "submit",
    affs: [
      { kind: "explanation", title: "What happens on submit",
        body: "<p>Your locked answers are sealed and added to the validation record. The form closes; you cannot reopen it. Withdrawal is possible by email for 30 days.</p>" },
    ] },
  { id: "thanks", stepId: null, location: "Complete · Thank you", hasShell: false, affs: [], kind: "thanks" },
];

/* ---------- Helpers for SCREENS construction ---------- */

function locationFromQ(id) {
  const q = CONTENT.questions[id];
  if (!q) return id;
  // e.g. "Problem · M1 · Q1.1 Solution-first adoption"
  return `${q.kicker} · ${q.chapter}`;
}

function groundingAffs(/* i */) {
  // G1 and G2 deliberately carry no right-rail affordances.
  // The reference triggers in the master shell remain available.
  return [];
}

function qAffs(id) {
  const q = CONTENT.questions[id];
  if (!q) return [];

  // Per-question explicit override — used when the auto-derived
  // scope/source/rationale shape can’t express what the question needs
  // (e.g. a SCOPE card with body + list + footer, or an EXAMPLE card).
  if (q.customAffs) return q.customAffs;

  const out = [];

  // Paired questions: surface each sub-question's affordances side by side
  if (q.kind === "paired") {
    q.questions.forEach((sq) => {
      out.push({
        kind: "scope",
        title: `${sq.tag} · Scope`,
        body: `<p>${sq.subtitle}</p>`,
      });
      if (sq.rationaleDependent) {
        out.push({
          kind: "explanation",
          title: `${sq.tag} · Why the framework takes this position`,
          body: sq.rationaleBody || "<p><em>Rationale unit placeholder.</em></p>",
        });
      }
    });
    return out;
  }

  // 1. Scope — repeats subtitle + any extra scope bullets
  if (!q.noScope) {
    out.push({
      kind: "scope",
      title: "Scope · What this question is about",
      body: `<p>${q.subtitle}</p>`,
      items: q.scopeNote || undefined,
    });
  }

  // 2. Source material — when authored
  if (q.sourceNote) {
    out.push({
      kind: "source",
      title: q.sourceNote.title || "Source material",
      items: q.sourceNote.items,
      body: q.sourceNote.footer ? `<p class="italic" style="margin-top:8px;">${q.sourceNote.footer}</p>` : undefined,
    });
  }

  // 3. Rationale card — for choice-judging questions
  if (q.rationaleDependent) {
    out.push({
      kind: "explanation",
      title: "Why the framework takes this position",
      body: q.rationaleBody || "<p><em>Rationale unit placeholder \u2014 full copy in Phase B+.</em></p>",
    });
  }

  return out;
}

function closeAffs() {
  // The merged Cluster 4 screen carries both Q4.1 (required) and Q4.2 (optional).
  // The rail surfaces each question's scope note as its own card so the rail's
  // affordance vocabulary stays one-card-per-question.
  const q1 = CONTENT.questions["c4-q1"];
  const q2 = CONTENT.questions["c4-q2"];
  const out = [];
  if (q1?.scopeNote) {
    out.push({
      kind: "scope",
      title: "Q4.1 · Required · Coverage catch-all",
      body: `<p>${q1.subtitle}</p>`,
      items: q1.scopeNote,
    });
  }
  if (q2?.scopeNote) {
    out.push({
      kind: "scope",
      title: "Q4.2 · Optional · Questionnaire & platform",
      body: `<p>${q2.subtitle}</p>`,
      items: q2.scopeNote,
    });
  }
  return out;
}

function instrumentAffs(inst) {
  // Consolidated SCOPE card — one card per screen, two sub-headed sub-sections.
  // Byte-identical across all four cluster 3 instrument screens
  // (Block 1.2 SCOPE standardisation + shortening pass).
  const out = [
    { kind: "scope",
      body:
        '<dl class="aff__qnotes">' +
          '<div><dt>Q.1 — Quality</dt>' +
          '<dd>Paperwork is not sacred: the judgment is about analytical work, not whether the template is well-formed as a document.</dd></div>' +
          '<div><dt>Q.2 — Applicability</dt>' +
          '<dd>“Hard to apply” in the open response reaches for <em>design</em> difficulty, not the set-up work the MATURITY card names.</dd></div>' +
        '</dl>' },
    inst.glance
      ? { kind: "maturity",
          labelOverride: "Maturity",
          body: `<p><strong>${inst.maturity.level}</strong></p><p>${inst.maturity.body}</p>` }
      : { kind: "maturity",
          title: `${inst.code} maturity claim (P7)`,
          body: `<p>${inst.maturity.body}</p>` },
  ];
  if (inst.code === "AST") {
    out.push({ kind: "operable",
      title: "Explore mode · firewalled",
      body: "<p>You can run the AST against scenarios via <strong>Explore it</strong> in the inspection panel above. Runs are <em>not</em> recorded; only your evaluation answers are.</p>",
      chips: [
        { num: "1", label: "Select deployment characteristics" },
        { num: "2", label: "Watch the elimination logic resolve" },
        { num: "3", label: "Form a judgement" },
      ] });
  }
  if (inst.code === "CPD") {
    out.push({ kind: "explanation",
      title: "Why so much is deliberately left open",
      body: "<p>A contestation pathway is meaningful only if affected citizens can actually use it. That depends on language, literacy, disability access, digital access, urgency, trust, and whether the reviewer has real authority.</p><p>The framework therefore pre-fills the six dimensions, but not the setting-specific details. The institution must specify those details and name how each will be verified.</p><p>The openness is not unfinished paperwork. It is where the institution must show that contestation is operationally reachable, not only formally promised.</p>" });
  }
  return out;
}

/* ============================================================
   Progress & time maps — span the new 34-screen spine
   ============================================================ */
const PROGRESS_MAP = {
  welcome:   0,
  profile:   2,
  g1:  6, g2: 14,
  "c1-setup1": 21,
  "c1-setup2": 23,
  "c1-q1": 25, "c1-q2": 28, "c1-q3q4": 32, "c1-q5": 36, "c1-q6": 40, "c1-q7": 43, "c1-q8": 47,
  "c2-setup1": 49,
  "c2-setup2": 51,
  "c2-q1": 53, "c2-q2": 57, "c2-q3": 61, "c2-q4": 65,                  "c2-q6": 72, "c2-q7": 76,
  "c3-setup1": 78, "c3-setup2": 80,
  "c3-ciw": 82, "c3-ast": 86, "c3-dma": 90, "c3-cpd": 93,
  "c4-setup": 95,
  "c4-close": 98,
  interview: 99,
  submit:    99,
  thanks:    100,
};
const TIME_MAP = {
  welcome:   50,
  profile:   49,
  g1: 48, g2: 46,
  "c1-setup1": 42, "c1-setup2": 42,
  "c1-q1": 41, "c1-q2": 39, "c1-q3q4": 37, "c1-q5": 34, "c1-q6": 32, "c1-q7": 31, "c1-q8": 28,
  "c2-setup1": 27, "c2-setup2": 27,
  "c2-q1": 26, "c2-q2": 23, "c2-q3": 21, "c2-q4": 19,                  "c2-q6": 14, "c2-q7": 12,
  "c3-setup1": 10, "c3-setup2": 10,
  "c3-ciw": 9, "c3-ast": 7, "c3-dma": 4, "c3-cpd": 2,
  "c4-setup": 2,
  "c4-close": 1,
  interview: 1, submit: 1, thanks: 0,
};

function screenIndex(id) { return SCREENS.findIndex(s => s.id === id); }

/* ============================================================
   App
   ============================================================ */
function App({ initialScreen, printMode = false }) {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState(initialScreen || "welcome");
  const [overlayKind, setOverlayKind] = useState(null);
  const [openAff, setOpenAff] = useState(null);

  const idx = screenIndex(screen);
  const current = SCREENS[idx];
  if (!current) return <p style={{ padding: 32 }}>Unknown screen: {screen}</p>;

  const percent = PROGRESS_MAP[screen] ?? 0;
  const timeLeft = TIME_MAP[screen] ?? 0;

  useEffect(() => {
    if (printMode) return;
    const onKey = (e) => {
      if (e.target.matches("input, textarea")) return;
      if (e.key === "Escape") { setOverlayKind(null); setOpenAff(null); }
      else if (e.key.toLowerCase() === "c") setOverlayKind(k => k === "cards" ? null : "cards");
      else if (e.key.toLowerCase() === "f") setOverlayKind(k => k === "framework" ? null : "framework");
    };
    window.addEventListener("keydown", onKey);
    window.__setScreen = (id) => { if (SCREENS.some(s => s.id === id)) setScreen(id); };
    window.__setOverlay = (kind) => setOverlayKind(kind);
    return () => window.removeEventListener("keydown", onKey);
  }, [printMode]);

  // Reset scroll on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // Stamp the current cluster on <html> so cluster-scoped CSS variables
  // (--coral / --coral-deep / --coral-tint / --focus-ring) rebind for
  // the whole page — topbar chrome included. Screens with no stepId
  // (welcome / thanks) clear the attribute and fall back to coral.
  useEffect(() => {
    const cluster = current.stepId || "";
    if (cluster) document.documentElement.dataset.cluster = cluster;
    else delete document.documentElement.dataset.cluster;
  }, [current.stepId]);

  const next = () => { if (idx < SCREENS.length - 1) setScreen(SCREENS[idx + 1].id); };
  const prev = () => { if (idx > 0) setScreen(SCREENS[idx - 1].id); };

  const showShell = current.hasShell !== false;
  const railOn = showShell && t.affordanceMode === "rail" && current.affs.length > 0;
  const shellClass = !showShell
    ? "shell shell--no-rail"
    : !railOn
      ? "shell shell--no-rail"
      : t.shellSide === "left"
        ? "shell shell--rail-left"
        : "shell";

  // Find which step is "current" for the top bar
  const currentStepId = current.stepId;

  const contextRelevant = current.kind === "question" || current.kind === "paired"
    ? (CONTENT.questions[screen]?.chapter || current.kind)
    : current.kind === "instrument"
      ? `Instrument · ${screen.replace("c3-","").toUpperCase()}`
      : null;

  return (
    <>
      <TopBar
        steps={CONTENT.steps}
        currentStepId={currentStepId}
        percent={percent}
        timeLeft={timeLeft}
        location={current.location}
        onOpenRef={(k) => setOverlayKind(k)}
        refOpen={overlayKind}
      />

      <div className={shellClass}>
        <div style={{ position: "relative" }}>
          {showShell && t.affordanceMode === "inline-expanders" && current.affs.length > 0 && (
            <InlineExpanders affs={current.affs} openIdx={openAff} setOpenIdx={setOpenAff}/>
          )}

          <ScreenRouter screen={screen} kind={current.kind} onStart={next}/>

          {showShell && screen !== "welcome" && screen !== "thanks" && (
            <NavBar
              onPrev={prev} onNext={next}
              idx={idx} total={SCREENS.length}
              screen={screen} kind={current.kind}
            />
          )}
        </div>

        {railOn && <Rail affordances={current.affs}/>}
      </div>

      {showShell && t.affordanceMode === "floating-tools" && current.affs.length > 0 && (
        <FloatingToolsContainer affs={current.affs} openIdx={openAff} setOpenIdx={setOpenAff}/>
      )}

      <ReferenceOverlay
        kind={overlayKind}
        variant={t.overlayStyle}
        contextRelevant={contextRelevant}
        onClose={() => setOverlayKind(null)}
      />

      {!printMode && (
      <TweaksPanel title="Tweaks · Variation explorer" noDeckControls>
        <TweakSection label="Master shell"/>
        <TweakRadio label="Rail side"
          value={t.shellSide} options={["right", "left"]}
          onChange={(v) => setTweak("shellSide", v)}/>
        <TweakSelect label="Affordance mode"
          value={t.affordanceMode}
          options={["rail", "inline-expanders", "floating-tools"]}
          onChange={(v) => setTweak("affordanceMode", v)}/>

        <TweakSection label="Reference overlay"/>
        <TweakSelect label="Overlay style"
          value={t.overlayStyle}
          options={["drawer", "fullscreen", "floating"]}
          onChange={(v) => setTweak("overlayStyle", v)}/>

        <TweakSection label="Jump to screen"/>
        <TweakSelect label="Screen"
          value={screen}
          options={SCREENS.map(s => s.id)}
          onChange={(v) => setScreen(v)}/>

        <TweakSection label="Open overlay (test)"/>
        <TweakButton label="Open concept cards (C)" onClick={() => setOverlayKind("cards")}/>
        <TweakButton label="Open whole framework (F)" onClick={() => setOverlayKind("framework")} secondary/>
      </TweaksPanel>
      )}

      {/* Fallback Tweaks launcher — opens the panel even when the host
          toolbar's Tweaks toggle isn't visible. Lives bottom-left so it
          doesn't collide with the floating-tools FAB on the right. */}
      {!printMode && (
        <button
          type="button"
          aria-label="Open Tweaks panel"
          title="Open Tweaks"
          onClick={() => window.postMessage({ type: "__activate_edit_mode" }, "*")}
          style={{
            position: "fixed",
            left: 14,
            bottom: 14,
            zIndex: 50,
            height: 32,
            padding: "0 12px 0 10px",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(26,24,22,0.86)",
            color: "#FBF8F1",
            border: "0.5px solid rgba(255,255,255,0.18)",
            borderRadius: 16,
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span aria-hidden="true" style={{
            display: "inline-block", width: 7, height: 7,
            borderRadius: "50%", background: "var(--coral, #B8472E)",
          }}/>
          Tweaks
        </button>
      )}
    </>
  );
}
window.__App = App;

/* ============================================================
   ScreenRouter — dispatch by kind to the right component
   ============================================================ */
function ScreenRouter({ screen, kind, onStart }) {
  if (kind === "welcome")       return <WelcomeScreen onStart={onStart}/>;
  if (kind === "profile")       return <ProfileScreen/>;
  if (kind === "orient-1")      return <OrientG1/>;
  if (kind === "orient-2")      return <OrientG2/>;
  if (kind === "cluster-setup") {
    const s = SCREENS.find(s => s.id === screen);
    return <ClusterSetupScreen clusterId={s.clusterId}/>;
  }
  if (kind === "problem-setup-1")   return <ProblemSetup1/>;
  if (kind === "problem-setup-2")   return <ProblemSetup2/>;
  if (kind === "framework-setup-1") return <FrameworkSetup1/>;
  if (kind === "framework-setup-2") return <FrameworkSetup2/>;
  if (kind === "instruments-setup-1") return <InstrumentsSetup1/>;
  if (kind === "instruments-setup-2") return <InstrumentsSetup2/>;
  if (kind === "question")      return <QuestionScreen screenId={screen}/>;
  if (kind === "paired")        return <PairedQuestionScreen screenId={screen}/>;
  if (kind === "close-pair")    return <ClosePairScreen/>;
  if (kind === "instrument")    return <InstrumentScreen screenId={screen}/>;
  if (kind === "interview")     return <InterviewScreen/>;
  if (kind === "submit")        return <SubmitScreen onSubmit={() => window.__setScreen && window.__setScreen("thanks")}/>;
  if (kind === "thanks")        return <ThanksScreen/>;
  return <div className="main"><div className="main__inner"><p>Unknown screen kind: {kind}</p></div></div>;
}

/* ============================================================
   Rail-variant containers and bottom nav
   ============================================================ */
function InlineExpanders({ affs, openIdx, setOpenIdx }) {
  return (
    <div style={{
      position: "sticky", top: "var(--topbar-h)",
      background: "var(--page)", borderBottom: "0.5px solid var(--border)",
      padding: "var(--space-3) var(--space-7)", zIndex: 10,
      display: "flex", gap: "var(--space-2)", flexWrap: "wrap",
    }}>
      <span className="kicker kicker--mute" style={{ marginBottom: 0, alignSelf: "center" }}>For this screen →</span>
      {affs.map((a, i) => (
        <details key={i} open={openIdx === i} onToggle={(e) => { if (e.target.open) setOpenIdx(i); }}>
          <summary style={{
            cursor: "pointer", listStyle: "none",
            padding: "6px 14px",
            background: openIdx === i ? "var(--coral-tint)" : "var(--surface)",
            border: "0.5px solid var(--border)",
            color: openIdx === i ? "var(--coral-deep)" : "var(--ink)",
            borderRadius: "var(--radius-pill)",
            fontSize: 12.5, fontWeight: 500,
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <Icon name={iconForKindGlobal(a.kind)} size={13}/> {kindShortGlobal(a.kind)}
          </summary>
          {openIdx === i && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)",
              left: "var(--space-7)", right: "var(--space-7)",
              background: "var(--surface)", border: "0.5px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: "var(--space-4) var(--space-5)",
              boxShadow: "var(--elev-sticky)", marginTop: 8, zIndex: 12,
            }}>
              <button onClick={() => setOpenIdx(null)} style={{ float: "right", border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-soft)" }}><Icon name="close" size={14}/></button>
              <AffordanceInline a={a}/>
            </div>
          )}
        </details>
      ))}
    </div>
  );
}

function iconForKindGlobal(k) { return ({ scope: "info", source: "book", explanation: "wand", video: "play", maturity: "info", operable: "explore", example: "book" })[k] || "info"; }
function kindShortGlobal(k) { return ({ scope: "Scope", source: "Source", explanation: "Explanation", video: "Video", maturity: "Maturity", operable: "Operable", example: "Example" })[k] || "More"; }

function AffordanceInline({ a }) {
  return (
    <>
      <div className="aff__head"><span className="aff__kind">{kindShortGlobal(a.kind)}</span></div>
      {a.title && <h3 className="aff__title">{a.title}</h3>}
      <div className="aff__body">
        {a.body && <div dangerouslySetInnerHTML={{ __html: a.body }}/>}
        {a.items && <ul>{a.items.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: it }}/>)}</ul>}
        {a.chips && (
          <div className="aff__chips">
            {a.chips.map((c, i) => (<span className="chip" key={i}>{c.num && <span className="chip__num">{c.num}</span>}{c.label}</span>))}
          </div>
        )}
      </div>
    </>
  );
}

function FloatingToolsContainer({ affs, openIdx, setOpenIdx }) {
  return (
    <>
      <div className="tools-fab">
        {affs.map((a, i) => (
          <button key={i} className="tools-fab__btn" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <span className="tools-fab__icon"><Icon name={iconForKindGlobal(a.kind)}/></span>
            {kindShortGlobal(a.kind)}
          </button>
        ))}
      </div>
      {openIdx != null && affs[openIdx] && (
        <div style={{
          position: "fixed", right: 22, bottom: 22 + (affs.length * 44) + 8,
          width: 380, maxHeight: "60vh", overflowY: "auto",
          background: "var(--surface)", border: "0.5px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5)",
          boxShadow: "var(--elev-modal)", zIndex: 30,
        }}>
          <button onClick={() => setOpenIdx(null)} style={{ float: "right", border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-soft)" }}><Icon name="close" size={14}/></button>
          <AffordanceInline a={affs[openIdx]}/>
        </div>
      )}
    </>
  );
}

function NavBar({ onPrev, onNext, idx, total, screen, kind }) {
  const atEnd = idx >= total - 1;
  const isClusterSetup = kind === "cluster-setup";
  const isFrameworkSetup = kind === "framework-setup-1" || kind === "framework-setup-2";
  const isProblemSetup = kind === "problem-setup-1" || kind === "problem-setup-2";
  const isInstrumentsSetup = kind === "instruments-setup-1" || kind === "instruments-setup-2";
  const isSetup = isClusterSetup || isFrameworkSetup || isProblemSetup || isInstrumentsSetup;
  const isOrient = kind && kind.startsWith("orient-");
  const isQuestion = kind === "question" || kind === "paired" || kind === "instrument" || kind === "close-pair";

  // What to call the advance button
  let advanceLabel = "Continue";
  if (kind === "profile")  advanceLabel = "Continue to grounding";
  else if (isClusterSetup) {
    const s = SCREENS.find(s => s.id === screen);
    const c = CONTENT.clusters[s.clusterId];
    advanceLabel = `Begin ${c.label.toLowerCase()}`;
  }
  else if (kind === "orient-2") advanceLabel = "Begin the problem";
  else if (kind === "close-pair") advanceLabel = "Continue to follow-up";
  else if (kind === "interview") advanceLabel = "Continue to submission";
  else if (isQuestion)          advanceLabel = "Submit & continue";

  // Per-screen advance-label override wins over the kind-derived default.
  const currentScreen = SCREENS.find(s => s.id === screen);
  if (currentScreen?.advanceLabel) advanceLabel = currentScreen.advanceLabel;

  // Left note
  let leftNote;
  if (isOrient) {
    const m = ({ g1:1, g2:2 })[screen];
    leftNote = `Grounding · ${m} of 2 · no question on this screen`;
  } else if (isQuestion) {
    leftNote = <>Screen {idx + 1} of {total} &nbsp; · &nbsp; <span style={{ fontStyle: "italic" }}>Answers lock on advance</span></>;
  } else if (isSetup) {
    leftNote = "Introductory setup · not a graded screen";
  } else {
    leftNote = `Screen ${idx + 1} of ${total}`;
  }

  // Submit screen has its own internal submit button; nav bar shows only Back
  if (kind === "submit") {
    return (
      <div className="main">
        <div className="main__inner">
          <div className="q-actions">
            <div className="q-actions__left"><span style={{ fontStyle: "italic" }}>You can still go back and review any locked answer.</span></div>
            <div className="q-actions__right">
              <button className="btn btn--secondary" onClick={onPrev}><Icon name="chevron-left" size={14}/> Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="main__inner">
        <div className="q-actions">
          <div className="q-actions__left">{leftNote}</div>
          <div className="q-actions__right">
            <button className="btn btn--secondary" onClick={onPrev} disabled={idx === 0}>
              <Icon name="chevron-left" size={14}/> Back
            </button>
            <button className="btn btn--primary" onClick={onNext} disabled={atEnd}>
              {advanceLabel} <Icon name="chevron-right" size={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Mount
   ============================================================ */
const rootEl = document.getElementById("root");
if (rootEl && rootEl.dataset.skipMount !== "true") {
  ReactDOM.createRoot(rootEl).render(<App/>);
}
