import { useQuizStore } from '../quizStore'

describe('quizStore', () => {
  beforeEach(() => {
    useQuizStore.getState().clearQuizHistory()
    useQuizStore.setState({ hasHydrated: false })
  })

  it('records attempts and computes quiz stats', () => {
    useQuizStore.getState().recordAttempt({ quizId: 'q1', topic: 'Topic 1', correct: false })
    useQuizStore.getState().recordAttempt({ quizId: 'q1', topic: 'Topic 1', correct: true })

    const stats = useQuizStore.getState().getQuizStats('q1')

    expect(stats).toMatchObject({
      quizId: 'q1',
      attempts: 2,
      correct: 1,
      incorrect: 1,
      accuracy: 50,
    })
  })

  it('returns most missed and low-scoring topics', () => {
    useQuizStore.getState().recordAttempt({ quizId: 'q1', topic: 'Topic 1', correct: false })
    useQuizStore.getState().recordAttempt({ quizId: 'q1', topic: 'Topic 1', correct: false })
    useQuizStore.getState().recordAttempt({ quizId: 'q2', topic: 'Topic 2', correct: true })
    useQuizStore.getState().recordAttempt({ quizId: 'q2', topic: 'Topic 2', correct: false })

    const mostMissed = useQuizStore.getState().getMostMissedQuestions(1)
    const lowScoring = useQuizStore.getState().getLowScoringTopics(60, 2)

    expect(mostMissed[0]?.quizId).toBe('q1')
    expect(lowScoring.map((s) => s.quizId)).toContain('q1')
  })

  it('returns recent attempts in descending chronological order', () => {
    useQuizStore.getState().recordAttempt({
      quizId: 'q1',
      topic: 'Topic 1',
      correct: false,
      attemptedAt: new Date('2026-02-18T10:00:00.000Z'),
    })
    useQuizStore.getState().recordAttempt({
      quizId: 'q1',
      topic: 'Topic 1',
      correct: true,
      attemptedAt: new Date('2026-02-18T10:01:00.000Z'),
    })

    const recent = useQuizStore.getState().getRecentAttempts('q1', 2)

    expect(recent).toHaveLength(2)
    expect(recent[0]?.correct).toBe(true)
    expect(recent[1]?.correct).toBe(false)
  })
})
