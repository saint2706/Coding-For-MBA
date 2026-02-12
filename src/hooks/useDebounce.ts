import { useState, useEffect } from 'react'

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
