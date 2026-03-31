import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import NotebookViewer from '../NotebookViewer'
import * as contentLoader from '../../utils/contentLoader'

vi.mock('../../components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../components/Breadcrumb', () => ({
  default: () => <div data-testid="breadcrumb" />,
}))

vi.mock('../../components/MarkdownRenderer', () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="markdown-renderer">{content}</div>
  ),
}))

vi.mock('../../components/CodePlayground', () => ({
  default: ({ initialCode }: { initialCode: string }) => (
    <div data-testid="code-playground">{initialCode}</div>
  ),
}))

vi.mock('../../components/BackToTop', () => ({
  default: () => <div data-testid="back-to-top" />,
}))

vi.mock('../../utils/contentLoader', () => ({
  getNotebook: vi.fn(),
  getPhase: vi.fn(),
  phaseIcons: ['📊'],
}))

describe('NotebookViewer', () => {
  beforeEach(() => {
    vi.mocked(contentLoader.getPhase).mockReturnValue({
      title: 'Phase 1 Title',
    } as unknown as contentLoader.Phase)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders 404 state when notebook is not found', () => {
    vi.mocked(contentLoader.getNotebook).mockReturnValue(undefined)

    render(
      <MemoryRouter initialEntries={['/solutions/1']}>
        <Routes>
          <Route path="/solutions/:phaseNum" element={<NotebookViewer />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Solutions not found')).toBeInTheDocument()
    expect(screen.getByText('No solution notebook exists for Phase 1.')).toBeInTheDocument()
  })

  it('renders empty state when notebook has no cells', () => {
    vi.mocked(contentLoader.getNotebook).mockReturnValue({
      cells: [],
    } as unknown as contentLoader.Notebook)

    render(
      <MemoryRouter initialEntries={['/solutions/1']}>
        <Routes>
          <Route path="/solutions/:phaseNum" element={<NotebookViewer />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Solutions not found')).toBeInTheDocument()
  })

  it('merges consecutive code cells and renders outputs', () => {
    vi.mocked(contentLoader.getNotebook).mockReturnValue({
      cells: [
        {
          cell_type: 'markdown',
          source: ['# Hello'],
        },
        {
          cell_type: 'code',
          source: ['print("A")'],
          execution_count: 1,
          outputs: [{ output_type: 'stream', text: ['A\n'] }],
        },
        {
          cell_type: 'code',
          source: ['print("B")'],
          execution_count: 2,
          outputs: [{ output_type: 'error', ename: 'NameError', evalue: 'name is not defined' }],
        },
      ],
    } as unknown as contentLoader.Notebook)

    render(
      <MemoryRouter initialEntries={['/solutions/1']}>
        <Routes>
          <Route path="/solutions/:phaseNum" element={<NotebookViewer />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('📊 Phase 1: Phase 1 Title — Solutions')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('# Hello')

    // The two code cells should be merged into one CodePlayground
    expect(screen.getByTestId('code-playground')).toHaveTextContent('print("A") print("B")')

    // Outputs should be rendered
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('NameError: name is not defined')).toBeInTheDocument()
  })

  it('handles traceback outputs and strips ANSI codes', () => {
    vi.mocked(contentLoader.getNotebook).mockReturnValue({
      cells: [
        {
          cell_type: 'code',
          source: ['error_code()'],
          outputs: [
            {
              output_type: 'error',
              traceback: ['\u001b[31mError\u001b[0m', '  Traceback (most recent call last)'],
            },
          ],
        },
      ],
    } as unknown as contentLoader.Notebook)

    render(
      <MemoryRouter initialEntries={['/solutions/1']}>
        <Routes>
          <Route path="/solutions/:phaseNum" element={<NotebookViewer />} />
        </Routes>
      </MemoryRouter>,
    )

    const outputError = screen.getByText(/Error\s*Traceback \(most recent call last\)/i)
    expect(outputError).toBeInTheDocument()
    // Ensure ANSI is stripped
    expect(outputError.textContent).not.toContain('\u001b[31m')
  })

  it('handles plain text data output', () => {
    vi.mocked(contentLoader.getNotebook).mockReturnValue({
      cells: [
        {
          cell_type: 'code',
          source: ['1 + 1'],
          outputs: [
            {
              data: {
                'text/plain': ['2'],
              },
            },
          ],
        },
      ],
    } as unknown as contentLoader.Notebook)

    render(
      <MemoryRouter initialEntries={['/solutions/1']}>
        <Routes>
          <Route path="/solutions/:phaseNum" element={<NotebookViewer />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
