const fs = require('fs');
const file = 'src/components/ScrollProgress.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])`,
  `    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [targetSelector])`
);

content = content.replace(
  `    const handleScroll = () => {
      let calcProgress = 0

      if (targetSelector) {
        const element = document.querySelector(targetSelector)`,
  `    let element: HTMLElement | null = null

    const handleScroll = () => {
      let calcProgress = 0

      if (targetSelector) {
        if (!element) {
          element = document.querySelector<HTMLElement>(targetSelector)
        }
        if (element) {`
);

fs.writeFileSync(file, content);
console.log('patched');
