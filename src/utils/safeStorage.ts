/**
 * Safe Storage Accessor
 *
 * Provides a resilient wrapper around `localStorage` to handle environments where
 * storage might be restricted or unavailable (e.g., private browsing, iframes).
 *
 * Key Responsibilities:
 * - Wrap `getItem`, `setItem`, `removeItem` with try-catch blocks.
 * - Provide typed helpers for JSON parsing and validation.
 * - Return default fallbacks on failure instead of throwing.
 */

/**
 * Gets a raw string value from localStorage with a fallback.
 *
 * @param {string} key - localStorage key
 * @param {string | null} fallback - value returned when storage is unavailable or key is missing
 * @returns {string | null} The retrieved string or the fallback value.
 */
export function getStoredString(key: string, fallback: string | null = null): string | null {
  try {
    const value = localStorage.getItem(key)
    return value ?? fallback
  } catch {
    return fallback
  }
}

/**
 * Gets and parses JSON from localStorage with a typed fallback.
 *
 * @template T
 * @param {string} key - localStorage key
 * @param {T} fallback - value returned when storage is unavailable/invalid
 * @param {(value: unknown) => value is T} [validate] - optional runtime validator for parsed data
 * @returns {T} The parsed object or the fallback value.
 */
export function getStoredJson<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  const raw = getStoredString(key)
  if (!raw) return fallback

  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof fallback === 'object' &&
      fallback !== null &&
      !Array.isArray(fallback) &&
      (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null)
    ) {
      return fallback
    }
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback
    }
    if (typeof fallback !== 'object' && typeof parsed !== typeof fallback) {
      return fallback
    }
    if (validate && !validate(parsed)) return fallback
    return (parsed as T) ?? fallback
  } catch {
    return fallback
  }
}

/**
 * Writes a string value to localStorage.
 *
 * @param {string} key - localStorage key
 * @param {string} value - value to store
 * @returns {boolean} true when write succeeds, false when blocked/unavailable
 */
export function setStoredString(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Removes a key from localStorage.
 *
 * @param {string} key - localStorage key
 * @returns {boolean} true when remove succeeds, false when blocked/unavailable
 */
export function removeStoredValue(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
