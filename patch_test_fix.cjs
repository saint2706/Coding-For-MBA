const fs = require('fs');
const file = 'src/components/__tests__/BackToTop.test.tsx';
let content = fs.readFileSync(file, 'utf8');

// Read the current content
// Fix the async missing from the second test block

const regex = /it\('scrolls to top when clicked', \(\) => \{\s*act\(\(\) => \{\s*root\?.render\(<BackToTop \/>\)\s*\}\)\s*\/\/ Scroll down to make it visible\s*act\(\(\) => \{\s*;\(window as any\)\.scrollY = 500\s*window\.dispatchEvent\(new Event\('scroll'\)\)\s*\}\)\s*\/\/ Wait for requestAnimationFrame\s*await new Promise\(\(resolve\) => requestAnimationFrame\(resolve\)\)\s*const button = container\.querySelector\('button'\)\s*expect\(button\)\.toBeTruthy\(\)\s*act\(\(\) => \{\s*button\?.dispatchEvent\(new MouseEvent\('click', \{ bubbles: true \}\)\)\s*\}\)\s*expect\(window\.scrollTo\)\.toHaveBeenCalledWith\(\{ top: 0, behavior: 'smooth' \}\)\s*\}\)/;

// Let's just fix it fully with a complete replacement
const fullReplacement = `import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import BackToTop from '../BackToTop'

describe('BackToTop', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    // Spy on scrollTo
    vi.spyOn(window, 'scrollTo')

    // Mock scrollY
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('is initially hidden', () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    const button = container.querySelector('button')
    expect(button).toBeNull()
  })

  it('becomes visible after scrolling', async () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    // Simulate scroll and wait for requestAnimationFrame to execute
    await act(async () => {
      ;(window as any).scrollY = 500
      window.dispatchEvent(new Event('scroll'))
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    // We might need to wait for re-render
    const button = container.querySelector('button')
    expect(button).toBeTruthy()
    expect(button?.classList.contains('back-to-top')).toBe(true)
  })

  it('scrolls to top when clicked', async () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    // Scroll down to make it visible
    await act(async () => {
      ;(window as any).scrollY = 500
      window.dispatchEvent(new Event('scroll'))
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    const button = container.querySelector('button')
    expect(button).toBeTruthy()

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
`;

fs.writeFileSync(file, fullReplacement);
console.log("Patched test completely");
