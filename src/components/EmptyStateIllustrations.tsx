/**
 * Shared Empty State Illustrations
 *
 * Terminal-prompt-style empty states used across pages when no content
 * matches filters, or (for FreshStartIllustration) when the user hasn't
 * started yet. Replaces the old generic gradient-blob SVGs with the
 * app's own "workstation" visual vocabulary: a mono prompt line and a
 * blinking cursor block, styled entirely through design tokens so it is
 * automatically correct across all palettes.
 *
 * Key Responsibilities:
 * - Provide reusable, on-brand empty-state visuals (search, exercises, fresh start).
 * - Respect reduced-motion preferences (cursor blink collapses to static).
 * - Resolve every color through a CSS custom property — never a literal hex/rgba.
 * - Stay purely decorative (aria-hidden); callers already render the real
 *   accessible description as a sibling <p>.
 */

import { useReducedMotion } from 'motion/react'

interface TerminalPromptProps {
  /** Text shown after the `$` prompt glyph. */
  text: string
  className: string
  /** Adds a distinct accent border for the "welcome" variant. */
  boot?: boolean
}

/**
 * Renders a single terminal-prompt row: `$ {text}` followed by a
 * blinking cursor block. Shared by all three empty-state illustrations.
 * @param props - Prompt text, optional className, and boot (welcome) styling flag.
 * @returns A decorative, aria-hidden prompt block.
 */
function TerminalPrompt({ text, className, boot = false }: TerminalPromptProps) {
  const reducedMotion = !!useReducedMotion()
  const rootClassName = [
    'empty-state-illustration',
    boot ? 'empty-state-illustration--boot' : null,
    className || null,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={rootClassName} aria-hidden="true">
      <span className="empty-state-prompt-glyph">$</span>
      <span className="empty-state-prompt-text">{text}</span>
      <span
        className={
          reducedMotion ? 'empty-state-cursor empty-state-cursor--static' : 'empty-state-cursor'
        }
      />
    </div>
  )
}

interface SearchEmptyIllustrationProps {
  /** The search query to echo back in the prompt line, if any. */
  query?: string
  className?: string
}

/**
 * Renders a terminal-prompt empty state for a search with no results.
 * @param props - Optional query text to echo and optional className.
 * @returns A decorative prompt-style illustration.
 */
export function SearchEmptyIllustration({ query, className = '' }: SearchEmptyIllustrationProps) {
  const text = query ? `no results for "${query}"` : 'no results found'
  return <TerminalPrompt text={text} className={className} />
}

interface IllustrationProps {
  className?: string
}

/**
 * Renders a terminal-prompt empty state for a filtered exercise list with no matches.
 * @param props - Component props containing optional className.
 * @returns A decorative prompt-style illustration.
 */
export function ExercisesEmptyIllustration({ className = '' }: IllustrationProps) {
  return <TerminalPrompt text="no exercises match these filters" className={className} />
}

/**
 * Renders the "welcome" empty state shown on the Progress dashboard before
 * the user has completed any lessons — a boot-style prompt, visually
 * distinct from the "no results" illustrations above.
 * @param props - Component props containing optional className.
 * @returns A decorative prompt-style illustration.
 */
export function FreshStartIllustration({ className = '' }: IllustrationProps) {
  return <TerminalPrompt text="ready to start" className={className} boot />
}
