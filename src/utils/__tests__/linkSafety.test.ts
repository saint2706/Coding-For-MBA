import { describe, it, expect } from 'vitest'
import { getSecureLinkAttributes, normalizeAndValidateHref } from '../linkSafety'

describe('getSecureLinkAttributes', () => {
  it('should handle safe external links', () => {
    const result = getSecureLinkAttributes('https://example.com')
    expect(result).toEqual({
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })

  it('should preserve existing rel attributes for external links', () => {
    const result = getSecureLinkAttributes('https://example.com', { rel: 'nofollow' })
    expect(result).toEqual({
      href: 'https://example.com',
      target: '_blank',
      rel: 'nofollow noopener noreferrer',
    })
  })

  it('should enforce secure target for external links even if _self is requested', () => {
    const result = getSecureLinkAttributes('https://example.com', { target: '_self' })
    expect(result).toEqual({
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })

  it('should strip opener from rel for external links', () => {
    const result = getSecureLinkAttributes('https://example.com', { rel: 'opener' })
    expect(result).toEqual({
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })
  it('should handle safe internal links', () => {
    const result = getSecureLinkAttributes('/lesson/1')
    expect(result).toEqual({
      href: '/lesson/1',
      target: undefined,
      rel: undefined,
    })
  })

  it('should handle internal links with target', () => {
    const result = getSecureLinkAttributes('/lesson/1', { target: '_self' })
    expect(result).toEqual({
      href: '/lesson/1',
      target: '_self',
      rel: undefined,
    })
  })

  it('should return null for unsafe links', () => {
    const result = getSecureLinkAttributes('javascript:alert(1)')
    expect(result).toBeNull()
  })

  it('should reject tel links when protocol is not allowlisted', () => {
    const result = getSecureLinkAttributes('tel:+1234567890')
    expect(result).toBeNull()
  })

  it('should not duplicate noopener noreferrer', () => {
    const result = getSecureLinkAttributes('https://example.com', { rel: 'noopener' })
    expect(result?.rel).toBe('noopener noreferrer')
  })
})

describe('normalizeAndValidateHref', () => {
  it('rejects javascript URLs', () => {
    expect(normalizeAndValidateHref('javascript:alert(1)')).toEqual({
      normalizedHref: null,
      isExternal: false,
      isSafe: false,
    })
  })

  it('rejects data URLs', () => {
    expect(normalizeAndValidateHref('data:text/html,<script>alert(1)</script>')).toEqual({
      normalizedHref: null,
      isExternal: false,
      isSafe: false,
    })
  })

  it('allows relative paths', () => {
    expect(normalizeAndValidateHref('/lessons/intro')).toEqual({
      normalizedHref: '/lessons/intro',
      isExternal: false,
      isSafe: true,
    })
  })

  it('allows absolute https links and marks them external', () => {
    expect(normalizeAndValidateHref('https://example.com/docs')).toEqual({
      normalizedHref: 'https://example.com/docs',
      isExternal: true,
      isSafe: true,
    })
  })

  it('allows hash links', () => {
    expect(normalizeAndValidateHref('#chapter-1')).toEqual({
      normalizedHref: '#chapter-1',
      isExternal: false,
      isSafe: true,
    })
  })

  it('rejects javascript URLs with newlines', () => {
    expect(normalizeAndValidateHref('j\navascript:alert(1)')).toEqual({
      normalizedHref: null,
      isExternal: false,
      isSafe: false,
    })
  })

  it('rejects javascript URLs with null bytes', () => {
    expect(normalizeAndValidateHref('jav\0ascript:alert(1)')).toEqual({
      normalizedHref: null,
      isExternal: false,
      isSafe: false,
    })
  })

  it('rejects vbscript URLs', () => {
    expect(normalizeAndValidateHref('vbscript:alert(1)')).toEqual({
      normalizedHref: null,
      isExternal: false,
      isSafe: false,
    })
  })

  it('allows complex safe URLs', () => {
    expect(normalizeAndValidateHref('https://example.com/path?query=1#hash')).toEqual({
      normalizedHref: 'https://example.com/path?query=1#hash',
      isExternal: true,
      isSafe: true,
    })
  })

  it('allows relative URLs containing colons in query parameters', () => {
    expect(normalizeAndValidateHref('search?q=filter:value')).toEqual({
      normalizedHref: 'search?q=filter:value',
      isExternal: false,
      isSafe: true,
    })
  })

  it('rejects tel links when protocol is not allowlisted', () => {
    expect(normalizeAndValidateHref('tel:+1234567890')).toEqual({
      normalizedHref: null,
      isExternal: false,
      isSafe: false,
    })
  })
})
