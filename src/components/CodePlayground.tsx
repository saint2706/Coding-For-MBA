import { useState, useCallback, useRef, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import PythonRunner from './PythonRunner'

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

interface CodePlaygroundProps {
    initialCode: string
    expectedOutput?: string
}

export default function CodePlayground({ initialCode, expectedOutput }: CodePlaygroundProps) {
    const [code, setCode] = useState(initialCode)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const preRef = useRef<HTMLDivElement>(null)

    const handleReset = useCallback(() => {
        setCode(initialCode)
    }, [initialCode])

    // Auto-resize textarea + sync scroll
    useEffect(() => {
        const ta = textareaRef.current
        if (ta) {
            ta.style.height = 'auto'
            ta.style.height = ta.scrollHeight + 'px'
        }
    }, [code])

    const handleScroll = useCallback(() => {
        const ta = textareaRef.current
        const pre = preRef.current
        if (ta && pre) {
            pre.scrollTop = ta.scrollTop
            pre.scrollLeft = ta.scrollLeft
        }
    }, [])

    return (
        <div className="code-playground">
            <div className="code-playground__toolbar">
                <span className="code-playground__label">🐍 Python Playground</span>
                <div className="code-playground__actions">
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
                    spellCheck={false}
                    aria-label="Python code editor"
                />
            </div>

            <PythonRunner code={code} />

            {expectedOutput && (
                <div className="code-playground__expected">
                    <div className="code-playground__expected-header">Expected Output</div>
                    <pre className="code-playground__expected-body">{expectedOutput}</pre>
                </div>
            )}
        </div>
    )
}
