import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { waitFor } from '@testing-library/react'
import { createRoot, Root } from 'react-dom/client'
import MarkdownRenderer from '../MarkdownRenderer'

vi.mock('../CodePlayground', () => ({
  default: function MockCodePlayground(props: Record<string, unknown>) {
    return <div data-testid="code-playground">{props.initialCode as React.ReactNode}</div>
  },
}))

vi.mock('../ExerciseWidget', () => ({
  default: function MockExerciseWidget(props: Record<string, unknown>) {
    return (
      <div data-testid="exercise-widget" data-title={props.title as string}>
        {props.goal as React.ReactNode}
      </div>
    )
  },
}))

vi.mock('../MasteryCheck', () => ({
  default: function MockMasteryCheck(props: Record<string, unknown>) {
    return (
      <div data-testid="mastery-check" data-title={props.title as string}>
        {props.questionText as React.ReactNode}
      </div>
    )
  },
}))

const syntaxHighlighterMock = vi.fn(
  ({ children, wrapLongLines, codeTagProps, customStyle }: Record<string, unknown>) => {
    const safeCodeTagProps = codeTagProps as
      | { style?: { whiteSpace?: string; overflowWrap?: string } }
      | undefined
    const safeCustomStyle = customStyle as { overflowX?: string } | undefined
    return (
      <div
        className="syntax-highlighter"
        data-wrap-long-lines={String(Boolean(wrapLongLines))}
        data-white-space={safeCodeTagProps?.style?.whiteSpace ?? ''}
        data-overflow-wrap={safeCodeTagProps?.style?.overflowWrap ?? ''}
        data-overflow-x={safeCustomStyle?.overflowX ?? ''}
      >
        {children as React.ReactNode}
      </div>
    )
  },
)

// Mock Child Components
vi.mock('../CodePlayground', () => ({
  default: ({ initialCode }: { initialCode: string }) => (
    <div data-testid="code-playground">{initialCode}</div>
  ),
}))

vi.mock('../ExerciseWidget', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="exercise-widget" data-title={props.title as string}>
      {props.goal as React.ReactNode}
    </div>
  ),
}))

vi.mock('../MasteryCheck', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="mastery-check" data-title={props.title as string}>
      {props.questionText as React.ReactNode}
    </div>
  ),
}))

vi.mock('../../utils/prism', () => ({
  default: (props: Record<string, unknown>) => syntaxHighlighterMock(props),
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

// Mock CopyButton
vi.mock('../CopyButton', () => ({
  default: () => <button>Copy</button>,
}))

describe('MarkdownRenderer', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    syntaxHighlighterMock.mockClear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('renders basic markdown content', () => {
    const content = '# Hello World\nThis is a paragraph.'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    expect(container.querySelector('h1')?.textContent).toBe('Hello World')
    expect(container.querySelector('p')?.textContent).toBe('This is a paragraph.')
  })

  it('renders code blocks with syntax highlighting', () => {
    const content = '```python\nprint("hello")\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const codeBlock = container.querySelector('.code-block-wrapper')
    expect(codeBlock).toBeTruthy()
    expect(codeBlock?.querySelector('.code-block-lang')?.textContent).toBe('python')
    expect(codeBlock?.querySelector('.syntax-highlighter')?.textContent).toBe('print("hello")')
  })

  it('enables long-line wrapping for fenced code blocks', () => {
    const content =
      '```python\nprint("a very long line that should wrap instead of scrolling horizontally")\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const syntaxHighlighter = container.querySelector('.syntax-highlighter')
    expect(syntaxHighlighter?.getAttribute('data-wrap-long-lines')).toBe('true')
    expect(syntaxHighlighter?.getAttribute('data-white-space')).toBe('pre-wrap')
    expect(syntaxHighlighter?.getAttribute('data-overflow-wrap')).toBe('anywhere')
    expect(syntaxHighlighter?.getAttribute('data-overflow-x')).toBe('hidden')
  })

  it('applies wrapping props for unbroken long tokens to avoid horizontal scrolling', () => {
    const largeUrlString = 'https://example.com/' + 'averylongsegment'.repeat(30)
    const content = `\`\`\`python\n${largeUrlString}\n\`\`\``

    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const [highlighterPropsRaw] = syntaxHighlighterMock.mock.calls.at(-1) ?? []
    const highlighterProps = highlighterPropsRaw as
      | {
          wrapLongLines?: boolean
          codeTagProps?: { style?: { whiteSpace?: string; overflowWrap?: string } }
          customStyle?: { overflowX?: string }
        }
      | undefined
    expect(highlighterProps).toBeTruthy()
    expect(highlighterProps?.wrapLongLines).toBe(true)
    expect(highlighterProps?.codeTagProps?.style?.whiteSpace).toBe('pre-wrap')
    expect(highlighterProps?.codeTagProps?.style?.overflowWrap).toBe('anywhere')
    expect(highlighterProps?.customStyle?.overflowX).toBe('hidden')
  })

  it('renders "Try It" button for Python code blocks', async () => {
    const content = '```python\nprint("hello")\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const tryBtn = container.querySelector('.code-block-try-btn')
    expect(tryBtn).toBeTruthy()
    expect(tryBtn?.textContent).toContain('Try It')

    // Click it to open playground
    act(() => {
      tryBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    await waitFor(() => {
      const playground = container.querySelector('[data-testid="code-playground"]')
      expect(playground).toBeTruthy()
    })
    const playground = container.querySelector('[data-testid="code-playground"]')
    expect(playground?.textContent).toBe('print("hello")')
  })

  it('does not render "Try It" button for non-Python code blocks', () => {
    const content = '```javascript\nconsole.log("hello")\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const tryBtn = container.querySelector('.code-block-try-btn')
    expect(tryBtn).toBeNull()
  })

  it('renders ExerciseWidget for exercise blocks', async () => {
    const content = `
### Exercise 1: Test Exercise
**Goal**: Test Goal
\`\`\`python
starter code
\`\`\`
**Expected Output**:
\`\`\`text
output
\`\`\`
    `
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    await waitFor(() => {
      const widget = container.querySelector('[data-testid="exercise-widget"]')
      expect(widget).toBeTruthy()
    })
    const widget = container.querySelector('[data-testid="exercise-widget"]')
    expect(widget?.getAttribute('data-title')).toBe('Test Exercise')
    expect(widget?.textContent).toBe('Test Goal')
  })

  it('renders MasteryCheck for mastery blocks', async () => {
    const content = `
### Question 1: Test Question
What is it?
<details>
<summary>Answer</summary>
It is a test.
</details>
    `
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    await waitFor(() => {
      const check = container.querySelector('[data-testid="mastery-check"]')
      expect(check).toBeTruthy()
    })
    const check = container.querySelector('[data-testid="mastery-check"]')
    expect(check?.getAttribute('data-title')).toBe('Test Question')
    expect(check?.textContent).toContain('What is it?')
  })

  it('parses exercise headings with variant spacing and nested formatting', () => {
    const content = `
###   Exercise 2 : **Revenue** *Forecasting*
**Goal**: Practice parsing headings
Use the provided helper in your answer.

\`\`\`python
print('starter')
\`\`\`

**Expected Output**:
\`\`\`text
starter
\`\`\`
    `

    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const widget = container.querySelector('[data-testid="exercise-widget"]')
    expect(widget).toBeTruthy()
    expect(widget?.getAttribute('data-title')).toBe('Revenue Forecasting')
    expect(widget?.textContent).toContain('Practice parsing headings')
  })

  it('parses mastery questions with nested heading formatting and details answers', () => {
    const content = `
### Question 2 : **Cash** *Flow* Check
What does this print?
\`\`\`python
print(5 + 5)
\`\`\`
<details>
<summary><strong>Answer</strong></summary>
It prints:
\`\`\`text
10
\`\`\`
</details>
    `

    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const check = container.querySelector('[data-testid="mastery-check"]')
    expect(check).toBeTruthy()
    expect(check?.getAttribute('data-title')).toBe('Cash Flow Check')
    expect(check?.textContent).toContain('What does this print?')
  })

  it('sanitizes unsafe HTML', () => {
    const content = '<script>alert("xss")</script>'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    expect(container.innerHTML).not.toContain('<script>')
    expect(container.innerHTML).not.toContain('alert("xss")')
  })

  it('renders tel markdown links as plain text when disallowed by sanitizer', () => {
    const content = '[Call us](tel:1234567890)'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    expect(container.querySelector('a')).toBeNull()
    expect(container.querySelector('span')?.textContent).toContain('Call us')
  })

  it('renders unsafe markdown links as plain text spans', () => {
    const content = '[Bad Link](javascript:alert(1))'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    expect(container.querySelector('a')).toBeNull()
    expect(container.querySelector('span')?.textContent).toContain('Bad Link')
  })

  it('injects glossary tooltips', () => {
    const content = 'This is a function.'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const glossaryTerm = container.querySelector('.glossary-term')
    expect(glossaryTerm).toBeTruthy()
    expect(glossaryTerm?.tagName).toBe('BUTTON')
    expect(glossaryTerm?.textContent).toBe('function')
    expect(glossaryTerm?.getAttribute('data-definition')).toBeTruthy()
  })

  it('toggles a glossary tooltip open and closed on tap, for touch devices', () => {
    const content = 'This is a function.'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const glossaryTerm = container.querySelector<HTMLButtonElement>('.glossary-term')!
    expect(glossaryTerm.getAttribute('aria-expanded')).toBe('false')

    act(() => {
      glossaryTerm.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(glossaryTerm.getAttribute('aria-expanded')).toBe('true')
    expect(glossaryTerm.classList.contains('glossary-term-active')).toBe(true)

    act(() => {
      glossaryTerm.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(glossaryTerm.getAttribute('aria-expanded')).toBe('false')
    expect(glossaryTerm.classList.contains('glossary-term-active')).toBe(false)
  })

  it('closes an open glossary tooltip on outside pointerdown', () => {
    const content = 'This is a function.'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const glossaryTerm = container.querySelector<HTMLButtonElement>('.glossary-term')!
    act(() => {
      glossaryTerm.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(glossaryTerm.getAttribute('aria-expanded')).toBe('true')

    act(() => {
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    })
    expect(glossaryTerm.getAttribute('aria-expanded')).toBe('false')
  })

  it('renders glossary tooltips identically for repeated mixed-case terms', () => {
    const content = 'Function function VARIABLE variable'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const glossaryTerms = container.querySelectorAll('.glossary-term')
    expect(glossaryTerms).toHaveLength(2)
    expect(glossaryTerms[0]?.textContent).toBe('Function')
    expect(glossaryTerms[1]?.textContent).toBe('VARIABLE')
    expect(glossaryTerms[0]?.getAttribute('data-definition')).toBeTruthy()
    expect(glossaryTerms[1]?.getAttribute('data-definition')).toBeTruthy()
    expect(container.querySelector('p')?.textContent).toBe('Function function VARIABLE variable')
  })

  it('renders the same tooltip markup for glossary terms in running text', () => {
    const content = 'A function takes an argument and another function.'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const paragraph = container.querySelector('p')
    expect(paragraph?.textContent).toBe('A function takes an argument and another function.')

    const glossaryTerms = paragraph?.querySelectorAll('.glossary-term')
    expect(glossaryTerms).toHaveLength(2)
    expect(glossaryTerms?.[0]?.tagName).toBe('BUTTON')
    expect(glossaryTerms?.[0]?.textContent).toBe('function')
    expect(glossaryTerms?.[0]?.getAttribute('data-definition')).toBe(
      'A reusable block of code that performs a specific task.',
    )
    expect(glossaryTerms?.[1]?.tagName).toBe('BUTTON')
    expect(glossaryTerms?.[1]?.textContent).toBe('argument')
    expect(glossaryTerms?.[1]?.getAttribute('data-definition')).toBe(
      'A value passed to a function when it is called.',
    )
  })

  it('renders GitHub-style alert blockquotes as styled callouts', () => {
    const content = ['> [!WARNING]', '> Watch out for this edge case.'].join('\n')
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    expect(container.querySelector('blockquote')).toBeNull()

    const callout = container.querySelector('.callout')
    expect(callout).toBeTruthy()
    expect(callout?.tagName).toBe('DIV')
    expect(callout?.classList.contains('callout-warning')).toBe(true)
    expect(callout?.getAttribute('data-callout')).toBe('warning')
    expect(callout?.textContent?.trim()).toBe('Watch out for this edge case.')
  })

  it('renders a plain blockquote unchanged when there is no callout marker', () => {
    const content = '> Just a regular pull quote.'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    expect(container.querySelector('.callout')).toBeNull()
    expect(container.querySelector('blockquote')?.textContent?.trim()).toBe(
      'Just a regular pull quote.',
    )
  })
})
