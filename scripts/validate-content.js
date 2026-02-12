#!/usr/bin/env node

/**
 * Content Validation Script
 * Checks all 108 lesson READMEs have required frontmatter fields.
 * Run: node scripts/validate-content.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LESSONS_DIR = path.join(__dirname, '..', 'Lessons')
const REQUIRED_FIELDS = ['day', 'title', 'phase', 'difficulty', 'duration']
const OPTIONAL_FIELDS = ['tags', 'concepts', 'prerequisites']

let totalFiles = 0
let passCount = 0
let failCount = 0
const errors = []

function parseFrontmatter(content) {
    if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) return null
    const endIdx = content.indexOf('\n---\n', 4)
    if (endIdx === -1) {
        const endIdx2 = content.indexOf('\r\n---\r\n', 5)
        if (endIdx2 === -1) return null
        return content.slice(content.indexOf('\n') + 1, endIdx2)
    }
    return content.slice(content.indexOf('\n') + 1, endIdx)
}

function parseYamlSimple(yaml) {
    const fields = {}
    let currentKey = null
    let currentArray = null

    for (const line of yaml.split(/\r?\n/)) {
        const arrMatch = line.match(/^\s+-\s+(.+)$/)
        if (arrMatch && currentKey) {
            if (!currentArray) {
                currentArray = []
                fields[currentKey] = currentArray
            }
            currentArray.push(arrMatch[1].trim().replace(/^['"]|['"]$/g, ''))
            continue
        }

        const kvMatch = line.match(/^(\w+):\s*(.*)$/)
        if (kvMatch) {
            currentKey = kvMatch[1]
            currentArray = null
            const val = kvMatch[2].trim()
            if (val) fields[currentKey] = val
        }
    }

    return fields
}

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
    const content = fs.readFileSync(filePath, 'utf8')
    const yamlStr = parseFrontmatter(content)

    if (!yamlStr) {
        failCount++
        errors.push({ file: relativePath, issues: ['Missing frontmatter block'] })
        continue
    }

    const fields = parseYamlSimple(yamlStr)
    const fileErrors = []

    for (const field of REQUIRED_FIELDS) {
        if (!(field in fields)) {
            fileErrors.push(`Missing required field: ${field}`)
        }
    }

    // Type checks
    if (fields.day && isNaN(Number(fields.day))) {
        fileErrors.push(`"day" should be a number, got: ${fields.day}`)
    }
    if (fields.phase && isNaN(Number(fields.phase))) {
        fileErrors.push(`"phase" should be a number, got: ${fields.phase}`)
    }
    if (fields.duration && isNaN(Number(fields.duration))) {
        fileErrors.push(`"duration" should be a number, got: ${fields.duration}`)
    }

    // Content length check
    const bodyContent = content.slice(content.indexOf('\n---\n') + 5)
    if (bodyContent.trim().length < 100) {
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
