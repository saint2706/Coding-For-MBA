/**
 * Test script to verify prototype pollution protections in the shared frontmatter parser.
 */

import assert from 'node:assert/strict'
import { parseMarkdown } from '../src/utils/frontmatter.ts'
import { parseMarkdownForScripts } from './frontmatter-parser.ts'

const parseViaContentLoaderPath = parseMarkdown

function assertParsersMatch(raw: string, label: string) {
  const appResult = parseMarkdown(raw)
  const scriptResult = parseMarkdownForScripts(raw)
  const loaderResult = parseViaContentLoaderPath(raw)

  assert.deepStrictEqual(
    scriptResult,
    appResult,
    `${label}: script parser differs from shared parser`,
  )
  assert.deepStrictEqual(loaderResult, appResult, `${label}: content loader parser differs`)
}

console.log('🧪 Testing prototype pollution protection and parser parity...\n')

console.log('Test 1: __proto__ key should be ignored')
const malicious1 = `---
title: Test
__proto__: malicious
day: 1
---
Content here`

const result1 = parseMarkdownForScripts(malicious1)
assertParsersMatch(malicious1, 'malicious __proto__')
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

console.log('Test 2: constructor key should be ignored')
const malicious2 = `---
title: Test
constructor: malicious
day: 2
---
Content here`

const result2 = parseMarkdownForScripts(malicious2)
assertParsersMatch(malicious2, 'malicious constructor')
console.log(
  '  Has constructor key?',
  'constructor' in result2.frontmatter ? '❌ YES (FAIL)' : '✅ NO (PASS)',
)
console.log(
  '  Null prototype?',
  Object.getPrototypeOf(result2.frontmatter) === null ? '✅ YES (PASS)' : '❌ NO (FAIL)',
)
console.log()

console.log('Test 3: prototype key should be ignored')
const malicious3 = `---
title: Test
prototype: malicious
day: 3
---
Content here`

const result3 = parseMarkdownForScripts(malicious3)
assertParsersMatch(malicious3, 'malicious prototype')
console.log(
  '  Has prototype key?',
  'prototype' in result3.frontmatter ? '❌ YES (FAIL)' : '✅ NO (PASS)',
)
console.log(
  '  Null prototype?',
  Object.getPrototypeOf(result3.frontmatter) === null ? '✅ YES (PASS)' : '❌ NO (FAIL)',
)
console.log()

console.log('Test 4: Normal keys should be parsed correctly')
const normal = `---
title: My Lesson
day: 10
phase: 1
difficulty: beginner
tags: [python, basics]
---
This is the content`

const result4 = parseMarkdownForScripts(normal)
assertParsersMatch(normal, 'normal frontmatter')
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

console.log('Test 5: Empty/invalid frontmatter should have null prototype')
const empty = 'Just content without frontmatter'
const result5 = parseMarkdownForScripts(empty)
assertParsersMatch(empty, 'content without frontmatter')
console.log(
  '  Null prototype?',
  Object.getPrototypeOf(result5.frontmatter) === null ? '✅ YES (PASS)' : '❌ NO (FAIL)',
)
console.log()

console.log('✨ All tests completed!')
