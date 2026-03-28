// @ts-expect-error JS module without bundled type declarations
import * as contentSchemas from '../../../scripts/content-schemas.js'

const {
  difficultyLevelSchema,
  exerciseSchema,
  lessonFrontmatterSchema,
  phaseOverviewFrontmatterSchema,
} = contentSchemas as unknown as {
  difficultyLevelSchema: any
  exerciseSchema: any
  lessonFrontmatterSchema: any
  phaseOverviewFrontmatterSchema: any
}

describe('content zod schemas', () => {
  it('accepts valid lesson frontmatter fixture', () => {
    const validLesson = {
      day: '11B',
      title: 'Python Basics for Business',
      phase: 1,
      difficulty: 'beginner',
      duration: 45,
      tags: ['python', 'basics'],
      concepts: ['variables', 'types'],
    }

    const result = lessonFrontmatterSchema.safeParse(validLesson)
    expect(result.success).toBe(true)
  })

  it('rejects invalid lesson frontmatter fixture', () => {
    const invalidLesson = {
      day: 0,
      title: '  ',
      phase: 'phase-1',
      difficulty: 'novice',
      duration: -10,
      tags: ['python', ''],
    }

    const result = lessonFrontmatterSchema.safeParse(invalidLesson)
    expect(result.success).toBe(false)

    if (result.success) throw new Error('Expected invalid lesson fixture to fail')
    expect(
      result.error.issues.map((issue: { path: Array<string | number> }) => issue.path.join('.')),
    ).toEqual(expect.arrayContaining(['day', 'title', 'difficulty', 'duration', 'tags.1']))
  })

  it('accepts valid phase overview fixture and rejects empty day list', () => {
    const validPhase = {
      phase: 2,
      title: 'Functions & Modularity',
      days: [13, '14B', 15],
      totalDuration: 360,
      difficulty: 'intermediate',
    }

    expect(phaseOverviewFrontmatterSchema.safeParse(validPhase).success).toBe(true)

    const invalidPhase = { ...validPhase, days: [] }
    expect(phaseOverviewFrontmatterSchema.safeParse(invalidPhase).success).toBe(false)
  })

  it('validates exercise fixtures and difficulty enum', () => {
    expect(difficultyLevelSchema.safeParse('expert').success).toBe(true)
    expect(difficultyLevelSchema.safeParse('starter').success).toBe(false)

    const validExercise = {
      day: 12,
      lessonTitle: 'Control Flow',
      phase: 1,
      difficulty: 'beginner',
      title: 'Loop Through Sales Data',
      goal: 'Compute a running total',
      starterCode: 'total = 0\nfor x in sales:\n    total += x',
      expectedOutput: '2300',
    }

    const invalidExercise = {
      ...validExercise,
      day: -5,
      title: ' ',
      starterCode: 42,
    }

    expect(exerciseSchema.safeParse(validExercise).success).toBe(true)
    expect(exerciseSchema.safeParse(invalidExercise).success).toBe(false)
  })
})
