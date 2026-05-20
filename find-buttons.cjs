const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        filelist = walk(filepath, filelist);
      }
    } else if (filepath.endsWith('.tsx') || filepath.endsWith('.jsx')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const files = walk('./src');
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('<button') && !content.includes('aria-label')) {
    console.log(`Missing aria-label in: ${file}`);
  }
}
