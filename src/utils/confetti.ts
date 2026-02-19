import confetti from 'canvas-confetti'

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function safeConfetti(options: confetti.Options): void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return
  confetti(options)
}

export function triggerSparkle(): void {
  safeConfetti({
    particleCount: 24,
    spread: 55,
    startVelocity: 22,
    origin: { y: 0.72 },
    scalar: 0.7,
  })
}

export function triggerQuizAcedConfetti(): void {
  safeConfetti({
    particleCount: 120,
    spread: 85,
    startVelocity: 40,
    origin: { y: 0.62 },
  })
}

export function triggerDayExercisesCompleteConfetti(): void {
  safeConfetti({
    particleCount: 140,
    spread: 95,
    startVelocity: 45,
    origin: { y: 0.58 },
  })
}

export function triggerPhaseUnlockConfetti(): void {
  safeConfetti({
    particleCount: 180,
    spread: 110,
    startVelocity: 48,
    origin: { y: 0.6 },
  })
}

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
