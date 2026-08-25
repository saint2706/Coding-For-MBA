import { describe, expect, it } from 'vitest'
import { findStructuralIssues } from '../../../src/utils/content-structure-core.js'

describe('findStructuralIssues', () => {
  it('returns no issues for a well-formed exercise and question', () => {
    const markdown = `
### Exercise 1: Compute Sum

**Goal**: Add two numbers.

\`\`\`python
print(2 + 3)
\`\`\`

## Mastery Check

### Question 1: What does + do?

Explain addition.

<details>
<summary>Click for Answer</summary>

It adds two numbers.

</details>
`

    expect(findStructuralIssues(markdown)).toEqual([])
  })

  it('flags an exercise missing a **Goal** paragraph', () => {
    const markdown = `
### Exercise 1: Compute Sum

\`\`\`python
print(2 + 3)
\`\`\`
`

    const issues = findStructuralIssues(markdown)
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({
      type: 'exercise',
      heading: 'Exercise 1: Compute Sum',
    })
    expect(issues[0]?.message).toMatch(/Goal/)
  })

  it('flags an exercise missing a code block', () => {
    const markdown = `
### Exercise 1: Compute Sum

**Goal**: Add two numbers.
`

    const issues = findStructuralIssues(markdown)
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ type: 'exercise' })
    expect(issues[0]?.message).toMatch(/code block/)
  })

  it('accepts non-Python code blocks (SQL, shell, etc.) as satisfying the code requirement', () => {
    const markdown = `
### Exercise 1: Query Top Customers

**Goal**: Write a SQL query.

\`\`\`sql
SELECT * FROM customers;
\`\`\`

### Exercise 2: Set Up the Environment

**Goal**: Create and activate a virtual environment.

\`\`\`bash
python -m venv venv
\`\`\`
`

    expect(findStructuralIssues(markdown)).toEqual([])
  })

  it('flags both missing pieces when neither is present', () => {
    const markdown = `
### Exercise 1: Compute Sum

Just some prose, no goal or code.
`

    const issues = findStructuralIssues(markdown)
    expect(issues).toHaveLength(2)
    expect(issues.map((issue) => issue.message).join(' ')).toMatch(/Goal/)
    expect(issues.map((issue) => issue.message).join(' ')).toMatch(/code block/)
  })

  it('flags a question missing a <details> answer block', () => {
    const markdown = `
### Question 1: What does + do?

Explain addition.
`

    const issues = findStructuralIssues(markdown)
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({
      type: 'mastery',
      heading: 'Question 1: What does + do?',
    })
    expect(issues[0]?.message).toMatch(/<details>/)
  })

  it('scopes each exercise/question independently across multiple blocks', () => {
    const markdown = `
### Exercise 1: Good One

**Goal**: Do the thing.

\`\`\`python
do_thing()
\`\`\`

### Exercise 2: Bad One

Missing everything.

## Mastery Check

### Question 1: Fine

Text

<details>
<summary>Answer</summary>

Yes.

</details>

### Question 2: Broken

No answer here.
`

    const issues = findStructuralIssues(markdown)
    expect(issues.map((issue) => issue.heading)).toEqual([
      'Exercise 2: Bad One',
      'Exercise 2: Bad One',
      'Question 2: Broken',
    ])
  })

  it('reports a source line for each issue', () => {
    const markdown = `Intro paragraph.\n\n### Exercise 1: Compute Sum\n\nNo goal or code.\n`

    const issues = findStructuralIssues(markdown)
    expect(issues[0]?.line).toBe(3)
  })

  it('ignores headings that are not Exercise/Question sections', () => {
    const markdown = `
### Just a heading

Some content with no code or goal.
`

    expect(findStructuralIssues(markdown)).toEqual([])
  })
})
