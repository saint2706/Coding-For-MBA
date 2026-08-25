import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot, Root } from 'react-dom/client'
import { act } from 'react'
import MasteryCheck from '../../../src/components/MasteryCheck'
import { useMasteryStore } from '../../../src/stores/masteryStore'

// Mock CodePlayground
vi.mock('../../../src/components/CodePlayground', () => ({
  default: ({ initialCode }: { initialCode: string }) => (
    <div data-testid="code-playground">{initialCode}</div>
  ),
}))

describe('MasteryCheck', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    localStorage.clear()
    useMasteryStore.setState({ questionStatus: {}, hasHydrated: false })
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

  it('persists self-assessment to the mastery store when lessonId is provided', () => {
    act(() => {
      root.render(
        <MasteryCheck
          questionNumber={2}
          title="Persisted"
          questionText="Does it persist?"
          answer="Yes"
          lessonId="7"
        />,
      )
    })

    const revealBtn = container.querySelector('.mastery-check__check-btn')
    act(() => {
      revealBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const gotItBtn = container.querySelector('.mastery-check__assess-btn--got-it')
    act(() => {
      gotItBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(useMasteryStore.getState().getQuestionStatus(7, 2)).toBe('got-it')
    expect(container.textContent).toContain('Mastered')

    const reviewBtn = container.querySelector('.mastery-check__assess-btn--review-again')
    act(() => {
      reviewBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(useMasteryStore.getState().getQuestionStatus(7, 2)).toBe('review-again')
    expect(container.textContent).toContain('Review again')
  })

  it('tracks self-assessment locally without crashing when lessonId is absent', () => {
    act(() => {
      root.render(
        <MasteryCheck
          questionNumber={1}
          title="No Lesson Id"
          questionText="Still works?"
          answer="Yes"
        />,
      )
    })

    const revealBtn = container.querySelector('.mastery-check__check-btn')
    act(() => {
      revealBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const gotItBtn = container.querySelector('.mastery-check__assess-btn--got-it')
    act(() => {
      gotItBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.textContent).toContain('Mastered')
    expect(useMasteryStore.getState().questionStatus).toEqual({})
  })
})
