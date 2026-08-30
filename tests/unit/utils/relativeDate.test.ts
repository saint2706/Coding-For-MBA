import { describe, it, expect } from 'vitest'
import { formatRelativeDayLabel } from '../../../src/utils/relativeDate'

describe('formatRelativeDayLabel', () => {
  const now = new Date(2026, 0, 10) // Jan 10, 2026 (local time, no timezone drift)

  it('labels the current day as "today"', () => {
    expect(formatRelativeDayLabel('2026-01-10', now)).toBe('today')
  })

  it('labels the previous day as "yesterday"', () => {
    expect(formatRelativeDayLabel('2026-01-09', now)).toBe('yesterday')
  })

  it('labels 2-6 days ago as "N days ago"', () => {
    expect(formatRelativeDayLabel('2026-01-07', now)).toBe('3 days ago')
    expect(formatRelativeDayLabel('2026-01-04', now)).toBe('6 days ago')
  })

  it('falls back to the literal date at 7+ days', () => {
    expect(formatRelativeDayLabel('2026-01-03', now)).toBe('2026-01-03')
    expect(formatRelativeDayLabel('2025-12-01', now)).toBe('2025-12-01')
  })

  it('falls back to the literal string for malformed input', () => {
    expect(formatRelativeDayLabel('not-a-date', now)).toBe('not-a-date')
  })
})
