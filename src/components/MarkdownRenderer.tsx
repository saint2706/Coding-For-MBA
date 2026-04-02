/**
 * Markdown Content Renderer
 *
 * Renders lesson content from markdown into interactive React components.
 *
 * Key Responsibilities:
 * - Convert markdown to HTML (via `react-markdown`).
 * - Sanitize HTML output to prevent XSS (via `rehype-sanitize`).
 * - Detect and render interactive blocks (Exercises, Mastery Checks).
 * - Inject glossary tooltips for technical terms.
 * - Render code blocks with syntax highlighting and copy buttons.
 */

import { useState, memo, JSX, useMemo, type ComponentProps } from 'react'
import ReactMarkdown, { Components, ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { type Options as RehypeSanitizeOptions } from 'rehype-sanitize'
import { unified } from 'unified'
import type { Content, Heading, Html, Nodes, Paragraph, Root, Strong } from 'mdast'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import SyntaxHighlighter from '../utils/prism'
import CodePlayground from './CodePlayground'
import ExerciseWidget from './ExerciseWidget'
import MasteryCheck from './MasteryCheck'
import CopyButton from './CopyButton'
import { glossaryTerms, getGlossaryRegex } from '../utils/glossary'
import { getSecureLinkAttributes } from '../utils/linkSafety'
import { rehypeSlugCustom } from '../utils/rehype-slug-custom'

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
 * Custom CodeBlock component for ReactMarkdown.
 * Renders code with syntax highlighting and a copy button.
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
    <div className="code-block-wrapper code-block--wrapped">
      <div className="code-block-header">
        <span className="code-block-lang">{lang}</span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {isPython && (
            <button
              type="button"
              className="code-block-try-btn"
              onClick={() => setShowPlayground((p) => !p)}
              aria-label={showPlayground ? 'Close playground' : 'Try this code'}
            >
              {showPlayground ? '✕ Close' : '▶ Try It'}
            </button>
          )}
          <CopyButton text={code} ariaLabel="Copy code to clipboard" />
        </div>
      </div>
      <SyntaxHighlighter
        style={customTheme}
        language={lang}
        PreTag="div"
        wrapLongLines
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.8125rem',
          lineHeight: '1.65',
          overflowX: 'hidden',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        }}
        tabIndex={0}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
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

const TableComponent = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="table-wrapper">
      <table>{children}</table>
    </div>
  )
}

const ImageComponent = (props: JSX.IntrinsicElements['img'] & ExtraProps) => {
  // Respect fetchpriority for LCP (Hero) optimization
  // If fetchpriority="high", we should not lazy load.
  const {
    fetchpriority,
    fetchPriority,
    loading: _loading,
    ...rest
  } = props as JSX.IntrinsicElements['img'] & {
    fetchpriority?: 'high' | 'low' | 'auto'
    fetchPriority?: 'high' | 'low' | 'auto'
  }

  const isHighPriority = fetchpriority === 'high' || fetchPriority === 'high'

  return (
    <img
      loading={isHighPriority ? 'eager' : 'lazy'}
      decoding="async"
      // Using lowercase fetchpriority for exact DOM output, with TS definition in vite-env.d.ts
      fetchpriority={isHighPriority ? 'high' : undefined}
      alt={rest.alt || 'Course image'}
      {...rest}
    />
  )
}

const LinkComponent = ({ href, children, ...props }: JSX.IntrinsicElements['a'] & ExtraProps) => {
  const attributes = getSecureLinkAttributes(href, props)

  if (!attributes) {
    return <span>{children}</span>
  }

  // Remove target and rel from props so they don't override secure attributes
  const { target: _target, rel: _rel, ...rest } = props

  return (
    <a href={attributes.href} target={attributes.target} rel={attributes.rel} {...rest}>
      {children}
    </a>
  )
}

function createHeadingComponent(Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') {
  return ({ children, ...props }: JSX.IntrinsicElements['h1'] & ExtraProps) => {
    // The 'id' prop is now provided by rehype-slug-custom plugin
    return (
      <Tag tabIndex={-1} style={{ outline: 'none' }} {...props}>
        {children}
      </Tag>
    )
  }
}

// Use global flag 'g' to iterate over matches without string slicing
const glossaryRegex = new RegExp(getGlossaryRegex().source, 'gi')
const glossaryDefinitionsByLowerTerm = Object.fromEntries(
  Object.entries(glossaryTerms).map(([term, definition]) => [term.toLowerCase(), definition]),
)

/** Wrap only the first occurrence of each glossary term in a text node. */
function addGlossaryTooltips(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = []
  const matched = new Set<string>()
  let lastIndex = 0
  let match
  let keyIdx = 0

  // Reset lastIndex for the shared regex instance
  glossaryRegex.lastIndex = 0

  while ((match = glossaryRegex.exec(text)) !== null) {
    const termLower = match[1]!.toLowerCase()
    const matchStart = match.index
    const matchEnd = match.index + match[0].length

    // Append text before the match
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart))
    }

    if (matched.has(termLower)) {
      // Already matched in this paragraph, just append the text
      parts.push(match[0])
    } else {
      matched.add(termLower)
      const definition = glossaryDefinitionsByLowerTerm[termLower]

      if (definition) {
        parts.push(
          <span key={`gl-${keyIdx++}`} className="glossary-term" data-definition={definition}>
            {match[0]}
          </span>,
        )
      } else {
        parts.push(match[0])
      }
    }

    lastIndex = matchEnd
  }

  // Append remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

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

const ParagraphWithGlossary = ({ children, ...props }: JSX.IntrinsicElements['p'] & ExtraProps) => (
  <p {...props}>{processGlossaryChildren(children)}</p>
)

interface ParsedExercise {
  title: string
  goal: string
  instructions: string
  starterCode: string
  expectedOutput: string
  solution: string
}

interface ParsedMasteryQuestion {
  questionNumber: number
  title: string
  questionText: string
  codeSnippet: string
  answer: string
}

interface InteractiveBlock {
  type: 'exercise' | 'mastery'
  startIndex: number
  endIndex: number
  data: ParsedExercise | ParsedMasteryQuestion
}

interface MarkdownNodeWithPosition {
  position?: {
    start?: { offset?: number }
    end?: { offset?: number }
  }
}

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

function getNodeStartOffset(node: MarkdownNodeWithPosition): number | null {
  return node.position?.start?.offset ?? null
}

function getNodeEndOffset(node: MarkdownNodeWithPosition): number | null {
  return node.position?.end?.offset ?? null
}

function getInlineNodeText(node: Nodes): string {
  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value
  }

  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => getInlineNodeText(child as Nodes)).join('')
  }

  return ''
}

function getHeadingText(node: Heading): string {
  return node.children
    .map((child) => getInlineNodeText(child as Nodes))
    .join('')
    .trim()
}

function isLabeledParagraph(node: Content, label: string): boolean {
  if (node.type !== 'paragraph') return false
  const first = node.children[0]
  if (!first || first.type !== 'strong') return false

  const strongText = (first as Strong).children
    .map((child) => getInlineNodeText(child as Nodes))
    .join('')
    .trim()
    .replace(/:$/, '')

  return strongText.toLowerCase() === label.toLowerCase()
}

function extractLabeledTextFromParagraph(node: Content, label: string): string {
  if (!isLabeledParagraph(node, label)) return ''

  const children = (node as Paragraph).children

  const rest = children
    .slice(1)
    .map((child) => getInlineNodeText(child as Nodes))
    .join('')
    .trim()

  return rest.replace(/^:\s*/, '').trim()
}

/**
 * Parse exercise and mastery sections so they can render as interactive widgets.
 *
 * @param {string} content - The raw markdown content to be parsed.
 * @returns {InteractiveBlock[]} An array of objects representing parsed blocks (text, exercises, or mastery checks).
 */
function findInteractiveBlocks(content: string): InteractiveBlock[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(content) as Root
  const topLevelNodes = tree.children
  const blocks: InteractiveBlock[] = []

  for (let i = 0; i < topLevelNodes.length; i++) {
    const node = topLevelNodes[i]
    if (!node || node.type !== 'heading' || node.depth !== 3) continue

    const headingText = getHeadingText(node)
    const exerciseMatch = headingText.match(/^Exercise\s+(\d+)\s*:\s*(.+)$/i)
    const questionMatch = headingText.match(/^Question\s+(\d+)\s*:\s*(.+)$/i)
    if (!exerciseMatch && !questionMatch) continue

    const startIndex = getNodeStartOffset(node)
    if (startIndex === null) continue

    let boundaryIndex = topLevelNodes.length
    for (let j = i + 1; j < topLevelNodes.length; j++) {
      const candidate = topLevelNodes[j]
      if (!candidate) continue
      if (candidate.type === 'heading' && candidate.depth === 2) {
        boundaryIndex = j
        break
      }

      if (candidate.type === 'heading' && candidate.depth === 3) {
        const candidateText = getHeadingText(candidate)
        if (/^Exercise\s+\d+\s*:/i.test(candidateText)) {
          boundaryIndex = j
          break
        }
      }
    }

    const boundaryNode = topLevelNodes[boundaryIndex]
    const endIndex = boundaryNode
      ? (getNodeStartOffset(boundaryNode) ?? content.length)
      : content.length
    const sectionNodes = topLevelNodes.slice(i + 1, boundaryIndex)

    if (exerciseMatch) {
      const title = exerciseMatch[2]?.trim() || ''
      let goal = ''
      let starterCode = ''
      let expectedOutput = ''
      let instructions = ''
      let goalNodeIndex = -1
      let firstCodeNodeIndex = -1

      for (let k = 0; k < sectionNodes.length; k++) {
        const sectionNode = sectionNodes[k]
        if (!sectionNode) continue

        if (!goal) {
          goal = extractLabeledTextFromParagraph(sectionNode, 'Goal')
          if (goal) goalNodeIndex = k
        }

        if (sectionNode.type === 'code' && !starterCode) {
          if (sectionNode.lang === 'python' || sectionNode.lang === 'py') {
            starterCode = sectionNode.value.trim()
            firstCodeNodeIndex = k
          }
        }

        if (!expectedOutput && k > 0) {
          const prev = sectionNodes[k - 1]
          const hasExpectedLabel = !!prev && isLabeledParagraph(prev, 'Expected Output')
          if (hasExpectedLabel && sectionNode.type === 'code') {
            expectedOutput = sectionNode.value.trim()
          }
        }
      }

      if (firstCodeNodeIndex > goalNodeIndex) {
        const instructionNodes = sectionNodes.slice(goalNodeIndex + 1, firstCodeNodeIndex)
        const instructionParts: string[] = []
        for (const instructionNode of instructionNodes) {
          const nodeStart = getNodeStartOffset(instructionNode)
          const nodeEnd = getNodeEndOffset(instructionNode)
          if (nodeStart === null || nodeEnd === null) continue
          const chunk = content.slice(nodeStart, nodeEnd).trim()
          if (chunk) instructionParts.push(chunk)
        }
        instructions = instructionParts.join('\n\n').trim()
      }

      blocks.push({
        type: 'exercise',
        startIndex,
        endIndex,
        data: { title, goal, instructions, starterCode, expectedOutput, solution: starterCode },
      })
      continue
    }

    const questionNumber = parseInt(questionMatch?.[1] || '', 10)
    if (Number.isNaN(questionNumber)) continue

    const title = questionMatch?.[2]?.trim() || ''
    const detailsNodeIndex = sectionNodes.findIndex(
      (sectionNode) => sectionNode?.type === 'html' && /<details[\s>]/i.test(sectionNode.value),
    )

    const questionNodes =
      detailsNodeIndex >= 0 ? sectionNodes.slice(0, detailsNodeIndex) : sectionNodes
    const detailsNode = detailsNodeIndex >= 0 ? (sectionNodes[detailsNodeIndex] as Html) : null

    let questionBody = ''
    if (questionNodes.length > 0) {
      const firstQuestionNode = questionNodes[0]
      const lastQuestionNode = questionNodes[questionNodes.length - 1]
      if (firstQuestionNode && lastQuestionNode) {
        const start = getNodeStartOffset(firstQuestionNode)
        const end = getNodeEndOffset(lastQuestionNode)
        if (start !== null && end !== null) {
          questionBody = content.slice(start, end).trim()
        }
      }
    }

    const detailsValue = detailsNode?.value || ''
    const answerBody = detailsValue
      .replace(/^[\s\S]*?<summary>[\s\S]*?<\/summary>/i, '')
      .replace(/<\/details>\s*$/i, '')
      .trim()

    const { code: codeSnippet, remaining: questionText } = extractCodeBlock(questionBody)
    const answerText = answerBody
      .replace(/```[\s\S]*?```/g, (codeBlock) => {
        const codeContent = codeBlock.replace(/```(?:\w+)?\s*\n?/, '').replace(/\n?```$/, '')
        return codeContent
      })
      .trim()

    blocks.push({
      type: 'mastery',
      startIndex,
      endIndex,
      data: { questionNumber, title, questionText, codeSnippet, answer: answerText },
    })
  }

  blocks.sort((a, b) => a.startIndex - b.startIndex)
  return blocks
}

const markdownComponents: Components = {
  code: CodeComponent,
  table: TableComponent,
  img: ImageComponent,
  a: LinkComponent,
  h1: createHeadingComponent('h1'),
  h2: createHeadingComponent('h2'),
  h3: createHeadingComponent('h3'),
  h4: createHeadingComponent('h4'),
  h5: createHeadingComponent('h5'),
  h6: createHeadingComponent('h6'),
  p: ParagraphWithGlossary,
}

const lessonSanitizerSchema: RehypeSanitizeOptions = {
  tagNames: [
    'a',
    'blockquote',
    'br',
    'code',
    'del',
    'details',
    'div',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'img',
    'input',
    'li',
    'ol',
    'p',
    'pre',
    'span',
    'strong',
    'summary',
    'table',
    'tbody',
    'td',
    'th',
    'thead',
    'tr',
    'ul',
  ],
  attributes: {
    a: ['href', 'title', 'target', 'rel'],
    code: ['className'],
    div: ['className'],
    img: [
      'src',
      'alt',
      'title',
      'width',
      'height',
      'loading',
      'decoding',
      'fetchpriority',
      'fetchPriority',
    ],
    input: [
      ['type', 'checkbox'],
      ['disabled', true],
      ['checked', true],
    ],
    span: ['className', 'dataDefinition'],
    td: ['align'],
    th: ['align'],
    '*': ['id'],
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
  },
}

const rehypePlugins: NonNullable<ComponentProps<typeof ReactMarkdown>['rehypePlugins']> = [
  rehypeRaw,
  [rehypeSanitize, lessonSanitizerSchema],
  rehypeSlugCustom,
]

const remarkPlugins = [remarkGfm]

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

  const segments: JSX.Element[] = []
  let lastEnd = 0

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!

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

interface MarkdownRendererProps {
  content: string
}

/**
 * Render lesson markdown with safe HTML, custom code blocks, glossary tooltips,
 * and interactive exercise/mastery widgets.
 *
 * @param {MarkdownRendererProps} props - The component properties.
 * @param {string} props.content - The raw markdown content string to be rendered.
 * @returns {React.ReactElement} The rendered markdown content wrapped in a responsive container.
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

/**
 * Interactive block utilities and types for parsing mastery questions and exercises.
 */
export { findInteractiveBlocks, type ParsedMasteryQuestion, type ParsedExercise }

/**
 * Render lesson markdown with safe HTML, custom code blocks, glossary tooltips,
 * and interactive exercise/mastery widgets. Memoized to prevent unnecessary re-renders.
 *
 * @param {MarkdownRendererProps} props - The component properties.
 * @param {string} props.content - The raw markdown content string to be rendered.
 * @returns {React.ReactElement} The rendered markdown content wrapped in a responsive container.
 */
export default memo(MarkdownRenderer)
