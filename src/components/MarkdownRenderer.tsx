import { useState, useCallback, memo, JSX } from 'react'
import ReactMarkdown, { Components, ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

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

function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1]! : ''
  const code = String(children).replace(/\n$/, '')

  if (!match) {
    return <code className={className}>{children}</code>
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{lang}</span>
        <CopyButton text={code} />
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

const markdownComponents: Components = {
  code: CodeComponent,
  table: TableComponent,
  a: LinkComponent,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
}

const remarkPlugins = [remarkGfm]
const rehypePlugins = [rehypeRaw]

interface MarkdownRendererProps {
  content: string
}

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
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default memo(MarkdownRenderer)
