/**
 * Custom Cursor Component
 *
 * Renders a dot + ring cursor that replaces the default pointer
 * on desktop devices with fine-pointer input.
 *
 * Key Responsibilities:
 * - Track mouse movement and position dot/ring elements.
 * - Scale up the ring on hover over interactive elements.
 * - Disable itself on touch devices and when reduced motion is preferred.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useReducedMotion } from 'motion/react'

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, label, .interactive'

function isFinePointer(): boolean {
  return window.matchMedia('(pointer: fine)').matches
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion || !isFinePointer()) return
    setEnabled(true)

    const mql = window.matchMedia('(pointer: fine)')
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches)
    mql.addEventListener('change', onChange)

    return () => mql.removeEventListener('change', onChange)
  }, [prefersReducedMotion])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dotRef.current || !ringRef.current) return
      dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      ringRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) scale(${hovering ? 1.6 : 1})`
    },
    [hovering],
  )

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest(INTERACTIVE_SELECTOR)) {
      setHovering(true)
    }
  }, [])

  const handleMouseOut = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest(INTERACTIVE_SELECTOR)) {
      setHovering(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('custom-cursor-active')
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    window.addEventListener('mouseout', handleMouseOut, { passive: true })

    return () => {
      document.documentElement.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mouseout', handleMouseOut)
    }
  }, [enabled, handleMouseMove, handleMouseOver, handleMouseOut])

  if (!enabled) return null

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
      <div
        ref={ringRef}
        className={`custom-cursor-ring${hovering ? ' custom-cursor-ring--hover' : ''}`}
        aria-hidden="true"
      />
    </>
  )
}
