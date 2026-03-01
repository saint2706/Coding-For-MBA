import { validatePythonCode } from './src/utils/codeSecurity.js';
console.log(validatePythonCode("ｅval('1+1')".normalize('NFKC')));
