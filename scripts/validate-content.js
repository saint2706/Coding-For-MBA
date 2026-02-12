#!/usr/bin/env node

/**
 * Content Validation Script
 * Checks all 108 lesson READMEs have required frontmatter fields.
 * Run: node scripts/validate-content.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMarkdownForScripts } from './frontmatter-parser.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LESSONS_DIR = path.join(__dirname, '..', 'Lessons')
const REQUIRED_FIELDS = ['day', 'title', 'phase', 'difficulty', 'duration']

let totalFiles = 0
let passCount = 0
let failCount = 0
const errors = []

// Find all lesson README.md files
function findReadmes(dir) {
  const results = []
  if (!fs.existsSync(dir)) return results

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findReadmes(fullPath))
    } else if (entry.name === 'README.md' && dir !== LESSONS_DIR) {
      results.push(fullPath)
    }
  }
  return results
}

const readmes = findReadmes(LESSONS_DIR).sort()
totalFiles = readmes.length

console.log(`\n📋 Validating ${totalFiles} lesson files...\n`)

for (const filePath of readmes) {
  const relativePath = path.relative(LESSONS_DIR, filePath)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { frontmatter: fields, content } = parseMarkdownForScripts(fileContent)

  if (Object.keys(fields).length === 0) {
    failCount++
    errors.push({ file: relativePath, issues: ['Missing frontmatter block'] })
    continue
  }

  const fileErrors = []

  for (const field of REQUIRED_FIELDS) {
    if (!(field in fields)) {
      fileErrors.push(`Missing required field: ${field}`)
    }
  }

  // Type checks
  if (fields.day !== undefined && isNaN(Number(fields.day))) {
    fileErrors.push(`"day" should be a number, got: ${fields.day}`)
  }
  if (fields.phase !== undefined && isNaN(Number(fields.phase))) {
    fileErrors.push(`"phase" should be a number, got: ${fields.phase}`)
  }
  if (fields.duration !== undefined && isNaN(Number(fields.duration))) {
    fileErrors.push(`"duration" should be a number, got: ${fields.duration}`)
  }

  // Content length check
  if (content.trim().length < 100) {
    fileErrors.push('Content body is suspiciously short (< 100 chars)')
  }

  if (fileErrors.length > 0) {
    failCount++
    errors.push({ file: relativePath, issues: fileErrors })
  } else {
    passCount++
  }
}

// Report
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
  process.exit(1)
} else {
  console.log('\n🎉 All lessons have valid frontmatter!\n')
}
