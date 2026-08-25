/**
 * Back to Top Button
 *
 * A floating button that appears after scrolling down, allowing users to
 * quickly return to the top of the page.
 *
 * Key Responsibilities:
 * - Monitor scroll position to toggle visibility (threshold: 400px).
 * - Smoothly scroll to top on click.
 * - Respect reduced motion preferences (fade in/out vs slide).
 */

import { useState, useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CaretUp } from '@phosphor-icons/react'

/**
 * Back to Top Component
 *
 * Renders a floating button that smoothly scrolls the window back to the top.
 * Becomes visible only after the user has scrolled down a certain distance.
 *
 * @returns {JSX.Element | null} The back to top button, or null if not visible.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    /**
     * Updates button visibility based on scroll position.
     * Shows button when scrolled more than 400 pixels from top.
     */
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 400)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /**
   * Smoothly scrolls the window back to the top of the page.
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className="back-to-top visible"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 22 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 22 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
        >
          <CaretUp size={20} weight="bold" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
