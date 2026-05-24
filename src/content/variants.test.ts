import { describe, expect, it } from 'vitest';
import {
  VARIANTS,
  parseVariantId,
  effectiveScreens,
  effectiveRequired,
  effectiveFieldHidden,
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

    it('accepts a paired sub-question and reads its base required', () => {
      const wrapper = requireQuestion('c1-q3q4');
      if (!('questions' in wrapper)) throw new Error('expected paired');
      const q13 = wrapper.questions[0]!; // Q1.3 — rating required, open optional
      expect(effectiveRequired(q13, 'Q1.3', 'rating', VARIANTS.full)).toBe(true);
      expect(effectiveRequired(q13, 'Q1.3', 'open', VARIANTS.full)).toBe(false);
    });

    it('applies override on a paired sub-question via slot key', () => {
      const wrapper = requireQuestion('c1-q3q4');
      if (!('questions' in wrapper)) throw new Error('expected paired');
      const q13 = wrapper.questions[0]!;
      const overrideVariant: VariantConfig = {
        id: 'short',
        label: 'short fixture',
        requiredOverrides: { 'Q1.3': { rating: false } },
      };
      expect(effectiveRequired(q13, 'Q1.3', 'rating', overrideVariant)).toBe(false);
    });

    it('returns false on a PairedQuestion wrapper itself', () => {
      const wrapper = requireQuestion('c1-q3q4');
      // Wrapper has no top-level rating/open — required is always false here.
      expect(effectiveRequired(wrapper, 'c1-q3q4', 'rating', VARIANTS.full)).toBe(false);
      expect(effectiveRequired(wrapper, 'c1-q3q4', 'open', VARIANTS.full)).toBe(false);
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

    it('throws if a requiredOverrides key does not match any known id or slot', () => {
      const bad: VariantConfig = {
        id: 'short',
        label: 'bad',
        requiredOverrides: { 'c9-q99': { open: false } },
      };
      expect(() => assertVariantInvariants(bad)).toThrow(/does not match/);
    });

    it('accepts requiredOverrides for known StandardQuestion ids and sub slots', () => {
      const good: VariantConfig = {
        id: 'short',
        label: 'good',
        requiredOverrides: {
          'c4-q1': { open: false },
          'Q1.3': { rating: false },
        },
      };
      expect(() => assertVariantInvariants(good)).not.toThrow();
    });

    it('throws if hiddenFields key is not a known instrument screen id', () => {
      const bad: VariantConfig = {
        id: 'short',
        label: 'bad',
        hiddenFields: { 'c2-q4': ['q2'] },
      };
      expect(() => assertVariantInvariants(bad)).toThrow(/not a known instrument screen/);
    });

    it('throws if hiddenFields tries to hide sharedOpen', () => {
      const bad: VariantConfig = {
        id: 'short',
        label: 'bad',
        hiddenFields: { 'c3-ciw': ['sharedOpen'] },
      };
      expect(() => assertVariantInvariants(bad)).toThrow(/sharedOpen/);
    });

    it('throws if hiddenFields hides both q1 and q2 on the same screen', () => {
      const bad: VariantConfig = {
        id: 'short',
        label: 'bad',
        hiddenFields: { 'c3-ciw': ['q1', 'q2'] },
      };
      expect(() => assertVariantInvariants(bad)).toThrow(/both "q1" and "q2"/);
    });

    it('accepts hiding only q2 on every instrument', () => {
      const good: VariantConfig = {
        id: 'short',
        label: 'good',
        hiddenFields: {
          'c3-ciw': ['q2'],
          'c3-ast': ['q2'],
          'c3-dma': ['q2'],
          'c3-cpd': ['q2'],
        },
      };
      expect(() => assertVariantInvariants(good)).not.toThrow();
    });
  });

  describe('effectiveFieldHidden', () => {
    it('returns false when the variant has no hiddenFields entry', () => {
      expect(effectiveFieldHidden('c3-ciw', 'q2', VARIANTS.full)).toBe(false);
    });

    it('returns true for fields listed under the screen', () => {
      const v: VariantConfig = {
        id: 'short',
        label: 'short fixture',
        hiddenFields: { 'c3-ciw': ['q2'] },
      };
      expect(effectiveFieldHidden('c3-ciw', 'q2', v)).toBe(true);
    });

    it('returns false for fields not in the override list', () => {
      const v: VariantConfig = {
        id: 'short',
        label: 'short fixture',
        hiddenFields: { 'c3-ciw': ['q2'] },
      };
      expect(effectiveFieldHidden('c3-ciw', 'q1', v)).toBe(false);
      expect(effectiveFieldHidden('c3-ciw', 'sharedOpen', v)).toBe(false);
    });

    it('returns false for screens not listed in hiddenFields', () => {
      const v: VariantConfig = {
        id: 'short',
        label: 'short fixture',
        hiddenFields: { 'c3-ciw': ['q2'] },
      };
      expect(effectiveFieldHidden('c3-ast', 'q2', v)).toBe(false);
    });
  });
});
