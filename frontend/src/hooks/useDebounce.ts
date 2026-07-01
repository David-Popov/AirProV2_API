import { useState, useEffect } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after `delayMs` of no
 * changes. Use for search inputs so list queries fire once the user pauses
 * typing instead of on every keystroke.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}
