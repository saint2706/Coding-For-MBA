export type DayToken = string

export interface ParsedDayToken {
  token: DayToken
  number: number
  suffix: string
  sortKey: string
}

const DAY_TOKEN_PATTERN = /^(\d+)([A-Za-z]?)$/

export function normalizeDayToken(value: string | number): DayToken {
  const raw = String(value ?? '').trim()
  const match = raw.match(DAY_TOKEN_PATTERN)
  if (!match) return raw.toUpperCase()
  const [, numericPart = '0', suffixPart = ''] = match
  const dayNumber = Number(numericPart)
  const suffix = suffixPart.toUpperCase()
  return `${dayNumber}${suffix}`
}

export function parseDayToken(value: string | number): ParsedDayToken | null {
  const token = normalizeDayToken(value)
  const match = token.match(DAY_TOKEN_PATTERN)
  if (!match) return null
  const [, numericPart = '0', suffixPart = ''] = match
  const dayNumber = Number(numericPart)
  const suffix = suffixPart.toUpperCase()
  return {
    token,
    number: dayNumber,
    suffix,
    sortKey: `${String(dayNumber).padStart(5, '0')}:${suffix}`,
  }
}

export function compareDayTokens(a: string | number, b: string | number): number {
  const aa = parseDayToken(a)
  const bb = parseDayToken(b)
  if (!aa || !bb) {
    return normalizeDayToken(a).localeCompare(normalizeDayToken(b))
  }
  if (aa.number !== bb.number) return aa.number - bb.number
  return aa.suffix.localeCompare(bb.suffix)
}

export function extractDayToken(value: unknown): DayToken | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const parsed = parseDayToken(value)
  return parsed ? parsed.token : null
}

export function dayTokenFromPath(path: string): DayToken | null {
  const segments = path.split('/')
  const lessonDir = segments[segments.length - 2] || ''
  const match = lessonDir.match(/^Day_(\d+[A-Za-z]?)/)
  return match && match[1] ? normalizeDayToken(match[1]) : null
}

export function dayTokenFromReference(value: unknown): DayToken | null {
  if (typeof value === 'number' || typeof value === 'string') {
    const raw = String(value).trim()
    const direct = raw.match(/^(\d+[A-Za-z]?)$/)
    if (direct && direct[1]) return normalizeDayToken(direct[1])
    const dayPrefix = raw.match(/^Day\s*(\d+[A-Za-z]?)/i)
    if (dayPrefix && dayPrefix[1]) return normalizeDayToken(dayPrefix[1])
  }
  return null
}

export function dayTokenToProgressId(value: string | number): number {
  const parsed = parseDayToken(value)
  if (!parsed) return Number.NaN
  if (!parsed.suffix) return parsed.number
  const suffixCode = parsed.suffix.charCodeAt(0) - 64
  return parsed.number * 100 + suffixCode
}
