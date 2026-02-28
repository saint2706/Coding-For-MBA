const DAY_TOKEN_PATTERN = /^(\d+)([A-Za-z]*)$/

const parseCache = new Map()
const progressIdCache = new Map()

/**
 * Normalizes a raw day token input into a standard format.
 * Strips whitespace, forces uppercase suffix, and defaults numeric part to '0'.
 *
 * @param {any} value - The raw day token input (string or number).
 * @returns {string} The normalized day token (e.g., "1", "36B").
 */
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

/**
 * Parses a day token into its constituent numeric and suffix parts.
 * Uses a module-level Map cache to avoid redundant regex operations.
 *
 * @param {any} value - The raw day token input.
 * @returns {{ token: string, number: number, suffix: string, sortKey: string } | null} The parsed token object, or null if invalid.
 */
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

/**
 * Compares two day tokens for sorting purposes.
 * Sorts primarily by day number, then by suffix alphabetically.
 *
 * @param {any} a - The first day token.
 * @param {any} b - The second day token.
 * @returns {number} A negative number if a < b, positive if a > b, or 0 if equal.
 */
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

/**
 * Extracts a normalized day token from a given file path.
 * Looks for the parent directory name matching the pattern "Day_X".
 *
 * @param {string} path - The file path (e.g., "content/lessons/Phase_1/Day_1/lesson.md").
 * @returns {string | null} The normalized day token, or null if not found.
 */
export function dayTokenFromPath(path) {
  const segments = String(path).split(/[\\/]/)
  const lessonDir = segments[segments.length - 2] || ''
  const match = lessonDir.match(/^Day_(\d+[A-Za-z]*)/)
  return match && match[1] ? normalizeDayToken(match[1]) : null
}

/**
 * Safely extracts and normalizes a day token from a string or number value.
 * Useful for extracting tokens from markdown frontmatter.
 *
 * @param {any} value - The value to extract from.
 * @returns {string | null} The normalized day token, or null if invalid.
 */
export function extractDayToken(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const parsed = parseDayToken(value)
  return parsed ? parsed.token : null
}

/**
 * Extracts a normalized day token from a cross-reference string.
 * Handles explicit tokens (e.g., "36B") or prefixed references (e.g., "Day 36B").
 *
 * @param {any} value - The reference string or number.
 * @returns {string | null} The normalized day token, or null if not found.
 */
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

/**
 * Converts a day token into a unique numeric progress ID.
 * Numeric parts are multiplied by 10000; alphabetic suffixes are converted to a numeric offset.
 *
 * @param {any} value - The day token input.
 * @returns {number} The numeric progress ID, or NaN if invalid.
 */
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
