import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  duration?: number
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
