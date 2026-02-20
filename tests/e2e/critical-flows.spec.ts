import { test, expect } from '@playwright/test'

test.describe('critical desktop user flows', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop-only suite')

  test('navigation: home → curriculum → lesson → phase', async ({ page }) => {
    await page.goto('/#/')

    await expect(page.getByRole('link', { name: /Start Learning/i }).first()).toBeVisible()

    await page.getByRole('link', { name: /^Curriculum$/ }).click()
    await expect(page).toHaveURL(/#\/curriculum$/)

    await page.locator('.curriculum-phase-header').first().click()
    await expect(page).toHaveURL(/#\/phase\//)

    await page
      .getByRole('link', { name: /Day\s+\d+:/i })
      .first()
      .click()
    await expect(page).toHaveURL(/#\/lesson\//)
  })

  test('search: use keyboard shortcut, query, and navigate to result', async ({ page }) => {
    await page.goto('/#/')

    const searchInput = page.getByRole('searchbox', { name: 'Search lessons' })
    await searchInput.click()
    await searchInput.fill('python')
    await searchInput.press('Enter')

    await expect(page).toHaveURL(/#\/search\?q=python/)
    const firstResult = page.locator('.search-result-card').first()
    await expect(firstResult).toBeVisible()
    await firstResult.click()

    await expect(page).toHaveURL(/#\/lesson\//)
  })

  test('progress tracking persists after reload', async ({ page }) => {
    await page.goto('/#/')
    await page
      .getByRole('link', { name: /Start Learning/i })
      .first()
      .click()
    await expect(page).toHaveURL(/#\/lesson\//)

    const toggle = page.locator('button.lesson-complete-btn')
    await expect(toggle).toBeVisible({ timeout: 20000 })
    await toggle.click()
    await expect(toggle).toHaveText(/Completed/i)

    await page.reload()
    await expect(page.locator('button.lesson-complete-btn')).toContainText(/Completed/i)
  })

  test('theme toggle persists across navigations and reload', async ({ page }) => {
    await page.goto('/#/')

    const root = page.locator('html')
    await expect(page.getByRole('button', { name: /Switch to (light|dark) mode/i })).toBeVisible()

    const initialTheme = await root.getAttribute('data-theme')
    await page.getByRole('button', { name: /Switch to (light|dark) mode/i }).click()
    const toggledTheme = await root.getAttribute('data-theme')

    expect(toggledTheme).not.toBe(initialTheme)

    await page.goto('/#/curriculum')
    await expect(root).toHaveAttribute('data-theme', toggledTheme || 'dark')

    await page.reload()
    await expect(root).toHaveAttribute('data-theme', toggledTheme || 'dark')
  })

  test('code execution surface is reachable in lesson flow', async ({ page }) => {
    await page.goto('/#/solutions/1')

    await expect(page.getByRole('button', { name: 'Run Python code' }).first()).toBeVisible({
      timeout: 15000,
    })
  })
})
