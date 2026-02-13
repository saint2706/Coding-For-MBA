/**
 * CopyButton Component
 *
 * A reusable button component for copying text to the clipboard.
 * Features include visual feedback, accessibility support, error handling,
 * and proper cleanup of timeouts.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

interface CopyButtonProps {
  text: string
  className?: string
  showEmoji?: boolean
  ariaLabel?: string
}

/**
 * A button that copies text to the clipboard with visual feedback.
 *
 * @param text - The text to copy to the clipboard
 * @param className - Optional CSS class name for styling
 * @param showEmoji - Whether to show the emoji (📋) in the button text
 * @param ariaLabel - Optional custom aria-label for accessibility
 */
export default function CopyButton({
  text,
  className = 'code-block-copy',
  showEmoji = false,
  ariaLabel = 'Copy code to clipboard',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true)

        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = window.setTimeout(() => {
          setCopied(false)
          timeoutRef.current = null
        }, 2000)
      })
      .catch((error) => {
        console.error('Failed to copy text to clipboard', error)
      })
  }, [text])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <button className={className} onClick={handleCopy} aria-label={ariaLabel}>
      <span aria-live="polite" aria-atomic="true">
        {copied ? '✓ Copied' : showEmoji ? '📋 Copy' : 'Copy'}
      </span>
    </button>
  )
}
