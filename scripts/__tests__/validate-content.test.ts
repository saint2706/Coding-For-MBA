import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import {
  findReadmes,
  validateLessonContent,
  runValidation,
} from '../validate-content.js'

// Need a way to mock fs fully
vi.mock('node:fs')

describe('validate-content', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('findReadmes', () => {
    it('should return empty array if dir does not exist', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)
      expect(findReadmes('/fake/dir')).toEqual([])
    })

    it('should find README.md files and ignore extras', () => {
      vi.spyOn(fs, 'existsSync').mockImplementation((pathStr: string | fs.PathLike | URL) => {
        const p = pathStr.toString().replace(/\\/g, '/')
        if (p.includes('/test-dir')) return true
        return false
      })

      vi.spyOn(fs, 'readdirSync').mockImplementation((pathStr: fs.PathLike, options?: { withFileTypes?: boolean }) => {
        const p = pathStr.toString().replace(/\\/g, '/')
        if (p.endsWith('/test-dir') && options?.withFileTypes) {
           return [
             { name: 'README.md', isDirectory: () => false },
             { name: 'Phase_Overview.md', isDirectory: () => false },
             { name: 'extras', isDirectory: () => true },
             { name: 'phase1', isDirectory: () => true }
           ] as unknown as fs.Dirent[]
        }
        if (p.endsWith('/test-dir/phase1') && options?.withFileTypes) {
           return [
             { name: 'README.md', isDirectory: () => false }
           ] as unknown as fs.Dirent[]
        }
        if (p.endsWith('/test-dir/extras') && options?.withFileTypes) {
           return [
             { name: 'README.md', isDirectory: () => false }
           ] as unknown as fs.Dirent[]
        }
        return []
      })

      const files = findReadmes('/test-dir', '/other-dir')

      // Because findReadmes uses path.join internally, the returned strings
      // will have OS-specific separators. So let's map them to posix internally for test assertions
      const normalizedFiles = files.map(f => f.replace(/\\/g, '/'))

      expect(normalizedFiles).toContain('/test-dir/README.md')
      expect(normalizedFiles).toContain('/test-dir/Phase_Overview.md')
      expect(normalizedFiles).toContain('/test-dir/phase1/README.md')
      expect(normalizedFiles).not.toContain('/test-dir/extras/README.md')
    })
  })

  describe('validateLessonContent', () => {
    it('should return no errors for valid content', () => {
      const validContent = `---
day: 1
title: Sample Lesson
phase: 1
difficulty: beginner
duration: 30
---
This is a sample lesson body with enough content to pass validation checks because it clearly exceeds one hundred characters in total length.`
      expect(validateLessonContent(validContent, 'README.md')).toEqual([])
    })

    it('should return errors for missing frontmatter', () => {
      const invalidContent = `Just a plain markdown file with no frontmatter but still enough text to potentially bypass the character length check which requires at least 100 characters.`
      const errors = validateLessonContent(invalidContent, 'README.md')
      expect(errors).toContain('Missing frontmatter block')
    })

    it('should return errors for short body', () => {
      const invalidContent = `---
day: 1
title: Sample Lesson
phase: 1
difficulty: beginner
duration: 30
---
Too short`
      const errors = validateLessonContent(invalidContent, 'README.md')
      expect(errors).toContain('Content body is suspiciously short (< 100 chars)')
    })

    it('should handle Phase_Overview.md schema differences', () => {
        const validPhase = `---
phase: 1
title: Phase 1
description: A phase description
days: [1, 2]
totalDuration: 120
difficulty: beginner
---
This is a sample phase body with enough content to pass validation checks because it clearly exceeds one hundred characters in total length.`
        expect(validateLessonContent(validPhase, 'Phase_Overview.md')).toEqual([])
    })
  })

  describe('runValidation', () => {
    let consoleLogSpy: any;

    beforeEach(() => {
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should return 0 when no files are found', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)
      const exitCode = runValidation('/fake/dir')
      expect(exitCode).toBe(0)
    })

    it('should return 1 when validation fails', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'readdirSync').mockImplementation((pathStr: fs.PathLike, options?: { withFileTypes?: boolean }) => {
        const p = pathStr.toString().replace(/\\/g, '/')
        if (p.endsWith('/test-dir') && options?.withFileTypes) {
           return [
             { name: 'phase1', isDirectory: () => true }
           ] as unknown as fs.Dirent[]
        }
        if (p.endsWith('/test-dir/phase1') && options?.withFileTypes) {
           return [
             { name: 'README.md', isDirectory: () => false }
           ] as unknown as fs.Dirent[]
        }
        return []
      })
      vi.spyOn(fs, 'readFileSync').mockReturnValue(`invalid markdown`)

      const exitCode = runValidation('/test-dir')
      expect(exitCode).toBe(1)
    })

    it('should return 0 when validation passes with Phase Overview', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'readdirSync').mockImplementation((pathStr: fs.PathLike, options?: { withFileTypes?: boolean }) => {
        const p = pathStr.toString().replace(/\\/g, '/')
        if (p.endsWith('/test-dir') && options?.withFileTypes) {
           return [
             { name: 'phase1', isDirectory: () => true }
           ] as unknown as fs.Dirent[]
        }
        if (p.endsWith('/test-dir/phase1') && options?.withFileTypes) {
           return [
             { name: 'README.md', isDirectory: () => false }
           ] as unknown as fs.Dirent[]
        }
        return []
      })

      vi.spyOn(fs, 'readFileSync').mockReturnValue(`---
day: 1
title: Sample Lesson
phase: 1
difficulty: beginner
duration: 30
---
This is a sample lesson body with enough content to pass validation checks because it clearly exceeds one hundred characters in total length.`)

      const exitCode = runValidation('/test-dir')
      expect(exitCode).toBe(0)
    })
  })
})
