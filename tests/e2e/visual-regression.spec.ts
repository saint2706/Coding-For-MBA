/**
 * Visual Regression Tests
 *
 * Uses Playwright's toHaveScreenshot() for pixel-level comparison
 * against stored baselines. Runs only on Desktop Chrome.
 *
 * First run generates baselines. Subsequent runs compare against them.
 * Use --update-snapshots to regenerate baselines after intentional changes.
 */

import { expect, test, type Page } from '@playwright/test'

async function prepareDeterministicPage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()

    const fixedNow = new Date('2026-01-15T12:00:00.000Z').valueOf()
    Date.now = () => fixedNow
    Math.random = () => 0.123456789
  })
}

async function disableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
      }
      .custom-cursor-dot, .custom-cursor-ring {
        display: none !important;
      }
    `,
  })
}

async function waitForPage(page: Page, route: string, heading: RegExp): Promise<void> {
  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({
    timeout: 15000,
  })
  await disableAnimations(page)
  // Wait for layout to settle
  await page.waitForTimeout(500)
}

test.describe('visual regression', () => {
  test.use({
    viewport: { width: 1440, height: 900 },
    // @ts-expect-error -- reducedMotion is a valid Playwright context option
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  })

  test.skip(({ isMobile }) => isMobile, 'Desktop-only visual regression')

  test.beforeEach(async ({ page }) => {
    await prepareDeterministicPage(page)
  })

  const pages = [
    { route: '/#/', heading: /Master Technical Skills/i, name: 'home' },
    { route: '/#/curriculum', heading: /Full Curriculum Roadmap/i, name: 'curriculum' },
    { route: '/#/lesson/1', heading: /Day 1/i, name: 'lesson-1' },
    {
      route: '/#/progress',
      heading: /Something went wrong|Your Progress/i,
      name: 'progress',
    },
    { route: '/#/exercises', heading: /Exercise Browser/i, name: 'exercises' },
    { route: '/#/search?q=python', heading: /Search lessons/i, name: 'search' },
  ] as const

  for (const pageCase of pages) {
    test(`${pageCase.name} matches baseline`, async ({ page }) => {
      await waitForPage(page, pageCase.route, pageCase.heading)

      await expect(page).toHaveScreenshot(`${pageCase.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      })
    })
  }
})
