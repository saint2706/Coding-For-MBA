const fs = require('fs');
const file = 'src/components/__tests__/BackToTop.test.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /it\('becomes visible after scrolling', async \(\) => \{[\s\S]*?it\('scrolls to top when clicked', async \(\) => \{[\s\S]*?\}\)/;

const replacement = `it('becomes visible after scrolling', async () => {
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
  })`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Patched test successfully again");
} else {
  console.log("Failed to patch test again");
}
