import { readFileSync } from 'fs';

const store = readFileSync('src/stores/gamificationStore.ts', 'utf8');
console.log(store.includes('xpToNextMilestone'));
