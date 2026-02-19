import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import ExerciseWidget from '../ExerciseWidget'

// Mock SyntaxHighlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => (
    <pre className="syntax-highlighter">{children}</pre>
  ),
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

// Mock CodePlayground to simplify test
vi.mock('../CodePlayground', () => ({
  default: () => <div className="code-playground-mock" />,
}))

// Mock CopyButton
vi.mock('../CopyButton', () => ({
  default: () => <button>Copy</button>,
}))

describe('ExerciseWidget', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

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

  const defaultProps = {
    title: 'Test Exercise',
    goal: 'Test Goal',
    starterCode: 'def start(): pass',
    solution: 'def solution(): return True',
  }

  it('lazy loads the solution content', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ExerciseWidget {...defaultProps} />
        </MemoryRouter>,
      )
    })

    // 1. Initial state: Solution button exists
    const showButton = container.querySelector(
      '.exercise-widget__solution-btn',
    ) as HTMLButtonElement
    expect(showButton).not.toBeNull()
    expect(showButton.textContent).toContain('Show Solution')

    // The solution code (SyntaxHighlighter mock) should NOT be in the document initially
    const solutionCode = container.querySelector('.syntax-highlighter')
    expect(solutionCode).toBeNull()

    // 2. Click "Show Solution"
    await act(async () => {
      showButton.click()
    })

    // Button text should change
    expect(showButton.textContent).toContain('Hide Solution')

    // Solution code SHOULD now be in the document
    const solutionCodeVisible = container.querySelector('.syntax-highlighter')
    expect(solutionCodeVisible).not.toBeNull()
    expect(solutionCodeVisible?.textContent).toBe('def solution(): return True')

    // 3. Click "Hide Solution"
    await act(async () => {
      showButton.click()
    })

    // Button text should change back
    expect(showButton.textContent).toContain('Show Solution')

    // Solution code should STILL be in the document (hidden via CSS, but mounted)
    const solutionCodeHidden = container.querySelector('.syntax-highlighter')
    expect(solutionCodeHidden).not.toBeNull()

    // Check if the container is hidden
    const solutionPanel = container.querySelector(
      '.exercise-widget__solution-panel',
    ) as HTMLDivElement
    expect(solutionPanel.hidden).toBe(true)
  })
})
