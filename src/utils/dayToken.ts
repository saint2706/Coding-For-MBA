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
