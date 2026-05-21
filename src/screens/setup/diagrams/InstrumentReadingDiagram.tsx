/* PV-ACF Cluster 3 — instrument-reading-diagram-v1.
   Visual anchor for c3-setup1: three rounded-rectangle tiers stacked
   vertically (framework specifies → institution configures → you judge)
   with two downward arrows. ~2.5s staggered top-to-bottom build.

   Mechanical port of docs/reference-prototype/diagrams/instrument-reading-diagram.jsx.
   Standalone — no animations.jsx dependency. Honours prefers-reduced-motion. */

import { useEffect, useState } from 'react';
import type { JSX } from 'react';

const C = {
  surface: '#FFFFFF',
  surfaceDeep: '#F8F4EA',
  inkStrong: '#1A1816',
  ink: '#2C2C2A',
  inkSoft: '#5F5E5A',
  inkMute: '#888780',
  coral: '#B8472E',
  coralDeep: '#712B13',
  coralTint: '#FAECE7',
  border: '#E5E0D2',
  borderStrong: '#B4B0A2',
};

const FONT_SANS = "'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const STYLE_ID = '__ird_styles_v1';
function injectStylesOnce() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    .ird-wrap { display: block; width: 100%; }
    .ird-svg  { display: block; width: 100%; height: auto; }
  `;
  document.head.appendChild(s);
}

// ---------------------------------------------------------------------------
// Hooks (same shape as ThreeLevelsDiagram; intentionally duplicated to keep
// each diagram self-contained — they ship + version independently).
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
// Tiers
// ---------------------------------------------------------------------------

type Tier = {
  id: string;
  label: string;
  sub: string[];
};

const TIERS: Tier[] = [
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type InstrumentReadingDiagramProps = {
  size?: 'full' | 'small';
  autoplay?: boolean;
  ariaLabel?: string;
};

export function InstrumentReadingDiagram({
  size = 'full',
  autoplay = true,
  ariaLabel,
}: InstrumentReadingDiagramProps): JSX.Element {
  injectStylesOnce();
  const duration = 2.5;
  const t = useBuildTime({ autoplay, duration });

  const maxW = size === 'small' ? 380 : 560;
  const wrapStyle = { maxWidth: maxW, margin: '0 auto' };

  const Body = size === 'small' ? SmallBody : FullBody;

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? DEFAULT_ALT}
      className={`ird-wrap ird ird--${size}`}
      style={wrapStyle}
    >
      <Body t={t} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG defs + tier renderer
// ---------------------------------------------------------------------------

function ArrowDefs(): JSX.Element {
  return (
    <defs>
      <marker
        id="ird-ar-coral"
        markerWidth="10"
        markerHeight="10"
        refX="6"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,1.5 L7,5 L0,8.5 z" fill={C.coral} />
      </marker>
      <marker
        id="ird-ar-coral-sm"
        markerWidth="9"
        markerHeight="9"
        refX="5.5"
        refY="4.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,1.2 L6.5,4.5 L0,7.8 z" fill={C.coral} />
      </marker>
    </defs>
  );
}

type TierBoxProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string[];
  opacity: number;
  labelSize?: number;
  subSize?: number;
  rx?: number;
};

function TierBox({
  x,
  y,
  w,
  h,
  label,
  sub,
  opacity,
  labelSize = 14,
  subSize = 12,
  rx = 6,
}: TierBoxProps): JSX.Element {
  const cx = x + w / 2;
  const subText = sub.join('  ·  ');
  return (
    <g opacity={opacity} transform={`translate(0, ${(1 - opacity) * 8})`}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        ry={rx}
        fill={C.surface}
        stroke={C.borderStrong}
        strokeWidth={0.8}
      />
      <text
        x={cx}
        y={y + h / 2 - 6}
        fontFamily={FONT_SANS}
        fontSize={labelSize}
        fontWeight={600}
        fill={C.inkStrong}
        textAnchor="middle"
        letterSpacing="0.06em"
      >
        {label}
      </text>
      <text
        x={cx}
        y={y + h / 2 + subSize + 4}
        fontFamily={FONT_MONO}
        fontSize={subSize}
        fill={C.inkMute}
        textAnchor="middle"
        fontStyle="italic"
        letterSpacing="0.02em"
      >
        {subText}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Bodies
// ---------------------------------------------------------------------------

function FullBody({ t }: { t: number }): JSX.Element {
  const VB_W = 560;
  const tierW = 480;
  const tierH = 82;
  const gap = 44;
  const padY = 12;
  const padX = (VB_W - tierW) / 2;
  const VB_H = padY * 2 + 3 * tierH + 2 * gap;

  const tierO = [
    entry(t, 0.0, 0.45),
    entry(t, 1.0, 0.45),
    entry(t, 2.0, 0.45),
  ];
  const arrowO = [entry(t, 0.7, 0.4), entry(t, 1.7, 0.4)];

  const tiers = TIERS.map((tier, i) => ({
    ...tier,
    x: padX,
    y: padY + i * (tierH + gap),
  }));

  return (
    <svg
      className="ird-svg"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <ArrowDefs />

      {tiers.map((tier, i) => (
        <TierBox
          key={tier.id}
          x={tier.x}
          y={tier.y}
          w={tierW}
          h={tierH}
          label={tier.label}
          sub={tier.sub}
          opacity={tierO[i]!}
        />
      ))}

      {[0, 1].map((i) => {
        const xMid = padX + tierW / 2;
        const y1 = tiers[i]!.y + tierH + 8;
        const y2 = tiers[i + 1]!.y - 6;
        return (
          <line
            key={i}
            x1={xMid}
            y1={y1}
            x2={xMid}
            y2={y2}
            stroke={C.coral}
            strokeWidth={1.4}
            markerEnd="url(#ird-ar-coral)"
            opacity={arrowO[i]}
          />
        );
      })}
    </svg>
  );
}

function SmallBody({ t }: { t: number }): JSX.Element {
  const VB_W = 380;
  const tierW = 320;
  const tierH = 50;
  const gap = 24;
  const padY = 8;
  const padX = (VB_W - tierW) / 2;
  const VB_H = padY * 2 + 3 * tierH + 2 * gap;

  const tierO = [
    entry(t, 0.0, 0.35),
    entry(t, 0.7, 0.35),
    entry(t, 1.4, 0.35),
  ];
  const arrowO = [entry(t, 0.5, 0.3), entry(t, 1.2, 0.3)];

  const tiers = TIERS.map((tier, i) => ({
    ...tier,
    x: padX,
    y: padY + i * (tierH + gap),
  }));

  return (
    <svg
      className="ird-svg"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <ArrowDefs />

      {tiers.map((tier, i) => (
        <TierBox
          key={tier.id}
          x={tier.x}
          y={tier.y}
          w={tierW}
          h={tierH}
          label={tier.label}
          sub={tier.sub.slice(0, 3)}
          opacity={tierO[i]!}
          labelSize={11}
          subSize={9.5}
          rx={4}
        />
      ))}

      {[0, 1].map((i) => {
        const xMid = padX + tierW / 2;
        const y1 = tiers[i]!.y + tierH + 4;
        const y2 = tiers[i + 1]!.y - 4;
        return (
          <line
            key={i}
            x1={xMid}
            y1={y1}
            x2={xMid}
            y2={y2}
            stroke={C.coral}
            strokeWidth={1}
            markerEnd="url(#ird-ar-coral-sm)"
            opacity={arrowO[i]}
          />
        );
      })}
    </svg>
  );
}
