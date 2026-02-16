#!/usr/bin/env node

/**
 * Content Validation Script
 * Checks all 108 lesson READMEs have required frontmatter fields.
 * Run: node scripts/validate-content.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  normalizeLineEndingsForScripts,
  parseNormalizedMarkdownForScripts,
} from './frontmatter-parser.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LESSONS_DIR = path.join(__dirname, '..', 'content', 'lessons')
const REQUIRED_FIELDS = ['day', 'title', 'phase', 'difficulty', 'duration']

export function findReadmes(dir, lessonsDir = LESSONS_DIR) {
  const results = []
  if (!fs.existsSync(dir)) return results

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findReadmes(fullPath, lessonsDir))
    } else if (entry.name === 'README.md' && dir !== lessonsDir) {
      results.push(fullPath)
    }
  }

  return results
}

export function validateLessonContent(rawContent) {
  const normalizedContent = normalizeLineEndingsForScripts(rawContent)
  const { frontmatter: fields, content: body } =
    parseNormalizedMarkdownForScripts(normalizedContent)
  const fileErrors = []

  if (Object.keys(fields).length === 0) {
    fileErrors.push('Missing frontmatter block')
    return fileErrors
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in fields)) {
      fileErrors.push(`Missing required field: ${field}`)
    }
  }

  if (fields.day !== undefined && isNaN(Number(fields.day))) {
    fileErrors.push(`"day" should be a number, got: ${fields.day}`)
  }
  if (fields.phase !== undefined && isNaN(Number(fields.phase))) {
    fileErrors.push(`"phase" should be a number, got: ${fields.phase}`)
  }
  if (fields.duration !== undefined && isNaN(Number(fields.duration))) {
    fileErrors.push(`"duration" should be a number, got: ${fields.duration}`)
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
    const fileErrors = validateLessonContent(fileContent)

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
