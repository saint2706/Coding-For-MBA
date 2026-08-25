import { useMasteryStore } from '../../../src/stores/masteryStore'

describe('masteryStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useMasteryStore.setState({ questionStatus: {}, hasHydrated: false })
  })

  it('records and retrieves per-question status', () => {
    const store = useMasteryStore.getState()
    expect(store.getQuestionStatus(1, 1)).toBeNull()

    store.setQuestionStatus(1, 1, 'got-it')
    expect(useMasteryStore.getState().getQuestionStatus(1, 1)).toBe('got-it')

    store.setQuestionStatus(1, 1, 'review-again')
    expect(useMasteryStore.getState().getQuestionStatus(1, 1)).toBe('review-again')
  })

  it('keeps question statuses independent across lessons and question numbers', () => {
    const store = useMasteryStore.getState()
    store.setQuestionStatus(1, 1, 'got-it')
    store.setQuestionStatus(1, 2, 'review-again')
    store.setQuestionStatus(2, 1, 'got-it')

    const state = useMasteryStore.getState()
    expect(state.getQuestionStatus(1, 1)).toBe('got-it')
    expect(state.getQuestionStatus(1, 2)).toBe('review-again')
    expect(state.getQuestionStatus(2, 1)).toBe('got-it')
  })

  it('computes lesson stats from recorded statuses', () => {
    const store = useMasteryStore.getState()
    store.setQuestionStatus(5, 1, 'got-it')
    store.setQuestionStatus(5, 2, 'got-it')
    store.setQuestionStatus(5, 3, 'review-again')

    expect(useMasteryStore.getState().getLessonStats(5, 4)).toEqual({
      gotIt: 2,
      reviewAgain: 1,
      total: 4,
    })
  })

  it('surfaces lessons needing review, sorted by review count', () => {
    const store = useMasteryStore.getState()
    store.setQuestionStatus(1, 1, 'review-again')
    store.setQuestionStatus(2, 1, 'review-again')
    store.setQuestionStatus(2, 2, 'review-again')
    store.setQuestionStatus(3, 1, 'got-it')

    expect(useMasteryStore.getState().getLessonsNeedingReview()).toEqual([
      { lessonId: '2', reviewCount: 2 },
      { lessonId: '1', reviewCount: 1 },
    ])
  })

  it('clears all mastery state', () => {
    const store = useMasteryStore.getState()
    store.setQuestionStatus(1, 1, 'got-it')
    store.clearAllMastery()

    expect(useMasteryStore.getState().questionStatus).toEqual({})
  })
})
