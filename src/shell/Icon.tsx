/* Inline icon set. Carried verbatim from docs/reference-prototype/shell.jsx
   (Tabler-style line icons, stroke="currentColor", 24x24 viewBox). */

import type { JSX } from 'react';

export type IconName =
  | 'cards'
  | 'framework'
  | 'close'
  | 'play'
  | 'info'
  | 'book'
  | 'wand'
  | 'chevron-right'
  | 'chevron-left'
  | 'clock'
  | 'lock'
  | 'explore'
  | 'lightbulb'
  | 'check'
  | 'list';

export type IconProps = {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 16 }: IconProps): JSX.Element | null {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'cards':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="13" height="14" rx="1.5" />
          <path d="M7 9h6M7 12h5M7 15h4" />
          <path d="M16 7l4 1.2v11l-4-1.2" />
        </svg>
      );
    case 'framework':
      return (
        <svg {...common}>
          <circle cx="12" cy="6" r="2" />
          <circle cx="6" cy="17" r="2" />
          <circle cx="18" cy="17" r="2" />
          <path d="M12 8v3M12 11l-5 4.5M12 11l5 4.5" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      );
    case 'play':
      return (
        <svg width={size * 1.4} height={size * 1.4} viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    case 'info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v.01M11 12h1v4h1" />
        </svg>
      );
    case 'book':
      return (
        <svg {...common}>
          <path d="M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3V4z" />
          <path d="M5 17a3 3 0 013-3h10" />
        </svg>
      );
    case 'wand':
      return (
        <svg {...common}>
          <path d="M15 4l-1 2-2 1 2 1 1 2 1-2 2-1-2-1zM9 9l-7 11 2 2 11-7" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg {...common}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 018 0v3" />
        </svg>
      );
    case 'explore':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9l-2 5-5 2 2-5z" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg {...common}>
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path d="M12 3a6 6 0 0 0-3.5 10.9c.5.5 1 1.5 1 2.1v1h5v-1c0-.6.5-1.6 1-2.1A6 6 0 0 0 12 3z" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      );
    case 'list':
      return (
        <svg {...common}>
          <path d="M8 6h12M8 12h12M8 18h12" />
          <circle cx="4" cy="6" r="0.75" fill="currentColor" />
          <circle cx="4" cy="12" r="0.75" fill="currentColor" />
          <circle cx="4" cy="18" r="0.75" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}
