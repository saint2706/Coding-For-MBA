const DAY_TOKEN_PATTERN = /^(\d+)([A-Za-z]*)$/

const parseCache = new Map()
const progressIdCache = new Map()

export function normalizeDayToken(value) {
  const raw = String(value ?? '').trim()
  const match = raw.match(DAY_TOKEN_PATTERN)
  if (!match) return raw.toUpperCase()

  const numericPart = match[1] || '0'
  const suffixPart = match[2] || ''
  const dayNumber = Number(numericPart)
  const suffix = suffixPart.toUpperCase()
  return `${dayNumber}${suffix}`
}

export function parseDayToken(value) {
  const token = normalizeDayToken(value)
  if (parseCache.has(token)) {
    return parseCache.get(token)
  }

  const match = token.match(DAY_TOKEN_PATTERN)
  if (!match) return null

  const numericPart = match[1] || '0'
  const suffixPart = match[2] || ''
  const dayNumber = Number(numericPart)
  const suffix = suffixPart.toUpperCase()

  const result = {
    token,
    number: dayNumber,
    suffix,
    sortKey: `${String(dayNumber).padStart(5, '0')}:${suffix}`,
  }

  parseCache.set(token, result)
  return result
}

export function compareDayTokens(a, b) {
  const aa = parseDayToken(a)
  const bb = parseDayToken(b)
  if (!aa || !bb) {
    const normalizedA = normalizeDayToken(a)
    const normalizedB = normalizeDayToken(b)
    if (normalizedA === normalizedB) return 0
    return normalizedA < normalizedB ? -1 : 1
  }
  if (aa.number !== bb.number) return aa.number - bb.number
  if (aa.suffix === bb.suffix) return 0
  return aa.suffix < bb.suffix ? -1 : 1
}

export function dayTokenFromPath(path) {
  const segments = String(path).split(/[\\/]/)
  const lessonDir = segments[segments.length - 2] || ''
  const match = lessonDir.match(/^Day_(\d+[A-Za-z]*)/)
  return match && match[1] ? normalizeDayToken(match[1]) : null
}

export function extractDayToken(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const parsed = parseDayToken(value)
  return parsed ? parsed.token : null
}

export function dayTokenFromReference(value) {
  if (typeof value === 'number' || typeof value === 'string') {
    const raw = String(value).trim()
    const direct = raw.match(/^(\d+[A-Za-z]*)$/)
    if (direct && direct[1]) return normalizeDayToken(direct[1])
    const dayPrefix = raw.match(/^Day\s*(\d+[A-Za-z]*)/i)
    if (dayPrefix && dayPrefix[1]) return normalizeDayToken(dayPrefix[1])
  }
  return null
}

export function dayTokenToProgressId(value) {
  const normalizedKey = String(value)
  if (progressIdCache.has(normalizedKey)) {
    return progressIdCache.get(normalizedKey)
  }

  const parsed = parseDayToken(value)
  if (!parsed) {
    progressIdCache.set(normalizedKey, Number.NaN)
    return Number.NaN
  }

  if (!parsed.suffix) {
    progressIdCache.set(normalizedKey, parsed.number)
    return parsed.number
  }

  const suffixCode = [...parsed.suffix].reduce((acc, char) => {
    const code = char.charCodeAt(0) - 64
    return acc * 26 + Math.max(code, 0)
  }, 0)

  const result = parsed.number * 10000 + suffixCode
  progressIdCache.set(normalizedKey, result)
  return result
}
