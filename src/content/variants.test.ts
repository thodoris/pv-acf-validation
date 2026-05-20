import { describe, expect, it } from 'vitest';
import {
  VARIANTS,
  parseVariantId,
  effectiveScreens,
  effectiveRequired,
  assertVariantInvariants,
  type VariantConfig,
} from './variants';
import { SCREENS } from '@/routing/screens';
import { requireQuestion, requireStandardQuestion } from './index';

describe('variants', () => {
  describe('parseVariantId', () => {
    it('returns full for empty / unknown', () => {
      expect(parseVariantId(null)).toBe('full');
      expect(parseVariantId(undefined)).toBe('full');
      expect(parseVariantId('')).toBe('full');
      expect(parseVariantId('bogus')).toBe('full');
    });

    it('passes through known variants', () => {
      expect(parseVariantId('full')).toBe('full');
      expect(parseVariantId('short')).toBe('short');
    });
  });

  describe('effectiveScreens (full)', () => {
    it('returns all screens for the full variant', () => {
      expect(effectiveScreens(SCREENS, VARIANTS.full)).toHaveLength(SCREENS.length);
    });
  });

  describe('effectiveScreens (short fixture)', () => {
    const shortFixture: VariantConfig = {
      id: 'short',
      label: 'Short test fixture',
      hiddenScreens: ['c1-q3q4', 'c2-q4'],
    };

    it('filters out hidden screens', () => {
      const out = effectiveScreens(SCREENS, shortFixture);
      expect(out.find((s) => s.id === 'c1-q3q4')).toBeUndefined();
      expect(out.find((s) => s.id === 'c2-q4')).toBeUndefined();
      expect(out.length).toBe(SCREENS.length - 2);
    });

    it('preserves always-on screens even if a variant tries to hide them', () => {
      const badVariant: VariantConfig = {
        id: 'short',
        label: 'naughty',
        hiddenScreens: ['welcome', 'submit'],
      };
      const out = effectiveScreens(SCREENS, badVariant);
      expect(out.find((s) => s.id === 'welcome')).toBeDefined();
      expect(out.find((s) => s.id === 'submit')).toBeDefined();
    });
  });

  describe('effectiveRequired', () => {
    it('returns the base required for full variant', () => {
      const q = requireStandardQuestion('c4-q1');
      expect(effectiveRequired(q, 'c4-q1', 'open', VARIANTS.full)).toBe(true);
    });

    it('applies override when set', () => {
      const overrideVariant: VariantConfig = {
        id: 'short',
        label: 'short fixture',
        requiredOverrides: {
          'c4-q1': { open: false },
        },
      };
      const q = requireQuestion('c4-q1');
      expect(effectiveRequired(q, 'c4-q1', 'open', overrideVariant)).toBe(false);
    });
  });

  describe('assertVariantInvariants', () => {
    it('passes for full', () => {
      expect(() => assertVariantInvariants(VARIANTS.full)).not.toThrow();
    });

    it('throws if a variant tries to hide an always-on screen', () => {
      const bad: VariantConfig = {
        id: 'short',
        label: 'bad',
        hiddenScreens: ['welcome'],
      };
      expect(() => assertVariantInvariants(bad)).toThrow(/always-on/);
    });
  });
});
