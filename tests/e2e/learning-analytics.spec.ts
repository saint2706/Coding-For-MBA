import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'coding-for-mba-learning-analytics'

test('records study time when navigating away from a lesson', async ({ page }) => {
  await page.goto('/#/lesson/1')
  await page.waitForTimeout(1100)
  await page.goto('/#/progress')

  const persisted = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)
  expect(persisted).toBeTruthy()

  const parsed = JSON.parse(persisted || '{}') as {
    state?: { timeByLessonDay?: Record<string, number> }
  }

  const lessonMs = parsed.state?.timeByLessonDay?.['1'] || 0
  expect(lessonMs).toBeGreaterThan(500)
})
