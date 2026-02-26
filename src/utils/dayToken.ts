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

export function normalizeDayToken(value: string | number): DayToken {
  return core.normalizeDayToken(value)
}

export function parseDayToken(value: string | number): ParsedDayToken | null {
  return core.parseDayToken(value)
}

export function compareDayTokens(a: string | number, b: string | number): number {
  return core.compareDayTokens(a, b)
}

export function extractDayToken(value: unknown): DayToken | null {
  return core.extractDayToken(value)
}

export function dayTokenFromPath(path: string): DayToken | null {
  return core.dayTokenFromPath(path)
}

export function dayTokenFromReference(value: unknown): DayToken | null {
  return core.dayTokenFromReference(value)
}

export function dayTokenToProgressId(value: string | number): number {
  return core.dayTokenToProgressId(value)
}
