/**
 * Shared Markdown Fragment Renderer
 *
 * Houses the ReactMarkdown configuration (plugins, sanitizer schema, and
 * custom renderers) shared by `MarkdownRenderer`, `MasteryCheck`, and
 * `ExerciseWidget` so that any markdown-bearing text (question bodies,
 * answers, exercise instructions) renders consistently instead of showing
 * raw markdown syntax.
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  JSX,
  useMemo,
  isValidElement,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  lazy,
  Suspense,
} from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown, { Components, ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { type Options as RehypeSanitizeOptions } from 'rehype-sanitize'
import 'katex/dist/katex.min.css'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import SyntaxHighlighter from '../utils/prism'
import CopyButton from './CopyButton'
import GlossaryTerm from './GlossaryTerm'
import { glossaryTerms, getGlossaryRegex } from '../utils/glossary'
import { getSecureLinkAttributes } from '../utils/linkSafety'
import { rehypeSlugCustom } from '../utils/rehype-slug-custom'
import { remarkCallouts } from '../utils/remark-callouts'
import { remarkCodeMeta } from '../utils/remark-code-meta'
import { toastSuccess, toastError } from '../utils/toast'

const COLLAPSE_THRESHOLD = 20
const COLLAPSED_LINE_COUNT = 15

const CodePlayground = lazy(() => import('./CodePlayground'))
const SqlPlayground = lazy(() => import('./SqlPlayground'))
const MermaidDiagram = lazy(() => import('./MermaidDiagram'))

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

function CodeBlock({
  className,
  children,
  isDiff,
  highlightLines,
}: {
  className?: string
  children: React.ReactNode
  isDiff?: boolean
  highlightLines?: number[]
}) {
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1]! : ''
  const code = String(children).replace(/\n$/, '')
  const [showPlayground, setShowPlayground] = useState(false)
  const isPython = lang === 'python' || lang === 'py'
  const isSql = lang === 'sql'
  const isRunnable = isPython || isSql

  const lines = code.split('\n')
  const isLong = lines.length > COLLAPSE_THRESHOLD
  const [collapsed, setCollapsed] = useState(isLong)
  const [wrapLines, setWrapLines] = useState(true)

  const highlightLineSet = useMemo(() => new Set(highlightLines ?? []), [highlightLines])

  const getLineProps = useCallback(
    (lineNumber: number): { className?: string } => {
      const lineClasses: string[] = []
      if (highlightLineSet.has(lineNumber)) {
        lineClasses.push('code-block-line--highlighted')
      }
      if (isDiff) {
        const sourceLine = lines[lineNumber - 1] ?? ''
        if (sourceLine.startsWith('+') && !sourceLine.startsWith('+++')) {
          lineClasses.push('code-block-line--diff-add')
        } else if (sourceLine.startsWith('-') && !sourceLine.startsWith('---')) {
          lineClasses.push('code-block-line--diff-remove')
        }
      }
      return lineClasses.length > 0 ? { className: lineClasses.join(' ') } : {}
    },
    [highlightLineSet, isDiff, lines],
  )

  if (!match) {
    return <code className={className}>{children}</code>
  }

  const displayCode = collapsed ? lines.slice(0, COLLAPSED_LINE_COUNT).join('\n') : code
  const hiddenLineCount = lines.length - COLLAPSED_LINE_COUNT

  return (
    <div
      className="code-block-wrapper code-block--wrapped"
      data-wrap={wrapLines ? 'true' : 'false'}
    >
      <div className="code-block-header">
        <span className="code-block-lang">
          {lang}
          {isDiff && lang !== 'diff' && <span className="code-block-diff-badge">diff</span>}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            type="button"
            className="code-block-copy"
            onClick={() => setWrapLines((w) => !w)}
            aria-label={wrapLines ? 'Disable line wrapping' : 'Enable line wrapping'}
            title={wrapLines ? 'Unwrap long lines' : 'Wrap long lines'}
          >
            {wrapLines ? '↔ Unwrap' : '↩ Wrap'}
          </button>
          {isRunnable && (
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
      <div className={`code-block-content${collapsed ? ' code-block-content--collapsed' : ''}`}>
        <SyntaxHighlighter
          style={customTheme}
          language={lang}
          PreTag="div"
          wrapLongLines={wrapLines}
          wrapLines
          lineProps={getLineProps}
          showLineNumbers={lines.length > 3}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: 'var(--text-muted)',
            userSelect: 'none',
            opacity: 0.45,
            fontSize: '0.75rem',
          }}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.8125rem',
            lineHeight: '1.65',
            overflowX: 'hidden',
            whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
            overflowWrap: wrapLines ? 'anywhere' : 'normal',
            wordBreak: wrapLines ? 'break-word' : 'normal',
          }}
          tabIndex={0}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-mono)',
              whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
              overflowWrap: wrapLines ? 'anywhere' : 'normal',
              wordBreak: wrapLines ? 'break-word' : 'normal',
            },
          }}
        >
          {displayCode}
        </SyntaxHighlighter>
      </div>
      {isLong && (
        <button
          type="button"
          className="code-block-expand-btn"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand code block' : 'Collapse code block'}
        >
          {collapsed
            ? `▼ Show ${hiddenLineCount} more line${hiddenLineCount !== 1 ? 's' : ''}`
            : '▲ Collapse'}
        </button>
      )}
      {showPlayground && isPython && (
        <div className="code-block-inline-playground">
          <Suspense
            fallback={
              <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                Loading Pyodide environment...
              </div>
            }
          >
            <CodePlayground initialCode={code} />
          </Suspense>
        </div>
      )}
      {showPlayground && isSql && (
        <div className="code-block-inline-playground">
          <Suspense
            fallback={
              <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                Loading SQL engine...
              </div>
            }
          >
            <SqlPlayground initialCode={code} />
          </Suspense>
        </div>
      )}
    </div>
  )
}

function MermaidBlock({ code }: { code: string }) {
  const [showSource, setShowSource] = useState(false)

  return (
    <div className="code-block-wrapper code-block--wrapped mermaid-block">
      <div className="code-block-header">
        <span className="code-block-lang">mermaid</span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            type="button"
            className="code-block-copy"
            onClick={() => setShowSource((s) => !s)}
            aria-label={showSource ? 'Show rendered diagram' : 'View diagram source'}
          >
            {showSource ? '◇ Diagram' : '⌗ Source'}
          </button>
          <CopyButton text={code} ariaLabel="Copy diagram source to clipboard" />
        </div>
      </div>
      {showSource ? (
        <pre className="mermaid-source">
          <code>{code}</code>
        </pre>
      ) : (
        <Suspense
          fallback={<div className="mermaid-diagram-loading">Loading diagram renderer...</div>}
        >
          <MermaidDiagram code={code} />
        </Suspense>
      )}
    </div>
  )
}

const CodeComponent = (props: JSX.IntrinsicElements['code'] & ExtraProps) => {
  const { children, className, node, ...rest } = props
  const match = /language-(\w+)/.exec(className || '')
  if (match) {
    const lang = match[1]!
    if (lang === 'mermaid') {
      return <MermaidBlock code={String(children).replace(/\n$/, '')} />
    }
    const properties = node?.properties as Record<string, unknown> | undefined
    const isDiff = properties?.dataDiff === 'true'
    const highlightLinesAttr = properties?.dataHighlightLines
    const highlightLines =
      typeof highlightLinesAttr === 'string' && highlightLinesAttr.length > 0
        ? highlightLinesAttr.split(',').map((n) => parseInt(n, 10))
        : undefined
    return (
      <CodeBlock className={className} isDiff={isDiff} highlightLines={highlightLines}>
        {children}
      </CodeBlock>
    )
  }
  return (
    <code className={className} {...rest}>
      {children}
    </code>
  )
}

const TableComponent = ({ children }: { children?: React.ReactNode }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [overflowLeft, setOverflowLeft] = useState(false)
  const [overflowRight, setOverflowRight] = useState(false)

  const updateOverflow = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return
    const maxScrollLeft = el.scrollWidth - el.clientWidth
    setOverflowLeft(el.scrollLeft > 1)
    setOverflowRight(el.scrollLeft < maxScrollLeft - 1)
  }, [])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    updateOverflow()
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateOverflow) : undefined
    resizeObserver?.observe(el)
    el.addEventListener('scroll', updateOverflow, { passive: true })
    window.addEventListener('resize', updateOverflow)
    return () => {
      resizeObserver?.disconnect()
      el.removeEventListener('scroll', updateOverflow)
      window.removeEventListener('resize', updateOverflow)
    }
  }, [updateOverflow])

  return (
    <div
      className="table-wrapper"
      data-overflow-left={overflowLeft ? 'true' : 'false'}
      data-overflow-right={overflowRight ? 'true' : 'false'}
    >
      <div className="table-scroll" ref={wrapperRef}>
        <table>{children}</table>
      </div>
    </div>
  )
}

const ImageWithZoom = (props: JSX.IntrinsicElements['img'] & ExtraProps) => {
  const [zoomed, setZoomed] = useState(false)

  const {
    fetchPriority,
    fetchpriority: lowercaseFetchPriority,
    loading: _loading,
    ...rest
  } = props as JSX.IntrinsicElements['img'] & {
    fetchPriority?: 'high' | 'low' | 'auto'
    fetchpriority?: 'high' | 'low' | 'auto'
  }

  const isHighPriority = lowercaseFetchPriority === 'high' || fetchPriority === 'high'

  useEffect(() => {
    if (!zoomed) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [zoomed])

  return (
    <>
      <img
        loading={isHighPriority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={isHighPriority ? 'high' : undefined}
        alt={rest.alt || 'Course image'}
        className="zoomable-image"
        onClick={() => rest.src && setZoomed(true)}
        {...rest}
      />
      {zoomed &&
        rest.src &&
        createPortal(
          <div
            className="image-zoom-overlay"
            onClick={() => setZoomed(false)}
            role="presentation"
            aria-label={`Zoomed: ${rest.alt || 'image'}`}
          >
            <button
              type="button"
              className="image-zoom-close"
              onClick={(e) => {
                e.stopPropagation()
                setZoomed(false)
              }}
              aria-label="Close zoomed image"
            >
              ✕
            </button>
            <img
              src={rest.src}
              alt={rest.alt || 'Course image'}
              className="image-zoom-content"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </>
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

function handleHeadingAnchorClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault()
  const url = `${window.location.origin}${window.location.pathname}#${id}`
  window.history.replaceState(null, '', `#${id}`)
  navigator.clipboard
    .writeText(url)
    .then(() => toastSuccess('Link copied to clipboard'))
    .catch(() => toastError('Could not copy link'))
}

function createHeadingComponent(Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') {
  return ({
    children,
    id,
    className: _className,
    ...props
  }: JSX.IntrinsicElements['h1'] & ExtraProps) => {
    return (
      <Tag
        id={id}
        tabIndex={-1}
        style={{ outline: 'none' }}
        className="heading-with-anchor"
        {...props}
      >
        {children}
        {id && (
          <a
            href={`#${id}`}
            className="heading-anchor-link"
            aria-label="Copy link to this section"
            onClick={(event) => handleHeadingAnchorClick(event, id)}
          />
        )}
      </Tag>
    )
  }
}

// ⚡ Bolt: Removed 'g' flag and global RegExp instance to prevent stateful RegExp.lastIndex race conditions
// during React Concurrent Mode rendering. Replaced with stateless Array.from(matchAll()).
const glossaryRegexSource = getGlossaryRegex().source
const glossaryDefinitionsByLowerTerm = Object.fromEntries(
  Object.entries(glossaryTerms).map(([term, definition]) => [term.toLowerCase(), definition]),
)

/** Wrap only the first occurrence of each glossary term in a text node. */
function addGlossaryTooltips(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = []
  const matched = new Set<string>()
  let lastIndex = 0
  let keyIdx = 0

  // Create a new RegExp instance per call to ensure pure, deterministic rendering.
  const regex = new RegExp(glossaryRegexSource, 'gi')
  const matches = Array.from(text.matchAll(regex))

  for (const match of matches) {
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
        parts.push(<GlossaryTerm key={`gl-${keyIdx++}`} text={match[0]} definition={definition} />)
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

/**
 * A standalone `![alt](src)` image is parsed as a `<p>` containing only an
 * `<img>`. Wrapping that img in a `<figure>`/`<figcaption>` would nest a
 * `<figure>` inside a `<p>`, which is invalid HTML — so instead the
 * paragraph itself becomes the `<figure>` in that case.
 */
function findSoleImageChild(children: ReactNode): ReactElement<{ alt?: string }> | undefined {
  const kids = Array.isArray(children) ? children : [children]
  const meaningful = kids.filter((child) => !(typeof child === 'string' && child.trim() === ''))
  if (meaningful.length !== 1) return undefined
  const [only] = meaningful
  return isValidElement(only) && only.type === ImageWithZoom
    ? (only as ReactElement<{ alt?: string }>)
    : undefined
}

const ParagraphWithGlossary = ({ children, ...props }: JSX.IntrinsicElements['p'] & ExtraProps) => {
  const soleImage = findSoleImageChild(children)
  if (soleImage) {
    const caption = (soleImage.props.alt ?? '').trim()
    return (
      <figure className="markdown-image-figure">
        {children}
        {caption && <figcaption className="markdown-image-caption">{caption}</figcaption>}
      </figure>
    )
  }
  return <p {...props}>{processGlossaryChildren(children)}</p>
}

export const markdownComponents: Components = {
  code: CodeComponent,
  table: TableComponent,
  img: ImageWithZoom,
  a: LinkComponent,
  h1: createHeadingComponent('h1'),
  h2: createHeadingComponent('h2'),
  h3: createHeadingComponent('h3'),
  h4: createHeadingComponent('h4'),
  h5: createHeadingComponent('h5'),
  h6: createHeadingComponent('h6'),
  p: ParagraphWithGlossary,
}

export const lessonSanitizerSchema: RehypeSanitizeOptions = {
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
    code: ['className', 'dataDiff', 'dataHighlightLines'],
    div: ['className', 'dataCallout'],
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

export const rehypePlugins: NonNullable<ComponentProps<typeof ReactMarkdown>['rehypePlugins']> = [
  rehypeRaw,
  [rehypeSanitize, lessonSanitizerSchema],
  rehypeSlugCustom,
  rehypeKatex,
]

export const remarkPlugins = [remarkGfm, remarkMath, remarkCallouts, remarkCodeMeta]

/**
 * Renders a standalone markdown string (a question body, answer explanation,
 * or exercise instructions) using the same plugins and custom renderers as
 * full lesson content, so bold text, inline code, and fenced code blocks
 * render instead of showing raw markdown syntax.
 */
export function MarkdownFragment({ content }: { content: string }) {
  if (!content) return null
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
