import {
  getAdjacentLessons,
  getAllExercises,
  getAllLessons,
  getAllNotebooks,
  getAllPhases,
  getLesson,
  getLessonsByPhase,
  getNotebook,
  getPrerequisiteLessons,
  getReadingTime,
  getRelatedLessons,
} from '../contentLoader'

describe('contentLoader', () => {
  it('loads lessons with basic data integrity guarantees', () => {
    const lessons = getAllLessons()

    expect(lessons.length).toBeGreaterThan(100)
    expect(lessons.every((lesson) => typeof lesson.day === 'number' && lesson.day > 0)).toBe(true)
    expect(new Set(lessons.map((lesson) => lesson.day)).size).toBe(lessons.length)
  })

  it('resolves lessons and phases consistently', () => {
    const phases = getAllPhases()

    expect(phases.length).toBeGreaterThan(0)

    const lesson = getLesson(1)
    expect(lesson).toBeDefined()

    const phaseLessons = getLessonsByPhase(lesson!.phase)
    expect(phaseLessons.some((l) => l.day === lesson!.day)).toBe(true)
  })

  it('estimates reading time from markdown content', () => {
    const content = `# Heading\n\nThis is a paragraph with [a link](https://example.com).\n\n\
\
\
\

test words repeated `.repeat(120)

    expect(getReadingTime(content)).toBeGreaterThan(1)
    expect(getReadingTime('short text')).toBe(1)
  })

  it('returns previous and next lessons for a valid middle lesson', () => {
    const lessons = getAllLessons()
    const first = lessons[0]
    const last = lessons[lessons.length - 1]
    const middle = lessons[Math.floor(lessons.length / 2)]

    expect(first).toBeDefined()
    expect(last).toBeDefined()
    expect(middle).toBeDefined()

    const aroundMiddle = getAdjacentLessons(middle!.day)
    expect(aroundMiddle.prev).toBeDefined()
    expect(aroundMiddle.next).toBeDefined()
  })

  it('returns null on first/last lesson boundaries', () => {
    const lessons = getAllLessons()
    const first = lessons[0]
    const last = lessons[lessons.length - 1]

    expect(first).toBeDefined()
    expect(last).toBeDefined()

    const aroundFirst = getAdjacentLessons(first!.day)
    expect(aroundFirst.prev).toBeNull()
    expect(aroundFirst.next).toBeDefined()

    const aroundLast = getAdjacentLessons(last!.day)
    expect(aroundLast.next).toBeNull()
    expect(aroundLast.prev).toBeDefined()
  })

  it('returns null adjacency for an invalid day input', () => {
    expect(getAdjacentLessons(999999)).toEqual({ prev: null, next: null })
  })

  it('handles notebook lookups safely', () => {
    const notebooks = getAllNotebooks()
    expect(notebooks.length).toBeGreaterThan(0)

    expect(getNotebook(9999)).toBeUndefined()
  })

  it('returns empty prerequisites when none are configured', () => {
    const baseLesson = getAllLessons()[0]
    expect(baseLesson).toBeDefined()

    const noPrereqLesson = { ...baseLesson!, prerequisites: [] }
    expect(getPrerequisiteLessons(noPrereqLesson)).toEqual([])
  })

  it('returns valid prerequisite and related lessons', () => {
    const lessonWithPrereqs = getAllLessons().find(
      (lesson) => Array.isArray(lesson.prerequisites) && lesson.prerequisites.length > 0,
    )

    expect(lessonWithPrereqs).toBeDefined()

    const prereqs = getPrerequisiteLessons(lessonWithPrereqs!)
    expect(Array.isArray(prereqs)).toBe(true)
    expect(prereqs.every((lesson) => typeof lesson.day === 'number')).toBe(true)

    const related = getRelatedLessons(lessonWithPrereqs!, 4)
    expect(related.length).toBeLessThanOrEqual(4)
    expect(related.every((lesson) => lesson.day !== lessonWithPrereqs!.day)).toBe(true)
  })

  it('prevents collection mutation from changing source lesson data', () => {
    const baselineLessons = getAllLessons()
    const baselineFirst = baselineLessons[0]

    expect(baselineFirst).toBeDefined()

    expect(() => {
      ;(baselineLessons as Array<(typeof baselineLessons)[number]>).push(baselineFirst!)
    }).toThrow(TypeError)

    expect(() => {
      ;(baselineFirst as { title: string }).title = 'Mutated Lesson Title'
    }).toThrow(TypeError)

    const freshLessons = getAllLessons()
    expect(freshLessons.length).toBe(baselineLessons.length)
    expect(freshLessons[0]?.title).toBe(baselineFirst?.title)
  })

  it('prevents nested collection mutation from changing source exercise data', () => {
    const exercises = getAllExercises()
    const exerciseWithTags = exercises.find((exercise) => exercise.tags.length > 0)

    expect(exerciseWithTags).toBeDefined()

    expect(() => {
      ;(exerciseWithTags!.tags as string[]).push('mutated-tag')
    }).toThrow(TypeError)

    const freshExerciseWithTags = getAllExercises().find((exercise) => exercise.tags.length > 0)
    expect(freshExerciseWithTags?.tags).toEqual(exerciseWithTags?.tags)
  })
})
