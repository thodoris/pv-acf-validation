// Master shell: TopBar (fixed) + RightRail (contextual).
// All exposed on window for cross-script use.

const { useState } = React;

/* ---------- Tiny inline icon set (Tabler-style line) ---------- */
const Icon = ({ name, size = 16 }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.5,
    strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (name) {
    case "cards":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="13" height="14" rx="1.5"/>
          <path d="M7 9h6M7 12h5M7 15h4"/>
          <path d="M16 7l4 1.2v11l-4-1.2"/>
        </svg>
      );
    case "framework":
      return (
        <svg {...common}>
          <circle cx="12" cy="6" r="2"/>
          <circle cx="6" cy="17" r="2"/>
          <circle cx="18" cy="17" r="2"/>
          <path d="M12 8v3M12 11l-5 4.5M12 11l5 4.5"/>
        </svg>
      );
    case "close":
      return <svg {...common}><path d="M6 6l12 12M6 18L18 6"/></svg>;
    case "play":
      return <svg width={size*1.4} height={size*1.4} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
    case "info":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v4h1"/></svg>;
    case "book":
      return <svg {...common}><path d="M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3V4z"/><path d="M5 17a3 3 0 013-3h10"/></svg>;
    case "wand":
      return <svg {...common}><path d="M15 4l-1 2-2 1 2 1 1 2 1-2 2-1-2-1zM9 9l-7 11 2 2 11-7"/></svg>;
    case "chevron-right":
      return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case "chevron-left":
      return <svg {...common}><path d="M15 6l-6 6 6 6"/></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "lock":
      return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>;
    case "explore":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M15 9l-2 5-5 2 2-5z"/></svg>;
    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M9 18h6"/>
          <path d="M10 21h4"/>
          <path d="M12 3a6 6 0 0 0-3.5 10.9c.5.5 1 1.5 1 2.1v1h5v-1c0-.6.5-1.6 1-2.1A6 6 0 0 0 12 3z"/>
        </svg>
      );
    case "check":
      return <svg {...common}><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>;
    default: return null;
  }
};
window.Icon = Icon;

/* ---------- Top bar ---------- */
function TopBar({ steps, currentStepId, percent, timeLeft, location, onOpenRef, refOpen }) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">C9</span>
          <span>PV-ACF · Expert Review</span>
        </div>
        <span className="brand__line" aria-hidden="true"/>
        <span className="location" title={location}>
          <strong>{location.split(" · ")[0]}</strong>
          {location.includes(" · ") && <> · {location.split(" · ").slice(1).join(" · ")}</>}
        </span>
      </div>

      <div className="topbar__center">
        <div className="progress-cluster" role="navigation" aria-label="Progress">
          <div className="steps">
            {steps.map((s, i) => {
              const currentIdx = steps.findIndex(x => x.id === currentStepId);
              const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
              return (
                <React.Fragment key={s.id}>
                  <div className={`step step--${state}`} title={s.label}>
                    <span className="step__dot" aria-hidden="true"/>
                    <span className="step__label">{s.short}</span>
                  </div>
                  {i < steps.length - 1 && <span className="step__divider" aria-hidden="true"/>}
                </React.Fragment>
              );
            })}
          </div>
          <div className="percent-time" aria-label="Completion and remaining time">
            <div className="percent-time__bar"><div className="percent-time__fill" style={{ width: `${percent}%` }}/></div>
            <span>{percent}%</span>
            <span aria-hidden="true">·</span>
            <Icon name="clock" size={12}/>
            <span>~{timeLeft}′</span>
          </div>
        </div>
      </div>

      <div className="topbar__right">
        <button
          className="ref-trigger"
          onClick={() => onOpenRef("cards")}
          aria-pressed={refOpen === "cards"}
        >
          <span className="ref-trigger__icon"><Icon name="cards"/></span>
          Concept cards
          <span className="ref-trigger__kbd">C</span>
        </button>
        <button
          className="ref-trigger"
          onClick={() => onOpenRef("framework")}
          aria-pressed={refOpen === "framework"}
        >
          <span className="ref-trigger__icon"><Icon name="framework"/></span>
          Whole framework
          <span className="ref-trigger__kbd">F</span>
        </button>
      </div>
    </header>
  );
}
window.TopBar = TopBar;

/* ---------- Right rail ---------- */
function Rail({ affordances }) {
  if (!affordances || affordances.length === 0) {
    return (
      <aside className="rail">
        <p className="rail__title">For this screen</p>
        <div className="aff">
          <div className="aff__head">
            <span className="aff__kind">No contextual material</span>
          </div>
          <div className="aff__body">
            <p className="italic">This screen declares no extra affordances. The frame stays — the slot is empty, not relabelled.</p>
          </div>
        </div>
      </aside>
    );
  }
  return (
    <aside className="rail" aria-label="Contextual affordances">
      <p className="rail__title">For this screen</p>
      {affordances.map((a, i) => <AffordanceCard key={i} {...a}/>)}
    </aside>
  );
}
window.Rail = Rail;

function AffordanceCard({ kind, title, items, body, footer, chips, video, labelOverride }) {
  const iconName = ({ example: "lightbulb", source: "book", explanation: "wand", maturity: "info" })[kind];
  return (
    <section className={`aff aff--${kind}`}>
      <div className="aff__head">
        <span className="aff__kind">
          {iconName && <span className="aff__kind-icon"><Icon name={iconName} size={13}/></span>}
          {labelOverride || kindLabel(kind)}
        </span>
      </div>
      {title && <h3 className="aff__title" dangerouslySetInnerHTML={{ __html: title }}/>}
      <div className="aff__body">
        {body && <div dangerouslySetInnerHTML={{ __html: body }}/>}
        {items && (
          <ul>
            {items.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: it }}/>)}
          </ul>
        )}
        {footer && <div className="aff__footer" dangerouslySetInnerHTML={{ __html: footer }}/>}
        {chips && (
          <div className="aff__chips">
            {chips.map((c, i) => (
              <span className="chip" key={i}>
                {c.num && <span className="chip__num">{c.num}</span>}
                {c.label}
              </span>
            ))}
          </div>
        )}
        {video && (
          <>
            <div className="video-thumb" role="button" tabIndex={0} aria-label={`Play: ${video.title}`}>
              <Icon name="play" size={28}/>
            </div>
            <div className="video-meta">
              <span>{video.title}</span>
              <span>{video.duration}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
function kindLabel(k) {
  return ({
    scope: "Scope · What makes a good answer",
    source: "Source material",
    explanation: "Detailed explanation",
    example: "Example",
    video: "Instrument video",
    operable: "Operable widget — explore",
    maturity: "Maturity statement (P7)",
  })[k] || "Affordance";
}

/* ---------- Floating tools (variant) ---------- */
function FloatingTools({ affordances, onPick }) {
  if (!affordances) return null;
  return (
    <div className="tools-fab">
      {affordances.map((a, i) => (
        <button key={i} className="tools-fab__btn" onClick={() => onPick(i)}>
          <span className="tools-fab__icon"><Icon name={iconForKind(a.kind)}/></span>
          {kindShort(a.kind)}
        </button>
      ))}
    </div>
  );
}
function iconForKind(k) {
  return ({ scope: "info", source: "book", explanation: "wand", video: "play", maturity: "info" })[k] || "info";
}
function kindShort(k) {
  return ({ scope: "Scope", source: "Source", explanation: "Explain", video: "Video", maturity: "Maturity" })[k] || "More";
}
window.FloatingTools = FloatingTools;
