import { describe, it, expect, vi } from 'vitest'
import { propsAreEqual } from '../../../src/components/SidebarPhaseGroup'
import * as contentLoader from '../../../src/utils/contentLoader'

// Mock getLesson so that propsAreEqual can use it
vi.mock('../../../src/utils/contentLoader', async () => {
  const actual = await vi.importActual<typeof import('../../../src/utils/contentLoader')>(
    '../../../src/utils/contentLoader',
  )
  return {
    ...actual,
    getLesson: vi.fn(),
  }
})

describe('SidebarPhaseGroup propsAreEqual optimization', () => {
  const defaultProps = {
    phase: { phase: 1, title: 'Phase 1', days: ['01'], content: '', path: '' },
    isActive: false,
    completedIdsJoined: '',
    dueCount: 0,
    currentPath: '/',
    onToggle: vi.fn(),
    onClose: vi.fn(),
  }

  it('re-renders when isActive changes', () => {
    expect(propsAreEqual(defaultProps, { ...defaultProps, isActive: true })).toBe(false)
  })

  it('re-renders when dueCount changes', () => {
    expect(propsAreEqual(defaultProps, { ...defaultProps, dueCount: 1 })).toBe(false)
  })

  it('re-renders when phase changes', () => {
    expect(
      propsAreEqual(defaultProps, {
        ...defaultProps,
        phase: { ...defaultProps.phase, phase: 2, title: 'Phase 2' },
      }),
    ).toBe(false)
  })

  it('re-renders when completedIdsJoined changes for lessons in this phase', () => {
    expect(propsAreEqual(defaultProps, { ...defaultProps, completedIdsJoined: '1' })).toBe(false)
  })

  describe('handles currentPath changes correctly', () => {
    it('re-renders if new path is phase overview for this phase', () => {
      expect(propsAreEqual(defaultProps, { ...defaultProps, currentPath: '/phase/1' })).toBe(false)
    })

    it('re-renders if old path is phase overview for this phase', () => {
      expect(
        propsAreEqual(
          { ...defaultProps, currentPath: '/phase/1' },
          { ...defaultProps, currentPath: '/' },
        ),
      ).toBe(false)
    })

    it('re-renders if new path is a lesson in this phase', () => {
      vi.mocked(contentLoader.getLesson).mockReturnValueOnce({ phase: 1 } as unknown as ReturnType<
        typeof contentLoader.getLesson
      >)
      expect(propsAreEqual(defaultProps, { ...defaultProps, currentPath: '/lesson/01' })).toBe(
        false,
      )
    })

    it('re-renders if old path is a lesson in this phase', () => {
      vi.mocked(contentLoader.getLesson).mockReturnValueOnce({ phase: 1 } as unknown as ReturnType<
        typeof contentLoader.getLesson
      >)
      expect(
        propsAreEqual(
          { ...defaultProps, currentPath: '/lesson/01' },
          { ...defaultProps, currentPath: '/' },
        ),
      ).toBe(false)
    })

    it('does not re-render if path changes between two unrelated paths', () => {
      vi.mocked(contentLoader.getLesson).mockReturnValue({ phase: 2 } as unknown as ReturnType<
        typeof contentLoader.getLesson
      >)
      expect(
        propsAreEqual(
          { ...defaultProps, currentPath: '/lesson/03' },
          { ...defaultProps, currentPath: '/lesson/04' },
        ),
      ).toBe(true)
    })

    it('does not re-render if path changes between unrelated phase overviews', () => {
      expect(
        propsAreEqual(
          { ...defaultProps, currentPath: '/phase/2' },
          { ...defaultProps, currentPath: '/phase/3' },
        ),
      ).toBe(true)
    })

    it('handles null getLesson result gracefully', () => {
      vi.mocked(contentLoader.getLesson).mockReturnValueOnce(undefined)
      expect(propsAreEqual(defaultProps, { ...defaultProps, currentPath: '/lesson/unknown' })).toBe(
        true,
      )
    })

    it('handles identical currentPath properly', () => {
      expect(
        propsAreEqual(
          { ...defaultProps, currentPath: '/lesson/01' },
          { ...defaultProps, currentPath: '/lesson/01' },
        ),
      ).toBe(true)
    })
  })
})
