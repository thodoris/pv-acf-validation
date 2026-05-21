/* PV-ACF Cluster 2 — framework-organisation-diagram-v1.
   Visual anchor for c2-setup1 ("How the framework is organised").

   Two layouts (linear / circular), three reuse sizes (full / medium / small),
   a ~5s sequenced build animation, and a quiet ~2.5s pulse on the recursive
   arrow after the build settles.

   Mechanical port of docs/reference-prototype/diagrams/framework-organisation-diagram.jsx.
   The prototype depends on Easing / clamp / TimelineContext / useTime from
   animations.jsx. Here, we inline easeOutCubic + clamp + a minimal local
   TimelineContext (only Body components that need to read the animation
   playhead use useTime; the rest receive it via build) — porting all of
   animations.jsx would be ~600 lines of unused infrastructure. See ADR 0003. */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type JSX,
} from 'react';

const C = {
  page: '#FBF8F1',
  surface: '#FFFFFF',
  surfaceDeep: '#F8F4EA',
  inkStrong: '#1A1816',
  ink: '#2C2C2A',
  inkSoft: '#5F5E5A',
  inkMute: '#888780',
  inkFaint: '#B7B5AE',
  coral: '#B8472E',
  coralDeep: '#712B13',
  coralTint: '#FAECE7',
  border: '#E5E0D2',
  borderSoft: '#EDE8DA',
  borderStrong: '#B4B0A2',
};

const FONT_SANS = "'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const STYLE_ID = '__fod_styles_v1';
function injectStylesOnce() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    .fod-wrap { display: block; width: 100%; }
    .fod-svg  { display: block; width: 100%; height: auto; }
    .fod-pulse { animation: fod-pulse 2.5s cubic-bezier(0.6,0,0.4,1) infinite; }
    @keyframes fod-pulse {
      0%, 100% { stroke: ${C.inkSoft}; stroke-opacity: 0.55; }
      45%, 55% { stroke: ${C.coral};   stroke-opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .fod-pulse { animation: none; stroke: ${C.inkSoft}; stroke-opacity: 1; }
    }
    @media print {
      .fod-pulse { animation: none !important; stroke: ${C.inkSoft} !important; stroke-opacity: 1 !important; }
    }
  `;
  document.head.appendChild(s);
}

// ---------------------------------------------------------------------------
// Minimal local timeline (slim slice of animations.jsx). The Provider sits
// inside FrameworkOrganisationDiagram and passes the build-time `t` to body
// components via useTime(). Not exported — keep this private to the diagram.
// ---------------------------------------------------------------------------

const TimelineContext = createContext<{ time: number }>({ time: 0 });
const useTime = (): number => useContext(TimelineContext).time;

// ---------------------------------------------------------------------------
// Hooks — duplicated from the other two diagrams to keep each self-contained.
// ---------------------------------------------------------------------------

function useReducedMotion(): boolean {
  const [r, setR] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const h = (e: MediaQueryListEvent) => setR(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return r;
}

function useBuildTime({ autoplay, duration }: { autoplay: boolean; duration: number }): number {
  const reduced = useReducedMotion();
  const skip = !autoplay || reduced;
  const [t, setT] = useState(skip ? duration : 0);
  useEffect(() => {
    if (skip) {
      setT(duration);
      return;
    }
    let raf = 0;
    let started: number | null = null;
    const step = (ts: number) => {
      if (started === null) started = ts;
      const e = (ts - started) / 1000;
      if (e >= duration) {
        setT(duration);
        return;
      }
      setT(e);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [skip, duration]);
  return t;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const entry = (t: number, start: number, dur = 0.42): number =>
  easeOutCubic(clamp((t - start) / dur, 0, 1));

// ---------------------------------------------------------------------------
// Content + alt
// ---------------------------------------------------------------------------

const DEFAULT_ALT =
  "Framework diagram. A diagnostic layer at the top identifies the structural conditions already shaping a specific AI deployment before operational decisions begin. The diagnostic layer feeds a five-stage operational lifecycle: problem framing, design and procurement, oversight, public-value evaluation, and continuation or discontinuation. A recursive arrow returns from stage five to stage one, indicating the lifecycle re-runs across the deployment's life. Four reference-back markers connect stages one, two, three, and five back to the diagnostic layer; stage four deliberately has no marker. A small Generative LLM Gate marker is attached to stage two, signalling a conditional checkpoint that applies only when the architecture is a generative LLM.";

type Stage = { num: string; full: string; short: string; mini: string };

const STAGE_NAMES: Stage[] = [
  { num: '01', full: 'Problem framing', short: 'Problem framing', mini: 'Framing' },
  { num: '02', full: 'Design & procurement', short: 'Design & procurement', mini: 'Design' },
  { num: '03', full: 'Oversight', short: 'Oversight', mini: 'Oversight' },
  { num: '04', full: 'Public-value evaluation', short: 'Public-value evaluation', mini: 'PV eval.' },
  { num: '05', full: 'Continuation / discontinuation', short: 'Continuation', mini: 'Cont./disc.' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type FrameworkOrganisationDiagramVariant = 'linear' | 'circular';
export type FrameworkOrganisationDiagramSize = 'full' | 'medium' | 'small';

export type FrameworkOrganisationDiagramProps = {
  variant?: FrameworkOrganisationDiagramVariant;
  size?: FrameworkOrganisationDiagramSize;
  autoplay?: boolean;
  showGate?: boolean;
  showRefBacks?: boolean;
  ariaLabel?: string;
};

export function FrameworkOrganisationDiagram({
  variant = 'linear',
  size = 'full',
  autoplay = true,
  showGate = true,
  showRefBacks = true,
  ariaLabel,
}: FrameworkOrganisationDiagramProps): JSX.Element {
  injectStylesOnce();
  const duration = 5;
  const t = useBuildTime({ autoplay, duration });

  const maxW = size === 'small' ? 320 : size === 'medium' ? 620 : 880;
  const wrapStyle = { maxWidth: maxW, margin: '0 auto' };

  const Body = variant === 'circular' ? CircularDiagram : LinearDiagram;

  return (
    <TimelineContext.Provider value={{ time: t }}>
      <div
        role="img"
        aria-label={ariaLabel ?? DEFAULT_ALT}
        className={`fod-wrap fod fod--${variant} fod--${size}`}
        style={wrapStyle}
      >
        <Body size={size} showGate={showGate} showRefBacks={showRefBacks} />
      </div>
    </TimelineContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// SVG defs
// ---------------------------------------------------------------------------

function ArrowDefs(): JSX.Element {
  return (
    <defs>
      <marker id="fod-ar-mute" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
        <path d="M0,1 L7,4 L0,7 z" fill={C.inkMute} />
      </marker>
      <marker id="fod-ar-soft" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
        <path d="M0,1 L7,4 L0,7 z" fill={C.inkSoft} />
      </marker>
      <marker id="fod-ar-coral" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0.7 L6,3.5 L0,6.3 z" fill={C.coral} />
      </marker>
    </defs>
  );
}

// ---------------------------------------------------------------------------
// Dispatchers
// ---------------------------------------------------------------------------

type BodyProps = {
  size: FrameworkOrganisationDiagramSize;
  showGate: boolean;
  showRefBacks: boolean;
};

function LinearDiagram({ size, showGate, showRefBacks }: BodyProps): JSX.Element {
  if (size === 'small') return <LinearSmall showGate={showGate} showRefBacks={showRefBacks} />;
  return <LinearFull showGate={showGate} showRefBacks={showRefBacks} />;
}

function CircularDiagram({ size, showGate, showRefBacks }: BodyProps): JSX.Element {
  if (size === 'small') return <CircularSmall showGate={showGate} showRefBacks={showRefBacks} />;
  return <CircularFull showGate={showGate} showRefBacks={showRefBacks} />;
}

type SubBodyProps = { showGate: boolean; showRefBacks: boolean };

// ---------------------------------------------------------------------------
// Linear Full
// ---------------------------------------------------------------------------

function LinearFull({ showGate, showRefBacks }: SubBodyProps): JSX.Element {
  const t = useTime();
  const VB_W = 880;
  const VB_H = 460;
  const pad = 22;

  const diagX = pad;
  const diagY = 14;
  const diagW = VB_W - 2 * pad;
  const diagH = 78;

  const stageY = 234;
  const stageH = 70;
  const stageGap = 8;
  const stageW = (VB_W - 2 * pad - 4 * stageGap) / 5;
  const stages = STAGE_NAMES.map((s, i) => ({
    ...s,
    x: pad + i * (stageW + stageGap),
    y: stageY,
    w: stageW,
    h: stageH,
    cx: pad + i * (stageW + stageGap) + stageW / 2,
    cy: stageY + stageH / 2,
  }));

  const diagO = entry(t, 0.05, 0.55);
  const feedO = entry(t, 0.55, 0.4);
  const stageO = stages.map((_, i) => entry(t, 1.0 + i * 0.14, 0.42));
  const forwardO = [0, 1, 2, 3].map((i) => entry(t, 1.16 + i * 0.14, 0.3));
  const recursive = clamp((t - 2.0) / 0.9, 0, 1);
  const recursiveCap = entry(t, 2.7, 0.4);
  const refbackO = entry(t, 3.1, 0.7);
  const refbackCapO = entry(t, 3.4, 0.5);
  const gateO = entry(t, 4.1, 0.7);

  return (
    <svg
      className="fod-svg"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ArrowDefs />

      {/* Diagnostic layer */}
      <g opacity={diagO} transform={`translate(0, ${(1 - diagO) * -6})`}>
        <rect
          x={diagX}
          y={diagY}
          width={diagW}
          height={diagH}
          rx={4}
          ry={4}
          fill={C.surfaceDeep}
          stroke={C.border}
          strokeWidth={0.6}
        />
        <text x={diagX + 16} y={diagY + 22} fontFamily={FONT_MONO} fontSize={10.5} letterSpacing="0.12em" fill={C.inkMute}>
          DIAGNOSTIC LAYER
        </text>
        <text x={diagX + 16} y={diagY + 45} fontFamily={FONT_SANS} fontSize={15} fontWeight={600} fill={C.inkStrong}>
          Structural conditions already shaping the deployment
        </text>
        <text x={diagX + 16} y={diagY + 66} fontFamily={FONT_MONO} fontSize={11} fill={C.inkMute} letterSpacing="0.02em">
          problem framing already inherited &nbsp;·&nbsp; institution already reshaped by AI &nbsp;·&nbsp; commercial dependencies already in place
        </text>
      </g>

      {/* Feed arrow */}
      <g opacity={feedO}>
        <line
          x1={pad + 26}
          y1={diagY + diagH + 4}
          x2={pad + 26}
          y2={stageY - 6}
          stroke={C.inkMute}
          strokeWidth={1}
          markerEnd="url(#fod-ar-mute)"
        />
        <text
          x={pad + 38}
          y={diagY + diagH + 26}
          fontFamily={FONT_MONO}
          fontSize={11}
          fill={C.inkMute}
          letterSpacing="0.04em"
          fontStyle="italic"
        >
          completed once before deployment
        </text>
      </g>

      {/* Reference-back markers — stages 1, 2, 3, 5 (NOT stage 4) */}
      {showRefBacks &&
        [0, 1, 2, 4].map((i) => {
          const s = stages[i]!;
          const x = s.cx + s.w * 0.22;
          return (
            <g key={`rb-${i}`} opacity={refbackO}>
              <line
                x1={x}
                y1={s.y - 4}
                x2={x}
                y2={diagY + diagH + 4}
                stroke={C.coral}
                strokeWidth={0.9}
                strokeDasharray="4 4"
                markerEnd="url(#fod-ar-coral)"
              />
            </g>
          );
        })}
      {showRefBacks && (
        <g opacity={refbackCapO}>
          <text
            x={VB_W - pad - 2}
            y={diagY + diagH + 26}
            fontFamily={FONT_MONO}
            fontSize={11}
            fill={C.inkMute}
            letterSpacing="0.04em"
            textAnchor="end"
            fontStyle="italic"
          >
            brought back into view during the lifecycle
          </text>
        </g>
      )}

      {/* Five lifecycle stages */}
      {stages.map((s, i) => (
        <g key={i} opacity={stageO[i]} transform={`translate(0, ${(1 - stageO[i]!) * 8})`}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={8} ry={8} fill={C.surface} stroke={C.border} strokeWidth={0.6} />
          <text x={s.x + 12} y={s.y + 20} fontFamily={FONT_MONO} fontSize={10.5} letterSpacing="0.12em" fill={C.inkMute} fontWeight={500}>
            {s.num}
          </text>
          <text x={s.x + 12} y={s.y + 44} fontFamily={FONT_SANS} fontSize={13.5} fontWeight={500} fill={C.inkStrong}>
            {s.short}
          </text>
        </g>
      ))}

      {/* Forward-flow arrows */}
      {[0, 1, 2, 3].map((i) => {
        const sA = stages[i]!;
        const sB = stages[i + 1]!;
        return (
          <g key={`fa-${i}`} opacity={forwardO[i]}>
            <line x1={sA.x + sA.w + 0.5} y1={sA.cy} x2={sB.x - 2} y2={sB.cy} stroke={C.inkMute} strokeWidth={1} markerEnd="url(#fod-ar-mute)" />
          </g>
        );
      })}

      {/* Recursive arrow — Stage 5 → curve down → Stage 1 */}
      {recursive > 0 && (
        <RecursiveArrowLinearFull
          stages={stages}
          stageY={stageY}
          stageH={stageH}
          recursive={recursive}
          recursiveCap={recursiveCap}
          VB_W={VB_W}
        />
      )}

      {/* Generative LLM Gate */}
      {showGate && (
        <GateLinearFull stage={stages[1]!} gateO={gateO} />
      )}
    </svg>
  );
}

function RecursiveArrowLinearFull({
  stages,
  stageY,
  stageH,
  recursive,
  recursiveCap,
  VB_W,
}: {
  stages: Array<{ x: number; w: number; cy: number }>;
  stageY: number;
  stageH: number;
  recursive: number;
  recursiveCap: number;
  VB_W: number;
}): JSX.Element {
  const sFirst = stages[0]!;
  const sLast = stages[4]!;
  const startX = sLast.x + sLast.w + 1;
  const startY = sLast.cy;
  const endX = sFirst.x - 1;
  const endY = sFirst.cy;
  const arcY = stageY + stageH + 78;
  const d = `M ${startX} ${startY}
             C ${startX + 28} ${startY}, ${startX + 30} ${arcY}, ${startX - 28} ${arcY}
             L ${endX + 28} ${arcY}
             C ${endX - 30} ${arcY}, ${endX - 28} ${endY}, ${endX} ${endY}`;
  return (
    <g>
      <path
        d={d}
        fill="none"
        strokeWidth={1.2}
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - recursive}
        className={recursive >= 1 ? 'fod-pulse' : undefined}
        stroke={C.inkSoft}
        markerEnd={recursive >= 1 ? 'url(#fod-ar-soft)' : undefined}
      />
      <g opacity={recursiveCap}>
        <text
          x={VB_W / 2}
          y={arcY + 22}
          fontFamily={FONT_MONO}
          fontSize={11.5}
          fill={C.inkSoft}
          letterSpacing="0.04em"
          textAnchor="middle"
          fontStyle="italic"
        >
          re-runs across the deployment's life
        </text>
      </g>
    </g>
  );
}

function GateLinearFull({
  stage,
  gateO,
}: {
  stage: { x: number; y: number; w: number; h: number; cx: number };
  gateO: number;
}): JSX.Element {
  const gateW = 168;
  const gateH = 40;
  const gateX = stage.cx - gateW / 2;
  const gateY = stage.y + stage.h + 22;
  return (
    <g opacity={gateO} transform={`translate(0, ${(1 - gateO) * -4})`}>
      <line x1={stage.cx} y1={stage.y + stage.h + 1} x2={stage.cx} y2={gateY - 1} stroke={C.coral} strokeWidth={0.9} strokeDasharray="3 3" />
      <rect x={gateX} y={gateY} width={gateW} height={gateH} rx={20} ry={20} fill={C.coralTint} stroke={C.coral} strokeWidth={0.8} />
      <text x={gateX + gateW / 2} y={gateY + 17} fontFamily={FONT_SANS} fontSize={12} fontWeight={600} fill={C.coralDeep} textAnchor="middle">
        Generative LLM Gate
      </text>
      <text
        x={gateX + gateW / 2}
        y={gateY + 31}
        fontFamily={FONT_MONO}
        fontSize={9.5}
        fill={C.coralDeep}
        fontStyle="italic"
        textAnchor="middle"
        letterSpacing="0.02em"
      >
        for generative AI
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Linear Small
// ---------------------------------------------------------------------------

function LinearSmall({ showGate, showRefBacks }: SubBodyProps): JSX.Element {
  const t = useTime();
  const VB_W = 320;
  const VB_H = showGate ? 200 : 168;
  const pad = 10;
  const diagY = 6;
  const diagH = 22;
  const showDiag = showRefBacks;
  const stageY = showDiag ? 80 : 50;
  const stageH = 36;
  const stageGap = 4;
  const stageW = (VB_W - 2 * pad - 4 * stageGap) / 5;
  const stages = STAGE_NAMES.map((s, i) => ({
    ...s,
    x: pad + i * (stageW + stageGap),
    y: stageY,
    w: stageW,
    h: stageH,
    cx: pad + i * (stageW + stageGap) + stageW / 2,
    cy: stageY + stageH / 2,
  }));

  const diagO = entry(t, 0.05, 0.5);
  const stageO = stages.map((_, i) => entry(t, 0.9 + i * 0.1, 0.35));
  const forwardO = [0, 1, 2, 3].map((i) => entry(t, 1.05 + i * 0.1, 0.25));
  const recursive = clamp((t - 1.8) / 0.7, 0, 1);
  const refbackO = entry(t, 2.6, 0.5);
  const gateO = entry(t, 3.4, 0.5);

  return (
    <svg
      className="fod-svg"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ArrowDefs />
      {showDiag && (
        <g opacity={diagO}>
          <rect x={pad} y={diagY} width={VB_W - 2 * pad} height={diagH} rx={3} ry={3} fill={C.surfaceDeep} stroke={C.border} strokeWidth={0.5} />
          <text x={pad + 8} y={diagY + 15} fontFamily={FONT_MONO} fontSize={9} letterSpacing="0.12em" fill={C.inkMute}>
            DIAGNOSTIC LAYER
          </text>
        </g>
      )}
      {showRefBacks &&
        [0, 1, 2, 4].map((i) => {
          const s = stages[i]!;
          return (
            <line
              key={`rb-${i}`}
              x1={s.cx}
              y1={s.y - 2}
              x2={s.cx}
              y2={diagY + diagH + 2}
              stroke={C.coral}
              strokeWidth={0.8}
              strokeDasharray="3 3"
              opacity={refbackO}
              markerEnd="url(#fod-ar-coral)"
            />
          );
        })}
      {stages.map((s, i) => (
        <g key={i} opacity={stageO[i]}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={5} ry={5} fill={C.surface} stroke={C.border} strokeWidth={0.5} />
          <text x={s.cx} y={s.y + 15} fontFamily={FONT_MONO} fontSize={9.5} letterSpacing="0.10em" fill={C.inkMute} textAnchor="middle">
            {s.num}
          </text>
          <text x={s.cx} y={s.y + 28} fontFamily={FONT_SANS} fontSize={9} fontWeight={500} fill={C.inkStrong} textAnchor="middle">
            {s.mini}
          </text>
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => {
        const sA = stages[i]!;
        const sB = stages[i + 1]!;
        return (
          <line
            key={`fa-${i}`}
            x1={sA.x + sA.w + 0.5}
            y1={sA.cy}
            x2={sB.x - 1}
            y2={sB.cy}
            stroke={C.inkMute}
            strokeWidth={0.9}
            markerEnd="url(#fod-ar-mute)"
            opacity={forwardO[i]}
          />
        );
      })}
      {recursive > 0 && (() => {
        const sFirst = stages[0]!;
        const sLast = stages[4]!;
        const arcY = stageY + stageH + 24;
        const d = `M ${sLast.x + sLast.w + 1} ${sLast.cy}
                   C ${sLast.x + sLast.w + 18} ${sLast.cy}, ${sLast.x + sLast.w + 18} ${arcY}, ${VB_W / 2} ${arcY}
                   L ${VB_W / 2} ${arcY}
                   C ${sFirst.x - 18} ${arcY}, ${sFirst.x - 18} ${sFirst.cy}, ${sFirst.x - 1} ${sFirst.cy}`;
        return (
          <path
            d={d}
            fill="none"
            strokeWidth={1}
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - recursive}
            className={recursive >= 1 ? 'fod-pulse' : undefined}
            stroke={C.inkSoft}
            markerEnd={recursive >= 1 ? 'url(#fod-ar-soft)' : undefined}
          />
        );
      })()}
      {showGate && (() => {
        const s = stages[1]!;
        const gateW = 92;
        const gateH = 22;
        const gateX = s.cx - gateW / 2;
        const gateY = s.y + s.h + 14;
        return (
          <g opacity={gateO}>
            <line x1={s.cx} y1={s.y + s.h + 1} x2={s.cx} y2={gateY - 1} stroke={C.coral} strokeWidth={0.7} strokeDasharray="2 2" />
            <rect x={gateX} y={gateY} width={gateW} height={gateH} rx={11} ry={11} fill={C.coralTint} stroke={C.coral} strokeWidth={0.7} />
            <text x={gateX + gateW / 2} y={gateY + 14} fontFamily={FONT_SANS} fontSize={9} fontWeight={600} fill={C.coralDeep} textAnchor="middle">
              Generative LLM Gate
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Circular Full
// ---------------------------------------------------------------------------

function CircularFull({ showGate, showRefBacks }: SubBodyProps): JSX.Element {
  const t = useTime();
  const VB_W = 800;
  const VB_H = 560;
  const cx = 320;
  const cy = 290;
  const r = 200;
  const stageW = 142;
  const stageH = 56;

  const angle = (i: number) => ((i * 72) * Math.PI) / 180;
  const stages = STAGE_NAMES.map((s, i) => {
    const a = angle(i);
    const x = cx + r * Math.sin(a);
    const y = cy - r * Math.cos(a);
    return { ...s, cx: x, cy: y, x: x - stageW / 2, y: y - stageH / 2, w: stageW, h: stageH, a };
  });

  const diagO = entry(t, 0.05, 0.55);
  const stageO = stages.map((_, i) => entry(t, 1.0 + i * 0.14, 0.42));
  const ringO = [0, 1, 2, 3, 4].map((i) => entry(t, 1.16 + i * 0.14, 0.3));
  const recursive = clamp((t - 2.0) / 0.9, 0, 1);
  const recursiveCap = entry(t, 2.7, 0.4);
  const refbackO = entry(t, 3.1, 0.7);
  const gateO = entry(t, 4.1, 0.7);

  const arcD = (a1: number, a2: number, r2: number, edgeOffset = 14) => {
    const eo = edgeOffset / r2;
    const A1 = a1 + eo;
    const A2 = a2 - eo;
    const x1 = cx + r2 * Math.sin(A1);
    const y1 = cy - r2 * Math.cos(A1);
    const x2 = cx + r2 * Math.sin(A2);
    const y2 = cy - r2 * Math.cos(A2);
    return {
      d: `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r2} ${r2} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      endX: x2,
      endY: y2,
    };
  };

  return (
    <svg className="fod-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ArrowDefs />

      <g opacity={diagO}>
        <rect x={cx - 140} y={cy - 56} width={280} height={112} rx={4} ry={4} fill={C.surfaceDeep} stroke={C.border} strokeWidth={0.6} />
        <text x={cx} y={cy - 30} fontFamily={FONT_MONO} fontSize={10.5} letterSpacing="0.14em" fill={C.inkMute} textAnchor="middle">
          DIAGNOSTIC LAYER
        </text>
        <text x={cx} y={cy - 8} fontFamily={FONT_SANS} fontSize={14} fontWeight={600} fill={C.inkStrong} textAnchor="middle">
          Structural conditions
        </text>
        <text x={cx} y={cy + 12} fontFamily={FONT_SANS} fontSize={12.5} fill={C.inkSoft} textAnchor="middle">
          already shaping the deployment
        </text>
        <text x={cx} y={cy + 36} fontFamily={FONT_MONO} fontSize={10} fill={C.inkMute} letterSpacing="0.02em" textAnchor="middle">
          framing inherited · institution reshaped · dependencies in place
        </text>
      </g>

      {showRefBacks &&
        [0, 1, 2, 4].map((i) => {
          const s = stages[i]!;
          const a = s.a;
          const dx = Math.sin(a);
          const dy = -Math.cos(a);
          const hx = 140 + 4;
          const hy = 56 + 4;
          const tEdge = Math.min(
            Math.abs(dx) > 1e-6 ? hx / Math.abs(dx) : Infinity,
            Math.abs(dy) > 1e-6 ? hy / Math.abs(dy) : Infinity,
          );
          const innerX = cx + dx * tEdge;
          const innerY = cy + dy * tEdge;
          const outerR = r - stageH / 2 - 6;
          const outerX = cx + Math.sin(a) * outerR;
          const outerY = cy - Math.cos(a) * outerR;
          return (
            <line
              key={`rb-${i}`}
              x1={outerX}
              y1={outerY}
              x2={innerX}
              y2={innerY}
              stroke={C.coral}
              strokeWidth={0.9}
              strokeDasharray="4 4"
              opacity={refbackO}
              markerEnd="url(#fod-ar-coral)"
            />
          );
        })}
      {showRefBacks && (
        <text
          x={cx}
          y={cy + 64}
          fontFamily={FONT_MONO}
          fontSize={10}
          fill={C.inkMute}
          letterSpacing="0.04em"
          textAnchor="middle"
          fontStyle="italic"
          opacity={refbackO}
        >
          brought back into view during the lifecycle
        </text>
      )}

      {stages.map((s, i) => (
        <g key={i} opacity={stageO[i]}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={8} ry={8} fill={C.surface} stroke={C.border} strokeWidth={0.6} />
          <text x={s.cx} y={s.y + 18} fontFamily={FONT_MONO} fontSize={10.5} letterSpacing="0.12em" fill={C.inkMute} textAnchor="middle" fontWeight={500}>
            {s.num}
          </text>
          <text x={s.cx} y={s.y + 39} fontFamily={FONT_SANS} fontSize={12.5} fontWeight={500} fill={C.inkStrong} textAnchor="middle">
            {s.short}
          </text>
        </g>
      ))}

      {[0, 1, 2, 3].map((i) => {
        const a = arcD(angle(i), angle(i + 1), r, 36);
        return (
          <g key={`arc-${i}`} opacity={ringO[i]}>
            <path d={a.d} fill="none" stroke={C.inkMute} strokeWidth={1} markerEnd="url(#fod-ar-mute)" />
          </g>
        );
      })}

      {recursive > 0 && (() => {
        const a = arcD(angle(4), angle(5), r, 36);
        return (
          <g>
            <path
              d={a.d}
              fill="none"
              strokeWidth={1.2}
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - recursive}
              className={recursive >= 1 ? 'fod-pulse' : undefined}
              stroke={C.inkSoft}
              markerEnd={recursive >= 1 ? 'url(#fod-ar-soft)' : undefined}
            />
          </g>
        );
      })()}
      <g opacity={recursiveCap}>
        <text x={cx} y={cy - r - 36} fontFamily={FONT_MONO} fontSize={11} fill={C.inkSoft} letterSpacing="0.04em" textAnchor="middle" fontStyle="italic">
          re-runs across the deployment's life
        </text>
      </g>

      {showGate && (() => {
        const s = stages[1]!;
        const dx = Math.sin(s.a);
        const dy = -Math.cos(s.a);
        const attachD = 104;
        const startD = 78;
        const endD = 100;
        const px = s.cx + dx * attachD;
        const py = s.cy + dy * attachD;
        const sx = s.cx + dx * startD;
        const sy = s.cy + dy * startD;
        const ex = s.cx + dx * endD;
        const ey = s.cy + dy * endD;
        const gateW = 168;
        const gateH = 40;
        const gateX = px - 6;
        const gateY = py - gateH / 2;
        return (
          <g opacity={gateO}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={C.coral} strokeWidth={0.9} strokeDasharray="3 3" />
            <rect x={gateX} y={gateY} width={gateW} height={gateH} rx={20} ry={20} fill={C.coralTint} stroke={C.coral} strokeWidth={0.8} />
            <text x={gateX + gateW / 2} y={gateY + 17} fontFamily={FONT_SANS} fontSize={12} fontWeight={600} fill={C.coralDeep} textAnchor="middle">
              Generative LLM Gate
            </text>
            <text
              x={gateX + gateW / 2}
              y={gateY + 31}
              fontFamily={FONT_MONO}
              fontSize={9.5}
              fill={C.coralDeep}
              fontStyle="italic"
              textAnchor="middle"
              letterSpacing="0.02em"
            >
              for generative AI
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Circular Small
// ---------------------------------------------------------------------------

function CircularSmall({ showGate, showRefBacks }: SubBodyProps): JSX.Element {
  const t = useTime();
  const VB_W = 240;
  const VB_H = 240;
  const cx = 120;
  const cy = 120;
  const r = 90;
  const stageR = 16;

  const angle = (i: number) => ((i * 72) * Math.PI) / 180;
  const stages = STAGE_NAMES.map((s, i) => {
    const a = angle(i);
    return { ...s, x: cx + r * Math.sin(a), y: cy - r * Math.cos(a), a };
  });

  const diagO = entry(t, 0.05, 0.5);
  const stageO = stages.map((_, i) => entry(t, 0.9 + i * 0.1, 0.3));
  const ringO = [0, 1, 2, 3].map((i) => entry(t, 1.05 + i * 0.1, 0.25));
  const recursive = clamp((t - 1.8) / 0.7, 0, 1);
  const refbackO = entry(t, 2.6, 0.5);
  const gateO = entry(t, 3.4, 0.5);

  const arcD = (a1: number, a2: number, r2: number, eo = 0.22) => {
    const A1 = a1 + eo;
    const A2 = a2 - eo;
    const x1 = cx + r2 * Math.sin(A1);
    const y1 = cy - r2 * Math.cos(A1);
    const x2 = cx + r2 * Math.sin(A2);
    const y2 = cy - r2 * Math.cos(A2);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r2} ${r2} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  return (
    <svg className="fod-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ArrowDefs />
      <g opacity={diagO}>
        <rect x={cx - 42} y={cy - 18} width={84} height={36} rx={3} ry={3} fill={C.surfaceDeep} stroke={C.border} strokeWidth={0.5} />
        <text x={cx} y={cy - 4} fontFamily={FONT_MONO} fontSize={7.5} letterSpacing="0.10em" fill={C.inkMute} textAnchor="middle">
          DIAGNOSTIC
        </text>
        <text x={cx} y={cy + 8} fontFamily={FONT_SANS} fontSize={9} fontWeight={600} fill={C.inkStrong} textAnchor="middle">
          Conditions
        </text>
      </g>
      {showRefBacks &&
        [0, 1, 2, 4].map((i) => {
          const s = stages[i]!;
          const dx = Math.sin(s.a);
          const dy = -Math.cos(s.a);
          const inner = 22;
          const innerX = cx + dx * inner;
          const innerY = cy + dy * inner;
          const outer = r - stageR - 3;
          const outerX = cx + dx * outer;
          const outerY = cy + dy * outer;
          return (
            <line
              key={`rb-${i}`}
              x1={outerX}
              y1={outerY}
              x2={innerX}
              y2={innerY}
              stroke={C.coral}
              strokeWidth={0.7}
              strokeDasharray="3 3"
              opacity={refbackO}
              markerEnd="url(#fod-ar-coral)"
            />
          );
        })}
      {[0, 1, 2, 3].map((i) => (
        <path key={`arc-${i}`} d={arcD(angle(i), angle(i + 1), r)} fill="none" stroke={C.inkMute} strokeWidth={0.9} markerEnd="url(#fod-ar-mute)" opacity={ringO[i]} />
      ))}
      {recursive > 0 && (
        <path
          d={arcD(angle(4), angle(5), r)}
          fill="none"
          strokeWidth={1}
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - recursive}
          className={recursive >= 1 ? 'fod-pulse' : undefined}
          stroke={C.inkSoft}
          markerEnd={recursive >= 1 ? 'url(#fod-ar-soft)' : undefined}
        />
      )}
      {stages.map((s, i) => (
        <g key={i} opacity={stageO[i]}>
          <circle cx={s.x} cy={s.y} r={stageR} fill={C.surface} stroke={C.border} strokeWidth={0.6} />
          <text x={s.x} y={s.y + 3.5} fontFamily={FONT_MONO} fontSize={10} fontWeight={500} fill={C.inkStrong} textAnchor="middle">
            {s.num}
          </text>
        </g>
      ))}
      {showGate && (() => {
        const s = stages[1]!;
        const dx = Math.sin(s.a);
        const dy = -Math.cos(s.a);
        const gx = s.x + dx * 26;
        const gy = s.y + dy * 26;
        return (
          <g opacity={gateO}>
            <line x1={s.x + dx * (stageR + 2)} y1={s.y + dy * (stageR + 2)} x2={gx - dx * 6} y2={gy - dy * 6} stroke={C.coral} strokeWidth={0.7} strokeDasharray="2 2" />
            <rect x={gx - 18} y={gy - 8} width={36} height={16} rx={8} ry={8} fill={C.coralTint} stroke={C.coral} strokeWidth={0.7} />
            <text x={gx} y={gy + 3} fontFamily={FONT_MONO} fontSize={7.5} fontWeight={600} fill={C.coralDeep} textAnchor="middle" letterSpacing="0.08em">
              LLM GATE
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
