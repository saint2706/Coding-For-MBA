import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Sidebar from '../../../src/components/Sidebar'
import { MemoryRouter } from 'react-router-dom'
import * as contentLoader from '../../../src/utils/contentLoader'

// Mock dependencies
vi.mock('../../../src/utils/contentLoader', () => ({
  getAllPhases: vi.fn(),
  getLessonsByPhase: vi.fn(),
  getCurriculumMetadata: vi.fn(() => ({ totalDays: 163, totalPhases: 12, totalLevels: 4 })),
  phaseIcons: ['A', 'B'],
}))

// Mock store
const useProgressStoreMock = vi.fn((selector) =>
  selector({ completedLessons: [] } as unknown as ReturnType<
    typeof import('../../../src/stores/progressStore').useProgressStore.getState
  >),
)
vi.mock('../../../src/stores/progressStore', () => ({
  useProgressStore: (selector: (state: unknown) => unknown) => useProgressStoreMock(selector),
}))

vi.mock('../../../src/utils/reviewTracker', () => ({
  getReviewDueCountByPhase: () => ({}),
  getReviewStreak: () => 0,
}))

describe('Sidebar Performance', () => {
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

  const phases = [
    { phase: 1, title: 'Phase 1', days: [1, 2] },
    { phase: 2, title: 'Phase 2', days: [3, 4] },
  ]
  const lessonsPhase1 = [
    { day: 1, title: 'Lesson 1', phase: 1 },
    { day: 2, title: 'Lesson 2', phase: 1 },
  ]
  const lessonsPhase2 = [
    { day: 3, title: 'Lesson 3', phase: 2 },
    { day: 4, title: 'Lesson 4', phase: 2 },
  ]

  it('does not render lesson links for closed phases', async () => {
    // Cast to unknown first to bypass lint rules about direct casting to incompatible types if any
    vi.mocked(contentLoader.getAllPhases).mockReturnValue(
      phases as unknown as ReturnType<typeof contentLoader.getAllPhases>,
    )
    vi.mocked(contentLoader.getLessonsByPhase).mockImplementation((phase) => {
      if (phase === 1)
        return lessonsPhase1 as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>
      if (phase === 2)
        return lessonsPhase2 as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>
      return []
    })

    // Render sidebar with no active phase (simulate being on Home)
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={() => {}} />
        </MemoryRouter>,
      )
    })

    // Phase toggles should be visible — title appears in toggle, num is separate
    const toggles = Array.from(container.querySelectorAll('.phase-toggle'))
    const titles = toggles.map((t) => t.textContent ?? '')
    expect(titles.some((t) => t.includes('Phase 1'))).toBe(true)
    expect(titles.some((t) => t.includes('Phase 2'))).toBe(true)

    // Lesson links should NOT be in the DOM
    const lesson1 = Array.from(container.querySelectorAll('a.day-link')).find((el) =>
      el.textContent?.includes('Lesson 1'),
    )
    expect(lesson1).toBeUndefined()
  })

  it('renders lesson links when phase is opened', async () => {
    vi.mocked(contentLoader.getAllPhases).mockReturnValue(
      phases as unknown as ReturnType<typeof contentLoader.getAllPhases>,
    )
    vi.mocked(contentLoader.getLessonsByPhase).mockImplementation((phase) => {
      if (phase === 1)
        return lessonsPhase1 as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>
      if (phase === 2)
        return lessonsPhase2 as unknown as ReturnType<typeof contentLoader.getLessonsByPhase>
      return []
    })

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={() => {}} />
        </MemoryRouter>,
      )
    })

    // Initially lesson 1 is not visible
    let lesson1 = Array.from(container.querySelectorAll('a.day-link')).find((el) =>
      el.textContent?.includes('Lesson 1'),
    )
    expect(lesson1).toBeUndefined()

    // Find and click the toggle for Phase 1
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button.phase-toggle'))
    const phase1Button = buttons.find((b) => b.textContent?.includes('Phase 1'))

    expect(phase1Button).toBeDefined()

    await act(async () => {
      phase1Button?.click()
    })

    // Now lesson 1 should be visible
    lesson1 = Array.from(container.querySelectorAll('a.day-link')).find((el) =>
      el.textContent?.includes('Lesson 1'),
    )
    expect(lesson1).toBeDefined()
    expect(lesson1?.textContent).toContain('Lesson 1')
  })
})
