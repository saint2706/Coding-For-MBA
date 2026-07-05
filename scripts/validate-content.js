/**
 * Content Validation Script
 * Checks lesson/phase markdown frontmatter, phase metadata consistency,
 * and extracted exercise data schemas.
 * Run: node scripts/validate-content.js
 */

/**
 * Content Validation Script
 *
 * A CI/CD tool to verify the integrity of the curriculum's Markdown content.
 * Ensures that all lessons have valid frontmatter, exercises have correct
 * structures, and phase metadata matches the file system.
 *
 * Key Responsibilities:
 * - Scan all `README.md` and `Phase_Overview.md` files.
 * - Validate Frontmatter against Zod schemas.
 * - Verify that exercise code blocks and goals are present.
 * - Cross-check phase day counts with actual lesson files.
 * - Report errors to the console and exit with a status code.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  normalizeMarkdownLineEndings,
  parseNormalizedMarkdown,
} from '../src/utils/frontmatter-core.js'
import {
  lessonFrontmatterSchema,
  phaseOverviewFrontmatterSchema,
  exerciseSchema,
} from './content-schemas.js'
import {
  compareDayTokens,
  dayTokenFromPath,
  normalizeDayToken,
} from '../src/utils/dayToken-core.js'
import { extractExercisesFromContent } from '../src/utils/exercise-extractor-core.js'
import { findStructuralIssues } from '../src/utils/content-structure-core.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LESSONS_DIR = path.join(__dirname, '..', 'content', 'lessons')

/**
 * Recursively searches a directory for `README.md` and `Phase_Overview.md` files.
 * Ignores the 'extras' directory.
 *
 * @param {string} dir - The directory to search within.
 * @param {string} [lessonsDir=LESSONS_DIR] - The root lessons directory to use for relative path checks.
 * @returns {string[]} An array of absolute file paths to the found markdown files.
 */
export function findReadmes(dir, lessonsDir = LESSONS_DIR) {
  const results = []
  if (!fs.existsSync(dir)) return results

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'extras') continue
      results.push(...findReadmes(fullPath, lessonsDir))
    } else if (
      (entry.name === 'README.md' || entry.name === 'Phase_Overview.md') &&
      dir !== lessonsDir
    ) {
      results.push(fullPath)
    }
  }

  return results
}

function formatZodIssues(error, prefix = 'Invalid') {
  return error.issues.map((issue) => {
    const pathLabel = issue.path.length > 0 ? issue.path.join('.') : 'frontmatter'
    return `${prefix} ${pathLabel}: ${issue.message}`
  })
}

function parseAndValidateMarkdown(rawContent, fileName = 'README.md') {
  const normalizedContent = normalizeMarkdownLineEndings(rawContent)
  const { frontmatter: fields, content: body } = parseNormalizedMarkdown(normalizedContent)
  const fileErrors = []

  if (Object.keys(fields).length === 0) {
    return { fields, body, fileErrors: ['Missing frontmatter block'] }
  }

  const schema =
    fileName === 'Phase_Overview.md' ? phaseOverviewFrontmatterSchema : lessonFrontmatterSchema
  const result = schema.safeParse(fields)
  if (!result.success) {
    fileErrors.push(...formatZodIssues(result.error))
  }

  if (body.trim().length < 100) {
    fileErrors.push('Content body is suspiciously short (< 100 chars)')
  }

  return { fields, body, fileErrors }
}

function extractExercisesFromLesson(fields, body) {
  return extractExercisesFromContent(body).map((ex) => ({
    day: fields.day,
    lessonTitle: fields.title,
    phase: fields.phase,
    difficulty: fields.difficulty,
    title: ex.title,
    goal: ex.goal,
    starterCode: ex.starterCode,
    expectedOutput: ex.expectedOutput,
  }))
}

function getPhaseRoot(filePath, lessonsDir) {
  const relative = path.relative(lessonsDir, filePath)
  return relative.split(path.sep)[0]
}

/**
 * Validates the content of a single lesson or phase markdown file.
 * This function is useful for linting content on the fly, e.g. in tests.
 *
 * @param {string} rawContent - The raw markdown content to validate.
 * @param {string} [fileName='README.md'] - The file name, used to determine the correct validation schema.
 * @returns {string[]} An array of validation error messages. Empty if valid.
 */
export function validateLessonContent(rawContent, fileName = 'README.md') {
  return parseAndValidateMarkdown(rawContent, fileName).fileErrors
}

/**
 * Checks a lesson body's `### Exercise N` / `### Question N` sections against
 * the structural assumptions `findInteractiveBlocks` relies on to parse them.
 * A missing `<details>` answer block always fails validation (no lesson in
 * the curriculum currently omits one, so this is a safe hard gate). Missing
 * `**Goal**` paragraphs or code blocks on exercises are reported as
 * non-blocking warnings by default — a large share of existing exercises are
 * intentionally code-free discussion prompts — and only fail validation when
 * `strict` is enabled, so the check can be tightened once content is cleaned
 * up incrementally.
 *
 * @param {string} body - The lesson's Markdown body (frontmatter stripped).
 * @param {boolean} strict - Whether to treat exercise structural issues as errors too.
 * @returns {{ errors: string[], warnings: string[] }}
 */
function checkStructuralIssues(body, strict) {
  const issues = findStructuralIssues(body)
  const errors = []
  const warnings = []

  for (const issue of issues) {
    const message = `${issue.type === 'exercise' ? 'Exercise' : 'Question'} ${issue.message}`
    if (issue.type === 'mastery' || strict) {
      errors.push(message)
    } else {
      warnings.push(message)
    }
  }

  return { errors, warnings }
}

/**
 * Executes the main validation pipeline for all curriculum files.
 * Validates frontmatter, extracts exercises, and cross-checks phase metadata against the filesystem.
 *
 * @param {string} [lessonsDir=LESSONS_DIR] - The root directory of the curriculum to validate.
 * @param {{ strict?: boolean }} [options] - `strict: true` also fails validation on exercises
 *   missing a **Goal** paragraph or code block (see `checkStructuralIssues`).
 * @returns {number} An exit code: 0 if all validations pass, 1 if any file fails.
 */
export function runValidation(lessonsDir = LESSONS_DIR, { strict = false } = {}) {
  const files = findReadmes(lessonsDir, lessonsDir).sort()
  const totalFiles = files.length
  const fileResults = new Map()
  const crossCheckFailures = []
  const structuralWarningsByFile = new Map()

  console.log(`\n📋 Validating ${totalFiles} lesson files...\n`)

  const phaseFiles = files.filter((file) => path.basename(file) === 'Phase_Overview.md')
  const lessonFiles = files.filter((file) => path.basename(file) === 'README.md')
  const phaseFileByDir = new Map()
  const phaseMetadata = new Map()

  for (const filePath of files) {
    const relativePath = path.relative(lessonsDir, filePath)
    const fileName = path.basename(filePath)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { fields, body, fileErrors } = parseAndValidateMarkdown(fileContent, fileName)

    if (fileName === 'Phase_Overview.md' && fileErrors.length === 0) {
      const phaseRoot = getPhaseRoot(filePath, lessonsDir)
      phaseMetadata.set(phaseRoot, fields)
      phaseFileByDir.set(phaseRoot, filePath)
    }

    if (fileName === 'README.md' && fileErrors.length === 0) {
      const exercises = extractExercisesFromLesson(fields, body)
      for (const exercise of exercises) {
        const result = exerciseSchema.safeParse(exercise)
        if (!result.success) {
          fileErrors.push(...formatZodIssues(result.error, 'Invalid exercise'))
        }
      }

      const { errors: structuralErrors, warnings: structuralWarnings } = checkStructuralIssues(
        body,
        strict,
      )
      fileErrors.push(...structuralErrors)
      if (structuralWarnings.length > 0) {
        structuralWarningsByFile.set(relativePath, structuralWarnings)
      }
    }

    fileResults.set(relativePath, [...fileErrors])
  }

  // Cross-check phase metadata against lesson files in each phase directory
  const lessonsByPhaseDir = new Map()
  for (const lessonFile of lessonFiles) {
    const phaseDir = getPhaseRoot(lessonFile, lessonsDir)
    const list = lessonsByPhaseDir.get(phaseDir) ?? []
    const dayToken = dayTokenFromPath(lessonFile)
    if (dayToken) {
      list.push(dayToken)
    }
    lessonsByPhaseDir.set(phaseDir, list)
  }

  for (const [phaseDir, overviewPath] of phaseFileByDir.entries()) {
    const overview = phaseMetadata.get(phaseDir)
    if (!overview) continue

    const phaseLessons = lessonsByPhaseDir.get(phaseDir) ?? []
    const expectedDays = [...new Set(phaseLessons.map((day) => normalizeDayToken(day)))].sort(
      compareDayTokens,
    )
    const actualDays = [
      ...new Set((overview.days ?? []).map((day) => normalizeDayToken(day))),
    ].sort(compareDayTokens)

    const mismatchedDays =
      expectedDays.length !== actualDays.length ||
      expectedDays.some((value, idx) => value !== actualDays[idx])

    const phaseIssues = []
    if (mismatchedDays) {
      phaseIssues.push(
        `Phase days mismatch: overview has [${actualDays.join(', ')}], lessons have [${expectedDays.join(', ')}]`,
      )
    }
    if (phaseIssues.length > 0) {
      const relativePath = path.relative(lessonsDir, overviewPath)
      const existingIssues = fileResults.get(relativePath) ?? []
      fileResults.set(relativePath, [...existingIssues, ...phaseIssues])
      crossCheckFailures.push({ file: relativePath, issues: phaseIssues })
    }
  }

  const failedFiles = [...fileResults.entries()]
    .filter(([, issues]) => issues.length > 0)
    .map(([file, issues]) => ({ file, issues }))
  const failCount = failedFiles.length
  const passCount = totalFiles - failCount

  console.log(`✅ Passed files: ${passCount}/${totalFiles}`)
  console.log(`❌ Failed files: ${failCount}/${totalFiles}`)
  console.log(`🔎 Cross-check failures: ${crossCheckFailures.length}`)
  if (structuralWarningsByFile.size > 0) {
    const warningCount = [...structuralWarningsByFile.values()].reduce(
      (sum, warnings) => sum + warnings.length,
      0,
    )
    console.log(
      `⚠️  Structural warnings (non-blocking, use --strict to enforce): ${warningCount} in ${structuralWarningsByFile.size} file(s)`,
    )
  }

  if (failCount > 0) {
    console.log('\n📄 File-level failures:\n')
    for (const { file, issues } of failedFiles) {
      console.log(`  📄 ${file}`)
      for (const issue of issues) {
        console.log(`     ⚠ ${issue}`)
      }
      console.log()
    }

    if (crossCheckFailures.length > 0) {
      console.log('🔎 Cross-check failures:\n')
      for (const { file, issues } of crossCheckFailures) {
        console.log(`  📄 ${file}`)
        for (const issue of issues) {
          console.log(`     ⚠ ${issue}`)
        }
        console.log()
      }
    }

    return 1
  }

  if (structuralWarningsByFile.size > 0) {
    console.log('\n📄 Structural warnings:\n')
    for (const [file, warnings] of structuralWarningsByFile.entries()) {
      console.log(`  📄 ${file}`)
      for (const warning of warnings) {
        console.log(`     ⚠ ${warning}`)
      }
      console.log()
    }
  }

  console.log('\n🎉 All lessons have valid frontmatter and metadata!\n')
  return 0
}

const isMainModule =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMainModule) {
  const strict = process.argv.includes('--strict')
  process.exit(runValidation(LESSONS_DIR, { strict }))
}
