/**
 * Prism Syntax Highlighter Configuration
 *
 * Configures and exports a lightweight version of `react-syntax-highlighter`.
 * Only registers the specific languages needed for the course to minimize bundle size.
 *
 * Key Responsibilities:
 * - Register specific languages (Python, Bash, JSON, etc.).
 * - Export the configured `SyntaxHighlighter` component.
 */

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'

SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('markdown', markdown)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('javascript', javascript)

/**
 * A configured instance of `react-syntax-highlighter` using PrismLight.
 * This exported component has language definitions for python, bash, json,
 * markdown, typescript, and javascript pre-registered to minimize bundle size.
 *
 * @type {React.ComponentType}
 */
export default SyntaxHighlighter
