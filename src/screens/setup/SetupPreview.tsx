/* "What you will be asked" preview list shown at the bottom of setup screens. */

import type { JSX } from 'react';
import type { ClusterPreview } from './clusterPreview';

export type SetupPreviewProps = {
  preview: ClusterPreview;
  /** "standalone" variant has its own header instead of inheriting the
   *  surrounding setup-screen header. Used by the per-cluster setup screens. */
  standalone?: boolean;
  /** When true, kind labels are uppercased (matches the per-cluster setup
   *  screens' visual treatment). */
  uppercaseKind?: boolean;
  /** Override the head label. Default: "What you will be asked · N items" */
  headLabel?: string;
};

export function SetupPreview({
  preview,
  standalone,
  uppercaseKind,
  headLabel,
}: SetupPreviewProps): JSX.Element {
  const label =
    headLabel ?? `What you will be asked · ${preview.count} item${preview.count === 1 ? '' : 's'}`;
  return (
    <section
      className={
        standalone ? 'setup-preview setup-preview--standalone' : 'setup-preview'
      }
    >
      <div className="setup-preview__head">
        <span className="kicker kicker--mute">{label}</span>
        {!standalone && (
          <span className="mono setup-preview__count">
            {preview.count} item{preview.count === 1 ? '' : 's'}
          </span>
        )}
      </div>
      <ol className="setup-preview__list">
        {preview.items.map((it, i) => (
          <li key={i} className="setup-preview__item">
            <span className="setup-preview__num mono">{it.num}</span>
            <div>
              <div className="setup-preview__title">{it.title}</div>
              {it.kind && (
                <div className="setup-preview__kind mono">
                  {uppercaseKind ? it.kind.toUpperCase() : it.kind}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
