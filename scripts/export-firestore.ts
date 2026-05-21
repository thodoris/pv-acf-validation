/* Offline export — Node CLI using the Firebase Admin SDK.

   Reads the `responses` collection and writes two artifacts to `results/`:
     · pvacf-submissions-<stamp>.xlsx — flat, atomic-cell layout for Excel /
       `pandas.read_excel` (one column per scalar sub-value).
     · pvacf-submissions-<stamp>.json — full structured answers preserved
       verbatim for pandas/R/SPSS where you'll re-shape programmatically.

   Both files share the same timestamp so they pair cleanly on disk.

   Usage:
     # Uses the Firebase-adminsdk JSON in the project root automatically,
     # or set GOOGLE_APPLICATION_CREDENTIALS to override.
     npm run export:firestore

   Outputs land in <repo>/results/ (created if missing, gitignored). */

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as XLSX from 'xlsx';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  buildJsonPayload,
  buildWorkbook,
  exportBaseName,
  groupRowsByVariant,
  type SubmissionRow,
} from '@/admin/exportXlsx';
import { SUBMISSIONS_COLLECTION } from '@/lib/firestoreCollections';
import type { LockedAnswer } from '@/state/answerStore';

const RESULTS_DIR = 'results';

/** Auto-discover a Firebase Admin SDK key in the project root.
 *  Firebase's "Generate new private key" emits files matching
 *  `*-firebase-adminsdk-*.json` — we glob for the first match so the user
 *  doesn't have to set GOOGLE_APPLICATION_CREDENTIALS by hand. */
function findLocalKey(): string | null {
  const root = process.cwd();
  const entries = fs.readdirSync(root);
  const match = entries.find((f) => /-firebase-adminsdk-.*\.json$/.test(f));
  return match ? path.resolve(root, match) : null;
}

function initAdmin(): void {
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? findLocalKey();
  if (credsPath && fs.existsSync(credsPath)) {
    const json = JSON.parse(fs.readFileSync(credsPath, 'utf8')) as {
      project_id: string;
    };
    initializeApp({
      credential: cert(credsPath),
      projectId: json.project_id,
    });
    console.log(`[export] using service account ${path.basename(credsPath)} for project ${json.project_id}`);
    return;
  }
  // Fall back to ADC (gcloud auth) if no explicit creds file.
  initializeApp({ credential: applicationDefault() });
  console.log('[export] using application-default credentials');
}

async function main(): Promise<void> {
  initAdmin();
  const db = getFirestore();

  const snap = await db
    .collection(SUBMISSIONS_COLLECTION)
    .orderBy('submittedAt', 'desc')
    .get();

  const rows: SubmissionRow[] = snap.docs.map((d) => {
    const data = d.data();
    const ts = data.submittedAt;
    return {
      docId: d.id,
      submittedAt: ts instanceof Timestamp ? ts.toDate() : null,
      variant: (data.variant as string) ?? '',
      answerCount: typeof data.answerCount === 'number' ? data.answerCount : 0,
      answers: (data.answers as Record<string, LockedAnswer>) ?? {},
      userAgent: (data.userAgent as string) ?? '',
    };
  });

  console.log(`[export] fetched ${rows.length} submissions`);

  const outDir = path.resolve(process.cwd(), RESULTS_DIR);
  fs.mkdirSync(outDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  // Write one xlsx + json per variant so files group by variant when sorted.
  const groups = groupRowsByVariant(rows);
  for (const [variant, variantRows] of groups) {
    const baseName = exportBaseName(variant, stamp);

    const xlsxPath = path.join(outDir, `${baseName}.xlsx`);
    XLSX.writeFile(buildWorkbook(variantRows), xlsxPath);

    const jsonPath = path.join(outDir, `${baseName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(buildJsonPayload(variantRows), null, 2), 'utf8');

    console.log(
      `[export] ${variant}: ${variantRows.length} row(s) → ${path.relative(process.cwd(), xlsxPath)} + .json`,
    );
  }
}

main().catch((err) => {
  console.error('[export] failed', err);
  process.exit(1);
});
