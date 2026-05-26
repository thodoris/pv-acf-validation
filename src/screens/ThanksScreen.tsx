/* ThanksScreen — sealed state, what-happens-next, contact, 30-day withdrawal.
   hasShell: false on this screen, so TopBar + Rail don't render. */

import type { JSX } from 'react';
import { ProtectedEmail } from '@/shell/ProtectedEmail';
import { RESEARCHER } from '@/lib/contacts';

export function ThanksScreen(): JSX.Element {
  return (
    <div className="main main--wide">
      <div className="main__inner thanks">
        <div className="kicker">Complete</div>
        <h1 className="h-display">Thank you for your review.</h1>
        <p className="tagline">
          Your judgement strengthens the framework's validation.
        </p>

        <p className="lede" style={{ maxWidth: 640 }}>
          Your responses have been sealed and added to the validation record. The
          thesis' Chapter 9 analyses each cluster of expert input separately — your
          contributions to the problem cluster, to the framework's design claims, to
          the operational evaluation of the four instruments, and to the closing
          catch-all will all be visible in aggregate, never identified, in the
          published version.
        </p>

        <div className="thanks__cards">
          <div className="card">
            <div className="kicker kicker--mute">What happens next</div>
            <p style={{ margin: '8px 0 0', fontSize: 13.5 }}>
              If you said you were open to a follow-up interview, the author will
              reach out within two weeks. Interviews are typically 25 minutes and
              entirely voluntary.
            </p>
          </div>
          <div className="card">
            <div className="kicker kicker--mute">If you change your mind</div>
            <p style={{ margin: '8px 0 0', fontSize: 13.5 }}>
              You may withdraw your responses up to 30 days after submission by
              emailing the author. Withdrawal removes your record from the dataset;
              it does not retroactively remove already-published aggregate analysis.
            </p>
          </div>
          <div className="card">
            <div className="kicker kicker--mute">Contact</div>
            <p style={{ margin: '8px 0 0', fontSize: 13.5 }}>
              <ProtectedEmail contact={RESEARCHER} className="mono protected-email--soft" />
              <br />
              Department of Public Administration · University of the Aegean
            </p>
          </div>
        </div>

        <p className="thanks__closer italic">
          With appreciation — for your time, your expertise, and the rigour you
          brought to this review.
        </p>
      </div>
    </div>
  );
}
