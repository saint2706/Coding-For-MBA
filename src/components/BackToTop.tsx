/**
 * BackToTop Component
 * 
 * A floating button that appears when the user scrolls down the page,
 * allowing quick navigation back to the top of the page with smooth scrolling.
 */

import { useState, useEffect } from 'react'

/**
 * BackToTop button component that shows/hides based on scroll position.
 * 
 * The button becomes visible after scrolling down 400 pixels and smoothly
 * scrolls the page back to the top when clicked.
 * 
 * @returns A floating back-to-top button element
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

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
    <button
      className={`back-to-top ${visible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
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
    </button>
  )
}
