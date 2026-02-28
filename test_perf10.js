import fs from 'fs';

const contentLoader = fs.readFileSync('src/utils/contentLoader.ts', 'utf8');
console.log(contentLoader.includes('initializeContent()'));
