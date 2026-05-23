/* PV-ACF Cluster 1 — three-levels-diagram-v2 (vertical trace-back ladder).

   Replaces v1's horizontal three-box diagram. The practitioner stands at
   the deployment level (bottom) and traces back UPWARD to the institutional
   and strategic conditions that shape what arrives there.

   Structure
   - A vertical stack of three rungs:
       top    — Rung 03 · Strategy level       (dashed border — often invisible)
       middle — Rung 02 · Institutional level  (lighter outline — partly visible)
       bottom — Rung 01 · Deployment level     (solid border, full weight — visible)
   - Connectors between adjacent rungs, each carrying an upward-pointing
     chevron with dashed line segments above and below.
   - Each rung: left-edge glyph (material / relational / discursive), then
     a three-line content stack — small mono level label, dominant sans
     question, smaller content list beneath.

   Animation
   - Rungs render fully visible from the first frame — the build is
     carried by the cursor sweep alone. This keeps the diagram legible
     in environments where rAF is paused (backgrounded iframes, print,
     html-to-image capture).
   - A horizontal reading cursor — wider than the rungs, carrying an
     upward arrow and a "TRACING BACK" label — fades in at the deployment
     rung, dwells, climbs to the institutional rung, dwells, climbs to
     the strategy rung, dwells, then exits above the diagram while fading
     out. Total sweep ~5s. Static end state shows no cursor.
   - Honours `prefers-reduced-motion: reduce` — skips the build, renders
     the final state (no cursor) immediately.
   - The host (DiagramSlot) re-triggers the build by remounting the
     component via a key bump on the Replay button. The component
     exposes no imperative API.

   Mechanical port of docs/reference-prototype/diagrams/three-levels-diagram.jsx
   (v2). Same SVG markup, same easing math, same palette — TypeScript
   types, ES module exports, no IIFE / window-global. */

import { useEffect, useState } from 'react';
import type { JSX } from 'react';

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
  borderStrong: '#B4B0A2',
};

const FONT_SANS = "'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const STYLE_ID = '__tld_styles_v2';
function injectStylesOnce(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    .tld-wrap { display: block; width: 100%; }
    .tld-svg  { display: block; width: 100%; height: auto; }
  `;
  document.head.appendChild(s);
}

// ---------------------------------------------------------------------------
// Hooks
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

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------

const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const entry = (t: number, start: number, dur = 0.45): number =>
  easeOutCubic(clamp((t - start) / dur, 0, 1));
/** Linear ramp from 0 to 1 over [t0, t1]; clamped outside. */
const ramp = (t: number, t0: number, t1: number): number => clamp((t - t0) / (t1 - t0), 0, 1);

// ---------------------------------------------------------------------------
// Content + alt text
// ---------------------------------------------------------------------------

const DEFAULT_ALT =
  'Vertical trace-back ladder. Three rungs stacked top-to-bottom: at the top, Rung 03, Strategy level, framed with a dashed border to signal that strategic priorities are often invisible from inside ordinary administrative work; in the middle, Rung 02, Institutional level, framed with a lighter outline to signal partial visibility of organisational arrangements; at the bottom, Rung 01, Deployment level, framed with a solid full-weight border to signal what the practitioner sees directly. Each rung carries a left-edge glyph, an investigative question, and a short list of what that level typically contains. Thin connectors between adjacent rungs carry upward chevrons indicating the trace-back direction.';

type LevelId = 'strategy' | 'institutional' | 'deployment';
type Highlight = LevelId | 'all' | null;
type BorderStyle = 'solid' | 'outlined' | 'dashed';

type Rung = {
  id: LevelId;
  ord: string;
  name: string;
  question: string;
  contains: string;
  border: BorderStyle;
};

// Top → bottom in the diagram.
const RUNGS: Rung[] = [
  {
    id: 'strategy',
    ord: '03',
    name: 'Strategy level',
    question: 'Which prior priorities shaped what was on the table?',
    contains:
      'Strategic priorities, sectoral commitments, framings set before the deployment was specified.',
    border: 'dashed',
  },
  {
    id: 'institutional',
    ord: '02',
    name: 'Institutional level',
    question: 'How is the organisation around the system arranged?',
    contains:
      'Procurement decisions, governance, divisions of responsibility, organisational routines.',
    border: 'outlined',
  },
  {
    id: 'deployment',
    ord: '01',
    name: 'Deployment level',
    question: 'What is the AI system actually doing here?',
    contains: 'Running systems, model outputs, frontline workflows, day-to-day operation.',
    border: 'solid',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type ThreeLevelsDiagramProps = {
  size?: 'full' | 'small';
  /** Reserved for compatibility with v1 — unused in v2. Kept so any
   *  existing callsite that still passes `feedback` continues to compile. */
  feedback?: boolean;
  highlight?: Highlight;
  autoplay?: boolean;
  ariaLabel?: string;
};

export function ThreeLevelsDiagram({
  size = 'full',
  highlight = null,
  autoplay = true,
  ariaLabel,
}: ThreeLevelsDiagramProps): JSX.Element {
  injectStylesOnce();
  // Cursor sweep is ~5s for full size; small variant just fades the
  // static state in over 0.4s.
  const duration = size === 'small' ? 0.4 : 5.3;
  const t = useBuildTime({ autoplay, duration });

  const maxW = size === 'small' ? 360 : 820;
  const wrapStyle = { maxWidth: maxW, margin: '0 auto' };

  const Body = size === 'small' ? SmallBody : FullBody;

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? DEFAULT_ALT}
      className={`tld-wrap tld tld--${size}`}
      style={wrapStyle}
    >
      <Body t={t} highlight={highlight} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline glyphs (kept tiny — no <use>/<symbol> sizing pitfalls)
// ---------------------------------------------------------------------------

type UpChevronProps = { cx: number; cy: number; scale?: number };

function UpChevron({ cx, cy, scale = 1 }: UpChevronProps): JSX.Element {
  const s = scale;
  return (
    <path
      d={`M ${cx - 7 * s} ${cy + 4 * s} L ${cx} ${cy - 3 * s} L ${cx + 7 * s} ${cy + 4 * s}`}
      fill="none"
      stroke={C.inkSoft}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

type UpArrowProps = { cx: number; cy: number };

function UpArrow({ cx, cy }: UpArrowProps): JSX.Element {
  return (
    <g
      fill="none"
      stroke={C.coralDeep}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={cx} y1={cy + 6} x2={cx} y2={cy - 5} />
      <polyline points={`${cx - 4},${cy - 1} ${cx},${cy - 5} ${cx + 4},${cy - 1}`} />
    </g>
  );
}

// Per-level outline glyphs — each renders within a 36x36 box centred at (0,0).
function RungIcon({ id }: { id: LevelId }): JSX.Element | null {
  const stroke = C.inkStrong;
  const sw = 1.2;
  if (id === 'deployment') {
    // Material / system glyph — a screen / running system
    return (
      <g
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x={-15} y={-12} width={30} height={20} rx={2.5} />
        <line x1={-10} y1={-6} x2={2} y2={-6} />
        <line x1={-10} y1={-1} x2={8} y2={-1} />
        <line x1={-10} y1={4} x2={-2} y2={4} />
        <line x1={-6} y1={12} x2={6} y2={12} />
        <line x1={0} y1={8} x2={0} y2={12} />
      </g>
    );
  }
  if (id === 'institutional') {
    // Relational / organisational glyph — three connected nodes
    return (
      <g
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1={0} y1={-9} x2={-11} y2={9} />
        <line x1={0} y1={-9} x2={11} y2={9} />
        <line x1={-11} y1={9} x2={11} y2={9} />
        <circle cx={0} cy={-9} r={3.6} fill={C.surface} />
        <circle cx={-11} cy={9} r={3.6} fill={C.surface} />
        <circle cx={11} cy={9} r={3.6} fill={C.surface} />
      </g>
    );
  }
  if (id === 'strategy') {
    // Discursive / directional glyph — a banner / flag on a pole
    return (
      <g
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1={-9} y1={-14} x2={-9} y2={14} />
        <path d="M -9 -13 L 12 -10 L 6 -4 L 12 2 L -9 -1 Z" />
      </g>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Bodies
// ---------------------------------------------------------------------------

type BodyProps = { t: number; highlight: Highlight };

function FullBody({ t, highlight }: BodyProps): JSX.Element {
  // ---------- Geometry ----------
  const VB_W = 820;

  // Ladder rails sit inset from the SVG edges so the cursor band can
  // extend slightly past the ladder on both sides.
  const RUNG_X = 56;
  const RUNG_W = 708;
  const RUNG_H = 108;
  const CONN_H = 46; // vertical space between adjacent rungs
  const TOP_PAD = 28; // room above top rung (cursor exits here)
  const BOTTOM_PAD = 28; // room below bottom rung (cursor enters here)

  // Top → bottom y-positions for each rung (matches RUNGS order).
  const rungY: [number, number, number] = [
    TOP_PAD,
    TOP_PAD + RUNG_H + CONN_H,
    TOP_PAD + (RUNG_H + CONN_H) * 2,
  ];
  const VB_H = TOP_PAD + RUNG_H * 3 + CONN_H * 2 + BOTTOM_PAD;

  // ---------- Cursor sweep ----------
  // Cursor begins at t = 0.25s (small grace so it doesn't pop on mount).
  const CURSOR_START = 0.25;
  const yDeployment = rungY[2] + RUNG_H / 2;
  const yInstitutional = rungY[1] + RUNG_H / 2;
  const yStrategy = rungY[0] + RUNG_H / 2;
  const yExitTop = -40; // off the top
  const yEntryBottom = VB_H + 20; // off the bottom (resting position pre-fade)

  // Sweep schedule (seconds elapsed since CURSOR_START).
  const seg = {
    fadeInEnd: 0.45, // fade in at deployment
    dwellDeployEnd: 1.2,
    moveToInstEnd: 1.9,
    dwellInstEnd: 2.7,
    moveToStratEnd: 3.4,
    dwellStratEnd: 4.2,
    exitEnd: 5.0, // cursor exits above top, invisible
  };

  const ct = t - CURSOR_START;
  let cy = yEntryBottom;
  let cOpacity = 0;
  if (ct >= 0 && ct <= seg.exitEnd) {
    cy = yDeployment;
    if (ct < seg.fadeInEnd) {
      cOpacity = easeOutCubic(ramp(ct, 0, seg.fadeInEnd));
      cy = yDeployment;
    } else if (ct < seg.dwellDeployEnd) {
      cOpacity = 1;
      cy = yDeployment;
    } else if (ct < seg.moveToInstEnd) {
      cOpacity = 1;
      const k = easeInOutCubic(ramp(ct, seg.dwellDeployEnd, seg.moveToInstEnd));
      cy = yDeployment + (yInstitutional - yDeployment) * k;
    } else if (ct < seg.dwellInstEnd) {
      cOpacity = 1;
      cy = yInstitutional;
    } else if (ct < seg.moveToStratEnd) {
      cOpacity = 1;
      const k = easeInOutCubic(ramp(ct, seg.dwellInstEnd, seg.moveToStratEnd));
      cy = yInstitutional + (yStrategy - yInstitutional) * k;
    } else if (ct < seg.dwellStratEnd) {
      cOpacity = 1;
      cy = yStrategy;
    } else {
      // Exit upward, fading as it goes.
      const k = easeInOutCubic(ramp(ct, seg.dwellStratEnd, seg.exitEnd));
      cy = yStrategy + (yExitTop - yStrategy) * k;
      cOpacity = 1 - k;
    }
  }
  // After the sweep, cursor is fully invisible — static final state.
  if (ct > seg.exitEnd) cOpacity = 0;

  return (
    <svg
      className="tld-svg"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Connectors (drawn beneath rungs so chevron sits between them) */}
      {[0, 1].map((i) => {
        const yTop = rungY[i]! + RUNG_H;
        const yBottom = rungY[i + 1]!;
        const xCenter = RUNG_X + RUNG_W / 2;
        const yMid = (yTop + yBottom) / 2;
        return (
          <g key={`conn-${i}`}>
            <line
              x1={xCenter}
              y1={yTop + 4}
              x2={xCenter}
              y2={yMid - 8}
              stroke={C.inkFaint}
              strokeWidth={1}
              strokeDasharray="3 4"
              strokeLinecap="round"
            />
            <line
              x1={xCenter}
              y1={yMid + 8}
              x2={xCenter}
              y2={yBottom - 4}
              stroke={C.inkFaint}
              strokeWidth={1}
              strokeDasharray="3 4"
              strokeLinecap="round"
            />
            <UpChevron cx={xCenter} cy={yMid} />
          </g>
        );
      })}

      {/* Rungs */}
      {RUNGS.map((r, i) => {
        const y = rungY[i]!;
        const isHi = highlight === r.id || highlight === 'all';
        const fill = isHi ? C.coralTint : C.surface;

        // Visibility-gradient borders.
        let strokeProps: {
          stroke: string;
          strokeWidth: number;
          strokeDasharray?: string;
        };
        if (r.border === 'solid') {
          strokeProps = {
            stroke: isHi ? C.coral : C.inkStrong,
            strokeWidth: 1.6,
          };
        } else if (r.border === 'outlined') {
          strokeProps = {
            stroke: isHi ? C.coral : C.borderStrong,
            strokeWidth: 0.9,
          };
        } else {
          // dashed
          strokeProps = {
            stroke: isHi ? C.coral : C.borderStrong,
            strokeWidth: 0.9,
            strokeDasharray: '5 5',
          };
        }

        const iconCX = RUNG_X + 44;
        const iconCY = y + RUNG_H / 2;
        const textX = RUNG_X + 100;

        return (
          <g key={r.id}>
            <rect
              x={RUNG_X}
              y={y}
              width={RUNG_W}
              height={RUNG_H}
              rx={6}
              ry={6}
              fill={fill}
              {...strokeProps}
            />

            {/* Icon */}
            <g transform={`translate(${iconCX}, ${iconCY})`}>
              <RungIcon id={r.id} />
            </g>

            {/* Vertical hairline between icon and content */}
            <line
              x1={RUNG_X + 84}
              y1={y + 22}
              x2={RUNG_X + 84}
              y2={y + RUNG_H - 22}
              stroke={C.border}
              strokeWidth={0.8}
            />

            {/* Level label */}
            <text
              x={textX}
              y={y + 28}
              fontFamily={FONT_MONO}
              fontSize={11.5}
              fill={C.inkMute}
              letterSpacing="0.06em"
            >
              {r.ord} · {r.name}
            </text>

            {/* Question — dominant element */}
            <text
              x={textX}
              y={y + 58}
              fontFamily={FONT_SANS}
              fontSize={20}
              fontWeight={600}
              fill={C.inkStrong}
            >
              {r.question}
            </text>

            {/* Content list */}
            <text
              x={textX}
              y={y + 88}
              fontFamily={FONT_SANS}
              fontSize={13}
              fill={C.inkSoft}
            >
              {r.contains}
            </text>
          </g>
        );
      })}

      {/* Reading cursor (above rungs in z-order) */}
      <Cursor
        y={cy}
        opacity={cOpacity}
        xLeft={RUNG_X - 26}
        xRight={RUNG_X + RUNG_W + 26}
      />
    </svg>
  );
}

// ---------- The reading cursor band ----------

type CursorProps = { y: number; opacity: number; xLeft: number; xRight: number };

function Cursor({ y, opacity, xLeft, xRight }: CursorProps): JSX.Element | null {
  if (opacity <= 0) return null;
  const bandH = 30;
  const yTop = y - bandH / 2;
  const chipW = 130;
  const chipH = 24;
  const chipX = xLeft;
  const chipY = y - chipH / 2;
  return (
    <g opacity={opacity}>
      {/* Soft tinted band — translucent so rungs remain readable */}
      <rect
        x={xLeft}
        y={yTop}
        width={xRight - xLeft}
        height={bandH}
        fill={C.coralTint}
        opacity={0.55}
      />
      {/* Top and bottom hairlines define the band crisply */}
      <line
        x1={xLeft}
        y1={yTop}
        x2={xRight}
        y2={yTop}
        stroke={C.coral}
        strokeWidth={0.8}
        opacity={0.85}
      />
      <line
        x1={xLeft}
        y1={yTop + bandH}
        x2={xRight}
        y2={yTop + bandH}
        stroke={C.coral}
        strokeWidth={0.8}
        opacity={0.85}
      />

      {/* Chip on the left edge of the band */}
      <rect
        x={chipX}
        y={chipY}
        width={chipW}
        height={chipH}
        rx={3}
        ry={3}
        fill={C.surface}
        stroke={C.coral}
        strokeWidth={1}
      />
      <UpArrow cx={chipX + 14} cy={chipY + chipH / 2} />
      <text
        x={chipX + 26}
        y={chipY + chipH / 2 + 4}
        fontFamily={FONT_MONO}
        fontSize={10.5}
        fill={C.coralDeep}
        letterSpacing="0.08em"
      >
        TRACING BACK
      </text>
    </g>
  );
}

// ---------- Small body — compact reuse (e.g. source-card scale) ----------

function SmallBody({ t, highlight }: BodyProps): JSX.Element {
  const VB_W = 360;
  const RUNG_X = 12;
  const RUNG_W = 336;
  const RUNG_H = 44;
  const CONN_H = 20;
  const TOP_PAD = 8;
  const BOTTOM_PAD = 8;
  const rungY: [number, number, number] = [
    TOP_PAD,
    TOP_PAD + RUNG_H + CONN_H,
    TOP_PAD + (RUNG_H + CONN_H) * 2,
  ];
  const VB_H = TOP_PAD + RUNG_H * 3 + CONN_H * 2 + BOTTOM_PAD;

  const opa = entry(t, 0, 0.4);

  return (
    <svg
      className="tld-svg"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Connectors */}
      {[0, 1].map((i) => {
        const yTop = rungY[i]! + RUNG_H;
        const yBottom = rungY[i + 1]!;
        const xCenter = RUNG_X + RUNG_W / 2;
        const yMid = (yTop + yBottom) / 2;
        return (
          <g key={`sconn-${i}`} opacity={opa}>
            <line
              x1={xCenter}
              y1={yTop + 2}
              x2={xCenter}
              y2={yMid - 5}
              stroke={C.inkFaint}
              strokeWidth={0.8}
              strokeDasharray="2 3"
              strokeLinecap="round"
            />
            <line
              x1={xCenter}
              y1={yMid + 5}
              x2={xCenter}
              y2={yBottom - 2}
              stroke={C.inkFaint}
              strokeWidth={0.8}
              strokeDasharray="2 3"
              strokeLinecap="round"
            />
            <UpChevron cx={xCenter} cy={yMid} scale={0.7} />
          </g>
        );
      })}

      {/* Rungs */}
      {RUNGS.map((r, i) => {
        const y = rungY[i]!;
        const isHi = highlight === r.id || highlight === 'all';
        const fill = isHi ? C.coralTint : C.surface;
        let strokeProps: {
          stroke: string;
          strokeWidth: number;
          strokeDasharray?: string;
        };
        if (r.border === 'solid') {
          strokeProps = { stroke: isHi ? C.coral : C.inkStrong, strokeWidth: 1.2 };
        } else if (r.border === 'outlined') {
          strokeProps = { stroke: isHi ? C.coral : C.borderStrong, strokeWidth: 0.7 };
        } else {
          strokeProps = {
            stroke: isHi ? C.coral : C.borderStrong,
            strokeWidth: 0.7,
            strokeDasharray: '3 3',
          };
        }
        return (
          <g key={r.id} opacity={opa}>
            <rect
              x={RUNG_X}
              y={y}
              width={RUNG_W}
              height={RUNG_H}
              rx={4}
              ry={4}
              fill={fill}
              {...strokeProps}
            />
            <text
              x={RUNG_X + 14}
              y={y + 18}
              fontFamily={FONT_MONO}
              fontSize={9}
              fill={C.inkMute}
              letterSpacing="0.06em"
            >
              {r.ord} · {r.name}
            </text>
            <text
              x={RUNG_X + 14}
              y={y + 34}
              fontFamily={FONT_SANS}
              fontSize={11}
              fontWeight={600}
              fill={C.inkStrong}
            >
              {r.question}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
