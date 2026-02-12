/**
 * Safe localStorage helpers with typed fallbacks.
 *
 * These wrappers prevent localStorage failures (security, quota, private mode)
 * from crashing runtime logic.
 */

/**
 * Gets a raw string value from localStorage with a fallback.
 *
 * @param key - localStorage key
 * @param fallback - value returned when storage is unavailable or key is missing
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
 * @param key - localStorage key
 * @param fallback - value returned when storage is unavailable/invalid
 * @param validate - optional runtime validator for parsed data
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
    if (validate && !validate(parsed)) return fallback
    return (parsed as T) ?? fallback
  } catch {
    return fallback
  }
}

/**
 * Writes a string value to localStorage.
 *
 * @returns true when write succeeds, false when blocked/unavailable
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
 * @returns true when remove succeeds, false when blocked/unavailable
 */
export function removeStoredValue(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
