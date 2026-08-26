import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { waitFor } from '@testing-library/react'
import { createRoot, Root } from 'react-dom/client'
import MarkdownRenderer from '../../../src/components/MarkdownRenderer'

vi.mock('../../../src/components/CodePlayground', () => ({
  default: function MockCodePlayground(props: Record<string, unknown>) {
    return <div data-testid="code-playground">{props.initialCode as React.ReactNode}</div>
  },
}))

vi.mock('../../../src/components/SqlPlayground', () => ({
  default: function MockSqlPlayground(props: Record<string, unknown>) {
    return <div data-testid="sql-playground">{props.initialCode as React.ReactNode}</div>
  },
}))

vi.mock('../../../src/components/ExerciseWidget', () => ({
  default: function MockExerciseWidget(props: Record<string, unknown>) {
    return (
      <div data-testid="exercise-widget" data-title={props.title as string}>
        {props.goal as React.ReactNode}
      </div>
    )
  },
}))

vi.mock('../../../src/components/MasteryCheck', () => ({
  default: function MockMasteryCheck(props: Record<string, unknown>) {
    return (
      <div
        data-testid="mastery-check"
        data-title={props.title as string}
        data-lesson-id={props.lessonId as string | number | undefined}
      >
        {props.questionText as React.ReactNode}
      </div>
    )
  },
}))

vi.mock('../../../src/components/MermaidDiagram', () => ({
  default: function MockMermaidDiagram(props: Record<string, unknown>) {
    return <div data-testid="mermaid-diagram">{props.code as React.ReactNode}</div>
  },
}))

const syntaxHighlighterMock = vi.fn(
  ({ children, wrapLongLines, codeTagProps, customStyle }: Record<string, unknown>) => {
    const safeCodeTagProps = codeTagProps as
      { style?: { whiteSpace?: string; overflowWrap?: string } } | undefined
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
vi.mock('../../../src/components/CodePlayground', () => ({
  default: ({ initialCode }: { initialCode: string }) => (
    <div data-testid="code-playground">{initialCode}</div>
  ),
}))

vi.mock('../../../src/components/ExerciseWidget', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="exercise-widget" data-title={props.title as string}>
      {props.goal as React.ReactNode}
    </div>
  ),
}))

vi.mock('../../../src/components/MasteryCheck', () => ({
  default: (props: Record<string, unknown>) => (
    <div
      data-testid="mastery-check"
      data-title={props.title as string}
      data-lesson-id={props.lessonId as string | number | undefined}
    >
      {props.questionText as React.ReactNode}
    </div>
  ),
}))

vi.mock('../../../src/utils/prism', () => ({
  default: (props: Record<string, unknown>) => syntaxHighlighterMock(props),
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

// Mock CopyButton
vi.mock('../../../src/components/CopyButton', () => ({
  default: () => <button>Copy</button>,
}))

const { mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}))

vi.mock('../../../src/utils/toast', () => ({
  toastSuccess: mockToastSuccess,
  toastError: mockToastError,
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

  it('copies the heading link to the clipboard and toasts on anchor click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    mockToastSuccess.mockClear()

    const content = '## Hello World'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const anchor = container.querySelector('.heading-anchor-link') as HTMLAnchorElement
    expect(anchor).toBeTruthy()
    expect(anchor.getAttribute('href')).toBe('#hello-world')

    await act(async () => {
      anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('#hello-world'))
    expect(mockToastSuccess).toHaveBeenCalledWith('Link copied to clipboard')
    expect(window.location.hash).toBe('#hello-world')
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

  it('shows a diff badge and colors +/- lines for `diff`-flagged fences', () => {
    const content = '```python diff\n print("a")\n+print("b")\n-print("c")\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const codeBlock = container.querySelector('.code-block-wrapper')
    expect(codeBlock?.querySelector('.code-block-diff-badge')?.textContent).toBe('diff')

    const [highlighterPropsRaw] = syntaxHighlighterMock.mock.calls.at(-1) ?? []
    const lineProps = (highlighterPropsRaw as { lineProps?: (n: number) => { className?: string } })
      .lineProps
    expect(lineProps).toBeTruthy()
    expect(lineProps?.(1)).toEqual({})
    expect(lineProps?.(2).className).toBe('code-block-line--diff-add')
    expect(lineProps?.(3).className).toBe('code-block-line--diff-remove')
  })

  it('treats a bare ```diff fence as diff mode without showing a badge', () => {
    const content = '```diff\n+print("b")\n-print("c")\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const codeBlock = container.querySelector('.code-block-wrapper')
    expect(codeBlock?.querySelector('.code-block-diff-badge')).toBeNull()

    const [highlighterPropsRaw] = syntaxHighlighterMock.mock.calls.at(-1) ?? []
    const lineProps = (highlighterPropsRaw as { lineProps?: (n: number) => { className?: string } })
      .lineProps
    expect(lineProps?.(1).className).toBe('code-block-line--diff-add')
    expect(lineProps?.(2).className).toBe('code-block-line--diff-remove')
  })

  it('does not color unified-diff file header lines (+++/---)', () => {
    const content = '```diff\n+++ b/file.py\n--- a/file.py\n+print("b")\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const [highlighterPropsRaw] = syntaxHighlighterMock.mock.calls.at(-1) ?? []
    const lineProps = (highlighterPropsRaw as { lineProps?: (n: number) => { className?: string } })
      .lineProps
    expect(lineProps?.(1)).toEqual({})
    expect(lineProps?.(2)).toEqual({})
    expect(lineProps?.(3).className).toBe('code-block-line--diff-add')
  })

  it('highlights specified lines via a `{a,b-c}` meta range', () => {
    const content = '```python {2,4-5}\nline1\nline2\nline3\nline4\nline5\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const [highlighterPropsRaw] = syntaxHighlighterMock.mock.calls.at(-1) ?? []
    const lineProps = (highlighterPropsRaw as { lineProps?: (n: number) => { className?: string } })
      .lineProps
    expect(lineProps?.(1)).toEqual({})
    expect(lineProps?.(2).className).toBe('code-block-line--highlighted')
    expect(lineProps?.(3)).toEqual({})
    expect(lineProps?.(4).className).toBe('code-block-line--highlighted')
    expect(lineProps?.(5).className).toBe('code-block-line--highlighted')
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

  it('does not render "Try It" button for non-Python/SQL code blocks', () => {
    const content = '```javascript\nconsole.log("hello")\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const tryBtn = container.querySelector('.code-block-try-btn')
    expect(tryBtn).toBeNull()
  })

  it('renders "Try It" button for SQL code blocks', async () => {
    const content = '```sql\nSELECT 1;\n```'
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
      const playground = container.querySelector('[data-testid="sql-playground"]')
      expect(playground).toBeTruthy()
    })
    const playground = container.querySelector('[data-testid="sql-playground"]')
    expect(playground?.textContent).toBe('SELECT 1;')
  })

  it('renders a mermaid diagram block instead of a syntax-highlighted code block', async () => {
    const content = '```mermaid\ngraph TD;\nA-->B;\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    const mermaidBlock = container.querySelector('.mermaid-block')
    expect(mermaidBlock).toBeTruthy()
    expect(mermaidBlock?.querySelector('.code-block-lang')?.textContent).toBe('mermaid')
    expect(container.querySelector('.syntax-highlighter')).toBeNull()

    await waitFor(() => {
      expect(container.querySelector('[data-testid="mermaid-diagram"]')).toBeTruthy()
    })
    expect(container.querySelector('[data-testid="mermaid-diagram"]')?.textContent).toBe(
      'graph TD;\nA-->B;',
    )
  })

  it('toggles a mermaid block to show raw source text', async () => {
    const content = '```mermaid\ngraph TD;\nA-->B;\n```'
    act(() => {
      root.render(<MarkdownRenderer content={content} />)
    })

    await waitFor(() => {
      expect(container.querySelector('[data-testid="mermaid-diagram"]')).toBeTruthy()
    })

    const sourceBtn = container.querySelector('.mermaid-block .code-block-copy')
    act(() => {
      sourceBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('[data-testid="mermaid-diagram"]')).toBeNull()
    expect(container.querySelector('.mermaid-source')?.textContent).toBe('graph TD;\nA-->B;')
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
      root.render(<MarkdownRenderer content={content} lessonId="5" />)
    })

    await waitFor(() => {
      const check = container.querySelector('[data-testid="mastery-check"]')
      expect(check).toBeTruthy()
    })
    const check = container.querySelector('[data-testid="mastery-check"]')
    expect(check?.getAttribute('data-title')).toBe('Test Question')
    expect(check?.textContent).toContain('What is it?')
    expect(check?.getAttribute('data-lesson-id')).toBe('5')
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

  it('captures instructions through to the section end for exercises with no starter code block', async () => {
    const content = `
### Exercise 2: Designing a DAG
**Goal**: Draw the dependencies.

* **Parallel**: A and B can run at the same time.
* **Converge**: C waits for both.

\`\`\`mermaid
flowchart TD
    A --> C
    B --> C
\`\`\`

The two tasks run in parallel, but C cannot start until both finish.

### Exercise 3: Next
**Goal**: Unrelated goal.
\`\`\`python
print('ok')
\`\`\`
    `

    const { findInteractiveBlocks } = await import('../../../src/components/MarkdownRenderer')
    const blocks = findInteractiveBlocks(content)
    const exercise2 = blocks.find(
      (b) => b.type === 'exercise' && (b.data as { title: string }).title === 'Designing a DAG',
    )
    expect(exercise2).toBeTruthy()
    const instructions = (exercise2!.data as { instructions: string }).instructions
    expect(instructions).toContain('Converge')
    expect(instructions).toContain('```mermaid')
    expect(instructions).toContain('The two tasks run in parallel')
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

    // The callout type has no aria-label (a bare div's implicit ARIA role is
    // `generic`, which is barred from aria-label/aria-labelledby); instead a
    // visually-hidden `.sr-only` span carries the type as real text content.
    const srOnly = callout?.querySelector('.sr-only')
    expect(srOnly?.tagName).toBe('SPAN')
    expect(srOnly?.textContent).toBe('warning callout')
    expect(callout?.hasAttribute('aria-label')).toBe(false)

    expect(callout?.textContent?.replace(srOnly?.textContent ?? '', '').trim()).toBe(
      'Watch out for this edge case.',
    )
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
