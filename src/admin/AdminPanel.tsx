/* AdminPanel — hidden at /admin. No entry point in the questionnaire UI.

   Three sub-states:
     1. Not signed in    → single "Sign in with Google" button.
     2. Signed in, not whitelisted → "Not authorized" + sign-out.
     3. Signed in, admin → submission list (count, last submitted-at) + export.

   The whitelist is a single email read from VITE_ADMIN_EMAIL at build time.
   Firestore security rules enforce the same check server-side — this client
   gate is a UX nicety, not a security boundary. */

import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db, ADMIN_EMAIL } from '@/lib/firebase';
import { SUBMISSIONS_COLLECTION } from '@/lib/sealSubmission';
import {
  exportSubmissionsToJson,
  exportSubmissionsToXlsx,
  type SubmissionRow,
} from '@/admin/exportXlsx';

type AuthState =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'unauthorized'; user: User }
  | { kind: 'admin'; user: User };

type FetchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'loaded'; rows: SubmissionRow[] }
  | { kind: 'error'; message: string };

export function AdminPanel(): JSX.Element {
  const [authState, setAuthState] = useState<AuthState>({ kind: 'loading' });
  const [fetchState, setFetchState] = useState<FetchState>({ kind: 'idle' });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAuthState({ kind: 'signed-out' });
        return;
      }
      if (ADMIN_EMAIL && user.email === ADMIN_EMAIL) {
        setAuthState({ kind: 'admin', user });
      } else {
        setAuthState({ kind: 'unauthorized', user });
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (authState.kind !== 'admin') return;
    let cancelled = false;
    void (async () => {
      setFetchState({ kind: 'loading' });
      try {
        const q = query(
          collection(db, SUBMISSIONS_COLLECTION),
          orderBy('submittedAt', 'desc'),
        );
        const snap = await getDocs(q);
        const rows: SubmissionRow[] = snap.docs.map((d) => {
          const data = d.data() as DocumentData;
          const ts = data.submittedAt;
          return {
            docId: d.id,
            submittedAt: ts instanceof Timestamp ? ts.toDate() : null,
            variant: data.variant ?? '',
            answerCount: typeof data.answerCount === 'number' ? data.answerCount : 0,
            answers: data.answers ?? {},
            userAgent: data.userAgent ?? '',
          };
        });
        if (!cancelled) setFetchState({ kind: 'loaded', rows });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setFetchState({ kind: 'error', message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authState.kind]);

  const lastSubmittedAt = useMemo(() => {
    if (fetchState.kind !== 'loaded') return null;
    return fetchState.rows[0]?.submittedAt ?? null;
  }, [fetchState]);

  const onSignIn = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      console.error('[admin] sign-in failed', err);
    }
  };

  const onSignOut = () => {
    void signOut(auth);
  };

  const onExportXlsx = () => {
    if (fetchState.kind !== 'loaded') return;
    exportSubmissionsToXlsx(fetchState.rows);
  };

  const onExportJson = () => {
    if (fetchState.kind !== 'loaded') return;
    exportSubmissionsToJson(fetchState.rows);
  };

  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        <div className="kicker">Admin</div>
        <h1 className="h-display" style={{ marginTop: 8 }}>
          Submissions
        </h1>

        {authState.kind === 'loading' && <p className="lede">Loading…</p>}

        {authState.kind === 'signed-out' && (
          <>
            <p className="lede">Sign in with the authorized Google account to view and export submissions.</p>
            <button type="button" className="btn btn--primary btn--lg" onClick={() => void onSignIn()}>
              Sign in with Google
            </button>
          </>
        )}

        {authState.kind === 'unauthorized' && (
          <>
            <p className="lede">
              Signed in as <strong>{authState.user.email}</strong>, but this account is not authorized.
            </p>
            <button type="button" className="btn" onClick={onSignOut}>
              Sign out
            </button>
          </>
        )}

        {authState.kind === 'admin' && (
          <>
            <p className="lede">
              Signed in as <strong>{authState.user.email}</strong>.{' '}
              <button
                type="button"
                onClick={onSignOut}
                style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', padding: 0 }}
              >
                Sign out
              </button>
            </p>

            {fetchState.kind === 'loading' && <p>Loading submissions…</p>}

            {fetchState.kind === 'error' && (
              <p role="alert" style={{ color: 'var(--danger)' }}>
                <strong>Error loading submissions:</strong> {fetchState.message}
              </p>
            )}

            {fetchState.kind === 'loaded' && (
              <>
                <div style={statsStyle}>
                  <div>
                    <div className="kicker">Total</div>
                    <div style={statValStyle}>{fetchState.rows.length}</div>
                  </div>
                  <div>
                    <div className="kicker">Last submitted</div>
                    <div style={statValStyle}>
                      {lastSubmittedAt ? lastSubmittedAt.toLocaleString() : '—'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn--primary btn--lg"
                    onClick={onExportXlsx}
                    disabled={fetchState.rows.length === 0}
                  >
                    Export to .xlsx
                  </button>
                  <button
                    type="button"
                    className="btn btn--lg"
                    onClick={onExportJson}
                    disabled={fetchState.rows.length === 0}
                  >
                    Export to .json
                  </button>
                </div>

                {fetchState.rows.length > 0 && (
                  <section style={{ marginTop: 32 }}>
                    <div className="kicker">Preview · most recent 10</div>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>docId</th>
                          <th style={thStyle}>submittedAt</th>
                          <th style={thStyle}>variant</th>
                          <th style={thStyle}>answers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fetchState.rows.slice(0, 10).map((r) => (
                          <tr key={r.docId}>
                            <td style={tdStyle}>{r.docId}</td>
                            <td style={tdStyle}>
                              {r.submittedAt ? r.submittedAt.toLocaleString() : '—'}
                            </td>
                            <td style={tdStyle}>{r.variant}</td>
                            <td style={tdStyle}>{r.answerCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--page)',
  padding: '48px 24px',
};

const panelStyle: React.CSSProperties = {
  maxWidth: 920,
  margin: '0 auto',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '32px 40px',
};

const statsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 48,
  marginTop: 16,
  padding: '16px 0',
  borderTop: '1px solid var(--border-soft)',
  borderBottom: '1px solid var(--border-soft)',
};

const statValStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  color: 'var(--ink-strong)',
  marginTop: 4,
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 8,
  borderCollapse: 'collapse',
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '1px solid var(--border)',
  fontWeight: 600,
  color: 'var(--ink-soft)',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--border-soft)',
  fontFamily: 'var(--font-mono, monospace)',
  color: 'var(--ink)',
};
