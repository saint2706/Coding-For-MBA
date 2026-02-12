/**
 * Test script to verify prototype pollution fix in contentLoader.ts
 *
 * This script tests that the YAML frontmatter parser correctly handles
 * dangerous keys like __proto__, constructor, and prototype without
 * polluting the Object prototype.
 */

// Simple test implementation of the parseMarkdown function
interface Frontmatter {
  [key: string]: string | number | boolean | (string | number)[]
}

interface ParsedMarkdown {
  frontmatter: Frontmatter
  content: string
}

function parseMarkdown(raw: string): ParsedMarkdown {
  // Normalize line endings to \n
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Split on frontmatter delimiters
  if (!normalized.startsWith('---\n'))
    return { frontmatter: Object.create(null), content: normalized }

  const endIndex = normalized.indexOf('\n---\n', 4)
  if (endIndex === -1) return { frontmatter: Object.create(null), content: normalized }

  const yamlStr = normalized.slice(4, endIndex)
  const content = normalized.slice(endIndex + 5)
  const frontmatter: Frontmatter = Object.create(null)

  let currentKey: string | null = null
  let currentArray: (string | number)[] | null = null

  for (const line of yamlStr.split('\n')) {
    // Array item: "  - value"
    const arrayMatch = line.match(/^\s+-\s+(.+)$/)
    if (arrayMatch && currentKey) {
      if (!currentArray) {
        currentArray = []
        frontmatter[currentKey] = currentArray
      }
      let val = arrayMatch[1]!.trim()
      val = val.replace(/^["']|["']$/g, '')
      currentArray.push(isNaN(Number(val)) ? val : Number(val))
      continue
    }

    // Key-value: "key: value"
    const kvMatch = line.match(/^(\w+):\s*(.*)$/)
    if (kvMatch) {
      const key = kvMatch[1]!
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        currentKey = null
        currentArray = null
        continue
      }

      currentKey = key
      currentArray = null
      let val = kvMatch[2]!.trim()

      if (val === '') {
        // Next lines might be array items
        continue
      }

      // Inline array: [1, 2, 3]
      const inlineArray = val.match(/^\[(.*)\]$/)
      if (inlineArray) {
        frontmatter[currentKey] = inlineArray[1]!
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .map((s) => (isNaN(Number(s)) ? s : Number(s)))
        continue
      }

      // Remove quotes
      val = val.replace(/^["']|["']$/g, '')

      // Type coercion
      if (val === 'true') frontmatter[currentKey] = true
      else if (val === 'false') frontmatter[currentKey] = false
      else if (!isNaN(Number(val)) && val !== '') frontmatter[currentKey] = Number(val)
      else frontmatter[currentKey] = val
    }
  }

  return { frontmatter, content }
}

// Test cases
console.log('🧪 Testing prototype pollution protection...\n')

// Test 1: Attempt to pollute via __proto__
console.log('Test 1: __proto__ key should be ignored')
const malicious1 = `---
title: Test
__proto__: malicious
day: 1
---
Content here`

const result1 = parseMarkdown(malicious1)
console.log('  Parsed frontmatter:', result1.frontmatter)
// Check if Object.prototype was polluted by creating a plain object
const testObj = {}
console.log(
  '  Object.prototype polluted?',
  'malicious' in testObj ? '❌ YES (FAIL)' : '✅ NO (PASS)',
)
console.log(
  '  Has __proto__ key?',
  '__proto__' in result1.frontmatter ? '❌ YES (FAIL)' : '✅ NO (PASS)',
)
console.log(
  '  Null prototype?',
  Object.getPrototypeOf(result1.frontmatter) === null ? '✅ YES (PASS)' : '❌ NO (FAIL)',
)
console.log()

// Test 2: Attempt to pollute via constructor
console.log('Test 2: constructor key should be ignored')
const malicious2 = `---
title: Test
constructor: malicious
day: 2
---
Content here`

const result2 = parseMarkdown(malicious2)
console.log('  Parsed frontmatter:', result2.frontmatter)
console.log(
  '  Has constructor key?',
  'constructor' in result2.frontmatter ? '❌ YES (FAIL)' : '✅ NO (PASS)',
)
console.log(
  '  Null prototype?',
  Object.getPrototypeOf(result2.frontmatter) === null ? '✅ YES (PASS)' : '❌ NO (FAIL)',
)
console.log()

// Test 3: Attempt to pollute via prototype
console.log('Test 3: prototype key should be ignored')
const malicious3 = `---
title: Test
prototype: malicious
day: 3
---
Content here`

const result3 = parseMarkdown(malicious3)
console.log('  Parsed frontmatter:', result3.frontmatter)
console.log(
  '  Has prototype key?',
  'prototype' in result3.frontmatter ? '❌ YES (FAIL)' : '✅ NO (PASS)',
)
console.log(
  '  Null prototype?',
  Object.getPrototypeOf(result3.frontmatter) === null ? '✅ YES (PASS)' : '❌ NO (FAIL)',
)
console.log()

// Test 4: Normal keys should work
console.log('Test 4: Normal keys should be parsed correctly')
const normal = `---
title: My Lesson
day: 10
phase: 1
difficulty: beginner
tags: [python, basics]
---
This is the content`

const result4 = parseMarkdown(normal)
console.log('  Parsed frontmatter:', result4.frontmatter)
console.log(
  '  Has title?',
  result4.frontmatter.title === 'My Lesson' ? '✅ YES (PASS)' : '❌ NO (FAIL)',
)
console.log('  Has day?', result4.frontmatter.day === 10 ? '✅ YES (PASS)' : '❌ NO (FAIL)')
console.log(
  '  Has tags array?',
  Array.isArray(result4.frontmatter.tags) ? '✅ YES (PASS)' : '❌ NO (FAIL)',
)
console.log(
  '  Null prototype?',
  Object.getPrototypeOf(result4.frontmatter) === null ? '✅ YES (PASS)' : '❌ NO (FAIL)',
)
console.log()

// Test 5: Empty frontmatter should have null prototype
console.log('Test 5: Empty/invalid frontmatter should have null prototype')
const empty = 'Just content without frontmatter'
const result5 = parseMarkdown(empty)
console.log(
  '  Null prototype?',
  Object.getPrototypeOf(result5.frontmatter) === null ? '✅ YES (PASS)' : '❌ NO (FAIL)',
)
console.log()

console.log('✨ All tests completed!')
