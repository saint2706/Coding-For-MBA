import { test, expect } from '@playwright/test'

const MOCK_AI_REPLY = {
  text: 'Python is a high-level programming language used for data science and automation.',
}
const MOCK_FLASHCARDS = {
  text: JSON.stringify(
    Array.from({ length: 8 }, (_, i) => ({
      front: `Question ${i + 1}: What is concept ${i + 1}?`,
      back: `Answer ${i + 1}: Concept ${i + 1} is an important building block in Python programming.`,
    })),
  ),
}

test.describe('AI Study Assistant — desktop and mobile', () => {
  test.beforeEach(async ({ page }) => {
    // Mock health check so AI availability is detected
    await page.route('**/api/gemini/health', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
    )
    // Mock text generation endpoint
    await page.route('**/api/gemini/generate', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_AI_REPLY),
      }),
    )
    // Mock embed endpoint
    await page.route('**/api/gemini/embed', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ embedding: new Array(768).fill(0.1) }),
      }),
    )
  })

  test('AI FAB is visible on a lesson page', async ({ page }) => {
    await page.goto('/#/lesson/1')
    await page.waitForLoadState('networkidle')

    const aiButton = page.getByRole('button', { name: 'Open AI Study Assistant' })
    await expect(aiButton).toBeVisible({ timeout: 8000 })
  })

  test('AI panel opens, shows tabs, and closes', async ({ page }) => {
    await page.goto('/#/lesson/1')
    await page.waitForLoadState('networkidle')

    const aiButton = page.getByRole('button', { name: 'Open AI Study Assistant' })
    await expect(aiButton).toBeVisible({ timeout: 8000 })
    await aiButton.click()

    const panel = page.locator('.ai-panel')
    await expect(panel).toBeVisible()

    // Both tabs should be present
    await expect(page.locator('.ai-panel-tab', { hasText: '💬 Chat' })).toBeVisible()
    await expect(page.locator('.ai-panel-tab', { hasText: '🃏 Flashcards' })).toBeVisible()

    // Chat input should be accessible
    await expect(page.getByPlaceholder('Ask about this lesson...')).toBeVisible()

    // Close button works
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(panel).not.toBeVisible()
  })

  test('AI chat — quick actions trigger a response', async ({ page }) => {
    await page.goto('/#/lesson/1')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Open AI Study Assistant' }).click()
    const panel = page.locator('.ai-panel')
    await expect(panel).toBeVisible()

    // Quick actions should appear when no messages yet
    const summariseBtn = page.locator('.ai-quick-action', { hasText: '📝 Summarise' })
    await expect(summariseBtn).toBeVisible()
    await summariseBtn.click()

    // User message and model reply should appear
    await expect(page.locator('.ai-message.user')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.ai-message.model')).toContainText('Python', { timeout: 8000 })
  })

  test('AI chat — manual input sends message and gets reply', async ({ page }) => {
    await page.goto('/#/lesson/1')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Open AI Study Assistant' }).click()
    const input = page.getByPlaceholder('Ask about this lesson...')
    await expect(input).toBeVisible()

    await input.fill('What is Python used for?')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.locator('.ai-message.user')).toContainText('What is Python used for?')
    await expect(page.locator('.ai-message.model')).toBeVisible({ timeout: 8000 })

    // Clear chat history link should appear
    await expect(page.getByText('Clear chat history')).toBeVisible()
  })

  test('AI flashcards tab — generate and flip cards', async ({ page }) => {
    // Override generate to return flashcard JSON
    await page.route('**/api/gemini/generate', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_FLASHCARDS),
      }),
    )

    await page.goto('/#/lesson/1')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Open AI Study Assistant' }).click()

    // Switch to flashcards tab
    await page.locator('.ai-panel-tab', { hasText: '🃏 Flashcards' }).click()
    await expect(page.locator('.ai-flashcard-generate')).toBeVisible()

    // Generate flashcards
    await page.locator('.ai-flashcard-generate').click()
    await expect(page.locator('.ai-flashcard').first()).toBeVisible({ timeout: 8000 })

    // All 8 cards should appear
    await expect(page.locator('.ai-flashcard')).toHaveCount(8)

    // Click a card to flip it (reveal answer)
    const firstCard = page.locator('.ai-flashcard').first()
    await expect(firstCard).toHaveClass(/collapsed/)
    await firstCard.click()
    await expect(firstCard).not.toHaveClass(/collapsed/)
  })

  test('AI page (dashboard) is accessible via nav', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForLoadState('networkidle')

    // Navigate to AI page
    await page.goto('/#/ai')
    await expect(page.getByText('Your AI Study')).toBeVisible()
    await expect(page.getByText('What AI Can Do For You')).toBeVisible()
    await expect(page.getByText('Start a Lesson with AI')).toBeVisible()
  })

  test('on mobile: AI FAB sits above the bottom nav bar', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test')

    await page.goto('/#/lesson/1')
    await page.waitForLoadState('networkidle')

    const aiButton = page.getByRole('button', { name: 'Open AI Study Assistant' })
    await expect(aiButton).toBeVisible({ timeout: 8000 })

    const fabBox = await aiButton.boundingBox()
    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]')
    const navBox = await mobileNav.boundingBox()

    if (fabBox && navBox) {
      // FAB bottom edge must be above the top of mobile nav
      expect(fabBox.y + fabBox.height).toBeLessThanOrEqual(navBox.y + 4)
    }
  })

  test('on mobile: AI panel appears above the bottom nav bar', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test')

    await page.goto('/#/lesson/1')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Open AI Study Assistant' }).click()
    const panel = page.locator('.ai-panel')
    await expect(panel).toBeVisible()

    const panelBox = await panel.boundingBox()
    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]')
    const navBox = await mobileNav.boundingBox()

    if (panelBox && navBox) {
      // Panel bottom edge must not overlap mobile nav (panel bottom ≤ nav top)
      expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(navBox.y + 4)
    }
  })
})
