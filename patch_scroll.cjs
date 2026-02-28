const fs = require('fs');
const file = 'src/components/ScrollProgress.tsx';
let content = fs.readFileSync(file, 'utf8');

// The original file uses `const handleScroll = () => {` inside the useEffect
// Let's replace the content more robustly.

const orig = `  useEffect(() => {
    const handleScroll = () => {
      let calcProgress = 0

      if (targetSelector) {
        const element = document.querySelector<HTMLElement>(targetSelector)
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementHeight = element.clientHeight
          const windowHeight = window.innerHeight

          const scrollableDistance = elementHeight - windowHeight
          if (scrollableDistance <= 0) {
            calcProgress = 100
          } else {
            // rect.top is relative to the viewport.
            // when scrolled 0 past the element, rect.top is where it starts (could be positive if below top).
            // We want progress relative to the element's start.
            // -rect.top is how much of the element is scrolled past its initial position relative to viewport.
            // A more accurate way: rect.top gives the distance from viewport top to element top.
            // If rect.top <= 0, we have scrolled past the element's top.
            const scrolled = Math.max(0, -rect.top)
            calcProgress = (scrolled / scrollableDistance) * 100
            calcProgress = Math.max(0, Math.min(100, calcProgress))
          }
        } else {
          // Fallback if target is not found
          const scrollTop = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          calcProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
        }
      } else {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        calcProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      }

      setProgress(calcProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [targetSelector])`

const replacement = `  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          let calcProgress = 0

          if (targetSelector) {
            const element = document.querySelector<HTMLElement>(targetSelector)
            if (element) {
              const rect = element.getBoundingClientRect()
              const elementHeight = element.clientHeight
              const windowHeight = window.innerHeight

              const scrollableDistance = elementHeight - windowHeight
              if (scrollableDistance <= 0) {
                calcProgress = 100
              } else {
                const scrolled = Math.max(0, -rect.top)
                calcProgress = (scrolled / scrollableDistance) * 100
                calcProgress = Math.max(0, Math.min(100, calcProgress))
              }
            } else {
              // Fallback if target is not found
              const scrollTop = window.scrollY
              const docHeight = document.documentElement.scrollHeight - window.innerHeight
              calcProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
            }
          } else {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            calcProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
          }

          setProgress(calcProgress)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
    return () => window.removeEventListener('scroll', handleScroll)
  }, [targetSelector])`

if (content.includes(orig)) {
  content = content.replace(orig, replacement);
  fs.writeFileSync(file, content);
  console.log("Patched ScrollProgress.tsx successfully");
} else {
  // Try another approach using regex or exact block matching since I messed it up before
  console.log("File content doesn't match expected block exactly, possibly because I already patched it.");
}
