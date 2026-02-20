import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/stores/progressStore.ts',
        'src/stores/quizStore.ts',
        'scripts/content-schemas.js',
      ],
      exclude: ['src/**/*.d.ts'],
      thresholds: {
        lines: 80,
      },
    },
  },
})
