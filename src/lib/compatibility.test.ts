import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MIN_VIEWPORT_PX,
  checkCompatibility,
  isViewportOnlyFailure,
} from './compatibility';

/* jsdom defaults: innerWidth = 1024, localStorage present, customElements
   present, indexedDB present. Each test starts from that baseline and
   surgically breaks one capability at a time, then restores it afterwards. */

const realInnerWidth = window.innerWidth;
const realScreenWidth = window.screen.width;
const realIndexedDB = (globalThis as { indexedDB?: unknown }).indexedDB;
const realCustomElements = window.customElements;

function setInnerWidth(px: number): void {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: px,
  });
}

function setScreenWidth(px: number): void {
  Object.defineProperty(window.screen, 'width', {
    configurable: true,
    value: px,
  });
}

function restoreAll(): void {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: realInnerWidth,
  });
  Object.defineProperty(window.screen, 'width', {
    configurable: true,
    value: realScreenWidth,
  });
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: realIndexedDB,
  });
  Object.defineProperty(window, 'customElements', {
    configurable: true,
    value: realCustomElements,
  });
  localStorage.clear();
  vi.restoreAllMocks();
}

describe('checkCompatibility', () => {
  beforeEach(() => {
    // jsdom's default 1024px is BELOW our 1100 minimum, so explicitly
    // widen the baseline to a passing value for the happy-path tests.
    setInnerWidth(1280);
    setScreenWidth(1920);
    // jsdom does not ship an `indexedDB` global. Install a truthy stub so
    // probeIndexedDB() returns true on the baseline; individual tests
    // override this when they need to assert the failure path.
    if (typeof (globalThis as { indexedDB?: unknown }).indexedDB === 'undefined') {
      Object.defineProperty(globalThis, 'indexedDB', {
        configurable: true,
        value: { __jsdomStub: true },
      });
    }
  });

  afterEach(restoreAll);

  it('returns ok when every capability is present', () => {
    expect(checkCompatibility()).toEqual({ ok: true });
  });

  it('flags viewport failure when innerWidth < MIN_VIEWPORT_PX', () => {
    setInnerWidth(800);
    const result = checkCompatibility();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toEqual({
      kind: 'viewport',
      widthPx: 800,
      minPx: MIN_VIEWPORT_PX,
    });
  });

  it('passes viewport exactly at the threshold (>=, not >)', () => {
    setInnerWidth(MIN_VIEWPORT_PX);
    expect(checkCompatibility()).toEqual({ ok: true });
  });

  it('fails viewport one pixel below the threshold', () => {
    setInnerWidth(MIN_VIEWPORT_PX - 1);
    const result = checkCompatibility();
    expect(result.ok).toBe(false);
  });

  it('flags viewport failure when screen.width is small even if innerWidth is wide (mobile with viewport meta)', () => {
    // An iPhone in landscape with the page's <meta viewport width=1280>:
    // innerWidth reports the layout viewport (1280), but screen.width still
    // reports the device's actual CSS-pixel width (390). The min check
    // catches this.
    setInnerWidth(1280);
    setScreenWidth(390);
    const result = checkCompatibility();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failures).toContainEqual({
      kind: 'viewport',
      widthPx: 390,
      minPx: MIN_VIEWPORT_PX,
    });
  });

  it('flags viewport failure when innerWidth is small even if screen.width is wide (narrow window on big monitor)', () => {
    // A desktop user with a 4K monitor but a narrow browser window.
    setInnerWidth(800);
    setScreenWidth(3840);
    const result = checkCompatibility();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failures).toContainEqual({
      kind: 'viewport',
      widthPx: 800,
      minPx: MIN_VIEWPORT_PX,
    });
  });

  it('flags localStorage failure when setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    const result = checkCompatibility();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failures).toContainEqual({ kind: 'localStorage' });
  });

  it('flags localStorage failure when write silently no-ops (read-back mismatch)', () => {
    // Simulate quota-zero modes that swallow writes without throwing.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      /* silent no-op */
    });
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    const result = checkCompatibility();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failures).toContainEqual({ kind: 'localStorage' });
  });

  it('flags indexedDB failure when the global is undefined', () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: undefined,
    });
    const result = checkCompatibility();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failures).toContainEqual({ kind: 'indexedDB' });
  });

  it('flags customElements failure when the registry is missing', () => {
    Object.defineProperty(window, 'customElements', {
      configurable: true,
      value: undefined,
    });
    const result = checkCompatibility();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failures).toContainEqual({ kind: 'customElements' });
  });

  it('flags customElements failure when define is not a function (legacy polyfill)', () => {
    Object.defineProperty(window, 'customElements', {
      configurable: true,
      value: { /* registry object missing .define */ },
    });
    const result = checkCompatibility();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failures).toContainEqual({ kind: 'customElements' });
  });

  it('aggregates multiple failures', () => {
    setInnerWidth(640);
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: undefined,
    });
    const result = checkCompatibility();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failures.map((f) => f.kind).sort()).toEqual(
      ['indexedDB', 'viewport'],
    );
  });
});

describe('isViewportOnlyFailure', () => {
  it('returns false for an ok result', () => {
    expect(isViewportOnlyFailure({ ok: true })).toBe(false);
  });

  it('returns true when the only failure is viewport', () => {
    expect(
      isViewportOnlyFailure({
        ok: false,
        failures: [{ kind: 'viewport', widthPx: 800, minPx: MIN_VIEWPORT_PX }],
      }),
    ).toBe(true);
  });

  it('returns false when any non-viewport failure is present', () => {
    expect(
      isViewportOnlyFailure({
        ok: false,
        failures: [
          { kind: 'viewport', widthPx: 800, minPx: MIN_VIEWPORT_PX },
          { kind: 'localStorage' },
        ],
      }),
    ).toBe(false);
  });

  it('returns false when there are no viewport failures and only API failures', () => {
    expect(
      isViewportOnlyFailure({
        ok: false,
        failures: [{ kind: 'indexedDB' }, { kind: 'customElements' }],
      }),
    ).toBe(false);
  });
});
