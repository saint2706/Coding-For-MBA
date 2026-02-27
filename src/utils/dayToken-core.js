/**
 * Core Day Token Logic
 *
 * This module provides the fundamental logic for parsing, normalizing, and comparing
 * "Day Tokens" (e.g., "1", "36B") which represent a lesson's position in the curriculum.
 *
 * Designed to be environment-agnostic (Node.js and Browser compatible).
 */

const DAY_TOKEN_PATTERN = /^(\d+)([A-Za-z]*)$/

/**
 * Normalizes a day token input into a standard string format.
 * - Trims whitespace.
 * - Defaults to "0" if invalid or missing.
 * - Standardizes suffix to uppercase.
 *
 * @param {string|number} value - The input day value (e.g., "36b", 36).
 * @returns {string} The normalized day token (e.g., "36B").
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
 * Parses a day token into its components for sorting and logic.
 *
 * @param {string|number} value - The input day value.
 * @returns {{ token: string, number: number, suffix: string, sortKey: string } | null} The parsed object or null if invalid.
 */
export function parseDayToken(value) {
  const token = normalizeDayToken(value)
  const match = token.match(DAY_TOKEN_PATTERN)
  if (!match) return null

  const numericPart = match[1] || '0'
  const suffixPart = match[2] || ''
  const dayNumber = Number(numericPart)
  const suffix = suffixPart.toUpperCase()
  return {
    token,
    number: dayNumber,
    suffix,
    sortKey: `${String(dayNumber).padStart(5, '0')}:${suffix}`,
  }
}

/**
 * Compares two day tokens for sorting order.
 * Sorts primarily by numeric day, then by suffix alphabetically.
 *
 * @param {string|number} a - First day token.
 * @param {string|number} b - Second day token.
 * @returns {number} Negative if a < b, positive if a > b, 0 if equal.
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
 * Extracts a day token from a file path.
 * Expects paths containing a folder like "Day_12" or "Day_36B".
 *
 * @param {string} path - The file path to parse.
 * @returns {string|null} The extracted day token or null.
 */
export function dayTokenFromPath(path) {
  const segments = String(path).split(/[\\/]/)
  const lessonDir = segments[segments.length - 2] || ''
  const match = lessonDir.match(/^Day_(\d+[A-Za-z]*)/)
  return match && match[1] ? normalizeDayToken(match[1]) : null
}

/**
 * Safely extracts a day token from an unknown value if it is a valid string/number.
 *
 * @param {unknown} value - The value to check.
 * @returns {string|null} The normalized token or null.
 */
export function extractDayToken(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const parsed = parseDayToken(value)
  return parsed ? parsed.token : null
}

/**
 * Parses a loose reference (like "Day 12" or "12") into a normalized token.
 * useful for parsing frontmatter references.
 *
 * @param {string|number} value - The reference string.
 * @returns {string|null} The normalized token or null.
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
 * Converts a day token into a unique integer ID for progress tracking.
 * Formula: DayNumber * 10000 + SuffixCode
 *
 * @param {string|number} value - The day token.
 * @returns {number} The numeric ID, or NaN if invalid.
 */
export function dayTokenToProgressId(value) {
  const parsed = parseDayToken(value)
  if (!parsed) return Number.NaN
  if (!parsed.suffix) return parsed.number

  const suffixCode = [...parsed.suffix].reduce((acc, char) => {
    const code = char.charCodeAt(0) - 64
    return acc * 26 + Math.max(code, 0)
  }, 0)

  return parsed.number * 10000 + suffixCode
}
