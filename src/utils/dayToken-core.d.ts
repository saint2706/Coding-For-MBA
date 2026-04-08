/**
 * Normalizes a raw day token input into a standard format.
 * Strips whitespace, forces uppercase suffix, and defaults numeric part to '0'.
 *
 * @param value - The raw day token input (string or number).
 * @returns The normalized day token (e.g., "1", "36B").
 */
export function normalizeDayToken(value: string | number | undefined | null): string

/**
 * Parses a day token into its constituent numeric and suffix parts.
 * Uses a module-level Map cache to avoid redundant regex operations.
 *
 * @param value - The raw day token input.
 * @returns The parsed token object, or null if invalid.
 */
export function parseDayToken(
  value: string | number | undefined | null,
): { token: string; number: number; suffix: string; sortKey: string } | null

/**
 * Compares two day tokens for sorting purposes.
 * Sorts primarily by day number, then by suffix alphabetically.
 *
 * @param a - The first day token.
 * @param b - The second day token.
 * @returns A negative number if a < b, positive if a > b, or 0 if equal.
 */
export function compareDayTokens(
  a: string | number | undefined | null,
  b: string | number | undefined | null,
): number

/**
 * Extracts a normalized day token from a given file path.
 * Looks for the parent directory name matching the pattern "Day_X".
 *
 * @param path - The file path (e.g., "content/lessons/Phase_1/Day_1/lesson.md").
 * @returns The normalized day token, or null if not found.
 */
export function dayTokenFromPath(path: string | undefined | null): string | null

/**
 * Safely extracts and normalizes a day token from a string or number value.
 * Useful for extracting tokens from markdown frontmatter.
 *
 * @param value - The value to extract from.
 * @returns The normalized day token, or null if invalid.
 */
export function extractDayToken(value: unknown): string | null

/**
 * Extracts a normalized day token from a cross-reference string.
 * Handles explicit tokens (e.g., "36B") or prefixed references (e.g., "Day 36B").
 *
 * @param value - The reference string or number.
 * @returns The normalized day token, or null if not found.
 */
export function dayTokenFromReference(value: unknown): string | null

/**
 * Converts a day token into a unique numeric progress ID.
 * Numeric parts are multiplied by 10000; alphabetic suffixes are converted to a numeric offset.
 *
 * @param value - The day token input.
 * @returns The numeric progress ID, or NaN if invalid.
 */
export function dayTokenToProgressId(value: string | number | undefined | null): number
