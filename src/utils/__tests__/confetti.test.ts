import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as confettiModule from '../confetti'
import confetti from 'canvas-confetti'

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

describe('confetti', () => {
  let originalWindow: typeof window

  beforeEach(() => {
    vi.clearAllMocks()
    originalWindow = global.window
  })

  afterEach(() => {
    global.window = originalWindow
    vi.restoreAllMocks()
  })

  describe('prefersReducedMotion handling', () => {
    it('should not call confetti if prefers-reduced-motion is true', () => {
      // Mock window.matchMedia to return true
      const matchMediaMock = vi.fn().mockReturnValue({ matches: true })
      Object.defineProperty(global, 'window', {
        value: { matchMedia: matchMediaMock },
        writable: true,
      })

      confettiModule.triggerSparkle()
      expect(confetti).not.toHaveBeenCalled()
    })

    it('should call confetti if prefers-reduced-motion is false', () => {
      // Mock window.matchMedia to return false
      const matchMediaMock = vi.fn().mockReturnValue({ matches: false })
      Object.defineProperty(global, 'window', {
        value: { matchMedia: matchMediaMock },
        writable: true,
      })

      confettiModule.triggerSparkle()
      expect(confetti).toHaveBeenCalled()
    })

    it('should not throw if matchMedia is not supported', () => {
      // Mock window without matchMedia
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      confettiModule.triggerSparkle()
      expect(confetti).toHaveBeenCalled()
    })

     it('should not throw and not call if window is undefined', () => {
      // @ts-ignore
      delete global.window

      confettiModule.triggerSparkle()
      expect(confetti).not.toHaveBeenCalled()
    })
  })

  describe('trigger methods', () => {
      beforeEach(() => {
        // ensure motion is not reduced
        const matchMediaMock = vi.fn().mockReturnValue({ matches: false })
        Object.defineProperty(global, 'window', {
            value: { matchMedia: matchMediaMock },
            writable: true,
        })
      })

    it('triggerSparkle should call confetti with correct options', () => {
      confettiModule.triggerSparkle()
      expect(confetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 24,
          spread: 55,
        })
      )
    })

    it('triggerQuizAcedConfetti should call confetti with correct options', () => {
      confettiModule.triggerQuizAcedConfetti()
      expect(confetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 120,
          spread: 85,
        })
      )
    })

    it('triggerDayExercisesCompleteConfetti should call confetti with correct options', () => {
      confettiModule.triggerDayExercisesCompleteConfetti()
      expect(confetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 140,
          spread: 95,
        })
      )
    })

    it('triggerPhaseUnlockConfetti should call confetti with correct options', () => {
      confettiModule.triggerPhaseUnlockConfetti()
      expect(confetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 180,
          spread: 110,
        })
      )
    })
  })

  describe('triggerCurriculumFireworks', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })
      afterEach(() => {
        vi.useRealTimers()
      })

      it('should not start interval if window is undefined', () => {
        // @ts-ignore
        delete global.window

        confettiModule.triggerCurriculumFireworks()
        expect(confetti).not.toHaveBeenCalled()
      })

      it('should not start interval if motion is reduced', () => {
         const matchMediaMock = vi.fn().mockReturnValue({ matches: true })
        Object.defineProperty(global, 'window', {
            value: { matchMedia: matchMediaMock, setInterval: vi.fn(), clearInterval: vi.fn() },
            writable: true,
        })
        confettiModule.triggerCurriculumFireworks()
        expect(confetti).not.toHaveBeenCalled()
        expect(global.window.setInterval).not.toHaveBeenCalled()
      })

      it('should schedule and clear intervals correctly', () => {
        const matchMediaMock = vi.fn().mockReturnValue({ matches: false })
        Object.defineProperty(global, 'window', {
            value: {
                matchMedia: matchMediaMock,
                setInterval: vi.fn((cb) => setInterval(cb, 250)),
                clearInterval: vi.fn((id) => clearInterval(id))
            },
            writable: true,
        })

        confettiModule.triggerCurriculumFireworks()

        expect(global.window.setInterval).toHaveBeenCalled()

        // Fast-forward past duration (1800ms) + 1 interval tick
        vi.advanceTimersByTime(2000)

        expect(global.window.clearInterval).toHaveBeenCalled()
        expect(confetti).toHaveBeenCalled() // should be called multiple times during interval
      })
  })
})
