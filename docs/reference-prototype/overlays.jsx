// Reference layer overlay — concept cards + whole-framework presentation.

function ReferenceOverlay({ kind, onClose, contextRelevant, variant }) {
  if (!kind) return null;
  const wrapClass =
    variant === "fullscreen" ? "overlay overlay--fullscreen"
    : variant === "floating" ? "overlay overlay--floating"
    : "overlay"; // default = side drawer

  return (
    <div className={wrapClass} role="dialog" aria-modal="true" onClick={onClose}>
      <div className="overlay__panel" onClick={(e) => e.stopPropagation()}>
        <header className="overlay__head">
          <div>
            <div className="overlay__kind">
              {kind === "cards" ? "Reference · Concepts & terminology" : "Reference · The whole framework"}
            </div>
            <div className="overlay__title">
              {kind === "cards" ? "Concepts relevant to this screen" : "PV-ACF — whole-framework presentation"}
            </div>
          </div>
          <button className="overlay__close" onClick={onClose} aria-label="Close"><Icon name="close"/></button>
        </header>

        <div className="overlay__body">
          {kind === "cards" ? <ConceptCards contextRelevant={contextRelevant}/> : <FrameworkPresentation/>}
        </div>

        <div className="overlay__hint">
          <span><em>Activity here is not captured as response data.</em></span>
          <span className="mono">Esc to close</span>
        </div>
      </div>
    </div>
  );
}
window.ReferenceOverlay = ReferenceOverlay;

function ConceptCards({ contextRelevant }) {
  return (
    <>
      {contextRelevant && (
        <div className="relevance-banner">
          <Icon name="info" size={14}/>
          <span>Concepts most relevant to the current screen ({contextRelevant}) are listed first.</span>
        </div>
      )}
      <div className="concept-list">
        {CONTENT.concepts.map((c, i) => (
          <article className={`concept ${c.featured ? "concept--featured" : ""}`} key={i}>
            <div className="concept__head">
              <h3 className="concept__title">{c.title}</h3>
              <span className="concept__greek">{c.gr}</span>
            </div>
            <div className="concept__body" dangerouslySetInnerHTML={{ __html: c.body }}/>
            {c.rels && (
              <div className="concept__rel">
                {c.rels.map((r, j) => <span className="concept__rel-chip" key={j}>{r}</span>)}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function FrameworkPresentation() {
  return (
    <div className="framework">
      <p style={{ color: "var(--ink-soft)", fontSize: 14.5 }}>
        The <em>Public-Value AI Co-production Framework</em> articulates its architecture across two layers:
        a preparatory diagnostic layer that screens for <strong>four governance gaps</strong>,
        and a five-stage recursive lifecycle that returns to that layer on every pass.
      </p>

      <div className="framework__diagram" aria-label="Schematic of the framework">
        {window.FrameworkOrganisationDiagram ? (
          <window.FrameworkOrganisationDiagram
            variant="linear"
            size="medium"
            autoplay={true}
            showGate={true}
            showRefBacks={true}
          />
        ) : (
          <div className="mono" style={{ padding: "var(--space-4)", color: "var(--ink-mute)", fontSize: 12 }}>
            framework-organisation-diagram · loading…
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        <div className="card">
          <div className="kicker">Stage 2 instruments</div>
          <p style={{ fontSize: 13.5, margin: 0 }}>
            <strong>Contextual Integrity Worksheet</strong> &nbsp;·&nbsp; <strong>Architecture Selection Tool</strong>
          </p>
        </div>
        <div className="card">
          <div className="kicker">Stage 3 instruments</div>
          <p style={{ fontSize: 13.5, margin: 0 }}>
            <strong>Discretion Migration Analysis</strong> &nbsp;·&nbsp; <strong>Contestation Pathway Design</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
