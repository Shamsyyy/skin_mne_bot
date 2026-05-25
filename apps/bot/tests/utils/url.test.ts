import { describe, it, expect } from 'vitest';
import { extractUrls, hasUrl } from '../../src/utils/url.js';

describe('url utils', () => {
  it('extracts https url', () => {
    const urls = extractUrls('Смотри https://example.com/product тут');
    expect(urls).toContain('https://example.com/product');
  });

  it('hasUrl returns true for links', () => {
    expect(hasUrl('http://test.ru')).toBe(true);
    expect(hasUrl('просто текст')).toBe(false);
  });
});
