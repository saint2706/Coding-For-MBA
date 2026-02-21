const DAY_TOKEN_PATTERN = /^(\d+)([A-Za-z]?)$/

export function normalizeDayToken(value) {
  const raw = String(value ?? '').trim()
  const match = raw.match(DAY_TOKEN_PATTERN)
  if (!match) return raw.toUpperCase()
  const dayNumber = Number(match[1])
  const suffix = (match[2] || '').toUpperCase()
  return `${dayNumber}${suffix}`
}

export function compareDayTokens(a, b) {
  const parse = (v) => {
    const normalized = normalizeDayToken(v)
    const match = normalized.match(DAY_TOKEN_PATTERN)
    if (!match) return { numeric: Number.POSITIVE_INFINITY, suffix: normalized }
    return { numeric: Number(match[1]), suffix: (match[2] || '').toUpperCase() }
  }
  const aa = parse(a)
  const bb = parse(b)
  if (aa.numeric !== bb.numeric) return aa.numeric - bb.numeric
  return aa.suffix.localeCompare(bb.suffix)
}

export function getDayTokenFromLessonPath(filePath) {
  const segments = String(filePath).split(/[\\/]/)
  const lessonDir = segments[segments.length - 2] || ''
  const match = lessonDir.match(/^Day_(\d+[A-Za-z]?)/)
  return match && match[1] ? normalizeDayToken(match[1]) : null
}
