const fs = require('fs');
const file = 'src/components/ScrollProgress.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `export default function ScrollProgress() {`,
  `interface ScrollProgressProps {
  targetSelector?: string
  isLesson?: boolean
}

export default function ScrollProgress({ targetSelector, isLesson }: ScrollProgressProps) {`
);

content = content.replace(
  `    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }`,
  `    const handleScroll = () => {
      let calcProgress = 0

      if (targetSelector) {
        const element = document.querySelector(targetSelector)
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
            const scrolled = -rect.top
            calcProgress = (scrolled / scrollableDistance) * 100
            calcProgress = Math.max(0, Math.min(100, calcProgress))
          }
        }
      }

      if (!calcProgress && !targetSelector) {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        calcProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      } else if (!calcProgress && targetSelector) {
         // fallback if target is not yet found or progress is 0
         const scrollTop = window.scrollY
         const docHeight = document.documentElement.scrollHeight - window.innerHeight
         if (docHeight > 0 && scrollTop > 0 && !document.querySelector(targetSelector)) {
            calcProgress = (scrollTop / docHeight) * 100
         }
      }

      setProgress(calcProgress)
    }`
);

content = content.replace(
  `className="scroll-progress"`,
  `className={\`scroll-progress \${isLesson ? 'lesson-progress' : ''}\`.trim()}`
);

fs.writeFileSync(file, content);
console.log('patched');
