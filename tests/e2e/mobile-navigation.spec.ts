import { test, expect } from '@playwright/test'

test.describe('mobile navigation flow', () => {
  test.skip(({ isMobile }) => !isMobile, 'Only relevant for mobile viewport')

  test('bottom nav routes between main sections', async ({ page }) => {
    await page.goto('/#/')

    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' })
    await expect(mobileNav).toBeVisible()

    await mobileNav.getByRole('link', { name: /Learn/i }).click()
    await expect(page).toHaveURL(/#\/curriculum$/)

    await mobileNav.getByRole('link', { name: /Progress/i }).click()
    await expect(page).toHaveURL(/#\/progress$/)

    await mobileNav.getByRole('link', { name: /Explore/i }).click()
    await expect(page).toHaveURL(/#\/concepts$/)
  })
})
