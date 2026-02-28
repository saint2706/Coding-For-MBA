const fs = require('fs');
const file = 'src/components/BackToTop.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const handleScroll = \(\) => \{\s+setVisible\(window\.scrollY > 400\)\s+\}/;

const replacement = `let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 400)
          ticking = false
        })
        ticking = true
      }
    }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Patched BackToTop.tsx successfully");
} else {
  console.log("Failed to patch BackToTop.tsx");
}
