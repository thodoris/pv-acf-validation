/* AffordanceCard — rail unit. Renders one of seven kinds: scope, source,
   explanation, example, maturity, operable, video.
   Selectors and shape carried verbatim from docs/reference-prototype/shell.jsx. */

import type { JSX } from 'react';
import { Icon, type IconName } from './Icon';
import type { AffordanceDecl, AffordanceKind } from '@/content';

const ICON_FOR_KIND: Partial<Record<AffordanceKind, IconName>> = {
  example: 'lightbulb',
  source: 'book',
  explanation: 'wand',
  maturity: 'info',
  operable: 'explore',
};

const KIND_LABEL: Record<AffordanceKind, string> = {
  scope: 'Scope · What makes a good answer',
  source: 'Source material',
  explanation: 'Detailed explanation',
  example: 'Example',
  video: 'Instrument video',
  operable: 'Operable widget — explore',
  maturity: 'Maturity statement (P7)',
};

export function AffordanceCard(props: AffordanceDecl): JSX.Element {
  const { kind, title, items, body, footer, chips, video, labelOverride } = props;
  const iconName = ICON_FOR_KIND[kind];
  return (
    <section className={`aff aff--${kind}`}>
      <div className="aff__head">
        <span className="aff__kind">
          {iconName && (
            <span className="aff__kind-icon">
              <Icon name={iconName} size={13} />
            </span>
          )}
          {labelOverride ?? KIND_LABEL[kind]}
        </span>
      </div>
      {title && <h3 className="aff__title" dangerouslySetInnerHTML={{ __html: title }} />}
      <div className="aff__body">
        {body && <div dangerouslySetInnerHTML={{ __html: body }} />}
        {items && (
          <ul>
            {items.map((it, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
            ))}
          </ul>
        )}
        {footer && <div className="aff__footer" dangerouslySetInnerHTML={{ __html: footer }} />}
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
            <div
              className="video-thumb"
              role="button"
              tabIndex={0}
              aria-label={`Play: ${video.title}`}
            >
              <Icon name="play" size={28} />
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
