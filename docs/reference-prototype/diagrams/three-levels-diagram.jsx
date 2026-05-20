/* three-levels-diagram.jsx
   PV-ACF Cluster 1 — three-levels-diagram-v1.

   The visual anchor for Cluster 1's first setup screen ("When the
   deployment isn't the whole story"). Three rounded-rectangle nodes
   in a horizontal chain (Strategy → Institutional → Deployment) with
   two unlabelled flow arrows between adjacent boxes. No continuous
   motion in the settled state.

   Props:
     size       'full' | 'small'      — visual scale (default 'full')
     feedback   boolean               — when true, renders the additive
                                        right-to-left dashed feedback
                                        arrow underneath (Q1.5 variant)
     highlight  'strategy' | 'institutional' | 'deployment' | 'all'
                                      — optional level highlight for
                                        small-scale source-card reuse
     autoplay   boolean               — short staggered fade-in build
                                        (default true; honours
                                        prefers-reduced-motion)
     ariaLabel  string                — overrides DEFAULT_ALT

   No external dependencies — does NOT need animations.jsx.

   Exposes: window.ThreeLevelsDiagram
*/

(function () {
  /* ---------- Tokens (from DESIGN_TOKENS.md, kept in sync with FOD) ---------- */
  const C = {
    page:        '#FBF8F1',
    surface:     '#FFFFFF',
    surfaceDeep: '#F8F4EA',
    inkStrong:   '#1A1816',
    ink:         '#2C2C2A',
    inkSoft:     '#5F5E5A',
    inkMute:     '#888780',
    inkFaint:    '#B7B5AE',
    coral:       '#B8472E',
    coralDeep:   '#712B13',
    coralTint:   '#FAECE7',
    border:      '#E5E0D2',
    borderStrong:'#B4B0A2',
  };

  const FONT_SANS = "'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif";
  const FONT_MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

  const STYLE_ID = '__tld_styles_v1';
  if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      .tld-wrap { display: block; width: 100%; }
      .tld-svg  { display: block; width: 100%; height: auto; }
    `;
    document.head.appendChild(s);
  }

  /* ---------- Hooks ---------- */
  function useReducedMotion() {
    const [r, setR] = React.useState(() =>
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false
    );
    React.useEffect(() => {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const h = (e) => setR(e.matches);
      mq.addEventListener ? mq.addEventListener('change', h) : mq.addListener(h);
      return () => mq.removeEventListener ? mq.removeEventListener('change', h) : mq.removeListener(h);
    }, []);
    return r;
  }

  function useBuildTime({ autoplay, duration }) {
    const reduced = useReducedMotion();
    const skip = !autoplay || reduced;
    const [t, setT] = React.useState(skip ? duration : 0);
    React.useEffect(() => {
      if (skip) { setT(duration); return; }
      let raf = 0, started = null;
      const step = (ts) => {
        if (started === null) started = ts;
        const e = (ts - started) / 1000;
        if (e >= duration) { setT(duration); return; }
        setT(e);
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => raf && cancelAnimationFrame(raf);
    }, [skip, duration]);
    return t;
  }

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const entry = (t, start, dur = 0.45) => easeOutCubic(clamp((t - start) / dur, 0, 1));

  /* ---------- Default alt-text ---------- */
  const DEFAULT_ALT =
    "Three-levels diagram. Three rounded rectangles arranged horizontally, equally sized and equally weighted, named left-to-right: Strategy level (strategic priorities), Institutional level (institutional routines), Deployment level (AI deployment). Two unlabelled arrows point left-to-right between adjacent boxes, indicating that decisions taken at upstream levels shape what is possible downstream.";

  const DEFAULT_ALT_FEEDBACK =
    DEFAULT_ALT + " A dashed arrow underneath the three boxes points right-to-left from the deployment level back to the strategy level, indicating that patterns established at the deployment level can feed back to reshape the upstream levels over time.";

  /* ---------- Levels (single source of truth) ---------- */
  const LEVELS = [
    { id: 'strategy',      name: 'Strategy level',      sub: 'strategic priorities'   },
    { id: 'institutional', name: 'Institutional level', sub: 'institutional routines' },
    { id: 'deployment',    name: 'Deployment level',    sub: 'AI deployment'          },
  ];

  /* ============================================================
     Component shell
     ============================================================ */
  function ThreeLevelsDiagram({
    size = 'full',
    feedback = false,
    highlight = null,
    autoplay = true,
    ariaLabel,
  }) {
    const duration = 1.6;
    const t = useBuildTime({ autoplay, duration });

    const maxW = size === 'small' ? 360 : 820;
    const wrapStyle = { maxWidth: maxW, margin: '0 auto' };

    const Body = size === 'small' ? SmallBody : FullBody;

    return (
      <div
        role="img"
        aria-label={ariaLabel || (feedback ? DEFAULT_ALT_FEEDBACK : DEFAULT_ALT)}
        className={`tld-wrap tld tld--${size}${feedback ? ' tld--feedback' : ''}`}
        style={wrapStyle}
      >
        <Body t={t} feedback={feedback} highlight={highlight}/>
      </div>
    );
  }

  /* ---------- Shared SVG defs ---------- */
  function ArrowDefs() {
    return (
      <defs>
        <marker id="tld-ar-soft"  markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,1 L7,4.5 L0,8 z" fill={C.inkSoft}/>
        </marker>
        <marker id="tld-ar-coral" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0.7 L6,3.5 L0,6.3 z" fill={C.coral}/>
        </marker>
      </defs>
    );
  }

  /* ============================================================
     Full size — primary placement
     ============================================================ */
  function FullBody({ t, feedback, highlight }) {
    const VB_W = 820, VB_H = feedback ? 250 : 200;
    const pad = 16;
    const boxW = 230, boxH = 110;
    const gap = (VB_W - 2 * pad - 3 * boxW) / 2;  // → 67px
    const boxY = 28;

    const boxes = LEVELS.map((lv, i) => ({
      ...lv,
      x: pad + i * (boxW + gap),
      y: boxY,
      cx: pad + i * (boxW + gap) + boxW / 2,
    }));

    // Build sequence: boxes fade up in stagger; arrows after; feedback last.
    const boxO = [entry(t, 0.00, 0.45), entry(t, 0.18, 0.45), entry(t, 0.36, 0.45)];
    const arrO = [entry(t, 0.70, 0.40), entry(t, 0.85, 0.40)];
    const fbO  = feedback ? entry(t, 1.10, 0.45) : 0;

    return (
      <svg className="tld-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        <ArrowDefs/>

        {/* Three boxes */}
        {boxes.map((b, i) => {
          const isHi =
            highlight === b.id ||
            highlight === 'all';
          const fill   = isHi ? C.coralTint : C.surface;
          const stroke = isHi ? C.coral     : C.borderStrong;
          return (
            <g key={b.id} opacity={boxO[i]} transform={`translate(0, ${(1 - boxO[i]) * 8})`}>
              <rect
                x={b.x} y={b.y} width={boxW} height={boxH} rx={6} ry={6}
                fill={fill} stroke={stroke} strokeWidth={0.8}
              />
              <text
                x={b.cx} y={b.y + 50}
                fontFamily={FONT_SANS} fontSize={18} fontWeight={600}
                fill={C.inkStrong} textAnchor="middle"
              >
                {b.name}
              </text>
              <text
                x={b.cx} y={b.y + 78}
                fontFamily={FONT_MONO} fontSize={12}
                fill={C.inkMute} textAnchor="middle"
                letterSpacing="0.02em"
              >
                {b.sub}
              </text>
            </g>
          );
        })}

        {/* Two flow arrows between adjacent boxes */}
        {[0, 1].map((i) => {
          const x1 = boxes[i].x + boxW + 10;
          const x2 = boxes[i + 1].x - 4;
          const y  = boxY + boxH / 2;
          return (
            <line
              key={i}
              x1={x1} y1={y} x2={x2} y2={y}
              stroke={C.inkSoft} strokeWidth={1.4}
              markerEnd="url(#tld-ar-soft)"
              opacity={arrO[i]}
            />
          );
        })}

        {/* Optional feedback arrow (Q1.5 variant) */}
        {feedback && (
          <g opacity={fbO}>
            <path
              d={`M ${boxes[2].cx} ${boxY + boxH + 32} L ${boxes[0].cx + 4} ${boxY + boxH + 32}`}
              stroke={C.coral} strokeWidth={1.1} strokeDasharray="5 4"
              fill="none" markerEnd="url(#tld-ar-coral)"
            />
            <text
              x={(boxes[0].cx + boxes[2].cx) / 2}
              y={boxY + boxH + 56}
              fontFamily={FONT_MONO} fontSize={11}
              fill={C.coralDeep} textAnchor="middle"
              letterSpacing="0.04em" fontStyle="italic"
            >
              effects feed back over time
            </text>
          </g>
        )}
      </svg>
    );
  }

  /* ============================================================
     Small size — source-card reuse
     ============================================================ */
  function SmallBody({ t, feedback, highlight }) {
    const VB_W = 360, VB_H = feedback ? 150 : 110;
    const pad = 8;
    const boxW = 100, boxH = 56;
    const gap = (VB_W - 2 * pad - 3 * boxW) / 2;  // → 22px
    const boxY = 14;

    const boxes = LEVELS.map((lv, i) => ({
      ...lv,
      x: pad + i * (boxW + gap),
      y: boxY,
      cx: pad + i * (boxW + gap) + boxW / 2,
    }));

    const showAll = entry(t, 0.0, 0.30);
    const fbO = feedback ? entry(t, 0.5, 0.45) : 0;

    return (
      <svg className="tld-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        <ArrowDefs/>

        {/* Boxes — subtitle omitted at small scale per spec */}
        {boxes.map((b) => {
          const isHi =
            highlight === b.id ||
            highlight === 'all';
          const fill   = isHi ? C.coralTint : C.surface;
          const stroke = isHi ? C.coral     : C.borderStrong;
          return (
            <g key={b.id} opacity={showAll}>
              <rect
                x={b.x} y={b.y} width={boxW} height={boxH} rx={4} ry={4}
                fill={fill} stroke={stroke} strokeWidth={0.6}
              />
              <text
                x={b.cx} y={b.y + 34}
                fontFamily={FONT_SANS} fontSize={12} fontWeight={600}
                fill={C.inkStrong} textAnchor="middle"
              >
                {b.name.replace(' level', '')}
              </text>
            </g>
          );
        })}

        {/* Arrows */}
        {[0, 1].map((i) => {
          const x1 = boxes[i].x + boxW + 4;
          const x2 = boxes[i + 1].x - 2;
          const y  = boxY + boxH / 2;
          return (
            <line
              key={i}
              x1={x1} y1={y} x2={x2} y2={y}
              stroke={C.inkSoft} strokeWidth={1}
              markerEnd="url(#tld-ar-soft)"
              opacity={showAll}
            />
          );
        })}

        {feedback && (
          <g opacity={fbO}>
            <path
              d={`M ${boxes[2].cx} ${boxY + boxH + 18} L ${boxes[0].cx + 3} ${boxY + boxH + 18}`}
              stroke={C.coral} strokeWidth={0.9} strokeDasharray="4 3"
              fill="none" markerEnd="url(#tld-ar-coral)"
            />
            <text
              x={(boxes[0].cx + boxes[2].cx) / 2}
              y={boxY + boxH + 34}
              fontFamily={FONT_MONO} fontSize={9}
              fill={C.coralDeep} textAnchor="middle"
              letterSpacing="0.04em" fontStyle="italic"
            >
              feeds back over time
            </text>
          </g>
        )}
      </svg>
    );
  }

  /* ---------- Expose ---------- */
  window.ThreeLevelsDiagram = ThreeLevelsDiagram;
})();
