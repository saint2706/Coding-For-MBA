/**
 * SqlPlayground Component
 *
 * An interactive SQL editor with syntax highlighting and live execution
 * against an in-memory SQLite database (via sql.js/WASM).
 */

import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import SyntaxHighlighter from '../utils/prism'
import SqlRunner, { type SqlRunnerHandle } from './SqlRunner'
import CopyButton from './CopyButton'

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

/** Handle interface for accessing SqlPlayground methods imperatively. */
export interface SqlPlaygroundHandle {
  /** Trigger query execution */
  run: () => void
  /** Reset code to the initial state */
  reset: () => void
}

interface SqlPlaygroundProps {
  /** Initial SQL script to populate the editor. */
  initialCode: string
}

/**
 * Interactive SQL editor and playground, mirroring `CodePlayground`'s
 * editing experience but executing via sql.js instead of Pyodide.
 */
const SqlPlayground = forwardRef<SqlPlaygroundHandle, SqlPlaygroundProps>(
  ({ initialCode }, ref) => {
    const [code, setCode] = useState(initialCode)
    const [isConfirmingReset, setIsConfirmingReset] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const preRef = useRef<HTMLDivElement>(null)
    const runnerRef = useRef<SqlRunnerHandle>(null)
    const resetTimeoutRef = useRef<number | null>(null)

    const handleReset = useCallback(() => {
      setCode(initialCode)
      setIsConfirmingReset(false)
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
        resetTimeoutRef.current = null
      }
    }, [initialCode])

    const handleResetClick = useCallback(() => {
      if (isConfirmingReset) {
        handleReset()
      } else {
        setIsConfirmingReset(true)
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)
        resetTimeoutRef.current = window.setTimeout(() => {
          setIsConfirmingReset(false)
          resetTimeoutRef.current = null
        }, 3000)
      }
    }, [isConfirmingReset, handleReset])

    useEffect(() => {
      return () => {
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)
      }
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        run: () => runnerRef.current?.run(),
        reset: handleReset,
      }),
      [handleReset],
    )

    useEffect(() => {
      const ta = textareaRef.current
      if (ta) {
        ta.style.height = 'auto'
        ta.style.height = ta.scrollHeight + 'px'
      }
    }, [code])

    const isScrolling = useRef(false)
    const handleScroll = useCallback(() => {
      if (isScrolling.current) return
      isScrolling.current = true

      requestAnimationFrame(() => {
        const ta = textareaRef.current
        const pre = preRef.current
        if (ta && pre) {
          pre.scrollTop = ta.scrollTop
          pre.scrollLeft = ta.scrollLeft
        }
        isScrolling.current = false
      })
    }, [])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if ((e.shiftKey || e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        runnerRef.current?.run()
      }
    }, [])

    return (
      <div className="code-playground">
        <div className="code-playground__toolbar">
          <span className="code-playground__label">🗄️ SQL Playground</span>
          <div className="code-playground__actions">
            <CopyButton
              text={code}
              className="code-playground__btn"
              showEmoji={true}
              ariaLabel="Copy code"
            />
            <button
              type="button"
              className={`code-playground__btn code-playground__btn--reset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isConfirmingReset ? 'code-playground__btn--confirm' : ''}`}
              onClick={handleResetClick}
              aria-label={
                isConfirmingReset
                  ? 'Confirm reset? This will discard your changes'
                  : 'Reset code to original'
              }
              title={isConfirmingReset ? 'Click again to confirm reset' : 'Reset code to original'}
            >
              {isConfirmingReset ? (
                <>
                  <span aria-hidden="true">⚠️</span> Confirm?
                </>
              ) : (
                <>
                  <span aria-hidden="true">↺</span> Reset
                </>
              )}
            </button>
          </div>
        </div>

        <div className="code-playground__editor-area">
          <div className="code-playground__highlight" ref={preRef} aria-hidden="true">
            <SyntaxHighlighter
              style={highlightTheme}
              language="sql"
              PreTag="div"
              wrapLongLines
              customStyle={{
                margin: 0,
                padding: '0.6rem 0.75rem',
                background: 'transparent',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                overflowX: 'hidden',
              }}
              codeTagProps={{
                style: {
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                },
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
            aria-label="SQL code editor. Press Shift+Enter to run."
          />
        </div>

        <SqlRunner ref={runnerRef} sql={code} />
      </div>
    )
  },
)

SqlPlayground.displayName = 'SqlPlayground'

export default SqlPlayground
