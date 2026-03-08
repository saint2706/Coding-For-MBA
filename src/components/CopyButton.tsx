/**
 * Copy to Clipboard Button
 *
 * A reusable button for copying text (code, snippets) to the clipboard.
 *
 * Key Responsibilities:
 * - Execute `navigator.clipboard.writeText`.
 * - Provide visual feedback (checkmark) for 2 seconds.
 * - Manage cleanup of timeouts on unmount.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

interface CopyButtonProps {
  /** The text content to be copied. */
  text: string
  /** Optional custom class names. */
  className?: string
  /** Whether to display a clipboard emoji icon. */
  showEmoji?: boolean
  /** Optional aria-label for accessibility. */
  ariaLabel?: string
}

export default function CopyButton({
  text,
  className = 'code-block-copy',
  showEmoji = false,
  ariaLabel,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const label = ariaLabel || (showEmoji ? 'Copy to clipboard' : 'Copy code')

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
    <button
      type="button"
      className={className}
      onClick={handleCopy}
      aria-label={copied ? 'Code copied to clipboard' : label}
      title={label}
    >
      {copied ? '✓ Copied' : showEmoji ? '📋 Copy' : 'Copy'}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {copied ? 'Code copied to clipboard' : ''}
      </span>
    </button>
  )
}
