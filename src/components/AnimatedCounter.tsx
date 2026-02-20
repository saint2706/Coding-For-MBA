/**
 * Animated Counter Component
 *
 * Renders a numerical value that animates from 0 to the target number when it comes into view.
 * Respects user's reduced motion preferences by skipping animation.
 *
 * Key Responsibilities:
 * - Animate number increment using `framer-motion`.
 * - Trigger animation only when element enters viewport.
 * - Format the display value (e.g. currency, percentage).
 */

import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

interface AnimatedCounterProps {
  /** The target number to count up to. */
  value: number
  /** Optional string to append after the number (e.g., "%"). */
  suffix?: string
  /** Duration of the animation in seconds. Defaults to 0.8. */
  duration?: number
  /** Optional formatter function for the displayed number. */
  format?: (value: number) => string
}

export default function AnimatedCounter({
  value,
  suffix = '',
  duration = 0.8,
  format,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(ref, { once: true, amount: 0.45 })
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? value : 0)

  useEffect(() => {
    if (!isInView) return
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    })

    return () => controls.stop()
  }, [duration, isInView, prefersReducedMotion, value])

  const formatted = format ? format(displayValue) : displayValue.toString()

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  )
}
