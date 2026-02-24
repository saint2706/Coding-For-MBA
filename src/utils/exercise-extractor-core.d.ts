export interface ExtractedExercise {
  title: string
  goal: string
  starterCode: string
  expectedOutput?: string
  tags: string[]
}

export function extractExercisesFromContent(content: string): ExtractedExercise[]
