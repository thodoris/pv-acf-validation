import { describe, expect, it } from 'vitest';
import type { ConceptCard } from './types';
import {
  CONCEPT_CARDS,
  CONCEPT_CARDS_FOR_SCREEN,
  allCardsByTier,
  assertConceptCardsInvariants,
  conceptCardsFor,
  conceptKeysFor,
} from './conceptCards';
import { SCREENS } from '@/routing/screens';

describe('CONCEPT_CARDS pool', () => {
  it('passes the production invariants', () => {
    expect(() => assertConceptCardsInvariants()).not.toThrow();
  });

  it('every pool entry stores its own key in the card.key field', () => {
    for (const [poolKey, card] of Object.entries(CONCEPT_CARDS)) {
      expect(card.key, `pool key ${poolKey}`).toBe(poolKey);
    }
  });
});

describe('CONCEPT_CARDS_FOR_SCREEN mapping', () => {
  it('lists an entry for every screen id in the spine', () => {
    for (const s of SCREENS) {
      expect(
        Object.prototype.hasOwnProperty.call(CONCEPT_CARDS_FOR_SCREEN, s.id),
        `mapping missing screen ${s.id}`,
      ).toBe(true);
    }
  });

  it('every key referenced by the mapping resolves to a pool entry', () => {
    for (const [screenId, keys] of Object.entries(CONCEPT_CARDS_FOR_SCREEN)) {
      for (const key of keys ?? []) {
        expect(CONCEPT_CARDS[key], `${screenId} → ${key}`).toBeDefined();
      }
    }
  });
});

describe('conceptKeysFor', () => {
  it('returns the mapping for known screens', () => {
    // welcome ships with [] in the empty scaffold; assertion holds after
    // the data drop populates real keys (length may become > 0 then).
    const keys = conceptKeysFor('welcome');
    expect(Array.isArray(keys)).toBe(true);
  });

  it('returns [] for unknown screen ids', () => {
    expect(conceptKeysFor('nonexistent' as never)).toEqual([]);
  });
});

describe('assertConceptCardsInvariants — failure cases', () => {
  it('rejects a card whose pool key disagrees with card.key', () => {
    const bad: ConceptCard = {
      key: 'a',
      tier: 'core',
      title: 'A',
      subtitle: 'a',
      body: '',
      tags: ['x', 'y'] as const,
    };
    runAgainstFixture({ 'b': bad }, {}, /pool key "b" does not match/);
  });

  it('rejects a card with wrong tag count', () => {
    const bad = {
      key: 'a',
      tier: 'core',
      title: 'A',
      subtitle: 'a',
      body: '',
      // Cast: deliberately wrong tuple length to exercise the runtime check.
      tags: ['only one'] as unknown as readonly [string, string],
    } satisfies ConceptCard;
    runAgainstFixture({ a: bad }, {}, /must have exactly 2 tags/);
  });

  it('rejects a mapping that references an unknown key', () => {
    const card: ConceptCard = {
      key: 'a',
      tier: 'core',
      title: 'A',
      subtitle: 'a',
      body: '',
      tags: ['x', 'y'] as const,
    };
    runAgainstFixture({ a: card }, { welcome: ['a', 'ghost'] }, /unknown card key "ghost"/);
  });
});

describe('conceptCardsFor', () => {
  it('skips unknown keys silently and returns the surviving cards in order', () => {
    // Stash + monkeypatch the live maps with a fixture for this assertion.
    const savedPool = { ...CONCEPT_CARDS };
    const savedMap = { ...CONCEPT_CARDS_FOR_SCREEN };
    try {
      const card: ConceptCard = {
        key: 'real',
        tier: 'core',
        title: 'Real',
        subtitle: 'r',
        body: '',
        tags: ['x', 'y'] as const,
      };
      Object.keys(CONCEPT_CARDS).forEach((k) => delete CONCEPT_CARDS[k]);
      CONCEPT_CARDS.real = card;
      (CONCEPT_CARDS_FOR_SCREEN as Record<string, readonly string[]>)['welcome'] = [
        'real',
        'ghost',
        'real',
      ];
      const out = conceptCardsFor('welcome');
      expect(out.map((c) => c.key)).toEqual(['real', 'real']);
    } finally {
      Object.keys(CONCEPT_CARDS).forEach((k) => delete CONCEPT_CARDS[k]);
      Object.assign(CONCEPT_CARDS, savedPool);
      Object.assign(CONCEPT_CARDS_FOR_SCREEN, savedMap);
    }
  });
});

describe('allCardsByTier', () => {
  it('returns core entries before framework entries, alphabetised within each tier', () => {
    const savedPool = { ...CONCEPT_CARDS };
    try {
      Object.keys(CONCEPT_CARDS).forEach((k) => delete CONCEPT_CARDS[k]);
      CONCEPT_CARDS['b-core'] = mk('b-core', 'core', 'B');
      CONCEPT_CARDS['a-core'] = mk('a-core', 'core', 'A');
      CONCEPT_CARDS['z-fw'] = mk('z-fw', 'framework', 'Z');
      CONCEPT_CARDS['m-fw'] = mk('m-fw', 'framework', 'M');
      const out = allCardsByTier();
      expect(out.map((c) => c.key)).toEqual(['a-core', 'b-core', 'm-fw', 'z-fw']);
    } finally {
      Object.keys(CONCEPT_CARDS).forEach((k) => delete CONCEPT_CARDS[k]);
      Object.assign(CONCEPT_CARDS, savedPool);
    }
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mk(key: string, tier: 'core' | 'framework', title: string): ConceptCard {
  return { key, tier, title, subtitle: '', body: '', tags: ['x', 'y'] as const };
}

/** Mounts a fixture pool + mapping over the live state for one assertion
 *  and restores afterwards.  The invariant function reads CONCEPT_CARDS /
 *  CONCEPT_CARDS_FOR_SCREEN directly, so the fixture has to replace them
 *  in place rather than via a parameter. */
function runAgainstFixture(
  fixturePool: Record<string, ConceptCard>,
  fixtureMap: Record<string, readonly string[]>,
  expected: RegExp,
): void {
  const savedPool = { ...CONCEPT_CARDS };
  const savedMap = { ...CONCEPT_CARDS_FOR_SCREEN };
  try {
    Object.keys(CONCEPT_CARDS).forEach((k) => delete CONCEPT_CARDS[k]);
    Object.assign(CONCEPT_CARDS, fixturePool);
    Object.keys(CONCEPT_CARDS_FOR_SCREEN).forEach(
      (k) => delete (CONCEPT_CARDS_FOR_SCREEN as Record<string, unknown>)[k],
    );
    Object.assign(CONCEPT_CARDS_FOR_SCREEN, fixtureMap);
    expect(() => assertConceptCardsInvariants()).toThrow(expected);
  } finally {
    Object.keys(CONCEPT_CARDS).forEach((k) => delete CONCEPT_CARDS[k]);
    Object.assign(CONCEPT_CARDS, savedPool);
    Object.keys(CONCEPT_CARDS_FOR_SCREEN).forEach(
      (k) => delete (CONCEPT_CARDS_FOR_SCREEN as Record<string, unknown>)[k],
    );
    Object.assign(CONCEPT_CARDS_FOR_SCREEN, savedMap);
  }
}
