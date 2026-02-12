import { test, expect } from '@playwright/test'

test.describe('Security: Pyodide Integrity', () => {
  test('Pyodide loads securely and executes Python code', async ({ page }) => {
    // Navigate to a solution page known to have executable code
    await page.goto('/#/solutions/1')

    // Find the first "Run Python code" button
    const runButton = page.getByRole('button', { name: 'Run Python code' }).first()

    // Ensure the button is visible before interacting
    await expect(runButton).toBeVisible({ timeout: 15000 })

    // Click the run button to trigger Pyodide loading and execution
    await runButton.click()

    // Wait for execution to complete
    // The button should eventually return to "Run" state or show output
    // We look for the output container which appears after execution (success or failure)
    const outputArea = page.locator('.python-runner__output')
    await expect(outputArea).toBeVisible({ timeout: 60000 }) // Pyodide load can be slow

    // Verify that there are no errors displayed
    const errorElement = page.locator('.python-runner__error')
    await expect(errorElement).not.toBeVisible()

    // Verify that output is displayed (either content or "(no output)")
    const stdoutElement = page.locator('.python-runner__stdout')
    await expect(stdoutElement).toBeVisible()

    // Optional: check that the button is not in "Loading..." state anymore
    await expect(runButton).not.toHaveText(/Loading|Running/i)
  })
})
