/**
 * CodePlayground Component
 *
 * An interactive Python code editor with syntax highlighting and live execution.
 * Features include editable code, syntax highlighting, reset functionality,
 * and optional expected output display.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import PythonRunner, { type PythonRunnerHandle } from './PythonRunner'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button
      className="code-playground__btn"
      onClick={handleCopy}
      aria-label="Copy code to clipboard"
    >
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  )
}

/**
 * Custom syntax highlighting theme with transparent background.
 */
const highlightTheme = {
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
 * Props for the CodePlayground component.
 *
 * @property initialCode - The starting Python code to display in the editor
 * @property expectedOutput - Optional expected output text to display below the editor
 */
interface CodePlaygroundProps {
  initialCode: string
  expectedOutput?: string
}

/**
 * Interactive Python code editor and playground.
 *
 * Provides a rich code editing experience with:
 * - Syntax highlighting powered by Prism
 * - Auto-resizing textarea
 * - Synchronized scroll between editor and highlight layer
 * - Reset functionality to restore initial code
 * - Integrated Python execution
 * - Optional expected output display
 *
 * @param initialCode - Initial Python code to populate the editor
 * @param expectedOutput - Optional expected output to show users
 * @returns An interactive code playground component
 */
export default function CodePlayground({ initialCode, expectedOutput }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLDivElement>(null)
  const runnerRef = useRef<PythonRunnerHandle>(null)

  /**
   * Resets the code editor to its initial state.
   */
  const handleReset = useCallback(() => {
    setCode(initialCode)
  }, [initialCode])

  /**
   * Synchronizes scroll position between textarea and syntax highlighter.
   */
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = ta.scrollHeight + 'px'
    }
  }, [code])

  /**
   * Handles scroll synchronization between textarea and highlight layer.
   */
  const handleScroll = useCallback(() => {
    const ta = textareaRef.current
    const pre = preRef.current
    if (ta && pre) {
      pre.scrollTop = ta.scrollTop
      pre.scrollLeft = ta.scrollLeft
    }
  }, [])

  /**
   * Handles keyboard shortcuts for running code.
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Run code on Shift+Enter, Ctrl+Enter, or Meta+Enter
    if ((e.shiftKey || e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      runnerRef.current?.run()
    }
  }, [])

  return (
    <div className="code-playground">
      <div className="code-playground__toolbar">
        <span className="code-playground__label">🐍 Python Playground</span>
        <div className="code-playground__actions">
          <CopyButton text={code} />
          <button
            className="code-playground__btn code-playground__btn--reset"
            onClick={handleReset}
            aria-label="Reset code to original"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <div className="code-playground__editor-area">
        <div className="code-playground__highlight" ref={preRef} aria-hidden="true">
          <SyntaxHighlighter
            style={highlightTheme}
            language="python"
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '0.6rem 0.75rem',
              background: 'transparent',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              fontFamily: 'var(--font-mono)',
            }}
            codeTagProps={{
              style: { fontFamily: 'var(--font-mono)' },
            }}
          >
            {code + '\n'}
          </SyntaxHighlighter>
        </div>
        <textarea
          ref={textareaRef}
          className="code-playground__textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          aria-label="Python code editor. Press Shift+Enter to run."
        />
      </div>

      <PythonRunner ref={runnerRef} code={code} />

      {expectedOutput && (
        <div className="code-playground__expected">
          <div className="code-playground__expected-header">Expected Output</div>
          <pre className="code-playground__expected-body">{expectedOutput}</pre>
        </div>
      )}
    </div>
  )
}
