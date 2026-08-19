/**
 * Mermaid Diagram Renderer
 *
 * Lazily loads the `mermaid` library and renders a diagram definition into
 * sanitized SVG. Loaded on demand via `React.lazy` so the library only
 * enters the bundle for lessons that actually contain a `mermaid` code fence.
 */

import { useEffect, useId, useRef, useState } from 'react'
import DOMPurify from 'dompurify'

let mermaidModulePromise: Promise<typeof import('mermaid')> | null = null

/** Load and initialize the mermaid module once, sharing the in-flight promise across renders. */
function loadMermaid(theme: 'dark' | 'default') {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import('mermaid')
  }
  return mermaidModulePromise.then((mod) => {
    const mermaid = mod.default
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme,
      fontFamily: 'var(--font-mono)',
    })
    return mermaid
  })
}

/** Reads the app's current dark/light palette type, updating when the user switches themes. */
function usePaletteType(): 'dark' | 'light' {
  const [paletteType, setPaletteType] = useState<'dark' | 'light'>(() =>
    document.documentElement.getAttribute('data-palette-type') === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setPaletteType(root.getAttribute('data-palette-type') === 'dark' ? 'dark' : 'light')
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-palette-type'] })
    return () => observer.disconnect()
  }, [])

  return paletteType
}

interface MermaidDiagramProps {
  /** Raw mermaid diagram definition (the fenced code block's contents). */
  code: string
}

/**
 * Renders a mermaid diagram definition as sanitized, theme-aware SVG.
 *
 * @param props - The component properties.
 * @param props.code - The mermaid diagram source text.
 * @returns The rendered diagram, a loading placeholder, or an error fallback.
 */
function MermaidDiagram({ code }: MermaidDiagramProps) {
  const reactId = useId().replace(/:/g, '-')
  const paletteType = usePaletteType()
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    loadMermaid(paletteType === 'dark' ? 'dark' : 'default')
      .then((mermaid) => mermaid.render(`mermaid-${reactId}`, code))
      .then(({ svg }) => {
        if (cancelled) return
        if (containerRef.current) {
          // Mermaid renders node/edge labels as HTML inside <foreignObject> (an SVG/HTML
          // namespace boundary). DOMPurify's default namespace check only treats
          // <annotation-xml> as a valid HTML integration point, so without this config
          // it silently empties every <foreignObject>, stripping all diagram text.
          // We also instantiate a localized DOMPurify to safely add target="_blank" and rel="noopener noreferrer"
          // to any external links inside the diagram, preventing reverse tabnabbing vulnerabilities.
          const localPurify = DOMPurify(window)
          localPurify.addHook('afterSanitizeAttributes', function (node) {
            if (node.tagName && node.tagName.toLowerCase() === 'a') {
              const href = node.getAttribute('href')
              if (
                href &&
                (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))
              ) {
                node.setAttribute('target', '_blank')
                node.setAttribute('rel', 'noopener noreferrer')
              }
            }
          })

          containerRef.current.innerHTML = localPurify.sanitize(svg, {
            ADD_TAGS: ['foreignObject'],
            ADD_ATTR: ['target'],
            HTML_INTEGRATION_POINTS: { foreignobject: true },
          })
        }
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to render diagram.')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [code, paletteType, reactId])

  if (error) {
    return (
      <div className="mermaid-diagram-error" role="alert">
        <p>Could not render this diagram: {error}</p>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="mermaid-diagram-container">
      {loading && <div className="mermaid-diagram-loading">Rendering diagram…</div>}
      <div ref={containerRef} className="mermaid-diagram" aria-busy={loading} />
    </div>
  )
}

export default MermaidDiagram
