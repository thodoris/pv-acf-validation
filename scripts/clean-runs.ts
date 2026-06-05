/* clean-runs — prune old snapshot folders from results/ and analysis/.

   Keeps the newest N snapshot generations (default 1) and deletes the rest
   from BOTH results/ and analysis/. Explicit only — this never runs as a
   side-effect of export/analyze. Frozen thesis snapshots under
   docs/validation/ are never touched.

   Because Firestore is append-only, a later export is always a superset of
   an earlier one, so pruning old working snapshots loses nothing you can't
   re-export. (Freeze the one you base the chapter on — `npm run freeze`.)

   Usage:
     npm run clean                 # keep newest 1, delete older
     npm run clean -- --keep=3     # keep newest 3
     npm run clean -- --dry-run    # show what would be deleted, delete nothing
*/

import { promises as fs } from 'node:fs';

import {
  listAllStamps,
  resultsDirFor,
  analysisDirFor,
} from './lib/submissions';

function parseArgs(argv: string[]): { keep: number; dryRun: boolean } {
  let keep = 1;
  let dryRun = false;
  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg.startsWith('--keep=')) {
      const n = Number(arg.slice('--keep='.length));
      if (Number.isInteger(n) && n >= 0) keep = n;
      else process.stderr.write(`[clean] ignoring invalid --keep "${arg}"\n`);
    } else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        'clean-runs — prune old snapshot folders.\n' +
          'Usage: npm run clean [-- --keep=N --dry-run]\n',
      );
      process.exit(0);
    } else process.stderr.write(`[clean] unknown arg "${arg}" — ignored\n`);
  }
  return { keep, dryRun };
}

async function rmIfExists(dir: string): Promise<boolean> {
  try {
    await fs.access(dir);
  } catch {
    return false;
  }
  await fs.rm(dir, { recursive: true, force: true });
  return true;
}

async function main(): Promise<void> {
  const { keep, dryRun } = parseArgs(process.argv.slice(2));
  const stamps = (await listAllStamps()).sort().reverse();

  if (stamps.length === 0) {
    process.stderr.write('[clean] no snapshot folders found — nothing to do.\n');
    return;
  }

  const kept = stamps.slice(0, keep);
  const toDelete = stamps.slice(keep);

  process.stderr.write(
    `[clean] ${stamps.length} snapshot(s) found. Keeping newest ${kept.length}: ` +
      `${kept.join(', ') || '(none)'}.\n`,
  );

  if (toDelete.length === 0) {
    process.stderr.write('[clean] nothing to delete.\n');
    return;
  }

  for (const stamp of toDelete) {
    if (dryRun) {
      process.stderr.write(`[clean] would delete ${resultsDirFor(stamp)} + ${analysisDirFor(stamp)}\n`);
      continue;
    }
    const r = await rmIfExists(resultsDirFor(stamp));
    const a = await rmIfExists(analysisDirFor(stamp));
    process.stderr.write(
      `[clean] deleted ${stamp} (${[r && 'results', a && 'analysis'].filter(Boolean).join(' + ') || 'nothing'})\n`,
    );
  }

  if (dryRun) process.stderr.write('[clean] dry-run — no files were deleted.\n');
}

main().catch((err) => {
  console.error('[clean] failed', err);
  process.exit(1);
});
