export interface ExtractedExercise {
  title: string
  goal: string
  starterCode: string
  expectedOutput?: string
  tags: string[]
}

/**
 * Parses markdown content to extract exercise definitions.
 * The caller is responsible for adding lesson metadata (day, phase, difficulty, lessonTitle).
 *
 * @param content - The markdown content to parse.
 * @returns An array of partial exercise objects.
 */
export function extractExercisesFromContent(content: string): ExtractedExercise[]
