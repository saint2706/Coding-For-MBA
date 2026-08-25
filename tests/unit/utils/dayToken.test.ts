import {
  compareDayTokens,
  dayTokenFromPath,
  dayTokenFromReference,
  dayTokenToProgressId,
  normalizeDayToken,
  parseDayToken,
  extractDayToken,
} from '../../../src/utils/dayToken'

describe('dayToken utilities', () => {
  it('normalizes invalid day tokens deterministically', () => {
    // @ts-expect-error testing invalid input
    expect(normalizeDayToken(null)).toBe('')
    // @ts-expect-error testing invalid input
    expect(normalizeDayToken(undefined)).toBe('')
    expect(normalizeDayToken('')).toBe('')
    expect(normalizeDayToken('invalid')).toBe('INVALID')
  })

  it('compares invalid day tokens deterministically', () => {
    expect(compareDayTokens('invalidA', 'invalidA')).toBe(0)
    expect(compareDayTokens('invalidA', 'invalidB')).toBe(-1)
    expect(compareDayTokens('invalidB', 'invalidA')).toBe(1)

    // Testing case where one is valid and another is invalid
    expect(compareDayTokens('1', 'invalid')).toBe(-1) // '1' < 'INVALID'
    expect(compareDayTokens('invalid', '1')).toBe(1) // 'INVALID' > '1'
  })

  it('normalizes and sorts alphanumeric day tokens deterministically', () => {
    const tokens = ['36C', '36', '36b', '37', '35']
    const sorted = [...tokens].sort(compareDayTokens)

    expect(sorted).toEqual(['35', '36', '36b', '36C', '37'])
    expect(sorted.map((token) => normalizeDayToken(token))).toEqual([
      '35',
      '36',
      '36B',
      '36C',
      '37',
    ])
  })

  it('extracts day tokens from path and references with letter suffixes', () => {
    expect(
      dayTokenFromPath(
        '/content/lessons/Phase_03_Data_Engineering_Web_Development/Day_36B_Docker_Fundamentals/README.md',
      ),
    ).toBe('36B')
    expect(dayTokenFromReference('Day 36c: Async Python + FastAPI')).toBe('36C')
  })

  it('creates stable progress ids for day suffix variants', () => {
    expect(dayTokenToProgressId('36')).toBe(36)
    expect(dayTokenToProgressId('36B')).toBeGreaterThan(dayTokenToProgressId('36A'))
    expect(dayTokenToProgressId('36C')).toBeGreaterThan(dayTokenToProgressId('36B'))
  })

  it('parses day tokens correctly', () => {
    expect(parseDayToken('36B')).toEqual({
      token: '36B',
      number: 36,
      suffix: 'B',
      sortKey: '00036:B',
    })
    expect(parseDayToken('invalid')).toBeNull()
  })

  it('extracts day tokens correctly', () => {
    expect(extractDayToken('36B')).toBe('36B')
    expect(extractDayToken(36)).toBe('36')
    expect(extractDayToken(null)).toBeNull()
    expect(extractDayToken('invalid')).toBeNull()
  })

  it('dayTokenFromPath returns null for invalid paths', () => {
    expect(dayTokenFromPath('/some/random/path')).toBeNull()
  })

  it('dayTokenFromReference returns null for invalid references', () => {
    expect(dayTokenFromReference('invalid reference')).toBeNull()
    expect(dayTokenFromReference(null)).toBeNull()
    expect(dayTokenFromReference({})).toBeNull()
    expect(dayTokenFromReference('Day invalid')).toBeNull()
  })

  it('dayTokenToProgressId handles invalid tokens and cache', () => {
    expect(dayTokenToProgressId('invalid')).toBeNaN()
    expect(dayTokenToProgressId('invalid')).toBeNaN() // check cache

    expect(dayTokenToProgressId('36B')).toBe(360002)
    expect(dayTokenToProgressId('36B')).toBe(360002) // check cache

    expect(dayTokenToProgressId('36')).toBe(36)
    expect(dayTokenToProgressId('36')).toBe(36) // check cache
  })
})
