/* instrument-reading-diagram.jsx
   PV-ACF Cluster 3 — instrument-reading-diagram-v1.

   The visual anchor for Cluster 3's first setup screen ("How to read
   an instrument here"). Three rounded-rectangle tiers stacked
   vertically, with single downward arrows between adjacent tiers.

       ┌───────────────────────────────────┐
       │  THE FRAMEWORK SPECIFIES          │
       │  structure · prompts · …          │
       └───────────────────────────────────┘
                       ↓
       ┌───────────────────────────────────┐
       │  THE INSTITUTION CONFIGURES       │
       │  roles · records · …              │
       └───────────────────────────────────┘
                       ↓
       ┌───────────────────────────────────┐
       │  YOU JUDGE                        │
       │  distinctive analytical work · …  │
       └───────────────────────────────────┘

   Form is fixed (vertical, three equally-weighted tiers). No
   continuous motion in the settled state. Optional ~2.5 s staggered
   top-to-bottom build, honours prefers-reduced-motion.

   Props:
     size       'full' | 'small'      — visual scale (default 'full').
                                        Only 'full' is currently used
                                        by the platform; 'small' is a
                                        forward-looking variant.
     autoplay   boolean               — short staggered fade-in build
                                        (default true)
     ariaLabel  string                — overrides DEFAULT_ALT

   No external dependencies — does NOT need animations.jsx.

   Exposes: window.InstrumentReadingDiagram
*/

(function () {
  /* ---------- Tokens (kept in sync with DESIGN_TOKENS.md) ---------- */
  const C = {
    surface:     '#FFFFFF',
    surfaceDeep: '#F8F4EA',
    inkStrong:   '#1A1816',
    ink:         '#2C2C2A',
    inkSoft:     '#5F5E5A',
    inkMute:     '#888780',
    coral:       '#B8472E',
    coralDeep:   '#712B13',
    coralTint:   '#FAECE7',
    border:      '#E5E0D2',
    borderStrong:'#B4B0A2',
  };

  const FONT_SANS = "'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif";
  const FONT_MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

  const STYLE_ID = '__ird_styles_v1';
  if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      .ird-wrap { display: block; width: 100%; }
      .ird-svg  { display: block; width: 100%; height: auto; }
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

  /* ---------- Tiers (single source of truth) ---------- */
  const TIERS = [
    {
      id: 'framework',
      label: 'THE FRAMEWORK SPECIFIES',
      sub: ['structure', 'prompts', 'analytical questions'],
    },
    {
      id: 'institution',
      label: 'THE INSTITUTION CONFIGURES',
      sub: ['roles', 'records', 'sector calibration', 'oversight routes', 'verification'],
    },
    {
      id: 'respondent',
      label: 'YOU JUDGE',
      sub: ['distinctive analytical work', 'practical applicability'],
    },
  ];

  const DEFAULT_ALT =
    "Instrument-reading diagram. Three rounded rectangles stacked vertically, equally weighted. From top to bottom: 'The framework specifies' (structure, prompts, analytical questions); 'The institution configures' (roles, records, sector calibration, oversight routes, verification); 'You judge' (distinctive analytical work, practical applicability). Two downward arrows between adjacent tiers indicate that each tier feeds into the next: the framework specifies a form, the institution configures it for deployment, and the respondent judges the resulting working object.";

  /* ============================================================
     Component shell
     ============================================================ */
  function InstrumentReadingDiagram({
    size = 'full',
    autoplay = true,
    ariaLabel,
  }) {
    // ~2.5 s total per spec (three tiers, two arrows, staggered).
    const duration = 2.5;
    const t = useBuildTime({ autoplay, duration });

    const maxW = size === 'small' ? 380 : 560;
    const wrapStyle = { maxWidth: maxW, margin: '0 auto' };

    const Body = size === 'small' ? SmallBody : FullBody;

    return (
      <div
        role="img"
        aria-label={ariaLabel || DEFAULT_ALT}
        className={`ird-wrap ird ird--${size}`}
        style={wrapStyle}
      >
        <Body t={t}/>
      </div>
    );
  }

  /* ---------- Shared SVG defs ---------- */
  function ArrowDefs() {
    return (
      <defs>
        <marker id="ird-ar-coral" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,1.5 L7,5 L0,8.5 z" fill={C.coral}/>
        </marker>
        <marker id="ird-ar-coral-sm" markerWidth="9" markerHeight="9" refX="5.5" refY="4.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,1.2 L6.5,4.5 L0,7.8 z" fill={C.coral}/>
        </marker>
      </defs>
    );
  }

  /* ============================================================
     Tier renderer
     ============================================================ */
  function Tier({
    x, y, w, h, label, sub, opacity,
    labelSize = 14, subSize = 12, rx = 6,
  }) {
    const cx = x + w / 2;
    const subText = sub.join('  ·  ');

    return (
      <g opacity={opacity} transform={`translate(0, ${(1 - opacity) * 8})`}>
        <rect
          x={x} y={y} width={w} height={h} rx={rx} ry={rx}
          fill={C.surface} stroke={C.borderStrong} strokeWidth={0.8}
        />
        {/* Label — uppercase, primary weight, ink-strong */}
        <text
          x={cx} y={y + h / 2 - 6}
          fontFamily={FONT_SANS} fontSize={labelSize} fontWeight={600}
          fill={C.inkStrong} textAnchor="middle"
          letterSpacing="0.06em"
        >
          {label}
        </text>
        {/* Subtitle — mono, lighter weight, italic, ink-mute */}
        <text
          x={cx} y={y + h / 2 + subSize + 4}
          fontFamily={FONT_MONO} fontSize={subSize}
          fill={C.inkMute} textAnchor="middle"
          fontStyle="italic"
          letterSpacing="0.02em"
        >
          {subText}
        </text>
      </g>
    );
  }

  /* ============================================================
     Full size — primary placement
     ============================================================ */
  function FullBody({ t }) {
    // Geometry — vertical stack
    const VB_W = 560;
    const tierW = 480;
    const tierH = 82;
    const gap   = 44;                 // vertical gap between tiers (room for arrow)
    const padY  = 12;                 // top padding inside viewbox
    const padX  = (VB_W - tierW) / 2; // centered horizontally → 40
    const VB_H  = padY * 2 + 3 * tierH + 2 * gap;

    // Build sequence: each tier staggered, with the arrow drawing just
    // before the next tier appears.
    //
    //   0.00s  Tier 1 fades up                            (0.00–0.45)
    //   0.70s  Arrow 1 draws                              (0.70–1.10)
    //   1.00s  Tier 2 fades up                            (1.00–1.45)
    //   1.70s  Arrow 2 draws                              (1.70–2.10)
    //   2.00s  Tier 3 fades up                            (2.00–2.45)
    //
    const tierO = [
      entry(t, 0.00, 0.45),
      entry(t, 1.00, 0.45),
      entry(t, 2.00, 0.45),
    ];
    const arrowO = [
      entry(t, 0.70, 0.40),
      entry(t, 1.70, 0.40),
    ];

    const tiers = TIERS.map((tier, i) => ({
      ...tier,
      x: padX,
      y: padY + i * (tierH + gap),
    }));

    return (
      <svg className="ird-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        <ArrowDefs/>

        {/* Three tiers */}
        {tiers.map((tier, i) => (
          <Tier
            key={tier.id}
            x={tier.x} y={tier.y} w={tierW} h={tierH}
            label={tier.label} sub={tier.sub}
            opacity={tierO[i]}
            labelSize={14} subSize={12} rx={6}
          />
        ))}

        {/* Two downward arrows between adjacent tiers.
            Arrows leave a small gap on both ends so tier outlines
            stay visually closed. */}
        {[0, 1].map((i) => {
          const xMid = padX + tierW / 2;
          const y1 = tiers[i].y + tierH + 8;        // leave 8 px gap
          const y2 = tiers[i + 1].y - 6;            // leave 6 px gap (marker eats 4)
          return (
            <line
              key={i}
              x1={xMid} y1={y1} x2={xMid} y2={y2}
              stroke={C.coral} strokeWidth={1.4}
              markerEnd="url(#ird-ar-coral)"
              opacity={arrowO[i]}
            />
          );
        })}
      </svg>
    );
  }

  /* ============================================================
     Small size — forward-looking variant. Not currently used by
     the platform; included so the API matches the cluster 1/2
     diagrams and future right-rail re-use is possible without
     editing this file.
     ============================================================ */
  function SmallBody({ t }) {
    const VB_W = 380;
    const tierW = 320;
    const tierH = 50;
    const gap   = 24;
    const padY  = 8;
    const padX  = (VB_W - tierW) / 2;
    const VB_H  = padY * 2 + 3 * tierH + 2 * gap;

    const tierO = [
      entry(t, 0.00, 0.35),
      entry(t, 0.70, 0.35),
      entry(t, 1.40, 0.35),
    ];
    const arrowO = [
      entry(t, 0.50, 0.30),
      entry(t, 1.20, 0.30),
    ];

    const tiers = TIERS.map((tier, i) => ({
      ...tier,
      x: padX,
      y: padY + i * (tierH + gap),
    }));

    return (
      <svg className="ird-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        <ArrowDefs/>

        {tiers.map((tier, i) => (
          <Tier
            key={tier.id}
            x={tier.x} y={tier.y} w={tierW} h={tierH}
            label={tier.label}
            sub={tier.sub.slice(0, 3)}   /* keep small variant terse */
            opacity={tierO[i]}
            labelSize={11} subSize={9.5} rx={4}
          />
        ))}

        {[0, 1].map((i) => {
          const xMid = padX + tierW / 2;
          const y1 = tiers[i].y + tierH + 4;
          const y2 = tiers[i + 1].y - 4;
          return (
            <line
              key={i}
              x1={xMid} y1={y1} x2={xMid} y2={y2}
              stroke={C.coral} strokeWidth={1}
              markerEnd="url(#ird-ar-coral-sm)"
              opacity={arrowO[i]}
            />
          );
        })}
      </svg>
    );
  }

  /* ---------- Expose ---------- */
  window.InstrumentReadingDiagram = InstrumentReadingDiagram;
})();
