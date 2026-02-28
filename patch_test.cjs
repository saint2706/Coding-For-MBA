const fs = require('fs');
const file = 'src/components/__tests__/BackToTop.test.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
  it('becomes visible after scrolling', async () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    // Simulate scroll
    act(() => {
      ;(window as any).scrollY = 500
      window.dispatchEvent(new Event('scroll'))
    })

    // Wait for requestAnimationFrame
    await new Promise((resolve) => requestAnimationFrame(resolve))

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
    act(() => {
      ;(window as any).scrollY = 500
      window.dispatchEvent(new Event('scroll'))
    })

    // Wait for requestAnimationFrame
    await new Promise((resolve) => requestAnimationFrame(resolve))

    const button = container.querySelector('button')
    expect(button).toBeTruthy()

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
`;

const origBlock1 = `  it('becomes visible after scrolling', () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    // Simulate scroll
    act(() => {
      ;(window as any).scrollY = 500
      window.dispatchEvent(new Event('scroll'))
    })

    // We might need to wait for re-render
    const button = container.querySelector('button')
    expect(button).toBeTruthy()
    expect(button?.classList.contains('back-to-top')).toBe(true)
  })

  it('scrolls to top when clicked', () => {
    act(() => {
      root?.render(<BackToTop />)
    })

    // Scroll down to make it visible
    act(() => {
      ;(window as any).scrollY = 500
      window.dispatchEvent(new Event('scroll'))
    })

    const button = container.querySelector('button')
    expect(button).toBeTruthy()

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })`;

if (content.includes(origBlock1)) {
  content = content.replace(origBlock1, replacement.trim());
  fs.writeFileSync(file, content);
  console.log("Patched test successfully");
} else {
  console.log("Failed to patch test");
}
