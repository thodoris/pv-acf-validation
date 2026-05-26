import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { RESEARCHER, SUPERVISOR } from './contacts';

describe('contacts constants', () => {
  it('RESEARCHER joins to the canonical address', () => {
    expect(RESEARCHER.user + '@' + RESEARCHER.domain).toBe('t.papadopoulos@aegean.gr');
    expect(RESEARCHER.label).toBe('Researcher');
  });

  it('SUPERVISOR joins to the canonical address', () => {
    expect(SUPERVISOR.user + '@' + SUPERVISOR.domain).toBe('yannisx@aegean.gr');
    expect(SUPERVISOR.label).toBe('Supervisor');
  });
});

/* Source-tree invariant: no file in `src/` outside `src/lib/contacts.ts`
   carries a joined `user@aegean.gr` literal. If a future edit inlines an
   address rather than going through `ProtectedEmail`, this fails loudly. */
describe('source-tree invariant — no joined addresses outside contacts.ts', () => {
  const SRC_ROOT = join(__dirname, '..');           // src/
  const ALLOWED_FILE = join(__dirname, 'contacts.ts');
  // Match a joined address — local-part (incl. dots/dashes) immediately
  // followed by '@' and a domain.  This is what a scraper regex would
  // see; the ProtectedEmail component splits the '@' across JSX nodes
  // so source files using it produce no match here.
  const JOINED = /[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  // IANA reserved testing TLDs are routinely used as placeholders in input
  // hints / JSDoc examples and are not real contact addresses.  RFC 2606
  // reserves .test, .example, .invalid, .localhost; .tld is the de-facto
  // convention for "any TLD" in documentation.
  const PLACEHOLDER_TLDS = /\.(example|test|invalid|localhost|tld)$/i;

  it('only contacts.ts contains joined email literals', () => {
    const offenders: Array<{ file: string; matches: string[] }> = [];
    walk(SRC_ROOT, (file) => {
      // Skip the contacts file itself, this test file, and node_modules-style
      // generated files. Limit to .ts / .tsx source (CSS does not host emails).
      if (file === ALLOWED_FILE) return;
      if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) return;
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
      const text = readFileSync(file, 'utf8');
      const allMatches = text.match(JOINED) ?? [];
      const realMatches = allMatches.filter((m) => !PLACEHOLDER_TLDS.test(m));
      if (realMatches.length > 0) {
        offenders.push({ file: relative(SRC_ROOT, file), matches: Array.from(new Set(realMatches)) });
      }
    });
    expect(offenders, formatOffenders(offenders)).toEqual([]);
  });
});

function walk(dir: string, visit: (filePath: string) => void): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, visit);
    else if (st.isFile()) visit(full);
  }
}

function formatOffenders(offenders: Array<{ file: string; matches: string[] }>): string {
  if (offenders.length === 0) return '';
  return (
    'Joined email literals found outside src/lib/contacts.ts. Route them through <ProtectedEmail>:\n' +
    offenders.map((o) => `  ${o.file}  →  ${o.matches.join(', ')}`).join('\n')
  );
}
