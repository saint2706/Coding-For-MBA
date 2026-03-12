import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot, Root } from 'react-dom/client'
import { act } from 'react'
import MasteryCheck from '../MasteryCheck'

// Mock CodePlayground
vi.mock('../CodePlayground', () => ({
  default: ({ initialCode }: { initialCode: string }) => (
    <div data-testid="code-playground">{initialCode}</div>
  ),
}))

describe('MasteryCheck', () => {
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

  it('renders title and question number', () => {
    act(() => {
      root.render(
        <MasteryCheck
          questionNumber={1}
          title="Test Question"
          questionText="What is 2+2?"
          answer="4"
        />,
      )
    })

    expect(container.textContent).toContain('Q1')
    expect(container.textContent).toContain('Test Question')
    expect(container.textContent).toContain('What is 2+2?')
  })

  it('renders CodePlayground when codeSnippet is provided', () => {
    act(() => {
      root.render(
        <MasteryCheck
          questionNumber={1}
          title="Code Question"
          questionText="Fix the code"
          codeSnippet={'print("hello")'}
          answer={'print("world")'}
        />,
      )
    })

    const playground = container.querySelector('[data-testid="code-playground"]')
    expect(playground).toBeTruthy()
    expect(playground?.textContent).toBe('print("hello")')
  })

  it('does not render CodePlayground when codeSnippet is empty', () => {
    act(() => {
      root.render(
        <MasteryCheck
          questionNumber={1}
          title="No Code"
          questionText="Just text"
          codeSnippet=""
          answer="Answer"
        />,
      )
    })

    const playground = container.querySelector('[data-testid="code-playground"]')
    expect(playground).toBeNull()
  })

  it('toggles answer visibility', () => {
    act(() => {
      root.render(
        <MasteryCheck
          questionNumber={1}
          title="Toggle Test"
          questionText="Click button"
          answer="Hidden Answer"
        />,
      )
    })

    const button = container.querySelector('button')
    expect(button?.textContent).toContain('Check Answer')

    // We shouldn't find the answer region by role yet
    expect(container.querySelector('[role="region"]')).toBeNull()

    // Click to show
    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(button?.textContent).toContain('Hide Answer')
    expect(container.textContent).toContain('Hidden Answer')

    // Click to hide
    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(button?.textContent).toContain('Check Answer')

    const answerRegion = container.querySelector('[role="region"]')
    expect(answerRegion).toBeNull()
  })
})
