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

export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    /**
     * Updates button visibility based on scroll position.
     * Shows button when scrolled more than 400 pixels from top.
     */
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /**
   * Smoothly scrolls the window back to the top of the page.
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className="back-to-top visible"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 22 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 22 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
