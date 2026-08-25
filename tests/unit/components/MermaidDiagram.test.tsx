import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { waitFor } from '@testing-library/react'
import { createRoot, Root } from 'react-dom/client'
import MermaidDiagram from '../../../src/components/MermaidDiagram'

const renderMock = vi.fn()
const initializeMock = vi.fn()

vi.mock('mermaid', () => ({
  default: {
    initialize: (...args: unknown[]) => initializeMock(...args),
    render: (...args: unknown[]) => renderMock(...args),
  },
}))

describe('MermaidDiagram', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    renderMock.mockReset()
    initializeMock.mockReset()
    document.documentElement.removeAttribute('data-palette-type')
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('renders the sanitized SVG returned by mermaid', async () => {
    renderMock.mockResolvedValue({ svg: '<svg><text>diagram</text></svg>' })

    act(() => {
      root.render(<MermaidDiagram code="graph TD;\nA-->B;" />)
    })

    await waitFor(() => {
      expect(container.querySelector('.mermaid-diagram svg')).toBeTruthy()
    })
    expect(container.querySelector('.mermaid-diagram-loading')).toBeNull()
    expect(container.querySelector('.mermaid-diagram-error')).toBeNull()
  })

  it('shows an error fallback with the raw source when rendering fails', async () => {
    renderMock.mockRejectedValue(new Error('Parse error on line 1'))

    act(() => {
      root.render(<MermaidDiagram code="not a valid diagram" />)
    })

    await waitFor(() => {
      expect(container.querySelector('.mermaid-diagram-error')).toBeTruthy()
    })
    expect(container.textContent).toContain('Parse error on line 1')
    expect(container.textContent).toContain('not a valid diagram')
  })

  it('preserves foreignObject-based node labels through sanitization', async () => {
    renderMock.mockResolvedValue({
      svg:
        '<svg xmlns="http://www.w3.org/2000/svg"><g class="node">' +
        '<rect></rect>' +
        '<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">' +
        '<span class="nodeLabel">Detect missing values</span>' +
        '</div></foreignObject>' +
        '</g></svg>',
    })

    act(() => {
      root.render(<MermaidDiagram code="flowchart TD;\nA-->B;" />)
    })

    await waitFor(() => {
      expect(container.querySelector('.mermaid-diagram svg')).toBeTruthy()
    })
    expect(container.textContent).toContain('Detect missing values')
  })

  it('initializes mermaid with the dark theme when the dark palette is active', async () => {
    document.documentElement.setAttribute('data-palette-type', 'dark')
    renderMock.mockResolvedValue({ svg: '<svg></svg>' })

    act(() => {
      root.render(<MermaidDiagram code="graph TD;\nA-->B;" />)
    })

    await waitFor(() => {
      expect(initializeMock).toHaveBeenCalled()
    })
    expect(initializeMock.mock.calls[0]?.[0]).toMatchObject({ theme: 'dark' })
  })
})
