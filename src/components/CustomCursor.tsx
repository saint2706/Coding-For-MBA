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

/**
 * Custom Cursor Component
 *
 * Renders a stylized cursor using a dot and a trailing ring.
 * Disables itself automatically if the device does not support fine pointing.
 *
 * @returns {JSX.Element | null} The custom cursor DOM elements, or null on touch devices.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const mql = window.matchMedia('(pointer: fine)')

    const updateEnabled = (matches: boolean) => {
      setEnabled(Boolean(matches && !prefersReducedMotion))
    }

    updateEnabled(mql.matches)

    const onChange = (e: MediaQueryListEvent) => updateEnabled(e.matches)
    mql.addEventListener('change', onChange)

    return () => mql.removeEventListener('change', onChange)
  }, [prefersReducedMotion])

  const ticking = useRef(false)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dotRef.current || !ringRef.current) return

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (dotRef.current && ringRef.current) {
            dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
            ringRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) scale(${hovering ? 1.6 : 1})`
          }
          ticking.current = false
        })
        ticking.current = true
      }
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
    if (!enabled) {
      document.documentElement.classList.remove('custom-cursor-active')
      return
    }

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

  if (!enabled || !isFinePointer()) return null

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
