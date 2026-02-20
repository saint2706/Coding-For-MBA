import { test, expect } from '@playwright/test'

test.describe('Security: Pyodide Integrity', () => {
  test('Pyodide script uses SRI and runner handles execution state', async ({ page }) => {
    await page.goto('/#/solutions/1')

    const runButton = page.getByRole('button', { name: 'Run Python code' }).first()
    await expect(runButton).toBeVisible({ timeout: 15000 })

    await runButton.click()

    const outputArea = page.locator('.python-runner__output')
    await expect(outputArea).toBeVisible({ timeout: 60000 })

    const errorElement = page.locator('.python-runner__error')
    const stdoutElement = page.locator('.python-runner__stdout')

    await expect(errorElement.or(stdoutElement)).toBeVisible()
    await expect(runButton).not.toHaveText(/Loading|Running/i)

    const pyodideScript = page.locator(
      'script[src="https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js"]',
    )
    await expect(pyodideScript).toHaveAttribute(
      'integrity',
      'sha384-rm4QcPMX69sqmX2kWiJa3BF02sgdJkVyATWkw5NHAxBUAvmLXhToWZYaP2wCcyEe',
    )
    await expect(pyodideScript).toHaveAttribute('crossorigin', 'anonymous')
  })
})
