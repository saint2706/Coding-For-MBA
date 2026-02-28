const fs = require('fs');
const file = 'src/pages/Lesson.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const updateNearBottom = \(\) => \{\s*const maxScrollable = document\.documentElement\.scrollHeight - window\.innerHeight\s*if \(maxScrollable <= 0\) \{\s*setNearBottom\(true\)\s*return\s*\}\s*const scrollRatio = window\.scrollY \/ maxScrollable\s*setNearBottom\(scrollRatio > 0\.78\)\s*\}/;

const replacement = `let ticking = false
    const updateNearBottom = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScrollable = document.documentElement.scrollHeight - window.innerHeight
          if (maxScrollable <= 0) {
            setNearBottom(true)
          } else {
            const scrollRatio = window.scrollY / maxScrollable
            setNearBottom(scrollRatio > 0.78)
          }
          ticking = false
        })
        ticking = true
      }
    }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Patched Lesson.tsx successfully");
} else {
  console.log("Failed to patch Lesson.tsx");
}
