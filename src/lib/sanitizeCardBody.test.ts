import { describe, expect, it } from 'vitest';
import { sanitizeCardBody } from './sanitizeCardBody';

describe('sanitizeCardBody — allow-list', () => {
  it('preserves <strong> with no attributes', () => {
    expect(sanitizeCardBody('hello <strong>world</strong>')).toBe(
      'hello <strong>world</strong>',
    );
  });

  it('preserves <em> with no attributes', () => {
    expect(sanitizeCardBody('an <em>italic</em> word')).toBe(
      'an <em>italic</em> word',
    );
  });

  it('preserves <span class="…"> for class-based styling', () => {
    expect(sanitizeCardBody('a <span class="mono">term</span>')).toBe(
      'a <span class="mono">term</span>',
    );
  });

  it('passes plain text through unchanged', () => {
    expect(sanitizeCardBody('plain text — no markup')).toBe(
      'plain text — no markup',
    );
  });

  it('handles nested allowed tags', () => {
    expect(sanitizeCardBody('<strong>bold and <em>italic</em></strong>')).toBe(
      '<strong>bold and <em>italic</em></strong>',
    );
  });
});

describe('sanitizeCardBody — rejections', () => {
  it('strips <a> but keeps inner text', () => {
    expect(sanitizeCardBody('click <a href="https://evil.example">here</a>')).toBe(
      'click here',
    );
  });

  it('strips <img>', () => {
    expect(sanitizeCardBody('<img src="x" /> foo')).toBe(' foo');
  });

  it('strips <script> AND its inner code (DOMPurify treats script contents as code, not display text)', () => {
    const out = sanitizeCardBody('<script>alert(1)</script> safe');
    expect(out).not.toContain('alert');
    expect(out).toContain('safe');
  });

  it('strips <iframe>', () => {
    expect(sanitizeCardBody('<iframe src="//evil"></iframe>x')).toBe('x');
  });

  it('strips style attribute on allowed tags', () => {
    const out = sanitizeCardBody('<strong style="color:red">x</strong>');
    expect(out).toBe('<strong>x</strong>');
  });

  it('strips onclick attribute on allowed tags', () => {
    const out = sanitizeCardBody('<span class="ok" onclick="hack()">x</span>');
    expect(out).toBe('<span class="ok">x</span>');
  });

  it('strips id attribute on <span>', () => {
    const out = sanitizeCardBody('<span class="ok" id="weird">x</span>');
    expect(out).toBe('<span class="ok">x</span>');
  });

  it('strips <a> nested inside an allowed tag, keeping inner text', () => {
    expect(
      sanitizeCardBody('<strong><a href="//evil">bold link</a></strong>'),
    ).toBe('<strong>bold link</strong>');
  });
});
