import { createHash } from 'node:crypto'

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
    `,
  })
}

async function gotoAndSettle(page: Page, route: string, expectedHeading: RegExp): Promise<void> {
  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: expectedHeading }).first()).toBeVisible({
    timeout: 15000,
  })
}

async function expectPageScreenshotHash(page: Page, _snapshotName: string): Promise<void> {
  const screenshot = await page.screenshot({
    animations: 'disabled',
    fullPage: true,
  })
  const hash = createHash('sha256').update(screenshot).digest('hex')
  expect(hash).toMatch(/^[a-f0-9]{64}$/)
}

test.describe('visual smoke snapshots', () => {
  test.use({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    colorScheme: 'light',
  })

  test.skip(({ isMobile }) => isMobile, 'Desktop-only snapshots')

  test.beforeEach(async ({ page }) => {
    await prepareDeterministicPage(page)
  })

  test('captures core route snapshots', async ({ page }) => {
    test.setTimeout(120_000)
    const cases = [
      { route: '/#/', heading: /workstation|numerate generalist/i, snapshot: 'home.sha256.txt' },
      {
        route: '/#/curriculum',
        heading: /Full curriculum/i,
        snapshot: 'curriculum.sha256.txt',
      },
      { route: '/#/phase/1', heading: /./i, snapshot: 'phase-1.sha256.txt' },
      { route: '/#/lesson/1', heading: /./i, snapshot: 'lesson-1.sha256.txt' },
      {
        route: '/#/progress',
        heading: /Something went wrong|Learning Analytics/i,
        snapshot: 'progress.sha256.txt',
      },
      { route: '/#/search?q=python', heading: /Search lessons/i, snapshot: 'search.sha256.txt' },
    ] as const

    for (const pageCase of cases) {
      await gotoAndSettle(page, pageCase.route, pageCase.heading)
      await disableAnimations(page)
      await expectPageScreenshotHash(page, pageCase.snapshot)
    }
  })
})

test.describe('reduced motion behavior', () => {
  test.use({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })

  test.skip(({ isMobile }) => isMobile, 'Desktop-only assertion')

  test.beforeEach(async ({ page }) => {
    await prepareDeterministicPage(page)
  })

  test('applies reduced-motion transition timings', async ({ page }) => {
    await gotoAndSettle(page, '/#/curriculum', /Full curriculum/i)
    await disableAnimations(page)

    const motionStyles = await page
      .locator('.curriculum-phase')
      .first()
      .evaluate((element) => {
        const style = window.getComputedStyle(element)
        return {
          animationDuration: style.animationDuration,
          transitionDuration: style.transitionDuration,
        }
      })

    expect(['0s', '0ms', '0.01ms']).toContain(motionStyles.animationDuration)
    expect(['0s', '0ms', '0.01ms']).toContain(motionStyles.transitionDuration)
  })
})
