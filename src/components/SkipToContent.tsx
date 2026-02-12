/**
 * SkipToContent Component
 * 
 * An accessibility component that allows keyboard users to skip
 * navigation and jump directly to main content.
 */

import type { MouseEvent } from 'react'

/**
 * Skip-to-content link for keyboard navigation.
 * 
 * Provides an accessible way for keyboard users to skip repetitive navigation
 * and jump directly to the main content. The link is visually hidden but
 * becomes visible when focused via keyboard navigation.
 * 
 * @returns A skip-to-content link element
 */
export default function SkipToContent() {
  const handleSkipToContent = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const mainContent = document.getElementById('main-content')
    if (mainContent instanceof HTMLElement) {
      mainContent.focus()
    }
  }

  return (
    <a href="#main-content" className="skip-to-content" onClick={handleSkipToContent}>
      Skip to content
    </a>
  )
}
