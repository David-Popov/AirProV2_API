import { useState, useRef, useEffect } from 'react'

/**
 * Animates a number from 0 up to `target` with a cubic ease-out over `duration` ms.
 * Returns the current value to render. Resets to 0 immediately when `target` is 0.
 *
 * Used for dashboard stat counters.
 */
export function useCountUp(target: number, duration = 800): number {
  const [count, setCount] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (target === 0) {
      setCount(0)
      return
    }
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return count
}
