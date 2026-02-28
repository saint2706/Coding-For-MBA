const fs = require('fs');
const file = 'src/components/ScrollProgress.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  useEffect(() => {
    let element: HTMLElement | null = null

    const handleScroll = () => {
      let calcProgress = 0

      if (targetSelector) {
        if (!element) {
          element = document.querySelector<HTMLElement>(targetSelector)
        }
        if (element) {
          const rect = element.getBoundingClientRect()`,
  `  useEffect(() => {
    const handleScroll = () => {
      let calcProgress = 0

      if (targetSelector) {
        const element = document.querySelector<HTMLElement>(targetSelector)
        if (element) {
          const rect = element.getBoundingClientRect()`
);

fs.writeFileSync(file, content);
console.log('patched');
