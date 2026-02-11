import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Coding-For-MBA/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'syntax-highlighter': ['react-syntax-highlighter'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown': ['react-markdown', 'remark-gfm', 'rehype-raw'],
          'search': ['fuse.js'],
        },
      },
    },
  },
})
