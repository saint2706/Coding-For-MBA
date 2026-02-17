/**
 * ExerciseWidget Component
 *
 * An interactive exercise widget for practicing Python code.
 * Displays exercise instructions, starter code, an integrated code playground,
 * and an optional solution that can be revealed on demand.
 */

import { useState, useId, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CodePlayground, { type CodePlaygroundHandle } from './CodePlayground'
import CopyButton from './CopyButton'

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
  const solutionId = useId()
  const playgroundRef = useRef<CodePlaygroundHandle>(null)

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
      />

      {solution && (
        <div className="exercise-widget__solution">
          <button
            className="exercise-widget__solution-btn"
            onClick={() => setShowSolution((s) => !s)}
            aria-expanded={showSolution}
            aria-controls={solutionId}
          >
            {showSolution ? '🔽 Hide Solution' : '💡 Show Solution'}
          </button>
          <div
            id={solutionId}
            role="region"
            aria-label="Solution"
            className={`exercise-widget__solution-panel ${showSolution ? 'exercise-widget__solution-panel--open' : ''}`}
            hidden={!showSolution}
            aria-hidden={!showSolution}
            inert={!showSolution}
          >
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
          </div>
        </div>
      )}
    </div>
  )
}
