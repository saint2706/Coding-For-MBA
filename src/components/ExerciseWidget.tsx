/**
 * ExerciseWidget Component
 *
 * An interactive exercise widget for practicing Python code.
 * Displays exercise instructions, starter code, an integrated code playground,
 * and an optional solution that can be revealed on demand.
 */

import { useState, useId, useRef, useMemo, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CodePlayground, { type CodePlaygroundHandle } from './CodePlayground'
import CopyButton from './CopyButton'
import { useLocation } from 'react-router-dom'
import { getAllExercises } from '../utils/contentLoader'
import { markExerciseComplete } from '../utils/exerciseProgress'
import { triggerDayExercisesCompleteConfetti } from '../utils/confetti'
import { toastSuccess } from '../utils/toast'
import { useQuizStore } from '../stores/quizStore'

/**
 * Custom syntax highlighting theme for solution code display.
 */
const solutionTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...(oneDark['pre[class*="language-"]'] as object),
    background: 'transparent',
    margin: 0,
    padding: 0,
  },
  'code[class*="language-"]': {
    ...(oneDark['code[class*="language-"]'] as object),
    background: 'transparent',
  },
}

/**
 * Props for the ExerciseWidget component.
 *
 * @property title - Exercise title
 * @property goal - Optional goal or objective of the exercise
 * @property instructions - Optional step-by-step instructions
 * @property starterCode - Initial Python code provided to the user
 * @property expectedOutput - Optional expected output to show users what result to aim for
 * @property solution - Optional solution code that can be revealed
 */
interface ExerciseWidgetProps {
  title: string
  goal?: string
  instructions?: string
  starterCode: string
  expectedOutput?: string
  solution?: string
}

/**
 * Interactive exercise widget with code playground and solution reveal.
 *
 * Provides a complete learning exercise experience with:
 * - Clear exercise title and goals
 * - Step-by-step instructions
 * - Interactive code playground for practice
 * - Expected output display
 * - Collapsible solution viewer with syntax highlighting
 *
 * @param title - Exercise title to display
 * @param goal - Learning goal for the exercise
 * @param instructions - Detailed instructions for the learner
 * @param starterCode - Starting code template
 * @param expectedOutput - Expected output to guide learners
 * @param solution - Complete solution code
 * @returns An interactive exercise widget component
 */
export default function ExerciseWidget({
  title,
  goal,
  instructions,
  starterCode,
  expectedOutput,
  solution,
}: ExerciseWidgetProps) {
  const [showSolution, setShowSolution] = useState(false)
  const [hasRevealed, setHasRevealed] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const solutionId = useId()
  const playgroundRef = useRef<CodePlaygroundHandle>(null)
  const prefersReducedMotion = useReducedMotion()

  const location = useLocation()
  const lessonDay = useMemo(() => {
    const match = location.pathname.match(/\/lesson\/(\d+)/)
    return match ? Number(match[1]) : null
  }, [location.pathname])

  const totalExercisesForDay = useMemo(() => {
    if (!lessonDay) return 0
    return getAllExercises().filter((exercise) => exercise.day === lessonDay).length
  }, [lessonDay])

  const exerciseId = useMemo(() => {
    if (!lessonDay) return title.trim().toLowerCase()
    return `${lessonDay}-${title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`
  }, [lessonDay, title])

  const handleExerciseMatch = useCallback(() => {
    if (!lessonDay) return
    const completedAll = markExerciseComplete(lessonDay, exerciseId, totalExercisesForDay)
    if (completedAll) {
      triggerDayExercisesCompleteConfetti()
      toastSuccess(`All exercises complete for Day ${lessonDay}!`)
    }
  }, [exerciseId, lessonDay, totalExercisesForDay])

  const quizId = useMemo(() => `exercise-${exerciseId}`, [exerciseId])

  const quizTopic = useMemo(() => {
    if (!lessonDay) return title
    return `Day ${lessonDay}: ${title}`
  }, [lessonDay, title])

  const quizStats = useQuizStore(useShallow((state) => state.getQuizStats(quizId)))
  const recentAttempts = useQuizStore(useShallow((state) => state.getRecentAttempts(quizId, 3)))

  const handleSubmissionEvaluated = useCallback(
    (result: {
      correct: boolean
      output: string | null
      error: string | null
      attemptedAt: Date
    }) => {
      setHasSubmitted(true)
      useQuizStore.getState().recordAttempt({
        quizId,
        topic: quizTopic,
        correct: result.correct,
        attemptedAt: result.attemptedAt,
        ...(result.output ? { output: result.output } : {}),
        ...(result.error ? { error: result.error } : {}),
      })
    },
    [quizId, quizTopic],
  )

  const handleToggleSolution = () => {
    if (!showSolution && !hasRevealed) {
      setHasRevealed(true)
    }
    setShowSolution((s) => !s)
  }

  return (
    <div className="exercise-widget">
      <div className="exercise-widget__header">
        <span className="exercise-widget__icon" aria-hidden="true">
          🧪
        </span>
        <h4 className="exercise-widget__title">{title}</h4>
      </div>

      {goal && (
        <p className="exercise-widget__goal">
          <strong>Goal:</strong> {goal}
        </p>
      )}

      {instructions && (
        <div className="exercise-widget__instructions">
          {instructions.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <CodePlayground
        ref={playgroundRef}
        initialCode={starterCode}
        expectedOutput={expectedOutput}
        onExpectedOutputMatched={handleExerciseMatch}
        onSubmissionEvaluated={handleSubmissionEvaluated}
      />

      {quizStats && (
        <div className="exercise-widget__quiz-stats">
          <small>
            Attempts: {quizStats.attempts} · Accuracy: {quizStats.accuracy}% · Incorrect:{' '}
            {quizStats.incorrect}
          </small>
          {recentAttempts.length > 0 && (
            <small>
              Recent: {recentAttempts.map((attempt) => (attempt.correct ? '✅' : '❌')).join(' ')}
            </small>
          )}
        </div>
      )}

      {solution && (
        <div className="exercise-widget__solution">
          <button
            className="exercise-widget__solution-btn"
            onClick={handleToggleSolution}
            aria-expanded={showSolution}
            aria-controls={solutionId}
          >
            {showSolution
              ? '🔽 Hide Solution'
              : hasSubmitted
                ? '💡 Show Solution (Review Mode)'
                : '💡 Show Solution'}
          </button>
          <AnimatePresence initial={false}>
            {showSolution && (
              <motion.div
                id={solutionId}
                role="region"
                aria-label="Solution"
                className="exercise-widget__solution-panel"
                initial={
                  prefersReducedMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }
                }
                animate={{ opacity: 1, height: 'auto' }}
                exit={prefersReducedMotion ? { opacity: 1, height: 0 } : { opacity: 0, height: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22 }}
              >
                {(hasRevealed || showSolution) && (
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        zIndex: 10,
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        className="code-block-copy"
                        onClick={() => playgroundRef.current?.setCode(solution)}
                        aria-label="Load solution into playground"
                        title="Try Solution"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        🚀 Try Solution
                      </button>
                      <CopyButton text={solution} className="code-block-copy" showEmoji={true} />
                    </div>
                    <SyntaxHighlighter
                      style={solutionTheme}
                      language="python"
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: '0.75rem',
                        background: 'var(--bg-code)',
                        fontSize: '0.8125rem',
                        lineHeight: '1.65',
                        borderRadius: 'var(--radius-sm)',
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily: 'var(--font-mono)',
                        },
                      }}
                    >
                      {solution}
                    </SyntaxHighlighter>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
