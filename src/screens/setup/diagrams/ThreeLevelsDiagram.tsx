/* PV-ACF Cluster 1 — three-levels-diagram-v1.
   Visual anchor for c1-setup1: three rounded-rectangle nodes
   (Strategy → Institutional → Deployment) with two flow arrows.
   Optional dashed right-to-left feedback arrow underneath.

   Mechanical port of docs/reference-prototype/diagrams/three-levels-diagram.jsx.
   No external dependencies. Honours prefers-reduced-motion. Re-runs the
   entrance animation when its `key` prop changes (the Replay button bumps
   it via useReducer key-bump in DiagramSlot). */

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

const STYLE_ID = '__tld_styles_v1';
function injectStylesOnce() {
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

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const entry = (t: number, start: number, dur = 0.45): number =>
  easeOutCubic(clamp((t - start) / dur, 0, 1));

// ---------------------------------------------------------------------------
// Content + alt text
// ---------------------------------------------------------------------------

const DEFAULT_ALT =
  'Three-levels diagram. Three rounded rectangles arranged horizontally, equally sized and equally weighted, named left-to-right: Strategy level (strategic priorities), Institutional level (institutional routines), Deployment level (AI deployment). Two unlabelled arrows point left-to-right between adjacent boxes, indicating that decisions taken at upstream levels shape what is possible downstream.';

const DEFAULT_ALT_FEEDBACK =
  DEFAULT_ALT +
  ' A dashed arrow underneath the three boxes points right-to-left from the deployment level back to the strategy level, indicating that patterns established at the deployment level can feed back to reshape the upstream levels over time.';

type LevelId = 'strategy' | 'institutional' | 'deployment';
type Highlight = LevelId | 'all' | null;

type Level = { id: LevelId; name: string; sub: string };

const LEVELS: Level[] = [
  { id: 'strategy', name: 'Strategy level', sub: 'strategic priorities' },
  { id: 'institutional', name: 'Institutional level', sub: 'institutional routines' },
  { id: 'deployment', name: 'Deployment level', sub: 'AI deployment' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type ThreeLevelsDiagramProps = {
  size?: 'full' | 'small';
  feedback?: boolean;
  highlight?: Highlight;
  autoplay?: boolean;
  ariaLabel?: string;
};

export function ThreeLevelsDiagram({
  size = 'full',
  feedback = false,
  highlight = null,
  autoplay = true,
  ariaLabel,
}: ThreeLevelsDiagramProps): JSX.Element {
  injectStylesOnce();
  const duration = 1.6;
  const t = useBuildTime({ autoplay, duration });

  const maxW = size === 'small' ? 360 : 820;
  const wrapStyle = { maxWidth: maxW, margin: '0 auto' };

  const Body = size === 'small' ? SmallBody : FullBody;

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? (feedback ? DEFAULT_ALT_FEEDBACK : DEFAULT_ALT)}
      className={`tld-wrap tld tld--${size}${feedback ? ' tld--feedback' : ''}`}
      style={wrapStyle}
    >
      <Body t={t} feedback={feedback} highlight={highlight} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared SVG defs
// ---------------------------------------------------------------------------

function ArrowDefs(): JSX.Element {
  return (
    <defs>
      <marker
        id="tld-ar-soft"
        markerWidth="9"
        markerHeight="9"
        refX="7"
        refY="4.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,1 L7,4.5 L0,8 z" fill={C.inkSoft} />
      </marker>
      <marker
        id="tld-ar-coral"
        markerWidth="7"
        markerHeight="7"
        refX="6"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0.7 L6,3.5 L0,6.3 z" fill={C.coral} />
      </marker>
    </defs>
  );
}

// ---------------------------------------------------------------------------
// Bodies
// ---------------------------------------------------------------------------

type BodyProps = { t: number; feedback: boolean; highlight: Highlight };

function FullBody({ t, feedback, highlight }: BodyProps): JSX.Element {
  const VB_W = 820;
  const VB_H = feedback ? 250 : 200;
  const pad = 16;
  const boxW = 230;
  const boxH = 110;
  const gap = (VB_W - 2 * pad - 3 * boxW) / 2; // → 67px
  const boxY = 28;

  const boxes = LEVELS.map((lv, i) => ({
    ...lv,
    x: pad + i * (boxW + gap),
    y: boxY,
    cx: pad + i * (boxW + gap) + boxW / 2,
  }));

  const boxO = [
    entry(t, 0.0, 0.45),
    entry(t, 0.18, 0.45),
    entry(t, 0.36, 0.45),
  ];
  const arrO = [entry(t, 0.7, 0.4), entry(t, 0.85, 0.4)];
  const fbO = feedback ? entry(t, 1.1, 0.45) : 0;

  return (
    <svg
      className="tld-svg"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <ArrowDefs />

      {boxes.map((b, i) => {
        const isHi = highlight === b.id || highlight === 'all';
        const fill = isHi ? C.coralTint : C.surface;
        const stroke = isHi ? C.coral : C.borderStrong;
        return (
          <g
            key={b.id}
            opacity={boxO[i]}
            transform={`translate(0, ${(1 - boxO[i]!) * 8})`}
          >
            <rect
              x={b.x}
              y={b.y}
              width={boxW}
              height={boxH}
              rx={6}
              ry={6}
              fill={fill}
              stroke={stroke}
              strokeWidth={0.8}
            />
            <text
              x={b.cx}
              y={b.y + 50}
              fontFamily={FONT_SANS}
              fontSize={18}
              fontWeight={600}
              fill={C.inkStrong}
              textAnchor="middle"
            >
              {b.name}
            </text>
            <text
              x={b.cx}
              y={b.y + 78}
              fontFamily={FONT_MONO}
              fontSize={12}
              fill={C.inkMute}
              textAnchor="middle"
              letterSpacing="0.02em"
            >
              {b.sub}
            </text>
          </g>
        );
      })}

      {[0, 1].map((i) => {
        const x1 = boxes[i]!.x + boxW + 10;
        const x2 = boxes[i + 1]!.x - 4;
        const y = boxY + boxH / 2;
        return (
          <line
            key={i}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={C.inkSoft}
            strokeWidth={1.4}
            markerEnd="url(#tld-ar-soft)"
            opacity={arrO[i]}
          />
        );
      })}

      {feedback && (
        <g opacity={fbO}>
          <path
            d={`M ${boxes[2]!.cx} ${boxY + boxH + 32} L ${boxes[0]!.cx + 4} ${boxY + boxH + 32}`}
            stroke={C.coral}
            strokeWidth={1.1}
            strokeDasharray="5 4"
            fill="none"
            markerEnd="url(#tld-ar-coral)"
          />
          <text
            x={(boxes[0]!.cx + boxes[2]!.cx) / 2}
            y={boxY + boxH + 56}
            fontFamily={FONT_MONO}
            fontSize={11}
            fill={C.coralDeep}
            textAnchor="middle"
            letterSpacing="0.04em"
            fontStyle="italic"
          >
            effects feed back over time
          </text>
        </g>
      )}
    </svg>
  );
}

function SmallBody({ t, feedback, highlight }: BodyProps): JSX.Element {
  const VB_W = 360;
  const VB_H = feedback ? 150 : 110;
  const pad = 8;
  const boxW = 100;
  const boxH = 56;
  const gap = (VB_W - 2 * pad - 3 * boxW) / 2; // → 22px
  const boxY = 14;

  const boxes = LEVELS.map((lv, i) => ({
    ...lv,
    x: pad + i * (boxW + gap),
    y: boxY,
    cx: pad + i * (boxW + gap) + boxW / 2,
  }));

  const showAll = entry(t, 0.0, 0.3);
  const fbO = feedback ? entry(t, 0.5, 0.45) : 0;

  return (
    <svg
      className="tld-svg"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <ArrowDefs />

      {boxes.map((b) => {
        const isHi = highlight === b.id || highlight === 'all';
        const fill = isHi ? C.coralTint : C.surface;
        const stroke = isHi ? C.coral : C.borderStrong;
        return (
          <g key={b.id} opacity={showAll}>
            <rect
              x={b.x}
              y={b.y}
              width={boxW}
              height={boxH}
              rx={4}
              ry={4}
              fill={fill}
              stroke={stroke}
              strokeWidth={0.6}
            />
            <text
              x={b.cx}
              y={b.y + 34}
              fontFamily={FONT_SANS}
              fontSize={12}
              fontWeight={600}
              fill={C.inkStrong}
              textAnchor="middle"
            >
              {b.name.replace(' level', '')}
            </text>
          </g>
        );
      })}

      {[0, 1].map((i) => {
        const x1 = boxes[i]!.x + boxW + 4;
        const x2 = boxes[i + 1]!.x - 2;
        const y = boxY + boxH / 2;
        return (
          <line
            key={i}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={C.inkSoft}
            strokeWidth={1}
            markerEnd="url(#tld-ar-soft)"
            opacity={showAll}
          />
        );
      })}

      {feedback && (
        <g opacity={fbO}>
          <path
            d={`M ${boxes[2]!.cx} ${boxY + boxH + 18} L ${boxes[0]!.cx + 3} ${boxY + boxH + 18}`}
            stroke={C.coral}
            strokeWidth={0.9}
            strokeDasharray="4 3"
            fill="none"
            markerEnd="url(#tld-ar-coral)"
          />
          <text
            x={(boxes[0]!.cx + boxes[2]!.cx) / 2}
            y={boxY + boxH + 34}
            fontFamily={FONT_MONO}
            fontSize={9}
            fill={C.coralDeep}
            textAnchor="middle"
            letterSpacing="0.04em"
            fontStyle="italic"
          >
            feeds back over time
          </text>
        </g>
      )}
    </svg>
  );
}
