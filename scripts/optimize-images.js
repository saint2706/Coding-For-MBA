#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Converts PNG and JPG images in public/ to WebP and AVIF formats
 * using the sharp library.
 *
 * Usage:
 *   pnpm run optimize:images
 *   node scripts/optimize-images.js
 *
 * Prerequisites:
 *   pnpm add -D sharp
 */

import { readdirSync, existsSync } from 'node:fs'
import { resolve, extname, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const publicDir = resolve(root, 'public')
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg'])

async function optimizeImages() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('❌ sharp is not installed. Run: pnpm add -D sharp')
    process.exit(1)
  }

  if (!existsSync(publicDir)) {
    console.log('No public/ directory found. Nothing to optimize.')
    return
  }

  const files = readdirSync(publicDir, { recursive: true, withFileTypes: true }).filter(
    (entry) => entry.isFile() && EXTENSIONS.has(extname(entry.name).toLowerCase()),
  )

  if (files.length === 0) {
    console.log('No PNG/JPG images found in public/. Nothing to optimize.')
    return
  }

  console.log(`🖼️  Found ${files.length} image(s) to optimize...\n`)

  let converted = 0
  for (const entry of files) {
    const inputPath = resolve(entry.parentPath || entry.path, entry.name)
    const nameWithoutExt = basename(entry.name, extname(entry.name))
    const outputDir = entry.parentPath || entry.path

    try {
      const image = sharp(inputPath)

      const webpPath = resolve(outputDir, `${nameWithoutExt}.webp`)
      if (!existsSync(webpPath)) {
        await image.webp({ quality: 80 }).toFile(webpPath)
        console.log(`  ✓ ${entry.name} → ${nameWithoutExt}.webp`)
        converted++
      }

      const avifPath = resolve(outputDir, `${nameWithoutExt}.avif`)
      if (!existsSync(avifPath)) {
        await image.avif({ quality: 65 }).toFile(avifPath)
        console.log(`  ✓ ${entry.name} → ${nameWithoutExt}.avif`)
        converted++
      }
    } catch (err) {
      console.error(`  ✗ Failed to convert ${entry.name}: ${err.message}`)
    }
  }

  console.log(`\n✅ Done. Generated ${converted} optimized image(s).`)
}

optimizeImages()
