/**
 * Shared Empty State Illustrations
 *
 * Animated SVGs used across pages when no content matches filters.
 *
 * Key Responsibilities:
 * - Provide reusable empty-state visuals (search, exercises, fresh start).
 * - Respect reduced-motion preferences.
 * - Keep illustrations lightweight and theme-adaptive via CSS classes.
 */

import { useReducedMotion } from 'motion/react'

interface IllustrationProps {
  className?: string
}

export function SearchEmptyIllustration({ className = '' }: IllustrationProps) {
  const reducedMotion = !!useReducedMotion()
  return (
    <svg
      className={`empty-state-illustration ${className}`}
      viewBox="0 0 220 130"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="searchEmptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.9)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0.75)" />
        </linearGradient>
      </defs>
      <rect x="34" y="36" width="150" height="58" rx="12" fill="rgba(148,163,184,0.12)" />
      <circle
        cx="88"
        cy="65"
        r="15"
        fill="none"
        stroke="url(#searchEmptyGradient)"
        strokeWidth="5"
      />
      <line
        x1="99"
        y1="76"
        x2="118"
        y2="95"
        stroke="url(#searchEmptyGradient)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line x1="129" y1="58" x2="170" y2="58" className={reducedMotion ? '' : 'empty-state-line'} />
      <line x1="129" y1="72" x2="162" y2="72" className={reducedMotion ? '' : 'empty-state-line'} />
      <circle
        cx="174"
        cy="34"
        r="4"
        fill="rgba(99,102,241,0.65)"
        className={reducedMotion ? '' : 'empty-state-dot'}
      />
    </svg>
  )
}

export function ExercisesEmptyIllustration({ className = '' }: IllustrationProps) {
  const reducedMotion = !!useReducedMotion()
  return (
    <svg
      className={`empty-state-illustration ${className}`}
      viewBox="0 0 220 130"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="exerciseEmptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.85)" />
          <stop offset="100%" stopColor="rgba(14,165,233,0.75)" />
        </linearGradient>
      </defs>
      <rect x="30" y="20" width="162" height="88" rx="12" fill="rgba(148,163,184,0.1)" />
      <path
        d="M56 49h110"
        stroke="url(#exerciseEmptyGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M56 68h72"
        stroke="url(#exerciseEmptyGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M56 87h92"
        stroke="url(#exerciseEmptyGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle
        cx="164"
        cy="78"
        r="11"
        fill="none"
        stroke="url(#exerciseEmptyGradient)"
        strokeWidth="4"
      />
      <path
        d="M160 78l4 4 8-9"
        fill="none"
        stroke="url(#exerciseEmptyGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="44"
        cy="34"
        r="4"
        fill="rgba(14,165,233,0.75)"
        className={reducedMotion ? '' : 'empty-state-dot'}
      />
    </svg>
  )
}

export function FreshStartIllustration({ className = '' }: IllustrationProps) {
  const reducedMotion = !!useReducedMotion()
  return (
    <svg
      className={`empty-state-illustration ${className}`}
      viewBox="0 0 220 130"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="freshStartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.85)" />
          <stop offset="100%" stopColor="rgba(52,211,153,0.75)" />
        </linearGradient>
      </defs>
      <rect x="50" y="28" width="120" height="72" rx="14" fill="rgba(148,163,184,0.1)" />
      {/* Rocket body */}
      <path d="M110 42 L102 72 L110 68 L118 72 Z" fill="url(#freshStartGradient)" opacity="0.9" />
      {/* Rocket flame */}
      <path
        d="M106 72 L110 84 L114 72"
        fill="none"
        stroke="rgba(251,191,36,0.8)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={reducedMotion ? '' : 'empty-state-dot'}
      />
      {/* Stars */}
      <circle
        cx="72"
        cy="40"
        r="3"
        fill="rgba(99,102,241,0.6)"
        className={reducedMotion ? '' : 'empty-state-dot'}
      />
      <circle
        cx="150"
        cy="50"
        r="2.5"
        fill="rgba(52,211,153,0.6)"
        className={reducedMotion ? '' : 'empty-state-dot'}
      />
      <circle
        cx="85"
        cy="88"
        r="2"
        fill="rgba(167,139,250,0.5)"
        className={reducedMotion ? '' : 'empty-state-dot'}
      />
      {/* Trail lines */}
      <line x1="106" y1="78" x2="96" y2="92" className={reducedMotion ? '' : 'empty-state-line'} />
      <line x1="114" y1="78" x2="124" y2="92" className={reducedMotion ? '' : 'empty-state-line'} />
    </svg>
  )
}
