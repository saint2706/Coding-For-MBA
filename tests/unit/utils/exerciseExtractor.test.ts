import { extractExercises } from '../../../src/utils/exerciseExtractor'

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

type Assert<T extends true> = T

type ExtractedExerciseShape = ReturnType<typeof extractExercises>[number]

const typeAssertions: [
  Assert<
    Equal<
      keyof ExtractedExerciseShape,
      'title' | 'goal' | 'starterCode' | 'expectedOutput' | 'tags'
    >
  >,
  Assert<Equal<ExtractedExerciseShape['expectedOutput'], string | undefined>>,
  Assert<Equal<ExtractedExerciseShape['tags'], string[]>>,
] = [true, true, true]

expect(typeAssertions).toHaveLength(3)

describe('exerciseExtractor', () => {
  it('extracts exercises with the expected output shape', () => {
    const markdown = `
### Exercise 1: Compute Sum
**Goal**: Add two numbers.

\`\`\`python
print(2 + 3)
\`\`\`

**Expected Output:**
\`\`\`text
5
\`\`\`
`

    const exercises = extractExercises(markdown)

    expect(exercises).toHaveLength(1)
    expect(exercises[0]).toMatchObject({
      title: 'Compute Sum',
      goal: 'Add two numbers.',
      starterCode: 'print(2 + 3)',
      expectedOutput: '5',
      tags: [],
    })
  })

  it('keeps expectedOutput optional when omitted in markdown', () => {
    const markdown = `
### Exercise 1: No Output Block
**Goal**: Print hello.

\`\`\`python
print('hello')
\`\`\`
`

    const exercises = extractExercises(markdown)

    expect(exercises).toHaveLength(1)
    expect(exercises[0]?.expectedOutput).toBeUndefined()
  })
})
