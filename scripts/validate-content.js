/**
 * Content Validation Script
 * Checks lesson READMEs have required frontmatter fields.
 * Run: node scripts/validate-content.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  normalizeLineEndingsForScripts,
  parseNormalizedMarkdownForScripts,
} from './frontmatter-parser.js'
import { lessonFrontmatterSchema, phaseOverviewFrontmatterSchema } from './content-schemas.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LESSONS_DIR = path.join(__dirname, '..', 'content', 'lessons')

export function findReadmes(dir, lessonsDir = LESSONS_DIR) {
  const results = []
  if (!fs.existsSync(dir)) return results

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
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

function formatZodIssues(error) {
  return error.issues.map((issue) => {
    const pathLabel = issue.path.length > 0 ? issue.path.join('.') : 'frontmatter'
    return `Invalid ${pathLabel}: ${issue.message}`
  })
}

export function validateLessonContent(rawContent, fileName = 'README.md') {
  const normalizedContent = normalizeLineEndingsForScripts(rawContent)
  const { frontmatter: fields, content: body } =
    parseNormalizedMarkdownForScripts(normalizedContent)
  const fileErrors = []

  if (Object.keys(fields).length === 0) {
    fileErrors.push('Missing frontmatter block')
    return fileErrors
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

  return fileErrors
}

export function runValidation(lessonsDir = LESSONS_DIR) {
  const readmes = findReadmes(lessonsDir, lessonsDir).sort()
  const totalFiles = readmes.length
  let passCount = 0
  let failCount = 0
  const errors = []

  console.log(`\n📋 Validating ${totalFiles} lesson files...\n`)

  for (const filePath of readmes) {
    const relativePath = path.relative(lessonsDir, filePath)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const fileErrors = validateLessonContent(fileContent, path.basename(filePath))

    if (fileErrors.length > 0) {
      failCount++
      errors.push({ file: relativePath, issues: fileErrors })
    } else {
      passCount++
    }
  }

  console.log(`✅ Passed: ${passCount}/${totalFiles}`)

  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}/${totalFiles}\n`)
    for (const { file, issues } of errors) {
      console.log(`  📄 ${file}`)
      for (const issue of issues) {
        console.log(`     ⚠ ${issue}`)
      }
      console.log()
    }
    return 1
  }

  console.log('\n🎉 All lessons have valid frontmatter!\n')
  return 0
}

const isMainModule =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMainModule) {
  process.exit(runValidation())
}
