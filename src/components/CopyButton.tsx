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
  /** Optional custom button label, shown instead of the default "Copy" text. */
  label?: string
}

/**
 * Renders a button that copies the provided text to the clipboard when clicked.
 *
 * @param {CopyButtonProps} props - The component properties.
 * @param {string} props.text - The text content to be copied.
 * @param {string} [props.className='code-block-copy'] - Optional custom class names.
 * @param {boolean} [props.showEmoji=false] - Whether to display a clipboard emoji icon.
 * @param {string} [props.ariaLabel] - Optional aria-label for accessibility.
 * @returns {React.ReactElement} The rendered button component.
 */
export default function CopyButton({
  text,
  className = 'code-block-copy',
  showEmoji = false,
  ariaLabel,
  label,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const accessibleLabel = ariaLabel || (showEmoji ? 'Copy to clipboard' : 'Copy code')

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
      className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
      onClick={handleCopy}
      aria-label={copied ? 'Code copied to clipboard' : accessibleLabel}
      title={accessibleLabel}
    >
      {copied ? (
        <>
          <span aria-hidden="true">✓</span> Copied
        </>
      ) : showEmoji ? (
        <>
          <span aria-hidden="true">📋</span> {label ?? 'Copy'}
        </>
      ) : (
        (label ?? 'Copy')
      )}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {copied ? 'Code copied to clipboard' : ''}
      </span>
    </button>
  )
}
