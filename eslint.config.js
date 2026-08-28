import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'coverage',
      'playwright-report',
      'test-results',
      '.playwright-artifacts',
      'graphify-out',
      'public/sitemap.xml',
      '**/*.d.ts',
    ],
  },

  // Browser app source (React + TS)
  {
    files: ['src/**/*.{ts,tsx}', 'tests/unit/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.es2023 },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Only the long-standing, stable pair — not eslint-plugin-react-hooks
      // v7's bundled React Compiler-readiness rules (purity, immutability,
      // set-state-in-effect, etc.). This project hasn't adopted the
      // compiler, and those rules flag ordinary, correct React patterns
      // (e.g. a per-render-scoped counter, or setState at the top of a
      // data-fetching effect) as errors.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Test files: allow vitest/testing-library globals, relax a11y strictness
  // for deliberately-broken fixtures used to exercise error states.
  {
    files: ['tests/unit/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  // Files that deliberately co-export a component with a tightly-coupled
  // non-component value (a config object the component consumes, a parser
  // it depends on, a comparator only a unit test imports directly). Fast
  // Refresh falls back to a full reload editing these files — a DX cost, not
  // a correctness issue — which is a reasonable trade against fragmenting
  // small, cohesive modules or breaking existing test-mocking strategies.
  {
    files: [
      'src/components/MarkdownFragment.tsx',
      'src/components/MarkdownRenderer.tsx',
      'src/components/SidebarPhaseGroup.tsx',
      'src/utils/iconRegistry.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: [
            'markdownComponents',
            'lessonSanitizerSchema',
            'rehypePlugins',
            'remarkPlugins',
            'findInteractiveBlocks',
            'ParsedMasteryQuestion',
            'ParsedExercise',
            'propsAreEqual',
            'ICON_REGISTRY',
            'IconName',
          ],
        },
      ],
    },
  },

  // Node-side scripts (build tooling, plain JS/TS)
  {
    files: ['scripts/**/*.{js,cjs,ts}', '*.config.{js,ts}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // .cjs files are genuinely CommonJS — require() is the correct, idiomatic
  // way to import there, not a legacy pattern to flag.
  {
    files: ['scripts/**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    files: ['tests/e2e/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  eslintConfigPrettier,
)
