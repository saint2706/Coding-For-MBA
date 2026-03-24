#!/bin/bash
npx vitest run --coverage.enabled --coverage.include="src/stores/gamificationStore.ts" src/stores/__tests__/gamificationStore.test.ts
