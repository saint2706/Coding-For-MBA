const fs = require('fs');
const path = require('path');

function findMissingJSDoc(dir) {
  let files = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory() && !file.includes('__tests__')) {
        files = files.concat(findMissingJSDoc(file));
      } else {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          files.push(file);
        }
      }
    });
  } catch(e) {}
  return files;
}

const allFiles = [...findMissingJSDoc('src/utils'), ...findMissingJSDoc('src/components')];

const missing = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^export (function|const) [A-Za-z0-9_]+/)) {
      if (i === 0 || !lines[i-1].includes('*/')) {
        missing.push(`${file}:${i+1}:${line}`);
      }
    }
  }
}

console.log(missing.join('\n'));