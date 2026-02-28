const fs = require('fs');
const file = 'src/components/CustomCursor.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const handleMouseMove = useCallback\(\s*\(e: MouseEvent\) => \{\s*if \(!dotRef\.current \|\| !ringRef\.current\) return\s*dotRef\.current\.style\.transform = `translate\(\$\{e\.clientX\}px, \$\{e\.clientY\}px\)`\s*ringRef\.current\.style\.transform = `translate\(\$\{e\.clientX\}px, \$\{e\.clientY\}px\) scale\(\$\{hovering \? 1\.6 : 1\}\)`\s*\},\s*\[hovering\],\s*\)/;

const replacement = `  const ticking = useRef(false)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dotRef.current || !ringRef.current) return

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (dotRef.current && ringRef.current) {
            dotRef.current.style.transform = \`translate(\${e.clientX}px, \${e.clientY}px)\`
            ringRef.current.style.transform = \`translate(\${e.clientX}px, \${e.clientY}px) scale(\${hovering ? 1.6 : 1})\`
          }
          ticking.current = false
        })
        ticking.current = true
      }
    },
    [hovering],
  )`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Patched CustomCursor.tsx successfully");
} else {
  console.log("Failed to patch CustomCursor.tsx");
}
