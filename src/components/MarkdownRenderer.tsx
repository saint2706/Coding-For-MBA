/**
 * MarkdownRenderer Component
 *
 * A comprehensive Markdown rendering system with custom components,
 * interactive code blocks, glossary tooltips, and automatic parsing
 * of exercises and mastery check questions.
 */

import { useState, useCallback, memo, JSX, useMemo } from 'react'
import ReactMarkdown, { Components, ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CodePlayground from './CodePlayground'
import ExerciseWidget from './ExerciseWidget'
import MasteryCheck from './MasteryCheck'
import { glossaryTerms, getGlossaryRegex } from '../utils/glossary'

/**
 * Custom Prism theme with transparent background for code blocks.
 */
const customTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...(oneDark['pre[class*="language-"]'] as object),
    background: 'transparent',
    margin: 0,
    padding: 0,
  },
  'code[class*="language-"]': {
    ...(oneDark['code[class*="language-"]'] as object),
    background: 'transparent',
  },
}

/**
 * Copy button component for code blocks.
 *
 * @param text - The code text to copy to clipboard
 * @returns A copy button that shows feedback on click
 */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  /**
   * Copies code text to clipboard and shows confirmation.
   */
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button className="code-block-copy" onClick={handleCopy}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

/**
 * Enhanced code block with syntax highlighting and optional Python playground.
 *
 * @param className - Language class name (e.g., "language-python")
 * @param children - Code content
 * @returns A styled code block with copy and "Try It" features
 */
function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1]! : ''
  const code = String(children).replace(/\n$/, '')
  const [showPlayground, setShowPlayground] = useState(false)
  const isPython = lang === 'python' || lang === 'py'

  if (!match) {
    return <code className={className}>{children}</code>
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{lang}</span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {isPython && (
            <button
              className="code-block-try-btn"
              onClick={() => setShowPlayground((p) => !p)}
              aria-label={showPlayground ? 'Close playground' : 'Try this code'}
            >
              {showPlayground ? '✕ Close' : '▶ Try It'}
            </button>
          )}
          <CopyButton text={code} />
        </div>
      </div>
      <SyntaxHighlighter
        style={customTheme}
        language={lang}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.8125rem',
          lineHeight: '1.65',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono)',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
      {showPlayground && (
        <div className="code-block-inline-playground">
          <CodePlayground initialCode={code} />
        </div>
      )}
    </div>
  )
}

/**
 * Custom code component for ReactMarkdown.
 * Delegates to CodeBlock for language-specific code, renders inline code otherwise.
 *
 * @param props - Code element props from ReactMarkdown
 * @returns Either a CodeBlock or inline code element
 */
const CodeComponent = (props: JSX.IntrinsicElements['code'] & ExtraProps) => {
  const { children, className, ...rest } = props
  const match = /language-(\w+)/.exec(className || '')
  if (match) {
    return <CodeBlock className={className}>{children}</CodeBlock>
  }
  return (
    <code className={className} {...rest}>
      {children}
    </code>
  )
}

/**
 * Custom table wrapper component that makes tables horizontally scrollable.
 *
 * @param children - Table content
 * @returns A wrapped table with overflow handling
 */
const TableComponent = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="table-wrapper">
      <table>{children}</table>
    </div>
  )
}

/**
 * Custom link component that opens external links in new tabs.
 *
 * @param href - Link URL
 * @param children - Link content
 * @param props - Additional link attributes
 * @returns A properly configured link element
 */
const LinkComponent = ({ href, children, ...props }: JSX.IntrinsicElements['a'] & ExtraProps) => {
  const isExternal = href && (href.startsWith('http') || href.startsWith('//'))
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  )
}

/**
 * Custom H1 heading component with auto-generated ID for linking.
 *
 * @param children - Heading content
 * @param props - Additional heading attributes
 * @returns H1 element with ID generated from content
 */
const Heading1 = ({ children, ...props }: JSX.IntrinsicElements['h1'] & ExtraProps) => {
  const id = String(children)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return (
    <h1 id={id} {...props}>
      {children}
    </h1>
  )
}

/**
 * Custom H2 heading component with auto-generated ID for linking.
 *
 * @param children - Heading content
 * @param props - Additional heading attributes
 * @returns H2 element with ID generated from content
 */
const Heading2 = ({ children, ...props }: JSX.IntrinsicElements['h2'] & ExtraProps) => {
  const id = String(children)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return (
    <h2 id={id} {...props}>
      {children}
    </h2>
  )
}

/**
 * Custom H3 heading component with auto-generated ID for linking.
 *
 * @param children - Heading content
 * @param props - Additional heading attributes
 * @returns H3 element with ID generated from content
 */
const Heading3 = ({ children, ...props }: JSX.IntrinsicElements['h3'] & ExtraProps) => {
  const id = String(children)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return (
    <h3 id={id} {...props}>
      {children}
    </h3>
  )
}

/**
 * Global regex for matching glossary terms in content.
 */
const glossaryRegex = getGlossaryRegex()

/**
 * Processes text and wraps glossary terms with tooltip spans.
 * Only wraps the first occurrence of each term to avoid overwhelming the reader.
 *
 * @param text - The text content to process
 * @returns Array of text and JSX elements with wrapped glossary terms
 */
function addGlossaryTooltips(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = []
  const matched = new Set<string>()
  let remaining = text
  let keyIdx = 0

  while (remaining.length > 0) {
    const match = glossaryRegex.exec(remaining)
    if (!match) {
      parts.push(remaining)
      break
    }

    const termLower = match[1]!.toLowerCase()
    // Only wrap first occurrence of each term
    if (matched.has(termLower)) {
      parts.push(remaining.slice(0, match.index + match[0].length))
      remaining = remaining.slice(match.index + match[0].length)
      glossaryRegex.lastIndex = 0
      continue
    }

    matched.add(termLower)
    // Find the definition (case-insensitive key lookup)
    const defKey = Object.keys(glossaryTerms).find((k) => k.toLowerCase() === termLower)
    const definition = defKey ? glossaryTerms[defKey] : undefined

    if (match.index > 0) {
      parts.push(remaining.slice(0, match.index))
    }

    if (definition) {
      parts.push(
        <span key={`gl-${keyIdx++}`} className="glossary-term" data-definition={definition}>
          {match[0]}
        </span>,
      )
    } else {
      parts.push(match[0])
    }

    remaining = remaining.slice(match.index + match[0].length)
    glossaryRegex.lastIndex = 0
  }

  return parts
}

/**
 * Recursively processes React children to add glossary tooltips to text nodes.
 *
 * @param children - React children to process
 * @returns Processed children with glossary tooltips applied
 */
function processGlossaryChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string') {
    const parts = addGlossaryTooltips(children)
    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === 'string') {
        const parts = addGlossaryTooltips(child)
        return parts.length === 1 && typeof parts[0] === 'string' ? (
          parts[0]
        ) : (
          <span key={i}>{parts}</span>
        )
      }
      return child
    })
  }
  return children
}

/**
 * Custom paragraph component that automatically adds glossary tooltips.
 *
 * @param children - Paragraph content
 * @param props - Additional paragraph attributes
 * @returns Paragraph with glossary terms wrapped in tooltips
 */
const ParagraphWithGlossary = ({ children, ...props }: JSX.IntrinsicElements['p'] & ExtraProps) => (
  <p {...props}>{processGlossaryChildren(children)}</p>
)

/**
 * Represents a parsed exercise from markdown content.
 *
 * @property title - Exercise title
 * @property goal - Learning goal
 * @property instructions - Step-by-step instructions
 * @property starterCode - Initial code template
 * @property expectedOutput - Expected output text
 * @property solution - Complete solution code
 */
interface ParsedExercise {
  title: string
  goal: string
  instructions: string
  starterCode: string
  expectedOutput: string
  solution: string
}

/**
 * Represents a parsed mastery check question from markdown content.
 *
 * @property questionNumber - Question number
 * @property title - Question title
 * @property questionText - Question description
 * @property codeSnippet - Optional code snippet for the question
 * @property answer - Correct answer explanation
 */
interface ParsedMasteryQuestion {
  questionNumber: number
  title: string
  questionText: string
  codeSnippet: string
  answer: string
}

/**
 * Represents an interactive block (exercise or mastery question) in the markdown.
 *
 * @property type - Block type (exercise or mastery)
 * @property startIndex - Start position in the markdown content
 * @property endIndex - End position in the markdown content
 * @property data - Parsed block data
 */
interface InteractiveBlock {
  type: 'exercise' | 'mastery'
  startIndex: number
  endIndex: number
  data: ParsedExercise | ParsedMasteryQuestion
}

/**
 * Extracts the first code block from text and returns it with remaining text.
 *
 * @param text - Text containing code blocks
 * @returns Object with extracted code and remaining text
 */
function extractCodeBlock(text: string): { code: string; remaining: string } {
  const codeMatch = text.match(/```(?:python|py)?\s*\n([\s\S]*?)```/)
  if (codeMatch) {
    return {
      code: codeMatch[1]!.trim(),
      remaining: text.replace(codeMatch[0], '').trim(),
    }
  }
  return { code: '', remaining: text }
}

/**
 * Finds and parses all interactive blocks (exercises and mastery checks) in markdown content.
 *
 * @param content - Raw markdown content to parse
 * @returns Array of parsed interactive blocks with their positions
 */
function findInteractiveBlocks(content: string): InteractiveBlock[] {
  const blocks: InteractiveBlock[] = []

  // Find exercise blocks
  const exerciseRegex =
    /### Exercise \d+:\s*(.+?)\n([\s\S]*?)(?=\n### Exercise \d+:|\n## |\n---\s*\n## |$)/g
  let match
  while ((match = exerciseRegex.exec(content)) !== null) {
    const title = match[1]!.trim()
    const body = match[2]!
    const goalMatch = body.match(/\*\*Goal\*\*:\s*(.+)/)
    const goal = goalMatch ? goalMatch[1]!.trim() : ''
    const codeBlocks: string[] = []
    const codeRegex = /```(?:python|py)\s*\n([\s\S]*?)```/g
    let codeMatch
    while ((codeMatch = codeRegex.exec(body)) !== null) {
      codeBlocks.push(codeMatch[1]!.trim())
    }
    const expectedMatch = body.match(
      /\*\*Expected Output[:\s]*\*\*[\s\S]*?```(?:text|)\s*\n([\s\S]*?)```/,
    )
    const expectedOutput = expectedMatch ? expectedMatch[1]!.trim() : ''
    const starterCode = codeBlocks[0] || ''
    const goalEnd = goalMatch ? body.indexOf(goalMatch[0]) + goalMatch[0].length : 0
    const firstCodeStart = body.indexOf('```')
    const instructions = firstCodeStart > goalEnd ? body.slice(goalEnd, firstCodeStart).trim() : ''

    blocks.push({
      type: 'exercise',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      data: { title, goal, instructions, starterCode, expectedOutput, solution: starterCode },
    })
  }

  // Find mastery check questions
  const questionRegex =
    /### Question (\d+):\s*(.+?)\n([\s\S]*?)<details>\s*\n<summary>.*?<\/summary>\s*\n([\s\S]*?)<\/details>/g
  while ((match = questionRegex.exec(content)) !== null) {
    const questionNumber = parseInt(match[1]!, 10)
    const title = match[2]!.trim()
    const questionBody = match[3]!.trim()
    const answerBody = match[4]!.trim()
    const { code: codeSnippet, remaining: questionText } = extractCodeBlock(questionBody)
    const answerText = answerBody
      .replace(/```[\s\S]*?```/g, (codeBlock) => {
        const codeContent = codeBlock.replace(/```(?:\w+)?\s*\n?/, '').replace(/\n?```$/, '')
        return codeContent
      })
      .trim()

    blocks.push({
      type: 'mastery',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      data: { questionNumber, title, questionText, codeSnippet, answer: answerText },
    })
  }

  // Sort by startIndex
  blocks.sort((a, b) => a.startIndex - b.startIndex)
  return blocks
}

/**
 * Renders markdown content with interactive blocks replaced by custom components.
 *
 * @param content - Markdown content to render
 * @returns Rendered content with interactive components
 */
function InteractiveContent({ content }: { content: string }) {
  const blocks = useMemo(() => findInteractiveBlocks(content), [content])

  if (blocks.length === 0) {
    return (
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    )
  }

  // Split content into segments: plain markdown and interactive blocks
  const segments: JSX.Element[] = []
  let lastEnd = 0

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!

    // Add the markdown before this block
    if (block.startIndex > lastEnd) {
      const markdownChunk = content.slice(lastEnd, block.startIndex)
      if (markdownChunk.trim()) {
        segments.push(
          <ReactMarkdown
            key={`md-${i}`}
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={markdownComponents}
          >
            {markdownChunk}
          </ReactMarkdown>,
        )
      }
    }

    if (block.type === 'exercise') {
      const ex = block.data as ParsedExercise
      segments.push(
        <ExerciseWidget
          key={`ex-${i}`}
          title={ex.title}
          goal={ex.goal}
          instructions={ex.instructions}
          starterCode={ex.starterCode}
          expectedOutput={ex.expectedOutput}
          solution={ex.solution}
        />,
      )
    } else if (block.type === 'mastery') {
      const mq = block.data as ParsedMasteryQuestion
      segments.push(
        <MasteryCheck
          key={`mq-${i}`}
          questionNumber={mq.questionNumber}
          title={mq.title}
          questionText={mq.questionText}
          codeSnippet={mq.codeSnippet}
          answer={mq.answer}
        />,
      )
    }

    lastEnd = block.endIndex
  }

  // Add remaining markdown
  if (lastEnd < content.length) {
    const remaining = content.slice(lastEnd)
    if (remaining.trim()) {
      segments.push(
        <ReactMarkdown
          key="md-end"
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={markdownComponents}
        >
          {remaining}
        </ReactMarkdown>,
      )
    }
  }

  return <>{segments}</>
}

/**
 * Custom component overrides for ReactMarkdown.
 */
const markdownComponents: Components = {
  code: CodeComponent,
  table: TableComponent,
  a: LinkComponent,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  p: ParagraphWithGlossary,
}

/**
 * Remark plugins for markdown processing.
 */
const remarkPlugins = [remarkGfm]

/**
 * Rehype plugins for HTML processing.
 */
const rehypePlugins = [rehypeRaw]

/**
 * Props for the MarkdownRenderer component.
 *
 * @property content - Markdown content to render
 */
interface MarkdownRendererProps {
  content: string
}

/**
 * Main markdown renderer component.
 *
 * Renders markdown content with:
 * - Syntax-highlighted code blocks
 * - Interactive Python playgrounds
 * - Glossary term tooltips
 * - Custom-styled headings with IDs
 * - Responsive tables
 * - Auto-parsed exercises and mastery checks
 * - External link handling
 *
 * @param content - Markdown content to render
 * @returns Rendered markdown with all enhancements
 */
function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) {
    return (
      <div className="markdown-body">
        <p>No content available.</p>
      </div>
    )
  }

  return (
    <div className="markdown-body">
      <InteractiveContent content={content} />
    </div>
  )
}

export default memo(MarkdownRenderer)
