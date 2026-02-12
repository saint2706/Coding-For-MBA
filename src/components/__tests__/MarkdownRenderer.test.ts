import { normalizeAndValidateHref } from '../../utils/linkSafety'

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
})
