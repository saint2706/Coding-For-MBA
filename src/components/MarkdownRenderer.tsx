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

import { memo, JSX, useMemo, lazy, Suspense } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { Content, Heading, Html, Nodes, Paragraph, Root, Strong } from 'mdast'
import { markdownComponents, remarkPlugins, rehypePlugins } from './MarkdownFragment'

const ExerciseWidget = lazy(() => import('./ExerciseWidget'))
const MasteryCheck = lazy(() => import('./MasteryCheck'))

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

/**
 * Represents an interactive block (exercise or mastery check) extracted from Markdown content.
 * @interface InteractiveBlock
 * @property {'exercise' | 'mastery'} type - The type of the interactive block
 * @property {number} startIndex - The starting character index in the raw Markdown string
 * @property {number} endIndex - The ending character index in the raw Markdown string
 * @property {ParsedExercise | ParsedMasteryQuestion} data - The parsed data associated with the block
 */
export interface InteractiveBlock {
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
    return node.children.map((child: unknown) => getInlineNodeText(child as Nodes)).join('')
  }

  return ''
}

function getHeadingText(node: Heading): string {
  return node.children
    .map((child: unknown) => getInlineNodeText(child as Nodes))
    .join('')
    .trim()
}

function isLabeledParagraph(node: Content, label: string): boolean {
  if (node.type !== 'paragraph') return false
  const first = node.children[0]
  if (!first || first.type !== 'strong') return false

  const strongText = (first as Strong).children
    .map((child: unknown) => getInlineNodeText(child as Nodes))
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
    .map((child: unknown) => getInlineNodeText(child as Nodes))
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
      (sectionNode: Content) =>
        sectionNode?.type === 'html' && /<details[\s>]/i.test((sectionNode as Html).value),
    )

    const questionNodes =
      detailsNodeIndex >= 0 ? sectionNodes.slice(0, detailsNodeIndex) : sectionNodes

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

    // The <details> block is split into multiple sibling "html" nodes by the
    // markdown parser whenever it contains a blank line (e.g. before a list),
    // so its full raw text has to be reassembled from the opening tag through
    // the matching closing tag rather than read off a single node's value.
    let detailsRawValue = ''
    if (detailsNodeIndex >= 0) {
      const detailsStartNode = sectionNodes[detailsNodeIndex] as Html
      let closingNodeIndex = -1
      for (let k = detailsNodeIndex; k < sectionNodes.length; k++) {
        const candidate = sectionNodes[k]
        if (candidate?.type === 'html' && /<\/details>/i.test((candidate as Html).value)) {
          closingNodeIndex = k
          break
        }
      }
      const closingNode = closingNodeIndex >= 0 ? sectionNodes[closingNodeIndex]! : detailsStartNode
      const start = getNodeStartOffset(detailsStartNode)
      const end = getNodeEndOffset(closingNode)
      if (start !== null && end !== null) {
        detailsRawValue = content.slice(start, end)
      }
    }

    const answerBody = detailsRawValue
      .replace(/^[\s\S]*?<summary>[\s\S]*?<\/summary>/i, '')
      .replace(/<\/details>\s*$/i, '')
      .trim()

    const { code: codeSnippet, remaining: questionText } = extractCodeBlock(questionBody)
    const answerText = answerBody

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

function InteractiveContent({
  content,
  precomputedBlocks,
  lessonId,
}: {
  content: string
  precomputedBlocks?: InteractiveBlock[]
  lessonId?: string | number
}) {
  const blocks = useMemo(
    () => precomputedBlocks || findInteractiveBlocks(content),
    [content, precomputedBlocks],
  )

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
        <Suspense
          key={`ex-${i}`}
          fallback={
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading exercise...
            </div>
          }
        >
          <ExerciseWidget
            title={ex.title}
            goal={ex.goal}
            instructions={ex.instructions}
            starterCode={ex.starterCode}
            expectedOutput={ex.expectedOutput}
            solution={ex.solution}
          />
        </Suspense>,
      )
    } else if (block.type === 'mastery') {
      const mq = block.data as ParsedMasteryQuestion
      segments.push(
        <Suspense
          key={`mq-${i}`}
          fallback={
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading mastery check...
            </div>
          }
        >
          <MasteryCheck
            questionNumber={mq.questionNumber}
            title={mq.title}
            questionText={mq.questionText}
            codeSnippet={mq.codeSnippet}
            answer={mq.answer}
            lessonId={lessonId}
          />
        </Suspense>,
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
  precomputedBlocks?: InteractiveBlock[]
  lessonId?: string | number
}

/**
 * Render lesson markdown with safe HTML, custom code blocks, glossary tooltips,
 * and interactive exercise/mastery widgets.
 *
 * @param {MarkdownRendererProps} props - The component properties.
 * @param {string} props.content - The raw markdown content string to be rendered.
 * @returns {React.ReactElement} The rendered markdown content wrapped in a responsive container.
 */
function MarkdownRenderer({ content, precomputedBlocks, lessonId }: MarkdownRendererProps) {
  if (!content) {
    return (
      <div className="markdown-body">
        <p>No content available.</p>
      </div>
    )
  }

  return (
    <div className="markdown-body">
      <InteractiveContent
        content={content}
        precomputedBlocks={precomputedBlocks}
        lessonId={lessonId}
      />
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
