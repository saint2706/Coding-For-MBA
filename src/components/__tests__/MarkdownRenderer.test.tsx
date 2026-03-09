import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import MarkdownRenderer from '../MarkdownRenderer'

// Mock Child Components
vi.mock('../CodePlayground', () => ({
  default: ({ initialCode }: { initialCode: string }) => (
    <div data-testid="code-playground">{initialCode}</div>
  ),
}))

vi.mock('../ExerciseWidget', () => ({
  default: (props: any) => (
    <div data-testid="exercise-widget" data-title={props.title}>
      {props.goal}
    </div>
  ),
}))

vi.mock('../MasteryCheck', () => ({
  default: (props: any) => (
    <div data-testid="mastery-check" data-title={props.title}>
      {props.questionText}
    </div>
  ),
}))

vi.mock('../../utils/prism', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div className="syntax-highlighter">{children}</div>
  ),
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

  it('renders "Try It" button for Python code blocks', () => {
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

    const playground = container.querySelector('[data-testid="code-playground"]')
    expect(playground).toBeTruthy()
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

  it('renders ExerciseWidget for exercise blocks', () => {
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

    const widget = container.querySelector('[data-testid="exercise-widget"]')
    expect(widget).toBeTruthy()
    expect(widget?.getAttribute('data-title')).toBe('Test Exercise')
    expect(widget?.textContent).toBe('Test Goal')
  })

  it('renders MasteryCheck for mastery blocks', () => {
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

    const check = container.querySelector('[data-testid="mastery-check"]')
    expect(check).toBeTruthy()
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
    expect(glossaryTerm?.textContent).toBe('function')
    expect(glossaryTerm?.getAttribute('data-definition')).toBeTruthy()
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

    expect(container.querySelector('p')?.innerHTML).toBe(
      'A <span class="glossary-term" data-definition="A reusable block of code that performs a specific task.">function</span> takes an <span class="glossary-term" data-definition="A value passed to a function when it is called.">argument</span> and another function.',
    )
  })
})
