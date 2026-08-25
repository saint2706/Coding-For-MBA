import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import CaseStudies from '../../../src/pages/CaseStudies'
import * as contentLoader from '../../../src/utils/contentLoader'

vi.mock('../../../src/components/SEOHead', () => ({
  default: () => <div data-testid="seo-head" />,
}))

vi.mock('../../../src/components/MarkdownRenderer', () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="markdown-renderer">{content}</div>
  ),
}))

vi.mock('../../../src/utils/contentLoader', () => ({
  getAllCaseStudies: vi.fn(),
  getAllProjects: vi.fn(),
  difficultyConfig: {
    beginner: { label: 'Beginner', color: '#000', bg: '#fff' },
    intermediate: { label: 'Intermediate', color: '#111', bg: '#eee' },
    advanced: { label: 'Advanced', color: '#222', bg: '#ddd' },
  },
}))

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      layout,
      initial,
      animate,
      transition,
      ...props
    }: React.ComponentProps<'div'> & {
      layout?: boolean
      initial?: unknown
      animate?: unknown
      transition?: unknown
    }) => <div {...props}>{children}</div>,
  },
}))

describe('CaseStudies', () => {
  beforeEach(() => {
    vi.mocked(contentLoader.getAllCaseStudies).mockReturnValue([
      {
        slug: 'case-study-1',
        title: 'Case Study 1',
        difficulty: 'beginner',
        phasesCovered: 'Phase 1',
        estimatedTime: '1 hour',
        content: 'Content 1',
      },
      {
        slug: 'case-study-2',
        title: 'Case Study 2',
        difficulty: 'advanced',
        phasesCovered: 'Phase 2',
        estimatedTime: '2 hours',
        content: 'Content 2',
      },
    ] as unknown as contentLoader.CaseStudy[])

    vi.mocked(contentLoader.getAllProjects).mockReturnValue([
      {
        slug: 'project-1',
        title: 'Project 1',
        difficulty: 'intermediate',
        phasesCovered: 'Phase 3',
        estimatedTime: '3 hours',
        content: 'Content 3',
      },
    ] as unknown as contentLoader.Project[])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders case studies by default and allows switching to projects', () => {
    render(
      <MemoryRouter>
        <CaseStudies />
      </MemoryRouter>,
    )

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Case Studies & Projects')
    expect(screen.getByText('Case Study 1')).toBeInTheDocument()
    expect(screen.getByText('Case Study 2')).toBeInTheDocument()
    expect(screen.queryByText('Project 1')).not.toBeInTheDocument()

    const projectsTab = screen.getByRole('tab', { name: /Projects \(1\)/i })
    fireEvent.click(projectsTab)

    expect(screen.getByText('Project 1')).toBeInTheDocument()
    expect(screen.queryByText('Case Study 1')).not.toBeInTheDocument()
  })

  it('filters case studies by difficulty', () => {
    render(
      <MemoryRouter>
        <CaseStudies />
      </MemoryRouter>,
    )

    const filterSelect = screen.getByLabelText('Difficulty')

    fireEvent.change(filterSelect, { target: { value: 'beginner' } })
    expect(screen.getByText('Case Study 1')).toBeInTheDocument()
    expect(screen.queryByText('Case Study 2')).not.toBeInTheDocument()

    fireEvent.change(filterSelect, { target: { value: 'advanced' } })
    expect(screen.queryByText('Case Study 1')).not.toBeInTheDocument()
    expect(screen.getByText('Case Study 2')).toBeInTheDocument()
  })

  it('expands and collapses case study details', () => {
    render(
      <MemoryRouter>
        <CaseStudies />
      </MemoryRouter>,
    )

    const expandButtons = screen.getAllByRole('button', { name: /View details/i })
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()

    fireEvent.click(expandButtons[0] as HTMLElement)
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hide details/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Hide details/i }))
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
  })

  it('shows empty state when no matches found', () => {
    render(
      <MemoryRouter>
        <CaseStudies />
      </MemoryRouter>,
    )

    const filterSelect = screen.getByLabelText('Difficulty')
    fireEvent.change(filterSelect, { target: { value: 'intermediate' } })

    expect(screen.getByText('No case studies match your filters.')).toBeInTheDocument()
  })
})
