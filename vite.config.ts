import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/Coding-For-MBA/',
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Normalize path separators for Windows
          const normalId = id.replace(/\\/g, '/')

          if (
            normalId.includes('node_modules/react-syntax-highlighter') ||
            normalId.includes('node_modules/refractor') ||
            normalId.includes('node_modules/prismjs')
          ) {
            return 'syntax-highlighter'
          }
          if (normalId.includes('node_modules/react-dom/')) {
            return 'react-dom'
          }
          if (
            normalId.includes('node_modules/react/') ||
            normalId.includes('node_modules/react-router') ||
            normalId.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor'
          }
          if (
            normalId.includes('node_modules/react-markdown') ||
            normalId.includes('node_modules/remark') ||
            normalId.includes('node_modules/rehype') ||
            normalId.includes('node_modules/unified') ||
            normalId.includes('node_modules/mdast') ||
            normalId.includes('node_modules/hast') ||
            normalId.includes('node_modules/micromark') ||
            normalId.includes('node_modules/vfile')
          ) {
            return 'markdown'
          }
          if (normalId.includes('node_modules/d3')) {
            return 'd3-vendor'
          }
          if (normalId.includes('node_modules/fuse.js')) {
            return 'search'
          }
          // Split lesson content files into their own chunk
          if (normalId.includes('/Lessons/') && normalId.includes('README.md')) {
            return 'lesson-content'
          }
          if (normalId.includes('/Lessons/') && normalId.includes('Phase_Overview.md')) {
            return 'phase-content'
          }
        },
      },
    },
  },
})
