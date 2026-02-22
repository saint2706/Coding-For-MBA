import {
  compareDayTokens,
  dayTokenFromPath,
  dayTokenFromReference,
  dayTokenToProgressId,
  normalizeDayToken,
} from '../dayToken'

describe('dayToken utilities', () => {
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
})
