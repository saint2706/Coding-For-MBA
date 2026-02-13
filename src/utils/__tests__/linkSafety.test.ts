import { describe, it, expect } from 'vitest'
import { getSecureLinkAttributes } from '../linkSafety'

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

  it('should not duplicate noopener noreferrer', () => {
    const result = getSecureLinkAttributes('https://example.com', { rel: 'noopener' })
    expect(result?.rel).toBe('noopener noreferrer')
  })
})
