const fs = require('fs');
const file = 'src/styles/ux-features.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 9999;
  background: transparent;
  pointer-events: none;
}`,
  `.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  z-index: 9999;
  background: transparent;
  pointer-events: none;
  opacity: 0.6;
}

.scroll-progress.lesson-progress {
  height: 4px;
  opacity: 1;
}`
);

content = content.replace(
  `.scroll-progress-bar {
  height: 100%;
  background: var(--gradient-hero);
  transition: width 50ms linear;
  border-radius: 0 2px 2px 0;
}`,
  `.scroll-progress-bar {
  height: 100%;
  background: var(--accent-primary);
  transition: width 50ms linear;
  border-radius: 0 2px 2px 0;
}

.scroll-progress.lesson-progress .scroll-progress-bar {
  background: var(--gradient-hero);
}`
);

fs.writeFileSync(file, content);
console.log('patched');
