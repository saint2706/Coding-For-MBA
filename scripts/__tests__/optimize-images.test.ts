import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../..')
const SCRIPT_PATH = path.join(ROOT, 'scripts/optimize-images.js')
const PUBLIC_DIR = path.join(ROOT, 'public')

describe('optimize-images.js', () => {
  beforeEach(() => {
    // We only test that the script handles no files or sharp not installed gracefully
  })

  it('should run gracefully when there are no images', () => {
     let output = ''
     try {
       output = execSync(`node ${SCRIPT_PATH}`, { encoding: 'utf-8' })
     } catch (e: any) {
       // Sharp might not be installed, in which case it exits with 1
       if (e.status === 1) {
         const stderr = e.stderr?.toString() || ''
         const stdout = e.stdout?.toString() || ''

         if (stderr.includes('sharp is not installed') || stdout.includes('sharp is not installed')) {
            return; // Expected if sharp is missing
         }
       }
       throw e;
     }

     expect(output).toContain('No PNG/JPG images found')
  })
})
