/**
 * Confetti Animation Utilities
 *
 * Provides a centralized interface for triggering visual celebration effects
 * using the `canvas-confetti` library. Respects user accessibility settings
 * by disabling animations when 'prefers-reduced-motion' is active.
 *
 * Key Responsibilities:
 * - Trigger different intensity levels of confetti (sparkle, quiz aced, phase unlock).
 * - Enforce accessibility checks (prefers-reduced-motion).
 * - Manage animation timing and cleanup.
 */

import confetti from 'canvas-confetti'

/**
 * Checks if the user has requested reduced motion in their system settings.
 *
 * @returns True if reduced motion is preferred, false otherwise.
 */
const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Safely triggers a confetti burst, respecting accessibility preferences.
 *
 * @param options - Configuration options for the confetti burst.
 */
function safeConfetti(options: confetti.Options): void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return
  confetti(options)
}

/**
 * Triggers a small, subtle sparkle effect.
 * Useful for minor achievements or interactions.
 */
export function triggerSparkle(): void {
  safeConfetti({
    particleCount: 24,
    spread: 55,
    startVelocity: 22,
    origin: { y: 0.72 },
    scalar: 0.7,
  })
}

/**
 * Triggers a medium-sized burst for acing a quiz.
 */
export function triggerQuizAcedConfetti(): void {
  safeConfetti({
    particleCount: 120,
    spread: 85,
    startVelocity: 40,
    origin: { y: 0.62 },
  })
}

/**
 * Triggers a large burst for completing all daily exercises.
 */
export function triggerDayExercisesCompleteConfetti(): void {
  safeConfetti({
    particleCount: 140,
    spread: 95,
    startVelocity: 45,
    origin: { y: 0.58 },
  })
}

/**
 * Triggers a major celebration effect for unlocking a new phase.
 */
export function triggerPhaseUnlockConfetti(): void {
  safeConfetti({
    particleCount: 180,
    spread: 110,
    startVelocity: 48,
    origin: { y: 0.6 },
  })
}

/**
 * Triggers an extended fireworks-style animation sequence.
 * Used for major curriculum milestones or completion.
 */
export function triggerCurriculumFireworks(): void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return

  const durationMs = 1800
  const animationEnd = Date.now() + durationMs
  const defaults: confetti.Options = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) {
      window.clearInterval(interval)
      return
    }

    const particleCount = Math.round(50 * (timeLeft / durationMs))
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.1 + Math.random() * 0.2, y: Math.random() * 0.3 },
    })
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.7 + Math.random() * 0.2, y: Math.random() * 0.3 },
    })
  }, 250)
}
