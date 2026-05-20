/* Generic ClusterSetupScreen — used for c4-setup. Cluster 1/2/3 use their
   own dedicated 2-screen setups (ProblemSetup1/2, FrameworkSetup1/2, etc.)
   because their setups are diagram-centric and content-heavy.
   Port of docs/reference-prototype/screens-templates.jsx ClusterSetupScreen. */

import type { JSX } from 'react';
import { NavButtons } from '@/shell/NavButtons';
import { CONTENT, type ClusterId } from '@/content';
import { SetupPreview } from './SetupPreview';
import { clusterPreview, titleCase } from './clusterPreview';

export type ClusterSetupScreenProps = {
  clusterId: ClusterId;
};

export function ClusterSetupScreen({ clusterId }: ClusterSetupScreenProps): JSX.Element | null {
  const c = CONTENT.clusters[clusterId];
  if (!c) return null;

  const preview = clusterPreview(clusterId);
  const ordinalMatch = c.ordinal.match(/\d+/);
  const badgeNum = ordinalMatch ? ordinalMatch[0].padStart(2, '0') : '00';
  const badgeName = c.label.replace(/^the\s+/i, '');

  return (
    <div className="main">
      <div className="main__inner">
        <div className="setup-header">
          <div className="cluster-badge">
            <span className="cluster-badge__num">{badgeNum}</span>
            <span className="cluster-badge__name">{badgeName}</span>
            <span className="cluster-badge__step">Introductory setup</span>
          </div>
          <h1 className="h-display setup-header__title">{titleCase(c.label)}</h1>
          <p className="tagline">{c.tagline}</p>
        </div>

        <aside className="lede-panel">
          <p>{c.intro}</p>
        </aside>

        <section className="setup">
          <div className="setup__title-row">
            <h2 className="h-chapter setup__title">{c.setup.title}</h2>
            <span className="setup__count mono">{c.setup.sections.length} sections</span>
          </div>

          <div className="setup__sections">
            {c.setup.sections.map((s, i) => (
              <article className="setup__section" key={i}>
                <div className="setup__num">{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div className="setup__label">{s.label}</div>
                  <div
                    className="setup__body"
                    dangerouslySetInnerHTML={{ __html: s.body }}
                  />
                </div>
              </article>
            ))}
          </div>

          {c.setup.footer && (
            <div className="setup__pullquote">
              <span className="setup__pullquote-mark">“</span>
              <p>{c.setup.footer}</p>
            </div>
          )}
        </section>

        {preview && <SetupPreview preview={preview} />}

        <NavButtons />
      </div>
    </div>
  );
}
