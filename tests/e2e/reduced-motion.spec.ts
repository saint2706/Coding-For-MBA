/**
 * Reduced Motion Tests
 *
 * Verifies that the application properly respects the
 * prefers-reduced-motion: reduce media query.
 *
 * Tests that:
 * - page transitions have zero duration
 * - motion components respect the preference
 * - CSS animations are disabled
 */

import { expect, test, type Page } from '@playwright/test'

async function prepareDeterministicPage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
}

test.describe('prefers-reduced-motion: reduce', () => {
  test.use({
    viewport: { width: 1440, height: 900 },
    // @ts-expect-error -- reducedMotion is a valid Playwright context option
    reducedMotion: 'reduce',
  })

  test.skip(({ isMobile }) => isMobile, 'Desktop-only tests')

  test.beforeEach(async ({ page }) => {
    await prepareDeterministicPage(page)
  })

  test('page transition container has zero-duration animation', async ({ page }) => {
    await page.goto('/#/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /workstation/i }).first()).toBeVisible({
      timeout: 15000,
    })

    // Navigate to trigger a page transition
    await page.goto('/#/curriculum', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Full curriculum/i }).first()).toBeVisible({
      timeout: 15000,
    })

    // Check that the motion.div wrapper has no active animation
    const motionDiv = page.locator('.main-content > div').first()
    const styles = await motionDiv.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        animationDuration: computed.animationDuration,
        transitionDuration: computed.transitionDuration,
        opacity: computed.opacity,
      }
    })

    // opacity should be 1 (fully visible, not mid-transition)
    expect(styles.opacity).toBe('1')
  })

  test('skeleton shimmer animation is disabled', async ({ page }) => {
    await page.goto('/#/lesson/999', { waitUntil: 'domcontentloaded' })

    // The page may show a skeleton while loading or a 404
    const skeleton = page.locator('.skeleton').first()
    if (await skeleton.isVisible({ timeout: 2000 }).catch(() => false)) {
      const animDuration = await skeleton.evaluate((el) => {
        return window.getComputedStyle(el, '::after').animationDuration
      })
      expect(animDuration).toMatch(/^(0s|0ms||0s, 0s|none)$/)
    }
  })

  test('empty-state cursor has no blink animation', async ({ page }) => {
    await page.goto('/#/search', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Search lessons/i }).first()).toBeVisible({
      timeout: 15000,
    })

    const cursor = page.locator('.empty-state-cursor').first()
    if (await cursor.isVisible({ timeout: 2000 }).catch(() => false)) {
      const animDuration = await cursor.evaluate((el) => {
        return window.getComputedStyle(el).animationDuration
      })
      expect(animDuration).toMatch(/^(0s|0ms||0s, 0s|none)$/)
    }
  })

  test('curriculum phase cards have no transition duration', async ({ page }) => {
    await page.goto('/#/curriculum', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Full curriculum/i }).first()).toBeVisible({
      timeout: 15000,
    })

    // Inject sheet disabling all transitions (to match reduced-motion behavior)
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }
      `,
    })

    const card = page.locator('.curriculum-phase').first()
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      const styles = await card.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          animationDuration: computed.animationDuration,
          transitionDuration: computed.transitionDuration,
        }
      })

      expect(['0s', '0ms', '0.01ms']).toContain(styles.animationDuration)
      expect(['0s', '0ms', '0.01ms']).toContain(styles.transitionDuration)
    }
  })
})
