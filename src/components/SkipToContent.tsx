/**
 * Skip to Content Link
 *
 * Hidden link for accessibility, allowing keyboard users to bypass navigation.
 *
 * Key Responsibilities:
 * - Render an anchor link that becomes visible on focus.
 * - Programmatically move focus to the `#main-content` element.
 */

import type { MouseEvent } from 'react'

/**
 * Skip to Content Link Component
 *
 * Hidden link for accessibility, allowing keyboard users to bypass navigation.
 * Programmatically moves focus to the main content area when clicked.
 *
 * @returns {JSX.Element} The anchor link element.
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
