/* IncompatibleEnvironmentScreen — pre-boot compatibility blocker.

   Rendered by src/main.tsx when checkCompatibility() returns failures.
   Mirrors the visual register of SubmittedTerminalScreen: full-page
   centred column, no shell, no rail. Listing every required capability
   makes the failure self-explanatory and gives the reviewer a concrete
   set of things to fix or change before reloading. */

import type { JSX } from 'react';
import type { CompatibilityFailure, CompatibilityResult } from '@/lib/compatibility';

type Requirement = {
  key: CompatibilityFailure['kind'];
  label: string;
  passingBody: string;
  failingBody: (failure: CompatibilityFailure) => string;
};

const REQUIREMENTS: Requirement[] = [
  {
    key: 'viewport',
    label: 'Window width',
    passingBody:
      'This window is wide enough for the questionnaire and its reference panels.',
    failingBody: (f) => {
      if (f.kind !== 'viewport') return '';
      return (
        `This page needs a window at least ${f.minPx} pixels wide. ` +
        `Your current window is ${f.widthPx} pixels. ` +
        `Try widening the window, using a larger display, or rotating a tablet to landscape.`
      );
    },
  },
  {
    key: 'localStorage',
    label: 'Browser storage (localStorage)',
    passingBody:
      'Your browser allows the questionnaire to save your progress as you go.',
    failingBody: () =>
      'Your browser is blocking localStorage, which the questionnaire uses to remember your progress. ' +
      'Check your privacy / cookies settings — many browsers expose this as “block third-party cookies” or “strict tracking protection”. ' +
      'Private / incognito windows with hardened settings often disable storage entirely.',
  },
  {
    key: 'indexedDB',
    label: 'Browser database (IndexedDB)',
    passingBody:
      'Your browser supports IndexedDB, used by the submission step.',
    failingBody: () =>
      'Your browser is blocking IndexedDB. The submission step uses Google Firestore, which needs IndexedDB enabled. ' +
      'This is usually a side-effect of strict privacy settings; try a non-incognito window or a different browser.',
  },
  {
    key: 'customElements',
    label: 'Modern browser support (Web Components)',
    passingBody:
      'Your browser supports the Web Components API used by the AST exploration tool.',
    failingBody: () =>
      'Your browser is too old to run this questionnaire. ' +
      'Please open this page in a recent version of Chrome, Firefox, Safari, or Edge.',
  },
];

function failureFor(
  key: CompatibilityFailure['kind'],
  failures: CompatibilityFailure[],
): CompatibilityFailure | undefined {
  return failures.find((f) => f.kind === key);
}

function handleReload(): void {
  window.location.reload();
}

export function IncompatibleEnvironmentScreen({
  result,
}: {
  result: Extract<CompatibilityResult, { ok: false }>;
}): JSX.Element {
  const { failures } = result;
  const onlyViewport = failures.every((f) => f.kind === 'viewport');

  return (
    <div className="main main--wide">
      <div className="main__inner thanks">
        <div className="kicker">Compatibility</div>
        <h1 className="h-display">
          This browser can&rsquo;t run the questionnaire.
        </h1>
        <p className="tagline">
          The expert validation platform needs a few things from your browser
          and window that aren&rsquo;t currently available.
        </p>

        <p className="lede" style={{ maxWidth: 640 }}>
          {onlyViewport ? (
            <>
              Widen this window or use a larger display, and the questionnaire
              will appear automatically &mdash; no reload needed.
            </>
          ) : (
            <>
              The requirements below need to be addressed before the
              questionnaire can load. Once you&rsquo;ve adjusted your browser
              settings or moved to a supported browser, press <em>Reload page</em>.
            </>
          )}
        </p>

        <div className="thanks__cards">
          {REQUIREMENTS.map((req) => {
            const failure = failureFor(req.key, failures);
            const failing = failure !== undefined;
            return (
              <div
                key={req.key}
                className="card"
                style={
                  failing
                    ? { borderColor: 'var(--coral)', borderWidth: 1 }
                    : undefined
                }
              >
                <div
                  className="kicker kicker--mute"
                  style={failing ? { color: 'var(--coral-deep)' } : undefined}
                >
                  {failing ? '✕ ' : '✓ '}
                  {req.label}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 13.5 }}>
                  {failing && failure
                    ? req.failingBody(failure)
                    : req.passingBody}
                </p>
              </div>
            );
          })}
        </div>

        {!onlyViewport && (
          <section
            aria-label="Reload after adjusting browser settings"
            style={{
              marginTop: 'var(--space-6)',
              padding: 'var(--space-4) var(--space-5)',
              background: 'var(--surface-deep)',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: 640,
            }}
          >
            <div
              className="kicker kicker--mute"
              style={{ marginBottom: 'var(--space-2)' }}
            >
              When you&rsquo;ve made changes
            </div>
            <p
              style={{
                fontSize: 13.5,
                color: 'var(--ink-soft)',
                margin: '0 0 var(--space-3)',
              }}
            >
              Press the button below to re-check your browser and start the
              questionnaire if everything passes.
            </p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleReload}
            >
              Reload page
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
