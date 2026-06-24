/**
 * Glossary Term
 *
 * An inline glossary term that reveals its definition in a tooltip.
 * Supports hover (pointer devices) and tap-to-toggle (touch/mobile), since
 * hover-only tooltips are unreachable on touch screens.
 */

import { useState, useRef, useEffect } from 'react'

interface GlossaryTermProps {
  /** The literal matched text as it appears in the source (preserves casing). */
  text: string
  /** The glossary definition shown in the tooltip. */
  definition: string
}

export default function GlossaryTerm({ text, definition }: GlossaryTermProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <button
      ref={ref}
      type="button"
      className={`glossary-term${open ? ' glossary-term-active' : ''}`}
      data-definition={definition}
      aria-expanded={open}
      aria-label={`${text}: glossary term, tap for definition`}
      onClick={(event) => {
        event.stopPropagation()
        setOpen((prev) => !prev)
      }}
    >
      {text}
    </button>
  )
}
