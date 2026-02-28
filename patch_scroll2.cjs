const fs = require('fs');
const file = 'src/components/ScrollProgress.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `        if (element) {
        if (element) {
          const rect = element.getBoundingClientRect()`,
  `        if (element) {
          const rect = element.getBoundingClientRect()`
);

fs.writeFileSync(file, content);
console.log('patched');
