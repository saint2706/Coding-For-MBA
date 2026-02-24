import { extractExercisesFromContent, ExtractedExercise } from './exercise-extractor-core.js'

export type { ExtractedExercise }

/**
 * Extracts exercises from raw markdown content.
 */
export function extractExercises(content: string): ExtractedExercise[] {
  return extractExercisesFromContent(content)
}
