export interface StructuralIssue {
  type: 'exercise' | 'mastery'
  heading: string
  line: number | null
  message: string
}

/**
 * Scans a lesson's Markdown body for `### Exercise N` and `### Question N`
 * sections that are missing the structural pieces `findInteractiveBlocks`
 * expects (a `**Goal**` paragraph + code block for exercises, a `<details>`
 * answer block for questions).
 */
export function findStructuralIssues(content: string): StructuralIssue[]
