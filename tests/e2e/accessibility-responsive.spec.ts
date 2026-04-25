import { expect, test, type Page } from '@playwright/test'

async function prepareDeterministicPage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
}

type ThemeAuditResult = {
  palette: string
  pairs: Record<string, number>
}

function contrastAuditScript() {
  const palettes = [
    'peach-sorbet',
    'gradient-blues',
    'neon-party',
    'deep-ocean-blue',
    'pastel-dreamland',
    'golden-summer-fields',
    'light-steel',
  ]

  const parseColor = (value: string) => {
    const probe = document.createElement('span')
    probe.style.color = value
    document.body.appendChild(probe)
    const computed = getComputedStyle(probe).color
    probe.remove()

    const parts = computed.match(/\d+(\.\d+)?/g)?.map(Number)
    if (!parts || parts.length < 3) {
      throw new Error(`Unable to parse color: ${value}`)
    }

    return { r: parts[0], g: parts[1], b: parts[2] }
  }

  const srgbToLinear = (channel: number) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  const luminance = (color: { r: number; g: number; b: number }) =>
    0.2126 * srgbToLinear(color.r) + 0.7152 * srgbToLinear(color.g) + 0.0722 * srgbToLinear(color.b)

  const contrast = (
    foreground: { r: number; g: number; b: number },
    background: { r: number; g: number; b: number },
  ) => {
    const light = Math.max(luminance(foreground), luminance(background))
    const dark = Math.min(luminance(foreground), luminance(background))
    return Number(((light + 0.05) / (dark + 0.05)).toFixed(2))
  }

  const variablePairs = [
    ['--text-primary', '--bg-primary'],
    ['--text-secondary', '--bg-primary'],
    ['--text-muted', '--bg-primary'],
    ['--accent-primary', '--bg-primary'],
    ['--accent-tertiary', '--bg-primary'],
    ['--text-on-accent', '--accent-primary'],
  ] as const

  return palettes.map((palette) => {
    document.documentElement.setAttribute('data-palette', palette)
    const styles = getComputedStyle(document.documentElement)

    const pairs = Object.fromEntries(
      variablePairs.map(([foregroundVar, backgroundVar]) => {
        const foreground = parseColor(styles.getPropertyValue(foregroundVar).trim())
        const background = parseColor(styles.getPropertyValue(backgroundVar).trim())
        return [`${foregroundVar} on ${backgroundVar}`, contrast(foreground, background)]
      }),
    )

    return { palette, pairs }
  })
}

test.describe('accessibility and responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await prepareDeterministicPage(page)
  })

  test('keeps core palette tokens at accessible contrast levels', async ({ page }) => {
    await page.goto('/#/')
    await expect(page.getByRole('heading', { name: /workstation/i })).toBeVisible()

    const auditResults = await page.evaluate<ThemeAuditResult[]>(contrastAuditScript)

    for (const result of auditResults) {
      expect(
        result.pairs['--text-primary on --bg-primary'],
        `${result.palette} text-primary should meet AA contrast`,
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        result.pairs['--text-secondary on --bg-primary'],
        `${result.palette} text-secondary should meet AA contrast`,
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        result.pairs['--text-muted on --bg-primary'],
        `${result.palette} text-muted should remain readable`,
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        result.pairs['--accent-primary on --bg-primary'],
        `${result.palette} accent-primary should remain readable when used as text`,
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        result.pairs['--accent-tertiary on --bg-primary'],
        `${result.palette} accent-tertiary should remain readable when used as text`,
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        result.pairs['--text-on-accent on --accent-primary'],
        `${result.palette} accent buttons should keep readable foregrounds`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('avoids visible horizontal overflow on narrow screens', async ({ page }) => {
    const routes = [
      { url: '/#/', heading: /workstation/i },
      { url: '/#/search?q=python', heading: /Search lessons/i },
      { url: '/#/lesson/1', heading: /Day 1/i },
    ] as const

    for (const route of routes) {
      await page.goto(route.url)
      await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible({
        timeout: 15000,
      })

      const overflowOffenders = await page.evaluate(() => {
        const viewport = window.innerWidth

        return Array.from(document.querySelectorAll<HTMLElement>('body *'))
          .filter((element) => {
            const style = window.getComputedStyle(element)
            if (style.display === 'none' || style.visibility === 'hidden') return false
            if (element.closest('.sidebar') && !element.closest('.sidebar.open')) return false
            if (element.closest('.table-wrapper')) return false

            const rect = element.getBoundingClientRect()
            return rect.right > viewport + 1 && rect.left < viewport + 1
          })
          .map((element) => ({
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === 'string' ? element.className : '',
            text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
          }))
          .slice(0, 10)
      })

      expect(
        overflowOffenders,
        `${route.url} should not visibly overflow on a narrow viewport`,
      ).toEqual([])

      if (route.url === '/#/lesson/1') {
        const codeBlockOverflow = await page.evaluate(() => {
          const viewport = window.innerWidth

          return Array.from(document.querySelectorAll<HTMLElement>('.code-block-wrapper'))
            .filter((element) => {
              const rect = element.getBoundingClientRect()
              return rect.width > viewport + 1 || rect.right > viewport + 1 || rect.left < -1
            })
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              className: typeof element.className === 'string' ? element.className : '',
              text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
            }))
            .slice(0, 10)
        })

        expect(
          codeBlockOverflow,
          'Lesson 1 code blocks should fit within the viewport width',
        ).toEqual([])

        const hasHorizontalPageScroll = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        )

        expect(
          hasHorizontalPageScroll,
          'Lesson 1 should not introduce horizontal page scrolling',
        ).toBe(false)
      }
    }
  })
})
