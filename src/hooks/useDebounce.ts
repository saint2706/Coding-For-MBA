/**
 * Debounce Value Hook
 *
 * Delays updating a value until a specified time has passed since the last change.
 * Useful for rate-limiting expensive operations like search queries or API calls.
 *
 * Key Responsibilities:
 * - Manage a local state that updates only after a delay.
 * - Allow immediate updates for specific conditions (e.g. clearing input).
 * - Clean up timers on unmount or value change.
 */

import { useState, useEffect } from 'react'

/**
 * Custom hook that debounces a value.
 *
 * Returns a debounced version of the input value that only updates after
 * the specified delay has passed without changes. Optionally supports
 * immediate reset for specific values (e.g., empty strings).
 *
 * @template T - Type of the value being debounced
 * @param value - The value to debounce.
 * @param delay - Delay in milliseconds before updating the debounced value.
 * @param shouldResetImmediately - Optional function to determine if value should update immediately.
 * @returns The debounced value.
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebounce(searchTerm, 300, (val) => val === '')
 * ```
 */
export function useDebounce<T>(
  value: T,
  delay: number,
  shouldResetImmediately?: (value: T) => boolean,
): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Determine the actual delay: 0 for immediate reset, otherwise use the specified delay
    const actualDelay = shouldResetImmediately?.(value) ? 0 : delay

    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, actualDelay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay, shouldResetImmediately])

  return debouncedValue
}
