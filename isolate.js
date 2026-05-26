const fs = require('fs');
const { execSync } = require('child_process');

// get all md files
const out = execSync('find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*"').toString();
const files = out.trim().split('\n');

for (const f of files) {
  try {
    execSync(`npx markdown-link-check -q "${f}"`, { stdio: 'pipe' });
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : '';
    if (stderr.includes('TypeError: Invalid URL') || err.message.includes('TypeError: Invalid URL')) {
      console.log('CRASHED ON:', f);
    }
  }
}
