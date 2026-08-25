import { useQuizStore } from '../../../src/stores/quizStore'

describe('quizStore', () => {
  beforeEach(() => {
    localStorage.clear()
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
    expect(stats?.lastAttemptAt).toBeTypeOf('string')
  })

  it('ignores attempts with blank ids/topics and returns null stats for missing quiz', () => {
    useQuizStore.getState().recordAttempt({ quizId: '   ', topic: 'Topic 1', correct: true })
    useQuizStore.getState().recordAttempt({ quizId: 'q1', topic: '   ', correct: true })

    expect(useQuizStore.getState().attempts).toHaveLength(0)
    expect(useQuizStore.getState().getQuizStats('unknown')).toBeNull()
  })

  it('returns most missed and low-scoring topics', () => {
    useQuizStore.getState().recordAttempt({ quizId: 'q1', topic: 'Topic 1', correct: false })
    useQuizStore.getState().recordAttempt({ quizId: 'q1', topic: 'Topic 1', correct: false })
    useQuizStore.getState().recordAttempt({ quizId: 'q2', topic: 'Topic 2', correct: true })
    useQuizStore.getState().recordAttempt({ quizId: 'q2', topic: 'Topic 2', correct: true })
    useQuizStore.getState().recordAttempt({ quizId: 'q2', topic: 'Topic 2', correct: false })

    const mostMissed = useQuizStore.getState().getMostMissedQuestions(1)
    const lowScoring = useQuizStore.getState().getLowScoringTopics(60, 2)

    expect(mostMissed[0]?.quizId).toBe('q1')
    expect(lowScoring.map((s) => s.quizId)).toContain('q1')
    expect(lowScoring.map((s) => s.quizId)).not.toContain('q2')
  })

  it('sorts low scoring topics by accuracy then by incorrect count', () => {
    // q1: 50% accuracy (1/2), 1 incorrect
    useQuizStore.getState().recordAttempt({ quizId: 'q1', topic: 'Topic 1', correct: false })
    useQuizStore.getState().recordAttempt({ quizId: 'q1', topic: 'Topic 1', correct: true })

    // q3: 50% accuracy (2/4), 2 incorrect - should be ranked higher (worse) than q1 if we prioritize incorrect count for ties?
    // Sort logic: a.accuracy - b.accuracy || b.incorrect - a.incorrect
    // If accuracy is same, higher incorrect count comes FIRST (b.incorrect - a.incorrect implies descending sort of incorrects)

    useQuizStore.getState().recordAttempt({ quizId: 'q3', topic: 'Topic 3', correct: false })
    useQuizStore.getState().recordAttempt({ quizId: 'q3', topic: 'Topic 3', correct: false })
    useQuizStore.getState().recordAttempt({ quizId: 'q3', topic: 'Topic 3', correct: true })
    useQuizStore.getState().recordAttempt({ quizId: 'q3', topic: 'Topic 3', correct: true })

    const lowScoring = useQuizStore.getState().getLowScoringTopics(60, 1)

    expect(lowScoring[0]?.quizId).toBe('q3')
    expect(lowScoring[1]?.quizId).toBe('q1')
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

  it('clears quiz history', () => {
    useQuizStore.getState().recordAttempt({ quizId: 'q1', topic: 'Topic 1', correct: true })
    expect(useQuizStore.getState().attempts.length).toBe(1)

    useQuizStore.getState().clearQuizHistory()
    expect(useQuizStore.getState().attempts).toEqual([])
  })

  it('normalizes persisted attempts in migration', () => {
    const migrate = useQuizStore.persist.getOptions().migrate
    expect(migrate).toBeTypeOf('function')

    const migrated = migrate?.(
      {
        attempts: [
          {
            id: 'a',
            quizId: 'q1',
            topic: 'Topic 1',
            attemptedAt: '2026-01-01T00:00:00.000Z',
            correct: true,
          },
          { id: 1, quizId: 'bad', topic: 'bad', attemptedAt: 'x', correct: 'no' },
        ],
      },
      1,
    )

    expect(migrated).toEqual({
      attempts: [
        {
          id: 'a',
          quizId: 'q1',
          topic: 'Topic 1',
          attemptedAt: '2026-01-01T00:00:00.000Z',
          correct: true,
        },
      ],
    })
  })
})
