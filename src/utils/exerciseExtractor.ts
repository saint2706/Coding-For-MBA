import { extractExercisesFromContent, ExtractedExercise } from './exercise-extractor-core.js'

export type { ExtractedExercise }

/**
 * Extracts exercises from raw markdown content.
 *
 * @param {string} content - The markdown content to parse.
 * @returns {ExtractedExercise[]} An array of partial exercise objects extracted from the content.
 */
export function extractExercises(content: string): ExtractedExercise[] {
  return extractExercisesFromContent(content)
}
