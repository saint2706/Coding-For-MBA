/**
 * Parses markdown content to extract exercise definitions.
 * The caller is responsible for adding lesson metadata (day, phase, difficulty, lessonTitle).
 *
 * @param {string} content - The markdown content to parse.
 * @returns {Array<{ title: string, goal: string, starterCode: string, expectedOutput: string | undefined, tags: string[] }>} An array of partial exercise objects.
 */
export function extractExercisesFromContent(content) {
  const exercises = []
  const regex =
    /### Exercise \d+:\s*(.+?)\n([\s\S]*?)(?=\n### Exercise \d+:|\n## |\n---\s*\n## |$)/g
  let match

  while ((match = regex.exec(content)) !== null) {
    const titleText = match[1]
    if (!titleText) continue
    const title = titleText.trim()
    const body = match[2] || ''

    const goalMatch = body.match(/\*\*Goal\*\*:\s*(.+)/)
    const goalText = goalMatch?.[1]
    const goal = goalText ? goalText.trim() : ''

    const codeRegex = /```(?:python|py)\s*\n([\s\S]*?)```/g
    let codeMatch
    const codeBlocks = []
    while ((codeMatch = codeRegex.exec(body)) !== null) {
      const code = codeMatch[1]
      if (code) codeBlocks.push(code.trim())
    }

    const expectedMatch = body.match(
      /\*\*Expected Output[:\s]*\*\*[\s\S]*?```(?:text|)\s*\n([\s\S]*?)```/
    )
    const expectedOutput = expectedMatch?.[1]?.trim()

    exercises.push({
      title,
      goal,
      starterCode: codeBlocks[0] || '',
      expectedOutput,
      tags: [],
    })
  }

  return exercises
}
