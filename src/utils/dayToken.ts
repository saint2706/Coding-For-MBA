/**
 * Day Token Utilities
 *
 * Provides type-safe functions for parsing, normalizing, and comparing "Day Tokens".
 * A Day Token represents a lesson's position in the curriculum (e.g., "1", "36B").
 *
 * This file is a TypeScript wrapper around `dayToken-core.js` to ensure consistent
 * logic is shared between the frontend application and Node.js build scripts.
 *
 * Key Responsibilities:
 * - Normalize input (number/string) into a standard Day Token string.
 * - Parse tokens into components (number, suffix) for sorting.
 * - Compare tokens for correct curriculum ordering.
 * - Convert tokens to numeric IDs for progress tracking.
 */

import * as core from './dayToken-core.js'

export type DayToken = string

export interface ParsedDayToken {
  token: DayToken
  number: number
  suffix: string
  sortKey: string
}

/**
 * Normalizes a raw day token input into a standard format.
 * @param {string | number} value - The raw day token input.
 * @returns {DayToken} The normalized day token.
 */
export function normalizeDayToken(value: string | number): DayToken {
  return core.normalizeDayToken(value)
}

/**
 * Parses a day token into its constituent numeric and suffix parts.
 * @param {string | number} value - The raw day token input.
 * @returns {ParsedDayToken | null} The parsed token object, or null if invalid.
 */
export function parseDayToken(value: string | number): ParsedDayToken | null {
  return core.parseDayToken(value)
}

/**
 * Compares two day tokens for sorting purposes.
 * @param {string | number} a - The first day token.
 * @param {string | number} b - The second day token.
 * @returns {number} A negative number if a < b, positive if a > b, or 0 if equal.
 */
export function compareDayTokens(a: string | number, b: string | number): number {
  return core.compareDayTokens(a, b)
}

/**
 * Safely extracts and normalizes a day token from a string or number value.
 * @param {unknown} value - The value to extract from.
 * @returns {DayToken | null} The normalized day token, or null if invalid.
 */
export function extractDayToken(value: unknown): DayToken | null {
  return core.extractDayToken(value)
}

/**
 * Extracts a normalized day token from a given file path.
 * @param {string} path - The file path.
 * @returns {DayToken | null} The normalized day token, or null if not found.
 */
export function dayTokenFromPath(path: string): DayToken | null {
  return core.dayTokenFromPath(path)
}

/**
 * Extracts a normalized day token from a cross-reference string.
 * @param {unknown} value - The reference string or number.
 * @returns {DayToken | null} The normalized day token, or null if not found.
 */
export function dayTokenFromReference(value: unknown): DayToken | null {
  return core.dayTokenFromReference(value)
}

/**
 * Converts a day token into a unique numeric progress ID.
 * @param {string | number} value - The day token input.
 * @returns {number} The numeric progress ID, or NaN if invalid.
 */
export function dayTokenToProgressId(value: string | number): number {
  return core.dayTokenToProgressId(value)
}
